import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import LoggieAvatar from '../loggie/LoggieAvatar';
import type { GameWorld, GameLevel, GameSession } from '../../types/game';
import { villaVerdadWorld } from '../../data/villa-verdad';

interface WorldMapProps {
  world: GameWorld;
  onLevelSelect: (level: GameLevel) => void;
  onBackToDashboard: () => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({ world, onLevelSelect, onBackToDashboard }) => {
  const { user } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<GameLevel | null>(null);

  // Simular progreso del usuario (esto vendría de la API)
  const userProgress = {
    completedLevels: ['vv-001', 'vv-002'], // Niveles completados
    currentLevel: 3, // Nivel actual
    scores: {
      'vv-001': 95,
      'vv-002': 87
    }
  };

  const isLevelUnlocked = (level: GameLevel): boolean => {
    // El primer nivel siempre está desbloqueado
    if (level.levelNumber === 1) return true;
    
    // Los siguientes niveles se desbloquean al completar el anterior
    const previousLevelId = `vv-${String(level.levelNumber - 1).padStart(3, '0')}`;
    return userProgress.completedLevels.includes(previousLevelId);
  };

  const isLevelCompleted = (level: GameLevel): boolean => {
    return userProgress.completedLevels.includes(level.id);
  };

  const getLevelScore = (level: GameLevel): number | null => {
    return userProgress.scores[level.id as keyof typeof userProgress.scores] || null;
  };

  const getDifficultyColor = (difficulty: number): string => {
    switch (difficulty) {
      case 1: return 'text-growth-green';
      case 2: return 'text-energy-yellow';
      case 3: return 'text-loggie-orange';
      case 4: return 'text-challenge-red';
      case 5: return 'text-magic-purple';
      default: return 'text-white';
    }
  };

  const getDifficultyStars = (difficulty: number): string => {
    return '⭐'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'logic-puzzle': return '🧩';
      case 'truth-table': return '📊';
      case 'syllogism': return '🕵️';
      case 'pattern': return '🔢';
      case 'debate': return '🎭';
      case 'challenge': return '⚡';
      default: return '🎯';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-growth-green via-intelligence-blue to-magic-purple p-6">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto mb-6">
          <button
            onClick={onBackToDashboard}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all"
          >
            ← Dashboard
          </button>
          
          <div className="text-center">
            <h1 className="text-5xl font-orbitron font-bold text-white mb-2">
              {world.name}
            </h1>
            <p className="text-xl text-white/80 font-source">
              {world.description}
            </p>
          </div>
          
          <div className="w-20"></div> {/* Spacer */}
        </div>

        {/* World stats */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="magic-card text-center">
            <h3 className="text-lg font-orbitron font-bold text-white mb-2">Progreso</h3>
            <div className="text-3xl font-bold text-growth-green">
              {userProgress.completedLevels.length}/{world.totalLevels}
            </div>
            <p className="text-white/70 font-source text-sm">Niveles completados</p>
          </div>
          
          <div className="magic-card text-center">
            <h3 className="text-lg font-orbitron font-bold text-white mb-2">Nivel Actual</h3>
            <div className="text-3xl font-bold text-energy-yellow">
              {userProgress.currentLevel}
            </div>
            <p className="text-white/70 font-source text-sm">Próximo desafío</p>
          </div>
          
          <div className="magic-card text-center">
            <h3 className="text-lg font-orbitron font-bold text-white mb-2">Puntuación Promedio</h3>
            <div className="text-3xl font-bold text-loggie-orange">
              {Object.values(userProgress.scores).length > 0 
                ? Math.round(Object.values(userProgress.scores).reduce((a, b) => a + b, 0) / Object.values(userProgress.scores).length)
                : 0}
            </div>
            <p className="text-white/70 font-source text-sm">Puntos por nivel</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Panel izquierdo - Loggie guía */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="magic-card"
        >
          <div className="text-center mb-6">
            <LoggieAvatar
              emotion="friendly"
              size="xl"
              accessory="scarf"
              isAnimated={true}
            />
          </div>
          
          <div className="mb-6 p-4 bg-white/10 rounded-lg">
            <h3 className="text-lg font-orbitron font-bold text-white mb-2">
              🦊 Guía de Loggie
            </h3>
            <p className="text-white/80 font-source text-sm mb-3">
              ¡Bienvenido a Villa Verdad! Aquí aprenderás los fundamentos de la lógica matemática.
            </p>
            <ul className="text-white/70 font-source text-xs space-y-1">
              <li>• Completa los niveles en orden</li>
              <li>• Usa pistas si necesitas ayuda</li>
              <li>• ¡Intenta obtener puntuación perfecta!</li>
              <li>• La práctica hace al maestro lógico</li>
            </ul>
          </div>

          {selectedLevel && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white/10 rounded-lg"
            >
              <h4 className="text-white font-orbitron font-bold mb-2">
                Nivel Seleccionado
              </h4>
              <p className="text-white/80 font-source text-sm mb-3">
                {selectedLevel.description}
              </p>
              <div className="space-y-2 text-xs text-white/70">
                <p>⭐ Dificultad: {getDifficultyStars(selectedLevel.difficulty)}</p>
                <p>🎯 Puntos máximos: {selectedLevel.maxScore}</p>
                <p>⏱️ Tiempo límite: {selectedLevel.timeLimit ? `${selectedLevel.timeLimit}s` : 'Sin límite'}</p>
                <p>💡 Pistas disponibles: {selectedLevel.hints.length}</p>
              </div>
              
              <motion.button
                onClick={() => onLevelSelect(selectedLevel)}
                className="w-full mt-4 loggie-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!isLevelUnlocked(selectedLevel)}
              >
                {isLevelUnlocked(selectedLevel) ? '🚀 ¡Comenzar!' : '🔒 Bloqueado'}
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Panel derecho - Mapa de niveles */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <div className="magic-card">
            <h2 className="text-2xl font-orbitron font-bold text-white mb-6 text-center">
              Mapa de Niveles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {world.levels.map((level, index) => {
                const unlocked = isLevelUnlocked(level);
                const completed = isLevelCompleted(level);
                const score = getLevelScore(level);
                const isCurrent = userProgress.currentLevel === level.levelNumber;
                
                return (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedLevel?.id === level.id
                        ? 'border-loggie-orange bg-loggie-orange/20 transform scale-105'
                        : unlocked
                        ? completed
                          ? 'border-growth-green/40 bg-growth-green/10 hover:border-growth-green/60'
                          : isCurrent
                          ? 'border-energy-yellow/40 bg-energy-yellow/10 hover:border-energy-yellow/60'
                          : 'border-white/20 bg-white/10 hover:border-white/40'
                        : 'border-white/10 bg-white/5 opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => unlocked && setSelectedLevel(level)}
                    whileHover={unlocked ? { scale: 1.02 } : {}}
                  >
                    {/* Estado del nivel */}
                    <div className="absolute top-2 right-2">
                      {completed ? (
                        <div className="text-growth-green text-xl">✅</div>
                      ) : isCurrent ? (
                        <div className="text-energy-yellow text-xl">⭐</div>
                      ) : unlocked ? (
                        <div className="text-white/60 text-xl">🎯</div>
                      ) : (
                        <div className="text-white/30 text-xl">🔒</div>
                      )}
                    </div>

                    {/* Contenido del nivel */}
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{getTypeIcon(level.type)}</span>
                        <h3 className="text-lg font-orbitron font-bold text-white">
                          Nivel {level.levelNumber}
                        </h3>
                      </div>
                      <h4 className="text-white/90 font-source font-semibold mb-1">
                        {level.title}
                      </h4>
                      <p className="text-white/70 font-source text-sm line-clamp-2">
                        {level.description}
                      </p>
                    </div>

                    {/* Stats del nivel */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Dificultad:</span>
                        <span className={getDifficultyColor(level.difficulty)}>
                          {getDifficultyStars(level.difficulty)}
                        </span>
                      </div>
                      
                      {score && (
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Tu puntuación:</span>
                          <span className="text-energy-yellow font-bold">
                            {score}/{level.maxScore}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Tipo:</span>
                        <span className="text-white/80 capitalize">
                          {level.type.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Indicador de nivel actual */}
                    {isCurrent && !completed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-energy-yellow text-black text-xs px-2 py-1 rounded-full font-bold"
                      >
                        ¡SIGUIENTE!
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Información adicional */}
            <div className="mt-8 p-4 bg-white/10 rounded-lg">
              <h3 className="text-lg font-orbitron font-bold text-white mb-3">
                🏆 Desafíos de Villa Verdad
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="text-white font-semibold mb-2">🎯 Objetivos:</h4>
                  <ul className="text-white/70 space-y-1">
                    <li>• Dominar la lógica básica</li>
                    <li>• Construir argumentos sólidos</li>
                    <li>• Reconocer patrones lógicos</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">🌟 Recompensas:</h4>
                  <ul className="text-white/70 space-y-1">
                    <li>• Acceso a Ciudad Sherlock</li>
                    <li>• Nuevos accesorios para Loggie</li>
                    <li>• Certificado de Detective Lógico</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WorldMap;
