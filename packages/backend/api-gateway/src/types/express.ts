// 🎯 Tipos personalizados para Express con LogiVerse
import { Request } from 'express';

// 👤 Usuario autenticado en el request
export interface AuthenticatedUser {
  userId: string;
  email: string;
  username: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

// 🔐 Request con usuario autenticado
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

// 🎮 Contexto de Loggie para IA
export interface LoggieRequestContext {
  currentLevel?: number;
  worldId?: string;
  playerProgress?: {
    score: number;
    hintsUsed: number;
    timeSpent: number;
  };
  difficulty?: 'easy' | 'medium' | 'hard';
}

// 🤖 Request para endpoints de Loggie IA
export interface LoggieAIRequest extends AuthenticatedRequest {
  body: {
    message?: string;
    context?: LoggieRequestContext;
    level?: number;
    isCorrect?: boolean;
    playerAnswer?: string;
    expectedAnswer?: string;
    hintsUsed?: number;
    timeSpent?: number;
  };
}

// 🏆 Request para torneos
export interface TournamentRequest extends AuthenticatedRequest {
  params: {
    tournamentId?: string;
  };
  body: {
    tournamentSettings?: any; // Se puede tipar más específicamente después
  };
}

// 🎮 Request para multijugador
export interface MultiplayerRequest extends AuthenticatedRequest {
  params: {
    roomId?: string;
    userId?: string;
  };
  body: {
    roomSettings?: any; // Se puede tipar más específicamente después
    gameData?: any;
  };
}
