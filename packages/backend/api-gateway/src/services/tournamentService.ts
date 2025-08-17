// 🏆 Servicio de Torneos para LogiVerse
// Sistema automático de torneos de fin de semana

import { PrismaClient, TournamentType, TournamentStatus, MatchStatus } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';

export interface TournamentSettings {
  name: string;
  type: TournamentType;
  maxParticipants: number;
  registrationStart: Date;
  registrationEnd: Date;
  tournamentStart: Date;
  entryFee?: number;
  prizePool?: number;
  description: string;
}

export interface TournamentBracket {
  tournamentId: string;
  rounds: TournamentRound[];
  currentRound: number;
  isComplete: boolean;
}

export interface TournamentRound {
  roundNumber: number;
  matches: TournamentMatchData[];
  isComplete: boolean;
}

export interface TournamentMatchData {
  id: string;
  player1Id: string;
  player2Id?: string;
  winnerId?: string;
  status: MatchStatus;
  scheduledAt: Date;
  player1Name: string;
  player2Name?: string;
}

export class TournamentService {
  constructor(
    private prisma: PrismaClient,
    private io: SocketIOServer
  ) {}

  // 🏟️ Crear torneo automático
  async createAutomaticTournament(settings: TournamentSettings) {
    try {
      const tournament = await this.prisma.tournament.create({
        data: {
          name: settings.name,
          type: settings.type,
          maxParticipants: settings.maxParticipants,
          registrationStart: settings.registrationStart,
          registrationEnd: settings.registrationEnd,
          tournamentStart: settings.tournamentStart,
          entryFee: settings.entryFee || 0,
          prizePool: settings.prizePool || 0,
          description: settings.description,
          status: 'REGISTRATION_OPEN',
          isPublic: true,
          bracketData: {},
        },
      });

      // 📢 Notificar a todos los usuarios conectados
      this.io.emit('tournament-created', {
        tournament,
        message: `🏆 ¡Nuevo torneo disponible: ${settings.name}!`,
      });

      return tournament;
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw new Error('Failed to create tournament');
    }
  }

  // 🎯 Unirse a torneo
  async joinTournament(tournamentId: string, userId: string) {
    try {
      // Verificar que el torneo existe y está abierto
      const tournament = await this.prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: { participants: true },
      });

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      if (tournament.status !== 'REGISTRATION_OPEN') {
        throw new Error('Tournament registration is closed');
      }

      if (tournament.participants.length >= tournament.maxParticipants) {
        throw new Error('Tournament is full');
      }

      // Verificar que el usuario no esté ya registrado
      const existingParticipant = tournament.participants.find(
        p => p.userId === userId
      );

      if (existingParticipant) {
        throw new Error('User already registered for this tournament');
      }

      // Registrar participante
      const participant = await this.prisma.tournamentParticipant.create({
        data: {
          tournamentId,
          userId,
          registeredAt: new Date(),
        },
        include: {
          user: {
            select: { id: true, username: true, avatar: true },
          },
        },
      });

      // 📢 Notificar nueva inscripción
      this.io.emit('tournament-participant-joined', {
        tournamentId,
        participant,
        totalParticipants: tournament.participants.length + 1,
        maxParticipants: tournament.maxParticipants,
      });

      return participant;
    } catch (error) {
      console.error('Error joining tournament:', error);
      throw error;
    }
  }

  // 🏁 Iniciar torneo automáticamente
  async startTournament(tournamentId: string) {
    try {
      const tournament = await this.prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: { 
          participants: {
            include: {
              user: {
                select: { id: true, username: true, avatar: true },
              },
            },
          },
        },
      });

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      if (tournament.participants.length < 2) {
        throw new Error('Not enough participants to start tournament');
      }

      // 🎲 Mezclar participantes aleatoriamente
      const shuffledParticipants = this.shuffleArray([...tournament.participants]);
      
      // 🏗️ Generar bracket inicial
      const bracket = await this.generateBracket(tournamentId, shuffledParticipants);

      // 📝 Actualizar estado del torneo
      await this.prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          status: 'IN_PROGRESS',
          actualStart: new Date(),
          bracketData: bracket,
        },
      });

      // 📢 Notificar inicio del torneo
      this.io.emit('tournament-started', {
        tournamentId,
        tournament: tournament.name,
        bracket,
        message: `🚀 ¡Ha comenzado el torneo ${tournament.name}!`,
      });

      return bracket;
    } catch (error) {
      console.error('Error starting tournament:', error);
      throw error;
    }
  }

  // 🎯 Generar bracket de eliminación
  private async generateBracket(
    tournamentId: string, 
    participants: any[]
  ): Promise<TournamentBracket> {
    const rounds: TournamentRound[] = [];
    let currentParticipants = [...participants];
    let roundNumber = 1;

    // 🔄 Generar rondas hasta tener un ganador
    while (currentParticipants.length > 1) {
      const matches: TournamentMatchData[] = [];
      const nextRoundParticipants = [];

      // 🎮 Emparejar participantes para esta ronda
      for (let i = 0; i < currentParticipants.length; i += 2) {
        const player1 = currentParticipants[i];
        const player2 = currentParticipants[i + 1];

        // Crear match en base de datos
        const match = await this.prisma.tournamentMatch.create({
          data: {
            tournamentId,
            round: roundNumber,
            player1Id: player1.userId,
            player2Id: player2?.userId,
            status: 'PENDING',
            scheduledAt: new Date(Date.now() + (roundNumber - 1) * 30 * 60 * 1000), // 30 min entre rondas
          },
        });

        const matchData: TournamentMatchData = {
          id: match.id,
          player1Id: player1.userId,
          player2Id: player2?.userId,
          status: 'PENDING',
          scheduledAt: match.scheduledAt,
          player1Name: player1.user.username,
          player2Name: player2?.user.username,
        };

        matches.push(matchData);

        // Si solo hay un participante impar, pasa automáticamente
        if (!player2) {
          nextRoundParticipants.push(player1);
        }
      }

      rounds.push({
        roundNumber,
        matches,
        isComplete: false,
      });

      // 📈 Preparar para la siguiente ronda
      currentParticipants = nextRoundParticipants;
      roundNumber++;
    }

    return {
      tournamentId,
      rounds,
      currentRound: 1,
      isComplete: false,
    };
  }

  // 🎲 Mezclar array aleatoriamente (Fisher-Yates)
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // 🏆 Reportar resultado de match
  async reportMatchResult(matchId: string, winnerId: string) {
    try {
      const match = await this.prisma.tournamentMatch.update({
        where: { id: matchId },
        data: {
          winnerId,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
        include: {
          tournament: true,
        },
      });

      // 📢 Notificar resultado
      this.io.emit('match-completed', {
        matchId,
        winnerId,
        tournamentId: match.tournamentId,
      });

      // ✅ Verificar si la ronda está completa
      await this.checkAndAdvanceRound(match.tournamentId, match.round);

      return match;
    } catch (error) {
      console.error('Error reporting match result:', error);
      throw error;
    }
  }

  // 🔄 Verificar y avanzar ronda
  private async checkAndAdvanceRound(tournamentId: string, currentRound: number) {
    const roundMatches = await this.prisma.tournamentMatch.findMany({
      where: {
        tournamentId,
        round: currentRound,
      },
    });

    const allMatchesComplete = roundMatches.every(match => match.status === 'COMPLETED');

    if (allMatchesComplete) {
      // 🏆 Si es la ronda final, terminar torneo
      if (roundMatches.length === 1) {
        const finalMatch = roundMatches[0];
        await this.completeTournament(tournamentId, finalMatch.winnerId!);
      } else {
        // 📈 Avanzar ganadores a la siguiente ronda
        await this.advanceToNextRound(tournamentId, currentRound);
      }
    }
  }

  // 📈 Avanzar ganadores a la siguiente ronda
  private async advanceToNextRound(tournamentId: string, completedRound: number) {
    const completedMatches = await this.prisma.tournamentMatch.findMany({
      where: {
        tournamentId,
        round: completedRound,
        status: 'COMPLETED',
      },
    });

    const winners = completedMatches.map(match => match.winnerId).filter(Boolean);

    // 🎮 Crear matches para la siguiente ronda
    const nextRound = completedRound + 1;
    for (let i = 0; i < winners.length; i += 2) {
      const player1Id = winners[i];
      const player2Id = winners[i + 1];

      await this.prisma.tournamentMatch.create({
        data: {
          tournamentId,
          round: nextRound,
          player1Id: player1Id!,
          player2Id: player2Id,
          status: 'PENDING',
          scheduledAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min para la siguiente ronda
        },
      });
    }

    // 📢 Notificar nueva ronda
    this.io.emit('tournament-round-advanced', {
      tournamentId,
      newRound: nextRound,
      message: `🚀 ¡Ronda ${nextRound} iniciada!`,
    });
  }

  // 🏆 Completar torneo
  private async completeTournament(tournamentId: string, winnerId: string) {
    await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        status: 'COMPLETED',
        winnerId,
        completedAt: new Date(),
      },
    });

    const winner = await this.prisma.user.findUnique({
      where: { id: winnerId },
      select: { username: true, avatar: true },
    });

    // 📢 Notificar ganador del torneo
    this.io.emit('tournament-completed', {
      tournamentId,
      winnerId,
      winnerName: winner?.username,
      message: `🏆 ¡${winner?.username} ha ganado el torneo!`,
    });
  }

  // 📊 Obtener torneos activos
  async getActiveTournaments() {
    return await this.prisma.tournament.findMany({
      where: {
        status: {
          in: ['REGISTRATION_OPEN', 'IN_PROGRESS'],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true },
            },
          },
        },
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 🗓️ Programar torneos automáticos de fin de semana
  async scheduleWeekendTournaments() {
    const now = new Date();
    const nextSaturday = this.getNextSaturday(now);
    const nextSunday = this.getNextSunday(now);

    // 🏆 Torneo del Sábado - Villa Verdad Championship
    await this.createAutomaticTournament({
      name: '🌱 Villa Verdad Championship',
      type: 'SINGLE_ELIMINATION',
      maxParticipants: 16,
      registrationStart: new Date(nextSaturday.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 días antes
      registrationEnd: new Date(nextSaturday.getTime() - 1 * 60 * 60 * 1000), // 1 hora antes
      tournamentStart: nextSaturday,
      entryFee: 0,
      prizePool: 1000,
      description: '¡Demuestra tu maestría en los fundamentos de la lógica!',
    });

    // 🏆 Torneo del Domingo - Loggie's Grand Prix
    await this.createAutomaticTournament({
      name: '🦊 Loggie\'s Grand Prix',
      type: 'SINGLE_ELIMINATION',
      maxParticipants: 32,
      registrationStart: new Date(nextSunday.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 días antes
      registrationEnd: new Date(nextSunday.getTime() - 1 * 60 * 60 * 1000), // 1 hora antes
      tournamentStart: nextSunday,
      entryFee: 0,
      prizePool: 2000,
      description: '¡El torneo más épico de LogiVerse con Loggie como anfitrión!',
    });
  }

  // 📅 Obtener próximo sábado
  private getNextSaturday(date: Date): Date {
    const nextSaturday = new Date(date);
    nextSaturday.setDate(date.getDate() + ((6 - date.getDay()) % 7));
    nextSaturday.setHours(15, 0, 0, 0); // 3 PM
    return nextSaturday;
  }

  // 📅 Obtener próximo domingo  
  private getNextSunday(date: Date): Date {
    const nextSunday = new Date(date);
    nextSunday.setDate(date.getDate() + ((7 - date.getDay()) % 7));
    nextSunday.setHours(16, 0, 0, 0); // 4 PM
    return nextSunday;
  }
}
