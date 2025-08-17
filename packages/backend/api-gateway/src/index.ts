import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { aiService, type LoggieContext } from './services/aiService.js';
// import MultiplayerService from './services/multiplayerService.js';

// Load environment variables
dotenv.config();

// Configure environment variables
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://logiverse:logiverse@localhost:5432/logiverse?schema=public';
process.env.JWT_SECRET =
  process.env.JWT_SECRET ||
  'logiverse-super-secret-key-change-in-production-2024';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
process.env.BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS || '12';

// OpenAI Configuration
process.env.OPENAI_API_KEY =
  process.env.OPENAI_API_KEY || 'your-openai-api-key-here';

// Initialize Prisma Client
const prisma = new PrismaClient();

// JWT Authentication middleware
const authenticateToken = async (
  req: any,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de acceso requerido',
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, jwtSecret) as any;

    // Verify session exists and is not expired
    const session = await prisma.userSession.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado',
      });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        currentWorld: true,
        currentLevel: true,
        totalScore: true,
        logicPoints: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(403).json({
      success: false,
      message: 'Token inválido',
    });
  }
};

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'LogiVerse API Gateway',
    version: '1.0.0',
  });
});

// API Routes

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    });

    const { email, password } = loginSchema.parse(req.body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        age: true,
        role: true,
        currentWorld: true,
        currentLevel: true,
        totalScore: true,
        logicPoints: true,
        lastLogin: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos',
      });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET!;
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Update last login and store session
    await Promise.all([
      prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      }),
      prisma.userSession.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      }),
    ]);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword,
      token,
      message: `¡Bienvenido de vuelta, ${user.username}! 🦊`,
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Datos de login inválidos',
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const registerSchema = z.object({
      username: z.string().min(3).max(20),
      email: z.string().email(),
      password: z.string().min(6),
      age: z.number().min(8).max(120).optional(),
    });

    const userData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: userData.email }, { username: userData.username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Usuario ya existe con ese email o nombre de usuario',
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        age: userData.age,
        role: 'STUDENT',
      },
      select: {
        id: true,
        username: true,
        email: true,
        age: true,
        role: true,
        currentWorld: true,
        currentLevel: true,
        totalScore: true,
        logicPoints: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET!;
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Store session in database
    await prisma.userSession.create({
      data: {
        userId: newUser.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    res.json({
      success: true,
      user: newUser,
      token,
      message: '¡Bienvenido a LogiVerse! 🦊',
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Datos de registro inválidos',
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, async (req: any, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Remove session from database
      await prisma.userSession.deleteMany({
        where: { token },
      });
    }

    res.json({
      success: true,
      message: '¡Hasta luego! Vuelve pronto a LogiVerse 🦊',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error durante logout',
    });
  }
});

// Get current user info
app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo información del usuario',
    });
  }
});

// Game progress routes
app.get('/api/game/progress', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;

    // Get user progress from database
    const [user, userProgress, achievements] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          currentWorld: true,
          currentLevel: true,
          totalScore: true,
          logicPoints: true,
        },
      }),
      prisma.userProgress.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
      }),
      prisma.achievement.findMany({
        where: { userId },
        orderBy: { unlockedAt: 'desc' },
      }),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    const completedLevels = userProgress.filter(p => p.completed);
    const unlockedWorlds = [...new Set(userProgress.map(p => p.worldId))];

    res.json({
      success: true,
      progress: {
        userId,
        currentWorld: user.currentWorld,
        currentLevel: user.currentLevel,
        totalScore: user.totalScore,
        logicPoints: user.logicPoints,
        totalProblemsCompleted: completedLevels.length,
        achievements: achievements.map(a => ({
          type: a.type,
          title: a.title,
          description: a.description,
          points: a.points,
          unlockedAt: a.unlockedAt,
        })),
        unlockedWorlds,
        recentProgress: userProgress.slice(0, 5),
      },
    });
  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo progreso',
    });
  }
});

// Create test user endpoint (for development)
app.post('/api/dev/create-test-user', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Endpoint no disponible en producción',
      });
    }

    const testUser = await prisma.user.create({
      data: {
        username: 'TestPlayer',
        email: 'test@logiverse.com',
        password: await bcrypt.hash('password123', 12),
        age: 15,
        role: 'STUDENT',
      },
    });

    // Create some test achievements
    await prisma.achievement.createMany({
      data: [
        {
          userId: testUser.id,
          type: 'first-steps',
          title: 'Primeros Pasos',
          description: 'Completaste tu primer nivel',
          points: 10,
        },
        {
          userId: testUser.id,
          type: 'truth-seeker',
          title: 'Buscador de la Verdad',
          description: 'Resolviste 5 problemas de lógica básica',
          points: 25,
        },
      ],
    });

    res.json({
      success: true,
      message: 'Usuario de prueba creado',
      user: {
        email: testUser.email,
        password: 'password123',
      },
    });
  } catch (error) {
    console.error('Test user creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando usuario de prueba',
    });
  }
});

// Loggie AI interaction routes
app.post('/api/loggie/chat', async (req, res) => {
  try {
    const chatSchema = z.object({
      message: z.string().min(1),
      userId: z.string(),
      context: z
        .object({
          currentWorld: z.string().optional(),
          currentLevel: z.number().optional(),
          emotion: z.string().optional(),
        })
        .optional(),
    });

    const { message, userId, context } = chatSchema.parse(req.body);

    // Use AI service for intelligent Loggie responses
    const aiContext: LoggieContext = {
      worldId: context?.currentWorld || 'villa-verdad',
      levelId: 'general-chat',
      levelTitle: 'Chat General',
      levelType: 'logic-puzzle',
      difficulty: 1,
      attempts: 1,
      hintsUsed: 0,
    };

    const aiResponse = await aiService.generateResponse(
      aiContext,
      'explanation',
      `El usuario dice: "${message}". Responde como Loggie de manera conversacional y educativa.`
    );

    res.json({
      success: true,
      loggie: {
        message: aiResponse.text,
        emotion: aiResponse.emotion,
        accessory: aiResponse.accessory,
        tone: aiResponse.tone,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Loggie chat error:', error);
    res.status(400).json({
      success: false,
      message: 'Error processing chat message',
    });
  }
});

// 🤖 AI-Powered Loggie Responses for Game Levels
app.post(
  '/api/loggie/level-start',
  authenticateToken,
  async (req: any, res) => {
    try {
      const levelStartSchema = z.object({
        worldId: z.string(),
        levelId: z.string(),
        levelTitle: z.string(),
        levelType: z.enum([
          'logic-puzzle',
          'truth-table',
          'syllogism',
          'pattern',
          'debate',
          'challenge',
        ]),
        difficulty: z.number().min(1).max(5),
      });

      const context = levelStartSchema.parse(req.body);
      const aiContext: LoggieContext = {
        ...context,
        attempts: 1,
        hintsUsed: 0,
        correctAnswer: '',
      };

      const aiResponse = await aiService.generateResponse(
        aiContext,
        'level-start'
      );

      res.json({
        success: true,
        loggie: aiResponse,
      });
    } catch (error) {
      console.error('Level start response error:', error);
      res.status(400).json({
        success: false,
        message: 'Error generating level start response',
      });
    }
  }
);

app.post('/api/loggie/hint', authenticateToken, async (req: any, res) => {
  try {
    const hintSchema = z.object({
      worldId: z.string(),
      levelId: z.string(),
      levelTitle: z.string(),
      levelType: z.enum([
        'logic-puzzle',
        'truth-table',
        'syllogism',
        'pattern',
        'debate',
        'challenge',
      ]),
      difficulty: z.number().min(1).max(5),
      attempts: z.number(),
      hintsUsed: z.number(),
      correctAnswer: z.string(),
    });

    const context = hintSchema.parse(req.body);
    const aiContext: LoggieContext = context;

    const aiResponse = await aiService.generateResponse(aiContext, 'hint');

    res.json({
      success: true,
      loggie: aiResponse,
    });
  } catch (error) {
    console.error('Hint response error:', error);
    res.status(400).json({
      success: false,
      message: 'Error generating hint response',
    });
  }
});

app.post('/api/loggie/feedback', authenticateToken, async (req: any, res) => {
  try {
    const feedbackSchema = z.object({
      worldId: z.string(),
      levelId: z.string(),
      levelTitle: z.string(),
      levelType: z.enum([
        'logic-puzzle',
        'truth-table',
        'syllogism',
        'pattern',
        'debate',
        'challenge',
      ]),
      difficulty: z.number().min(1).max(5),
      attempts: z.number(),
      hintsUsed: z.number(),
      userAnswer: z.string(),
      correctAnswer: z.string(),
      isCorrect: z.boolean(),
    });

    const context = feedbackSchema.parse(req.body);
    const aiContext: LoggieContext = context;

    const responseType = context.isCorrect ? 'correct' : 'incorrect';
    const aiResponse = await aiService.generateResponse(
      aiContext,
      responseType
    );

    res.json({
      success: true,
      loggie: aiResponse,
    });
  } catch (error) {
    console.error('Feedback response error:', error);
    res.status(400).json({
      success: false,
      message: 'Error generating feedback response',
    });
  }
});

app.post(
  '/api/loggie/encouragement',
  authenticateToken,
  async (req: any, res) => {
    try {
      const encouragementSchema = z.object({
        worldId: z.string(),
        levelId: z.string(),
        levelTitle: z.string(),
        levelType: z.enum([
          'logic-puzzle',
          'truth-table',
          'syllogism',
          'pattern',
          'debate',
          'challenge',
        ]),
        difficulty: z.number().min(1).max(5),
        attempts: z.number(),
        hintsUsed: z.number(),
        correctAnswer: z.string(),
      });

      const context = encouragementSchema.parse(req.body);
      const aiContext: LoggieContext = context;

      const aiResponse = await aiService.generateResponse(
        aiContext,
        'encouragement'
      );

      res.json({
        success: true,
        loggie: aiResponse,
      });
    } catch (error) {
      console.error('Encouragement response error:', error);
      res.status(400).json({
        success: false,
        message: 'Error generating encouragement response',
      });
    }
  }
);

app.post(
  '/api/loggie/custom-hint',
  authenticateToken,
  async (req: any, res) => {
    try {
      const customHintSchema = z.object({
        worldId: z.string(),
        levelId: z.string(),
        levelTitle: z.string(),
        levelType: z.enum([
          'logic-puzzle',
          'truth-table',
          'syllogism',
          'pattern',
          'debate',
          'challenge',
        ]),
        difficulty: z.number().min(1).max(5),
        attempts: z.number(),
        hintsUsed: z.number(),
        correctAnswer: z.string(),
        specificQuestion: z.string(),
      });

      const context = customHintSchema.parse(req.body);
      const aiContext: LoggieContext = {
        worldId: context.worldId,
        levelId: context.levelId,
        levelTitle: context.levelTitle,
        levelType: context.levelType,
        difficulty: context.difficulty,
        attempts: context.attempts,
        hintsUsed: context.hintsUsed,
        correctAnswer: context.correctAnswer,
      };

      const aiResponse = await aiService.generateCustomHint(
        aiContext,
        context.specificQuestion
      );

      res.json({
        success: true,
        loggie: aiResponse,
      });
    } catch (error) {
      console.error('Custom hint response error:', error);
      res.status(400).json({
        success: false,
        message: 'Error generating custom hint response',
      });
    }
  }
);

// 🚀 RUTAS MULTIJUGADOR ÉPICAS - ¡LA REVOLUCIÓN DE LOGIVERSE!

// Obtener salas disponibles
app.get('/api/multiplayer/rooms', authenticateToken, async (req: any, res) => {
  try {
    // Mock data para empezar - pronto con datos reales
    const mockRooms = [
      {
        id: 'room-1',
        name: '🏆 Arena de Lógica Épica',
        type: 'RANKED',
        currentPlayers: 3,
        maxPlayers: 4,
        difficulty: [1, 2],
        worlds: ['villa-verdad'],
        status: 'WAITING',
      },
      {
        id: 'room-2',
        name: '🧩 Puzzles Rápidos',
        type: 'SPEED',
        currentPlayers: 2,
        maxPlayers: 6,
        difficulty: [2, 3],
        worlds: ['villa-verdad'],
        status: 'WAITING',
      },
    ];

    res.json({
      success: true,
      rooms: mockRooms,
      message: '¡Salas multijugador disponibles! (Versión inicial)',
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo salas',
    });
  }
});

// Obtener tabla de clasificación
app.get('/api/multiplayer/leaderboard', async (req, res) => {
  try {
    // Mock leaderboard - pronto con datos reales
    const mockLeaderboard = [
      { rank: 1, username: 'LogicMaster', score: 2847, gamesWon: 45 },
      { rank: 2, username: 'DebateKing', score: 2693, gamesWon: 38 },
      { rank: 3, username: 'PuzzleQueen', score: 2541, gamesWon: 32 },
      { rank: 4, username: 'ThinkFast', score: 2398, gamesWon: 28 },
      { rank: 5, username: 'LogicNinja', score: 2256, gamesWon: 25 },
    ];

    res.json({
      success: true,
      leaderboard: mockLeaderboard,
      message: '¡Top jugadores de LogiVerse! 🏆',
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo tabla de clasificación',
    });
  }
});

// Obtener estadísticas de jugador
app.get('/api/multiplayer/stats', authenticateToken, async (req: any, res) => {
  try {
    // Mock stats - pronto con datos reales del usuario
    const mockStats = {
      globalRank: 142,
      eloRating: 1456,
      totalGamesPlayed: 23,
      totalGamesWon: 15,
      winRate: '65%',
      averageTime: 45.2,
      favoriteWorld: 'Villa Verdad',
      currentStreak: 3,
      maxStreak: 8,
      achievements: ['Primera Victoria', 'Velocista', 'Pensador Rápido'],
    };

    res.json({
      success: true,
      stats: mockStats,
      message: '¡Tus estadísticas de batallas lógicas! 📊',
    });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
    });
  }
});

// 🚀 Inicializar Servicio Multijugador Épico (temporalmente comentado para debuggear)
// const multiplayerService = new MultiplayerService(prisma, io);

// WebSocket connection handling con multijugador épico
io.on('connection', socket => {
  console.log(`🦊 User connected: ${socket.id}`);

  // Eventos originales (mantener compatibilidad)
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('loggie-emotion-change', data => {
    socket.broadcast.emit('loggie-emotion-update', {
      emotion: data.emotion,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('chat-message', data => {
    socket.broadcast.emit('new-message', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  });

  // 🎮 El servicio multijugador maneja sus propios eventos automáticamente
  // Los eventos están definidos en multiplayerService.ts:
  // - join_room, leave_room, create_room, room_message
  // - start_game, submit_answer, request_hint, player_ready

  socket.on('disconnect', () => {
    console.log(`🦊 User disconnected: ${socket.id}`);
    // El servicio multijugador maneja las desconexiones automáticamente
  });
});

// Error handling middleware
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
🦊 ===================================
   LogiVerse API Gateway Started!
🦊 ===================================
   Port: ${PORT}
   Environment: ${process.env.NODE_ENV || 'development'}
   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}
   
   🚀 Ready to serve logic and fun!
🦊 ===================================
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🦊 Received SIGTERM. Shutting down gracefully...');
  server.close(() => {
    console.log('🦊 Process terminated');
  });
});

export default app;
