import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WorldMap from './WorldMap';
import GameEngine from './GameEngine';
import type { GameWorld, GameLevel, GameSession } from '../../types/game';
import { villaVerdadWorld } from '../../data/villa-verdad';

type GameState = 'world-map' | 'playing' | 'level-complete';

interface GameManagerProps {
  onBackToDashboard: () => void;
}

export const GameManager: React.FC<GameManagerProps> = ({
  onBackToDashboard,
}) => {
  const [gameState, setGameState] = useState<GameState>('world-map');
  const [currentWorld] = useState<GameWorld>(villaVerdadWorld);
  const [currentLevel, setCurrentLevel] = useState<GameLevel | null>(null);
  const [completedSession, setCompletedSession] = useState<GameSession | null>(
    null
  );

  const handleLevelSelect = (level: GameLevel) => {
    setCurrentLevel(level);
    setGameState('playing');
  };

  const handleLevelComplete = (session: GameSession) => {
    setCompletedSession(session);
    setGameState('level-complete');

    // Auto-volver al mapa después de mostrar resultados
    setTimeout(() => {
      setGameState('world-map');
      setCurrentLevel(null);
      setCompletedSession(null);
    }, 5000);
  };

  const handleExitLevel = () => {
    setGameState('world-map');
    setCurrentLevel(null);
  };

  const renderLevelComplete = () => {
    if (!completedSession || !currentLevel) return null;

    const isPerfect = completedSession.perfect;
    const scorePercentage =
      (completedSession.score / completedSession.maxScore) * 100;

    let performance = '';
    let performanceColor = '';
    let emoji = '';

    if (isPerfect) {
      performance = '¡PERFECTO!';
      performanceColor = 'text-energy-yellow';
      emoji = '🏆';
    } else if (scorePercentage >= 90) {
      performance = '¡EXCELENTE!';
      performanceColor = 'text-growth-green';
      emoji = '⭐';
    } else if (scorePercentage >= 70) {
      performance = '¡BIEN HECHO!';
      performanceColor = 'text-loggie-orange';
      emoji = '👏';
    } else {
      performance = '¡COMPLETADO!';
      performanceColor = 'text-intelligence-blue';
      emoji = '✅';
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div className="max-w-2xl mx-4 magic-card text-center">
          {/* Celebration animation */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-8xl mb-4"
            >
              {emoji}
            </motion.div>
            <h1
              className={`text-4xl font-orbitron font-bold mb-2 ${performanceColor}`}
            >
              {performance}
            </h1>
            <h2 className="text-2xl text-white font-source">
              {currentLevel.title} Completado
            </h2>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-orbitron font-bold text-energy-yellow">
                {completedSession.score}
              </div>
              <div className="text-white/70 text-sm font-source">Puntos</div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-orbitron font-bold text-intelligence-blue">
                {completedSession.attempts}
              </div>
              <div className="text-white/70 text-sm font-source">Intentos</div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-orbitron font-bold text-magic-purple">
                {completedSession.hintsUsed.length}
              </div>
              <div className="text-white/70 text-sm font-source">Pistas</div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-orbitron font-bold text-growth-green">
                {Math.floor(completedSession.timeSpent)}s
              </div>
              <div className="text-white/70 text-sm font-source">Tiempo</div>
            </div>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mb-6"
          >
            <div className="bg-white/20 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scorePercentage}%` }}
                transition={{ delay: 0.8, duration: 1.5 }}
                className={`h-full rounded-full ${
                  isPerfect
                    ? 'bg-energy-yellow'
                    : scorePercentage >= 90
                      ? 'bg-growth-green'
                      : scorePercentage >= 70
                        ? 'bg-loggie-orange'
                        : 'bg-intelligence-blue'
                }`}
              />
            </div>
            <p className="text-white/70 text-sm font-source mt-2">
              {scorePercentage.toFixed(1)}% de puntuación máxima
            </p>
          </motion.div>

          {/* Achievements */}
          {isPerfect && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mb-6 p-4 bg-energy-yellow/20 border border-energy-yellow/40 rounded-lg"
            >
              <h3 className="text-energy-yellow font-orbitron font-bold mb-2">
                🏆 ¡Logro Desbloqueado!
              </h3>
              <p className="text-white font-source">
                "Maestro de la Lógica" - Completaste el nivel sin usar pistas y
                en el primer intento
              </p>
            </motion.div>
          )}

          {/* Next level hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-white/70 font-source"
          >
            <p>Volviendo al mapa en unos segundos...</p>
            <p className="text-sm mt-1">¡El siguiente nivel te espera! 🦊</p>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {gameState === 'world-map' && (
          <motion.div
            key="world-map"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5 }}
          >
            <WorldMap
              world={currentWorld}
              onLevelSelect={handleLevelSelect}
              onBackToDashboard={onBackToDashboard}
            />
          </motion.div>
        )}

        {gameState === 'playing' && currentLevel && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.5 }}
          >
            <GameEngine
              level={currentLevel}
              onLevelComplete={handleLevelComplete}
              onExit={handleExitLevel}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level complete overlay */}
      <AnimatePresence>
        {gameState === 'level-complete' && renderLevelComplete()}
      </AnimatePresence>
    </div>
  );
};

export default GameManager;
