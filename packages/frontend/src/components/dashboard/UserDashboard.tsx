import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import LoggieAvatar from '../loggie/LoggieAvatar';
import GameManager from '../game/GameManager';
import { MultiplayerHub } from '../multiplayer/MultiplayerHub';

export const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'game' | 'multiplayer'>('dashboard');

  if (!user) return null;

  const handleLogout = () => {
    logout();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEnterGame = () => {
    setCurrentView('game');
  };

  const handleEnterMultiplayer = () => {
    setCurrentView('multiplayer');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  // Si estamos en el juego, mostrar GameManager
  if (currentView === 'game') {
    return <GameManager onBackToDashboard={handleBackToDashboard} />;
  }

  // Si estamos en multijugador, mostrar MultiplayerHub
  if (currentView === 'multiplayer') {
    return (
      <div>
        <motion.button
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBackToDashboard}
          className="fixed top-6 left-6 z-50 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold border border-white/20"
        >
          ← Dashboard
        </motion.button>
        <MultiplayerHub />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-intelligence-blue via-magic-purple to-loggie-orange p-8">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h1 className="text-6xl font-orbitron font-bold text-white mb-4">
          LogiVerse Dashboard
        </h1>
        <p className="text-xl text-white/80 font-source">
          ¡Bienvenido de vuelta, {user.username}! 🦊✨
        </p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Panel de usuario */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="magic-card">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <LoggieAvatar
                  emotion="celebrating"
                  size="xl"
                  accessory="scarf"
                  isAnimated={true}
                />
              </div>
              <h2 className="text-2xl font-orbitron font-bold text-white mb-2">
                {user.username}
              </h2>
              <p className="text-white/70 font-source text-sm">
                {user.role} • Nivel {user.currentLevel}
              </p>
            </div>

            {/* Estadísticas del usuario */}
            <div className="space-y-4 mb-6">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white/90 font-semibold mb-2">📧 Email</h3>
                <p className="text-white/70 font-source text-sm">{user.email}</p>
              </div>
              
              {user.age && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white/90 font-semibold mb-2">🎂 Edad</h3>
                  <p className="text-white/70 font-source text-sm">{user.age} años</p>
                </div>
              )}
              
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white/90 font-semibold mb-2">📅 Miembro desde</h3>
                <p className="text-white/70 font-source text-sm">
                  {formatDate(user.createdAt)}
                </p>
              </div>

              {user.lastLogin && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white/90 font-semibold mb-2">🕐 Último acceso</h3>
                  <p className="text-white/70 font-source text-sm">
                    {formatDate(user.lastLogin)}
                  </p>
                </div>
              )}
            </div>

            {/* Botón de logout */}
            <motion.button
              onClick={handleLogout}
              className="w-full bg-challenge-red hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🚪 Cerrar Sesión
            </motion.button>
          </div>
        </motion.div>

        {/* Panel de progreso */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="magic-card">
            <h2 className="text-2xl font-orbitron font-bold text-white mb-6">
              Tu Progreso en LogiVerse
            </h2>

            {/* Estadísticas de juego */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-growth-green/20 border border-growth-green/40 rounded-lg p-4 text-center">
                <h3 className="text-growth-green font-semibold text-lg mb-2">
                  Puntos Lógicos
                </h3>
                <p className="text-white text-3xl font-orbitron font-bold">
                  {user.logicPoints}
                </p>
              </div>
              
              <div className="bg-energy-yellow/20 border border-energy-yellow/40 rounded-lg p-4 text-center">
                <h3 className="text-energy-yellow font-semibold text-lg mb-2">
                  Puntuación Total
                </h3>
                <p className="text-white text-3xl font-orbitron font-bold">
                  {user.totalScore}
                </p>
              </div>
              
              <div className="bg-magic-purple/20 border border-magic-purple/40 rounded-lg p-4 text-center">
                <h3 className="text-magic-purple font-semibold text-lg mb-2">
                  Mundo Actual
                </h3>
                <p className="text-white text-lg font-orbitron font-bold">
                  {user.currentWorld === 'villa-verdad' ? 'Villa Verdad' : user.currentWorld}
                </p>
              </div>
            </div>

            {/* Acceso a Villa Verdad */}
            <div className="bg-gradient-to-r from-growth-green to-intelligence-blue rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-orbitron font-bold text-xl mb-2">
                    🌱 Villa Verdad
                  </h3>
                  <p className="text-white/90 font-source mb-3">
                    ¡Tu aventura lógica está esperándote! Domina los fundamentos 
                    de la lógica matemática con 5 niveles emocionantes.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-white/80">
                    <span>📊 Progreso: 0/5 niveles</span>
                    <span>⭐ Dificultad: Principiante</span>
                    <span>🎯 Puntos disponibles: 1000+</span>
                  </div>
                </div>
                <div className="text-center">
                  <LoggieAvatar
                    emotion="challenging"
                    size="lg"
                    accessory="scarf"
                    isAnimated={true}
                  />
                </div>
              </div>
              
              <motion.button
                onClick={handleEnterGame}
                className="w-full mt-6 bg-energy-yellow hover:bg-yellow-500 text-black font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 hover:scale-105 shadow-loggie"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🚀 ¡Entrar a Villa Verdad!
              </motion.button>
            </div>

            {/* 🚀 NUEVO: Botón Multijugador Épico */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              <motion.button
                onClick={handleEnterMultiplayer}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold py-6 px-6 rounded-lg text-xl transition-all duration-200 shadow-2xl border-2 border-white/20"
                whileHover={{ scale: 1.02, rotate: 1 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-3xl">⚔️</span>
                  <div className="text-center">
                    <div className="font-black">¡BATALLAS LÓGICAS!</div>
                    <div className="text-sm opacity-90">Multijugador en tiempo real</div>
                  </div>
                  <span className="text-3xl">🏆</span>
                </div>
              </motion.button>
              
              {/* Estadísticas rápidas */}
              <div className="mt-3 flex justify-center space-x-6 text-sm text-white/70">
                <span>👥 89 online</span>
                <span>🔥 12 salas activas</span>
                <span>⚡ Con Loggie IA</span>
              </div>
            </motion.div>

            {/* Próximos mundos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 border border-white/20 rounded-lg p-4 opacity-60">
                <h4 className="text-white font-semibold mb-2">🕵️ Ciudad Sherlock</h4>
                <p className="text-white/70 font-source text-sm mb-3">
                  Deducción y razonamiento avanzado
                </p>
                <div className="text-white/50 text-xs">
                  🔒 Se desbloquea al completar Villa Verdad
                </div>
              </div>
              
              <div className="bg-white/10 border border-white/20 rounded-lg p-4 opacity-60">
                <h4 className="text-white font-semibold mb-2">⚖️ Corte Real</h4>
                <p className="text-white/70 font-source text-sm mb-3">
                  Argumentación y debate lógico
                </p>
                <div className="text-white/50 text-xs">
                  🔒 Se desbloquea al completar Ciudad Sherlock
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-white font-semibold text-lg mb-3">
                🎯 ¿Qué aprenderás en Villa Verdad?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-white/90 font-medium mb-2">📚 Conceptos:</h4>
                  <ul className="text-white/70 font-source text-sm space-y-1">
                    <li>• Declaraciones verdaderas vs falsas</li>
                    <li>• Patrones y secuencias lógicas</li>
                    <li>• Tablas de verdad básicas</li>
                    <li>• Silogismos simples</li>
                    <li>• Introducción al debate</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white/90 font-medium mb-2">🏆 Recompensas:</h4>
                  <ul className="text-white/70 font-source text-sm space-y-1">
                    <li>• Puntos de lógica y experiencia</li>
                    <li>• Nuevos accesorios para Loggie</li>
                    <li>• Certificado de Detective Lógico</li>
                    <li>• Acceso a Ciudad Sherlock</li>
                    <li>• Logros y achievements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer temporal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-12"
      >
        <p className="text-white/50 font-source">
          LogiVerse Alpha - Sistema de autenticación completamente funcional 🦊
        </p>
      </motion.div>
    </div>
  );
};

export default UserDashboard;
