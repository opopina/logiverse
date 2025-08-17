// 🚀 Servicio Multijugador Épico - ¡La revolución de LogiVerse! 🎮

import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import { aiService } from './aiService.js';

// Tipos para el servicio multijugador
export interface Room {
  id: string;
  name: string;
  type:
    | 'CASUAL'
    | 'RANKED'
    | 'TOURNAMENT'
    | 'PRIVATE'
    | 'EDUCATIONAL'
    | 'SPEED'
    | 'COOPERATIVE';
  maxPlayers: number;
  currentPlayers: number;
  isPrivate: boolean;
  status: 'WAITING' | 'FULL' | 'PLAYING' | 'FINISHED';
  createdBy: string;
  participants: RoomParticipant[];
  settings: RoomSettings;
}

export interface RoomParticipant {
  id: string;
  userId: string;
  username: string;
  role: 'PLAYER' | 'SPECTATOR' | 'MODERATOR';
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONNECTED';
  score: number;
  ranking?: number;
  avatar?: string;
}

export interface RoomSettings {
  worldIds: string[];
  difficulty: number[];
  timeLimit?: number;
  maxHints?: number;
  enableAIModerator: boolean;
  autoMatch: boolean;
  allowSpectators: boolean;
}

export interface GameSession {
  id: string;
  roomId: string;
  levelId: string;
  worldId: string;
  status: 'WAITING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  startTime: Date;
  endTime?: Date;
  participants: SessionParticipant[];
  currentProblem?: any;
  loggieData?: any;
}

export interface SessionParticipant {
  userId: string;
  score: number;
  attempts: number;
  hintsUsed: number;
  timeSpent: number;
  answer?: string;
  isCorrect?: boolean;
  ranking?: number;
}

export interface LoggieModeratorContext {
  roomId: string;
  sessionId: string;
  event:
    | 'session_start'
    | 'player_answer'
    | 'hint_request'
    | 'session_end'
    | 'player_struggle'
    | 'celebration';
  participants: SessionParticipant[];
  currentLevel: any;
  metadata?: any;
}

class MultiplayerService {
  private prisma: PrismaClient;
  private io: Server;
  private activeRooms: Map<string, Room> = new Map();
  private activeSessions: Map<string, GameSession> = new Map();
  private playerRoomMap: Map<string, string> = new Map(); // userId -> roomId

  constructor(prisma: PrismaClient, io: Server) {
    this.prisma = prisma;
    this.io = io;
    this.initializeSocketHandlers();
  }

  private initializeSocketHandlers() {
    this.io.on('connection', socket => {
      console.log(`🦊 Jugador conectado al multijugador: ${socket.id}`);

      // Eventos de salas
      socket.on('join_room', data => this.handleJoinRoom(socket, data));
      socket.on('leave_room', data => this.handleLeaveRoom(socket, data));
      socket.on('create_room', data => this.handleCreateRoom(socket, data));
      socket.on('room_message', data => this.handleRoomMessage(socket, data));

      // Eventos de juego
      socket.on('start_game', data => this.handleStartGame(socket, data));
      socket.on('submit_answer', data => this.handleSubmitAnswer(socket, data));
      socket.on('request_hint', data => this.handleRequestHint(socket, data));
      socket.on('player_ready', data => this.handlePlayerReady(socket, data));

      // Desconexión
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  // 🏠 GESTIÓN DE SALAS

  async createRoom(
    creatorId: string,
    roomData: {
      name: string;
      type: Room['type'];
      maxPlayers: number;
      isPrivate: boolean;
      settings: RoomSettings;
    }
  ): Promise<Room> {
    // Crear sala en la base de datos
    const dbRoom = await this.prisma.multiplayerRoom.create({
      data: {
        name: roomData.name,
        type: roomData.type,
        maxPlayers: roomData.maxPlayers,
        isPrivate: roomData.isPrivate,
        inviteCode: roomData.isPrivate ? this.generateInviteCode() : null,
        settings: roomData.settings as any,
        createdBy: creatorId,
      },
      include: {
        creator: { select: { id: true, username: true } },
        participants: {
          include: {
            user: { select: { id: true, username: true } },
          },
        },
      },
    });

    // Crear sala en memoria
    const room: Room = {
      id: dbRoom.id,
      name: dbRoom.name,
      type: dbRoom.type as Room['type'],
      maxPlayers: dbRoom.maxPlayers,
      currentPlayers: 0,
      isPrivate: dbRoom.isPrivate,
      status: 'WAITING',
      createdBy: creatorId,
      participants: [],
      settings: roomData.settings,
    };

    this.activeRooms.set(room.id, room);

    // Notificar creación de sala
    this.io.emit('room_created', room);

    return room;
  }

  async joinRoom(
    userId: string,
    roomId: string,
    inviteCode?: string
  ): Promise<{ success: boolean; room?: Room; error?: string }> {
    const room = this.activeRooms.get(roomId);
    if (!room) {
      return { success: false, error: 'Sala no encontrada' };
    }

    if (room.status !== 'WAITING') {
      return { success: false, error: 'La sala ya está en juego' };
    }

    if (room.currentPlayers >= room.maxPlayers) {
      return { success: false, error: 'Sala llena' };
    }

    if (
      room.isPrivate &&
      (!inviteCode || inviteCode !== (await this.getRoomInviteCode(roomId)))
    ) {
      return { success: false, error: 'Código de invitación inválido' };
    }

    // Verificar si ya está en una sala
    const currentRoom = this.playerRoomMap.get(userId);
    if (currentRoom && currentRoom !== roomId) {
      await this.leaveRoom(userId, currentRoom);
    }

    // Agregar a la base de datos
    await this.prisma.roomParticipant.create({
      data: {
        roomId,
        userId,
        role: 'PLAYER',
        status: 'ACTIVE',
      },
    });

    // Obtener datos del usuario
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    });

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // Agregar a la sala en memoria
    const participant: RoomParticipant = {
      id: `${roomId}-${userId}`,
      userId,
      username: user.username,
      role: 'PLAYER',
      status: 'ACTIVE',
      score: 0,
    };

    room.participants.push(participant);
    room.currentPlayers++;
    this.playerRoomMap.set(userId, roomId);

    // Actualizar estado de la sala
    if (room.currentPlayers >= room.maxPlayers) {
      room.status = 'FULL';
    }

    // Notificar a todos en la sala
    this.io.to(roomId).emit('player_joined', { room, participant });

    // Loggie da la bienvenida al nuevo jugador
    if (room.settings.enableAIModerator) {
      await this.sendLoggieWelcome(roomId, participant);
    }

    return { success: true, room };
  }

  async leaveRoom(userId: string, roomId: string): Promise<void> {
    const room = this.activeRooms.get(roomId);
    if (!room) return;

    // Remover de la base de datos
    await this.prisma.roomParticipant.deleteMany({
      where: { roomId, userId },
    });

    // Remover de la sala en memoria
    room.participants = room.participants.filter(p => p.userId !== userId);
    room.currentPlayers--;
    this.playerRoomMap.delete(userId);

    // Si era el último jugador, eliminar la sala
    if (room.currentPlayers === 0) {
      this.activeRooms.delete(roomId);
      await this.prisma.multiplayerRoom.delete({ where: { id: roomId } });
    } else {
      // Notificar salida
      this.io.to(roomId).emit('player_left', { roomId, userId });

      // Si era el creador, transferir propiedad
      if (room.createdBy === userId && room.participants.length > 0) {
        room.createdBy = room.participants[0].userId;
        this.io
          .to(roomId)
          .emit('room_owner_changed', { roomId, newOwnerId: room.createdBy });
      }
    }
  }

  // 🎮 GESTIÓN DE JUEGOS

  async startGame(
    roomId: string,
    initiatorId: string
  ): Promise<{ success: boolean; session?: GameSession; error?: string }> {
    const room = this.activeRooms.get(roomId);
    if (!room) {
      return { success: false, error: 'Sala no encontrada' };
    }

    if (room.createdBy !== initiatorId) {
      return {
        success: false,
        error: 'Solo el creador puede iniciar el juego',
      };
    }

    if (room.participants.length < 2) {
      return { success: false, error: 'Se necesitan al menos 2 jugadores' };
    }

    // Seleccionar nivel aleatorio según configuración
    const level = await this.selectRandomLevel(room.settings);
    if (!level) {
      return { success: false, error: 'No se pudo encontrar un nivel válido' };
    }

    // Crear sesión en la base de datos
    const dbSession = await this.prisma.multiplayerSession.create({
      data: {
        roomId,
        levelId: level.id,
        worldId: level.worldId,
        startTime: new Date(),
        settings: {
          timeLimit: room.settings.timeLimit,
          maxHints: room.settings.maxHints,
          enableAIModerator: room.settings.enableAIModerator,
        },
      },
    });

    // Crear sesiones individuales para cada jugador
    const playerSessions = await Promise.all(
      room.participants.map(participant =>
        this.prisma.playerSession.create({
          data: {
            sessionId: dbSession.id,
            userId: participant.userId,
            startTime: new Date(),
          },
        })
      )
    );

    // Crear sesión en memoria
    const session: GameSession = {
      id: dbSession.id,
      roomId,
      levelId: level.id,
      worldId: level.worldId,
      status: 'ACTIVE',
      startTime: new Date(),
      participants: room.participants.map(p => ({
        userId: p.userId,
        score: 0,
        attempts: 0,
        hintsUsed: 0,
        timeSpent: 0,
      })),
      currentProblem: level.content,
    };

    this.activeSessions.set(session.id, session);
    room.status = 'PLAYING';

    // Notificar inicio del juego
    this.io.to(roomId).emit('game_started', {
      session,
      level: {
        id: level.id,
        title: level.title,
        description: level.description,
        difficulty: level.difficulty,
        content: level.content,
      },
    });

    // Loggie presenta el desafío
    if (room.settings.enableAIModerator) {
      await this.sendLoggieGameStart(roomId, session, level);
    }

    return { success: true, session };
  }

  async submitAnswer(
    userId: string,
    sessionId: string,
    answer: string
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.find(p => p.userId === userId);
    if (!participant) return;

    participant.attempts++;
    participant.answer = answer;

    // Obtener nivel para verificar respuesta
    const level = await this.prisma.gameLevel.findUnique({
      where: { id: session.levelId },
    });

    if (!level) return;

    // Verificar respuesta
    const isCorrect = this.checkAnswer(answer, level.solution as any);
    participant.isCorrect = isCorrect;

    if (isCorrect) {
      // Calcular puntuación
      const timeBonus = Math.max(0, 100 - participant.timeSpent);
      const hintPenalty = participant.hintsUsed * 10;
      const attemptPenalty = (participant.attempts - 1) * 5;
      participant.score = Math.max(
        0,
        100 + timeBonus - hintPenalty - attemptPenalty
      );
    }

    // Actualizar en la base de datos
    await this.prisma.playerSession.updateMany({
      where: { sessionId, userId },
      data: {
        attempts: participant.attempts,
        answer,
        isCorrect,
        score: participant.score,
        endTime: isCorrect ? new Date() : undefined,
      },
    });

    // Notificar respuesta
    this.io.to(session.roomId).emit('player_answered', {
      sessionId,
      userId,
      isCorrect,
      score: participant.score,
      attempts: participant.attempts,
    });

    // Loggie comenta la respuesta
    const room = this.activeRooms.get(session.roomId);
    if (room?.settings.enableAIModerator) {
      await this.sendLoggieAnswerFeedback(
        session.roomId,
        session,
        participant,
        level,
        isCorrect
      );
    }

    // Verificar si el juego terminó
    await this.checkGameEnd(session);
  }

  // 🤖 LOGGIE COMO MODERADOR INTELIGENTE

  private async sendLoggieWelcome(
    roomId: string,
    participant: RoomParticipant
  ): Promise<void> {
    try {
      const room = this.activeRooms.get(roomId);
      if (!room) return;

      const aiResponse = await aiService.generateResponse(
        {
          worldId: 'multiplayer-lobby',
          levelId: 'room-welcome',
          levelTitle: `Sala ${room.name}`,
          levelType: 'logic-puzzle',
          difficulty: 1,
          attempts: 1,
          hintsUsed: 0,
          correctAnswer: '',
        },
        'explanation',
        `¡Bienvenido ${participant.username} a la sala "${room.name}"! Hay ${room.currentPlayers} jugadores conectados. El tipo de sala es ${room.type}. Dale una bienvenida épica y motívalo para las batallas de lógica que vienen.`
      );

      // Enviar mensaje de Loggie a la sala
      await this.sendLoggieMessage(roomId, aiResponse.text, {
        type: 'welcome',
        targetUser: participant.userId,
        emotion: aiResponse.emotion,
        accessory: aiResponse.accessory,
      });
    } catch (error) {
      console.error('Error enviando bienvenida de Loggie:', error);
    }
  }

  private async sendLoggieGameStart(
    roomId: string,
    session: GameSession,
    level: any
  ): Promise<void> {
    try {
      const aiResponse = await aiService.generateResponse(
        {
          worldId: session.worldId,
          levelId: session.levelId,
          levelTitle: level.title,
          levelType: level.type || 'logic-puzzle',
          difficulty: level.difficulty,
          attempts: 1,
          hintsUsed: 0,
          correctAnswer: '',
        },
        'level-start'
      );

      await this.sendLoggieMessage(roomId, aiResponse.text, {
        type: 'game_start',
        sessionId: session.id,
        emotion: aiResponse.emotion,
        accessory: aiResponse.accessory,
      });
    } catch (error) {
      console.error('Error enviando presentación de juego de Loggie:', error);
    }
  }

  private async sendLoggieAnswerFeedback(
    roomId: string,
    session: GameSession,
    participant: SessionParticipant,
    level: any,
    isCorrect: boolean
  ): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: participant.userId },
        select: { username: true },
      });

      if (!user) return;

      const aiResponse = await aiService.generateResponse(
        {
          worldId: session.worldId,
          levelId: session.levelId,
          levelTitle: level.title,
          levelType: level.type || 'logic-puzzle',
          difficulty: level.difficulty,
          attempts: participant.attempts,
          hintsUsed: participant.hintsUsed,
          userAnswer: participant.answer || '',
          correctAnswer: level.solution?.correctAnswer || '',
          isCorrect,
        },
        isCorrect ? 'correct' : 'incorrect'
      );

      // Personalizar mensaje para multijugador
      const multiplayerMessage = `${user.username}: ${aiResponse.text}`;

      await this.sendLoggieMessage(roomId, multiplayerMessage, {
        type: isCorrect ? 'celebration' : 'encouragement',
        targetUser: participant.userId,
        sessionId: session.id,
        emotion: aiResponse.emotion,
        accessory: aiResponse.accessory,
      });
    } catch (error) {
      console.error('Error enviando feedback de Loggie:', error);
    }
  }

  private async sendLoggieMessage(
    roomId: string,
    content: string,
    metadata: any
  ): Promise<void> {
    // Guardar en la base de datos
    const message = await this.prisma.roomMessage.create({
      data: {
        roomId,
        userId: null, // null indica que es de Loggie
        type: 'AI_MODERATOR',
        content,
        metadata,
      },
    });

    // Enviar a todos en la sala
    this.io.to(roomId).emit('room_message', {
      id: message.id,
      type: 'AI_MODERATOR',
      content,
      metadata,
      timestamp: message.createdAt,
      sender: {
        id: 'loggie-ai',
        username: 'Loggie 🦊',
        isAI: true,
      },
    });
  }

  // 🎯 UTILIDADES PRIVADAS

  private generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private async getRoomInviteCode(roomId: string): Promise<string | null> {
    const room = await this.prisma.multiplayerRoom.findUnique({
      where: { id: roomId },
      select: { inviteCode: true },
    });
    return room?.inviteCode || null;
  }

  private async selectRandomLevel(settings: RoomSettings): Promise<any> {
    const levels = await this.prisma.gameLevel.findMany({
      where: {
        worldId: { in: settings.worldIds },
        difficulty: { in: settings.difficulty },
        isActive: true,
      },
    });

    if (levels.length === 0) return null;
    return levels[Math.floor(Math.random() * levels.length)];
  }

  private checkAnswer(userAnswer: string, solution: any): boolean {
    // Lógica simplificada de verificación
    // En una implementación real, esto sería más sofisticado
    if (typeof solution === 'object' && solution.correctAnswer) {
      return (
        userAnswer.toLowerCase().trim() ===
        solution.correctAnswer.toLowerCase().trim()
      );
    }
    return (
      userAnswer.toLowerCase().trim() ===
      solution.toString().toLowerCase().trim()
    );
  }

  private async checkGameEnd(session: GameSession): Promise<void> {
    const completedPlayers = session.participants.filter(
      p => p.isCorrect
    ).length;
    const totalPlayers = session.participants.length;

    // Si todos respondieron correctamente o si pasó el tiempo límite
    if (completedPlayers === totalPlayers) {
      await this.endGame(session);
    }
  }

  private async endGame(session: GameSession): Promise<void> {
    session.status = 'COMPLETED';
    session.endTime = new Date();

    // Calcular rankings
    session.participants.sort((a, b) => {
      if (a.isCorrect && !b.isCorrect) return -1;
      if (!a.isCorrect && b.isCorrect) return 1;
      if (a.isCorrect && b.isCorrect) {
        return a.timeSpent + a.attempts * 10 - (b.timeSpent + b.attempts * 10);
      }
      return b.score - a.score;
    });

    session.participants.forEach((participant, index) => {
      participant.ranking = index + 1;
    });

    // Actualizar base de datos
    await this.prisma.multiplayerSession.update({
      where: { id: session.id },
      data: {
        status: 'COMPLETED',
        endTime: session.endTime,
        results: {
          rankings: session.participants.map(p => ({
            userId: p.userId,
            ranking: p.ranking,
            score: p.score,
            timeSpent: p.timeSpent,
            attempts: p.attempts,
            isCorrect: p.isCorrect,
          })),
        },
      },
    });

    // Actualizar estadísticas de jugadores
    await this.updatePlayerStats(session);

    // Notificar fin del juego
    this.io.to(session.roomId).emit('game_ended', {
      sessionId: session.id,
      results: session.participants,
    });

    // Loggie comenta los resultados
    const room = this.activeRooms.get(session.roomId);
    if (room?.settings.enableAIModerator) {
      await this.sendLoggieGameEnd(session);
    }

    // Limpiar sesión
    this.activeSessions.delete(session.id);
    if (room) {
      room.status = 'WAITING';
    }
  }

  private async updatePlayerStats(session: GameSession): Promise<void> {
    for (const participant of session.participants) {
      await this.prisma.playerStats.upsert({
        where: { userId: participant.userId },
        create: {
          userId: participant.userId,
          totalGamesPlayed: 1,
          totalGamesWon: participant.ranking === 1 ? 1 : 0,
          totalScore: participant.score,
          averageTime: participant.timeSpent,
          winStreak: participant.ranking === 1 ? 1 : 0,
          maxWinStreak: participant.ranking === 1 ? 1 : 0,
        },
        update: {
          totalGamesPlayed: { increment: 1 },
          totalGamesWon:
            participant.ranking === 1 ? { increment: 1 } : undefined,
          totalScore: { increment: participant.score },
          winStreak: participant.ranking === 1 ? { increment: 1 } : 0,
          maxWinStreak:
            participant.ranking === 1 ? { increment: 1 } : undefined,
          lastActiveAt: new Date(),
        },
      });
    }
  }

  private async sendLoggieGameEnd(session: GameSession): Promise<void> {
    // Implementación de comentarios finales de Loggie
    const winner = session.participants.find(p => p.ranking === 1);
    // ... lógica de comentarios finales
  }

  // 🎯 HANDLERS DE SOCKET

  private async handleJoinRoom(
    socket: any,
    data: { roomId: string; userId: string; inviteCode?: string }
  ) {
    const result = await this.joinRoom(
      data.userId,
      data.roomId,
      data.inviteCode
    );
    socket.emit('join_room_result', result);

    if (result.success) {
      socket.join(data.roomId);
    }
  }

  private async handleLeaveRoom(
    socket: any,
    data: { roomId: string; userId: string }
  ) {
    await this.leaveRoom(data.userId, data.roomId);
    socket.leave(data.roomId);
  }

  private async handleCreateRoom(socket: any, data: any) {
    const room = await this.createRoom(data.creatorId, data.roomData);
    socket.emit('room_created', room);
    socket.join(room.id);
  }

  private async handleRoomMessage(
    socket: any,
    data: { roomId: string; userId: string; content: string }
  ) {
    // Manejar mensajes de chat en la sala
    const message = await this.prisma.roomMessage.create({
      data: {
        roomId: data.roomId,
        userId: data.userId,
        type: 'CHAT',
        content: data.content,
      },
      include: {
        user: { select: { username: true } },
      },
    });

    this.io.to(data.roomId).emit('room_message', {
      id: message.id,
      type: 'CHAT',
      content: message.content,
      timestamp: message.createdAt,
      sender: {
        id: data.userId,
        username: message.user?.username,
      },
    });
  }

  private async handleStartGame(
    socket: any,
    data: { roomId: string; initiatorId: string }
  ) {
    const result = await this.startGame(data.roomId, data.initiatorId);
    socket.emit('start_game_result', result);
  }

  private async handleSubmitAnswer(
    socket: any,
    data: { sessionId: string; userId: string; answer: string }
  ) {
    await this.submitAnswer(data.userId, data.sessionId, data.answer);
  }

  private async handleRequestHint(
    socket: any,
    data: { sessionId: string; userId: string }
  ) {
    // Implementar lógica de pistas
  }

  private async handlePlayerReady(
    socket: any,
    data: { roomId: string; userId: string }
  ) {
    // Implementar lógica de estado "listo"
  }

  private handleDisconnect(socket: any) {
    // Manejar desconexión de jugadores
    console.log(`🦊 Jugador desconectado del multijugador: ${socket.id}`);
  }

  // 🎯 MÉTODOS PÚBLICOS

  public async getRooms(filters?: {
    type?: Room['type'];
    isPrivate?: boolean;
  }): Promise<Room[]> {
    return Array.from(this.activeRooms.values()).filter(room => {
      if (filters?.type && room.type !== filters.type) return false;
      if (
        filters?.isPrivate !== undefined &&
        room.isPrivate !== filters.isPrivate
      )
        return false;
      return true;
    });
  }

  public async getPlayerStats(userId: string) {
    return this.prisma.playerStats.findUnique({
      where: { userId },
      include: {
        user: { select: { username: true } },
      },
    });
  }

  public async getLeaderboard(limit: number = 50) {
    return this.prisma.playerStats.findMany({
      take: limit,
      orderBy: { eloRating: 'desc' },
      include: {
        user: { select: { username: true } },
      },
    });
  }
}

export default MultiplayerService;
