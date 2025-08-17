// Hook personalizado para interactuar con Loggie inteligente 🤖

import { useState } from 'react';
import type { LoggieResponse } from '../types/game';

interface AILoggieContext {
  worldId: string;
  levelId: string;
  levelTitle: string;
  levelType:
    | 'logic-puzzle'
    | 'truth-table'
    | 'syllogism'
    | 'pattern'
    | 'debate'
    | 'challenge';
  difficulty: number;
  attempts?: number;
  hintsUsed?: number;
  userAnswer?: string;
  correctAnswer?: string;
  isCorrect?: boolean;
}

interface UseAILoggieResult {
  isLoading: boolean;
  error: string | null;
  getLevelStartResponse: (
    context: AILoggieContext
  ) => Promise<LoggieResponse | null>;
  getHintResponse: (context: AILoggieContext) => Promise<LoggieResponse | null>;
  getFeedbackResponse: (
    context: AILoggieContext & {
      userAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
    }
  ) => Promise<LoggieResponse | null>;
  getEncouragementResponse: (
    context: AILoggieContext
  ) => Promise<LoggieResponse | null>;
  getCustomHintResponse: (
    context: AILoggieContext & { specificQuestion: string }
  ) => Promise<LoggieResponse | null>;
  sendChatMessage: (
    message: string,
    context?: Partial<AILoggieContext>
  ) => Promise<LoggieResponse | null>;
}

const API_BASE_URL = 'http://localhost:3001/api';

export const useAILoggie = (): UseAILoggieResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeRequest = async (
    endpoint: string,
    data: any
  ): Promise<LoggieResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('logiverse_token');

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.loggie) {
        return result.loggie;
      } else {
        throw new Error(
          result.message || 'Error al obtener respuesta de Loggie'
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMessage);
      console.error('AI Loggie error:', err);

      // Fallback response si falla la API
      return {
        text: '¡Hola! Soy Loggie. Parece que tengo problemas técnicos, pero estoy aquí para ayudarte con la lógica! 🦊',
        emotion: 'friendly',
        context: 'level-start',
        accessory: 'scarf',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelStartResponse = async (
    context: AILoggieContext
  ): Promise<LoggieResponse | null> => {
    return makeRequest('/loggie/level-start', {
      worldId: context.worldId,
      levelId: context.levelId,
      levelTitle: context.levelTitle,
      levelType: context.levelType,
      difficulty: context.difficulty,
    });
  };

  const getHintResponse = async (
    context: AILoggieContext
  ): Promise<LoggieResponse | null> => {
    if (!context.attempts || !context.hintsUsed || !context.correctAnswer) {
      throw new Error('Faltan datos para generar pista');
    }

    return makeRequest('/loggie/hint', {
      worldId: context.worldId,
      levelId: context.levelId,
      levelTitle: context.levelTitle,
      levelType: context.levelType,
      difficulty: context.difficulty,
      attempts: context.attempts,
      hintsUsed: context.hintsUsed,
      correctAnswer: context.correctAnswer,
    });
  };

  const getFeedbackResponse = async (
    context: AILoggieContext & {
      userAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
    }
  ): Promise<LoggieResponse | null> => {
    if (!context.attempts || !context.hintsUsed) {
      throw new Error('Faltan datos para generar feedback');
    }

    return makeRequest('/loggie/feedback', {
      worldId: context.worldId,
      levelId: context.levelId,
      levelTitle: context.levelTitle,
      levelType: context.levelType,
      difficulty: context.difficulty,
      attempts: context.attempts,
      hintsUsed: context.hintsUsed,
      userAnswer: context.userAnswer,
      correctAnswer: context.correctAnswer,
      isCorrect: context.isCorrect,
    });
  };

  const getEncouragementResponse = async (
    context: AILoggieContext
  ): Promise<LoggieResponse | null> => {
    if (!context.attempts || !context.hintsUsed || !context.correctAnswer) {
      throw new Error('Faltan datos para generar ánimo');
    }

    return makeRequest('/loggie/encouragement', {
      worldId: context.worldId,
      levelId: context.levelId,
      levelTitle: context.levelTitle,
      levelType: context.levelType,
      difficulty: context.difficulty,
      attempts: context.attempts,
      hintsUsed: context.hintsUsed,
      correctAnswer: context.correctAnswer,
    });
  };

  const getCustomHintResponse = async (
    context: AILoggieContext & { specificQuestion: string }
  ): Promise<LoggieResponse | null> => {
    if (!context.attempts || !context.hintsUsed || !context.correctAnswer) {
      throw new Error('Faltan datos para generar pista personalizada');
    }

    return makeRequest('/loggie/custom-hint', {
      worldId: context.worldId,
      levelId: context.levelId,
      levelTitle: context.levelTitle,
      levelType: context.levelType,
      difficulty: context.difficulty,
      attempts: context.attempts,
      hintsUsed: context.hintsUsed,
      correctAnswer: context.correctAnswer,
      specificQuestion: context.specificQuestion,
    });
  };

  const sendChatMessage = async (
    message: string,
    context?: Partial<AILoggieContext>
  ): Promise<LoggieResponse | null> => {
    return makeRequest('/loggie/chat', {
      message,
      userId: 'current-user', // Se puede obtener del contexto de auth
      context: {
        currentWorld: context?.worldId || 'villa-verdad',
        currentLevel: context?.difficulty || 1,
        emotion: 'friendly',
      },
    });
  };

  return {
    isLoading,
    error,
    getLevelStartResponse,
    getHintResponse,
    getFeedbackResponse,
    getEncouragementResponse,
    getCustomHintResponse,
    sendChatMessage,
  };
};

export default useAILoggie;
