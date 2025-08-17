import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import LoggieAvatar from '../loggie/LoggieAvatar';
import type { GameLevel, GameSession, LoggieResponse } from '../../types/game';
import { villaVerdadLoggieResponses } from '../../data/villa-verdad';
import { useAILoggie } from '../../hooks/useAILoggie';

interface GameEngineProps {
  level: GameLevel;
  onLevelComplete: (session: GameSession) => void;
  onExit: () => void;
}

export const GameEngine: React.FC<GameEngineProps> = ({ level, onLevelComplete, onExit }) => {
  const { user } = useAuth();
  const { 
    getLevelStartResponse, 
    getHintResponse, 
    getFeedbackResponse 
  } = useAILoggie();
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [userAnswer, setUserAnswer] = useState<string | string[] | number>('');
  const [showHints, setShowHints] = useState(false);
  const [hintsUsed, setHintsUsed] = useState<string[]>([]);
  const [currentHint, setCurrentHint] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(level.timeLimit || 0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    message: string;
    loggieResponse: LoggieResponse;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLoggieResponse, setCurrentLoggieResponse] = useState<LoggieResponse | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Inicializar sesión de juego
  useEffect(() => {
    if (user) {
      const session: GameSession = {
        id: `session-${Date.now()}`,
        userId: user.id,
        worldId: level.worldId,
        levelId: level.id,
        startTime: new Date(),
        score: level.maxScore,
        maxScore: level.maxScore,
        attempts: 0,
        hintsUsed: [],
        timeSpent: 0,
        completed: false,
        perfect: false
      };
      setGameSession(session);
    }
  }, [user, level]);

  // Cargar respuesta inicial de Loggie con IA
  useEffect(() => {
    const loadInitialLoggieResponse = async () => {
      if (!level) return;
      
      setIsLoadingAI(true);
      try {
        const aiResponse = await getLevelStartResponse({
          worldId: level.worldId,
          levelId: level.id,
          levelTitle: level.title,
          levelType: level.type,
          difficulty: level.difficulty
        });
        
        if (aiResponse) {
          setCurrentLoggieResponse(aiResponse);
        }
      } catch (error) {
        console.error('Error loading initial Loggie response:', error);
        // Fallback a respuesta estática
        const fallbackResponse = villaVerdadLoggieResponses.levelStart[level.levelNumber as keyof typeof villaVerdadLoggieResponses.levelStart] || {
          text: '¡Hola! Soy Loggie y estoy emocionado de resolver este desafío contigo! 🦊',
          emotion: 'friendly',
          context: 'level-start',
          accessory: 'scarf'
        };
        setCurrentLoggieResponse(fallbackResponse);
      } finally {
        setIsLoadingAI(false);
      }
    };

    loadInitialLoggieResponse();
  }, [level, getLevelStartResponse]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !feedback?.isCorrect) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !feedback) {
      handleSubmit(); // Auto-submit when time runs out
    }
  }, [timeRemaining, feedback]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = (): number => {
    if (!gameSession) return 0;
    
    let score = gameSession.maxScore;
    
    // Penalizar por intentos adicionales
    if (attempts > 1) {
      score -= (attempts - 1) * 10;
    }
    
    // Penalizar por pistas usadas
    const hintPenalty = hintsUsed.reduce((total, hintId) => {
      const hint = level.hints.find(h => h.id === hintId);
      return total + (hint?.cost || 0);
    }, 0);
    score -= hintPenalty;
    
    // Bonus por tiempo restante (si hay límite de tiempo)
    if (level.timeLimit && timeRemaining > 0) {
      const timeBonus = Math.floor((timeRemaining / level.timeLimit) * 20);
      score += timeBonus;
    }
    
    return Math.max(score, 10); // Mínimo 10 puntos
  };

  const getLoggieResponse = (context: 'correct' | 'incorrect' | 'level-start'): LoggieResponse => {
    if (context === 'level-start') {
      return villaVerdadLoggieResponses.levelStart[level.levelNumber as keyof typeof villaVerdadLoggieResponses.levelStart] || {
        text: '¡Vamos a resolver este desafío juntos! 🦊',
        emotion: 'friendly',
        context: 'level-start',
        accessory: 'scarf'
      };
    }
    
    const responses = context === 'correct' 
      ? villaVerdadLoggieResponses.correct 
      : villaVerdadLoggieResponses.incorrect;
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const checkAnswer = (): boolean => {
    const { correctAnswer, type } = level.content;
    
    if (type === 'multiple-choice') {
      return userAnswer === correctAnswer;
    } else if (type === 'true-false') {
      return userAnswer === correctAnswer;
    } else if (type === 'text-input') {
      const userStr = String(userAnswer).toLowerCase().trim();
      const correctStr = String(correctAnswer).toLowerCase().trim();
      return userStr === correctStr;
    } else if (type === 'fill-blank') {
      return Array.isArray(userAnswer) && Array.isArray(correctAnswer)
        ? userAnswer.every((ans, idx) => ans === correctAnswer[idx])
        : userAnswer === correctAnswer;
    }
    
    return false;
  };

  const handleSubmit = async () => {
    if (isSubmitting || !gameSession) return;
    
    setIsSubmitting(true);
    setAttempts(prev => prev + 1);
    
    const isCorrect = checkAnswer();
    const finalScore = isCorrect ? calculateScore() : 0;
    
    const updatedSession: GameSession = {
      ...gameSession,
      endTime: new Date(),
      score: finalScore,
      attempts: attempts + 1,
      hintsUsed,
      timeSpent: (level.timeLimit || 300) - timeRemaining,
      completed: isCorrect,
      perfect: isCorrect && attempts === 0 && hintsUsed.length === 0
    };
    
    setGameSession(updatedSession);
    
    // Usar IA para generar respuesta de feedback
    setIsLoadingAI(true);
    try {
      const aiResponse = await getFeedbackResponse({
        worldId: level.worldId,
        levelId: level.id,
        levelTitle: level.title,
        levelType: level.type,
        difficulty: level.difficulty,
        attempts: attempts + 1,
        hintsUsed: hintsUsed.length,
        userAnswer: String(userAnswer),
        correctAnswer: String(level.content.correctAnswer),
        isCorrect
      });

      const loggieResponse = aiResponse || getLoggieResponse(isCorrect ? 'correct' : 'incorrect');
      setCurrentLoggieResponse(loggieResponse);
      
      setFeedback({
        isCorrect,
        message: isCorrect ? level.content.explanation : 'No es correcto. ¡Inténtalo de nuevo!',
        loggieResponse
      });
    } catch (error) {
      console.error('Error getting AI feedback:', error);
      // Fallback a respuesta estática
      const loggieResponse = getLoggieResponse(isCorrect ? 'correct' : 'incorrect');
      setCurrentLoggieResponse(loggieResponse);
      
      setFeedback({
        isCorrect,
        message: isCorrect ? level.content.explanation : 'No es correcto. ¡Inténtalo de nuevo!',
        loggieResponse
      });
    } finally {
      setIsLoadingAI(false);
    }
    
    if (isCorrect) {
      setTimeout(() => {
        onLevelComplete(updatedSession);
      }, 3000);
    }
    
    setIsSubmitting(false);
  };

  const useHint = async (hintId: string) => {
    if (!hintsUsed.includes(hintId)) {
      setHintsUsed(prev => [...prev, hintId]);
      setCurrentHint(prev => prev + 1);

      // Usar IA para generar pista inteligente
      setIsLoadingAI(true);
      try {
        const aiResponse = await getHintResponse({
          worldId: level.worldId,
          levelId: level.id,
          levelTitle: level.title,
          levelType: level.type,
          difficulty: level.difficulty,
          attempts: attempts,
          hintsUsed: hintsUsed.length + 1,
          correctAnswer: String(level.content.correctAnswer)
        });

        if (aiResponse) {
          setCurrentLoggieResponse(aiResponse);
        }
      } catch (error) {
        console.error('Error getting AI hint:', error);
      } finally {
        setIsLoadingAI(false);
      }
    }
  };

  const renderQuestion = () => {
    const { type, options } = level.content;
    
    if (type === 'multiple-choice' && options) {
      return (
        <div className="space-y-3">
          {options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => setUserAnswer(option)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                userAnswer === option
                  ? 'border-loggie-orange bg-loggie-orange/20 text-white'
                  : 'border-white/20 bg-white/10 text-white/80 hover:border-white/40'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-source">{option}</span>
            </motion.button>
          ))}
        </div>
      );
    } else if (type === 'text-input') {
      return (
        <div className="space-y-4">
          <input
            type="text"
            value={userAnswer as string}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-loggie-orange focus:border-transparent"
            placeholder="Escribe tu respuesta aquí..."
          />
        </div>
      );
    } else if (type === 'true-false') {
      return (
        <div className="flex gap-4">
          <motion.button
            onClick={() => setUserAnswer('Verdadero')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              userAnswer === 'Verdadero'
                ? 'border-growth-green bg-growth-green/20 text-white'
                : 'border-white/20 bg-white/10 text-white/80 hover:border-white/40'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ✅ Verdadero
          </motion.button>
          <motion.button
            onClick={() => setUserAnswer('Falso')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              userAnswer === 'Falso'
                ? 'border-challenge-red bg-challenge-red/20 text-white'
                : 'border-white/20 bg-white/10 text-white/80 hover:border-white/40'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ❌ Falso
          </motion.button>
        </div>
      );
    }
    
    return null;
  };

  if (!gameSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-intelligence-blue via-magic-purple to-loggie-orange flex items-center justify-center">
        <div className="text-center">
          <LoggieAvatar emotion="thinking" size="xl" accessory="glasses" isAnimated={true} />
          <p className="text-white font-source mt-4">Cargando nivel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-growth-green via-intelligence-blue to-magic-purple p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onExit}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all"
          >
            ← Salir
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-orbitron font-bold text-white">
              {level.title}
            </h1>
            <p className="text-white/70 font-source">
              Nivel {level.levelNumber} • Villa Verdad
            </p>
          </div>
          
          <div className="text-right">
            {level.timeLimit && (
              <div className="text-white font-orbitron">
                ⏱️ {formatTime(timeRemaining)}
              </div>
            )}
            <div className="text-white/70 text-sm font-source">
              Puntos: {calculateScore()}
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-white/20 rounded-full h-2">
          <motion.div
            className="bg-loggie-orange rounded-full h-2"
            initial={{ width: 0 }}
            animate={{ width: `${((level.levelNumber - 1) / 5) * 100}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel izquierdo - Loggie */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="magic-card"
        >
          <div className="text-center mb-6">
            <LoggieAvatar
              emotion={currentLoggieResponse?.emotion || 'friendly'}
              size="lg"
              accessory={currentLoggieResponse?.accessory || 'scarf'}
              isAnimated={true}
            />
            <div className="mt-4 p-4 bg-white/10 rounded-lg">
              {isLoadingAI ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <p className="text-white/70 font-source text-sm">
                    Loggie está pensando...
                  </p>
                </div>
              ) : (
                <p className="text-white font-source text-sm">
                  {currentLoggieResponse?.text || '¡Hola! Soy Loggie y estoy aquí para ayudarte! 🦊'}
                </p>
              )}
            </div>
          </div>
          
          {/* Pistas */}
          <div className="space-y-4">
            <button
              onClick={() => setShowHints(!showHints)}
              className="w-full loggie-button"
            >
              💡 {showHints ? 'Ocultar' : 'Ver'} Pistas ({level.hints.length})
            </button>
            
            <AnimatePresence>
              {showHints && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  {level.hints.map((hint, index) => (
                    <div
                      key={hint.id}
                      className={`p-3 rounded-lg border ${
                        hintsUsed.includes(hint.id)
                          ? 'border-energy-yellow/40 bg-energy-yellow/20 text-white'
                          : index <= currentHint
                          ? 'border-white/20 bg-white/10 text-white/80'
                          : 'border-white/10 bg-white/5 text-white/50'
                      }`}
                    >
                      {hintsUsed.includes(hint.id) ? (
                        <p className="text-sm font-source">{hint.text}</p>
                      ) : index <= currentHint ? (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-source">Pista {index + 1}</span>
                          <button
                            onClick={() => useHint(hint.id)}
                            disabled={isLoadingAI}
                            className="text-xs bg-energy-yellow text-black px-2 py-1 rounded disabled:opacity-50"
                          >
                            {isLoadingAI ? 'Cargando...' : `Ver (-${hint.cost} pts)`}
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm font-source">🔒 Pista bloqueada</p>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Panel central - Juego */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lg:col-span-2 magic-card"
        >
          <div className="mb-6">
            <div className="mb-4 p-4 bg-white/10 rounded-lg">
              <p className="text-white/80 font-source text-sm mb-2">
                {level.content.context}
              </p>
            </div>
            
            <div className="mb-6">
              <div className="text-white font-source whitespace-pre-line text-lg leading-relaxed">
                {level.content.problem}
              </div>
            </div>
            
            <h3 className="text-xl font-orbitron font-bold text-white mb-4">
              {level.content.question}
            </h3>
          </div>

          {/* Área de respuesta */}
          <div className="mb-6">
            {renderQuestion()}
          </div>

          {/* Botón de enviar */}
          <div className="flex justify-center">
            <motion.button
              onClick={handleSubmit}
              disabled={!userAnswer || isSubmitting || feedback?.isCorrect}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                feedback?.isCorrect
                  ? 'bg-growth-green text-white cursor-not-allowed'
                  : !userAnswer || isSubmitting
                  ? 'bg-white/20 text-white/50 cursor-not-allowed'
                  : 'bg-loggie-orange hover:bg-orange-600 text-white hover:scale-105'
              }`}
              whileHover={!userAnswer || isSubmitting || feedback?.isCorrect ? {} : { scale: 1.05 }}
              whileTap={!userAnswer || isSubmitting || feedback?.isCorrect ? {} : { scale: 0.95 }}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verificando...
                </div>
              ) : feedback?.isCorrect ? (
                '✅ ¡Correcto!'
              ) : (
                '🚀 Enviar Respuesta'
              )}
            </motion.button>
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mt-6 p-4 rounded-lg border-2 ${
                  feedback.isCorrect
                    ? 'border-growth-green/40 bg-growth-green/20'
                    : 'border-challenge-red/40 bg-challenge-red/20'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">
                    {feedback.isCorrect ? '🎉' : '🤔'}
                  </div>
                  <div>
                    <p className="text-white font-source">
                      {feedback.message}
                    </p>
                    {feedback.isCorrect && (
                      <div className="mt-2 text-sm text-white/80">
                        <p>🎯 Puntuación final: {calculateScore()} puntos</p>
                        <p>⚡ Intentos: {attempts}</p>
                        <p>💡 Pistas usadas: {hintsUsed.length}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default GameEngine;
