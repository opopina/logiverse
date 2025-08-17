// 🚀 Hub Multijugador - ¡El corazón de las batallas lógicas! 🎮

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import LoggieAvatar from '../loggie/LoggieAvatar';

interface Room {
  id: string;
  name: string;
  type: string;
  currentPlayers: number;
  maxPlayers: number;
  difficulty: number[];
  worlds: string[];
  status: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  gamesWon: number;
}

interface PlayerStats {
  globalRank: number;
  eloRating: number;
  totalGamesPlayed: number;
  totalGamesWon: number;
  winRate: string;
  averageTime: number;
  favoriteWorld: string;
  currentStreak: number;
  maxStreak: number;
  achievements: string[];
}

export const MultiplayerHub: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<
    'lobby' | 'rooms' | 'leaderboard' | 'stats'
  >('lobby');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadMultiplayerData();
  }, [currentView]);

  const loadMultiplayerData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('logiverse_token');

      if (currentView === 'rooms') {
        const response = await fetch(
          'http://localhost:3001/api/multiplayer/rooms',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        if (data.success) setRooms(data.rooms);
      }

      if (currentView === 'leaderboard') {
        const response = await fetch(
          'http://localhost:3001/api/multiplayer/leaderboard'
        );
        const data = await response.json();
        if (data.success) setLeaderboard(data.leaderboard);
      }

      if (currentView === 'stats') {
        const response = await fetch(
          'http://localhost:3001/api/multiplayer/stats',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        if (data.success) setPlayerStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading multiplayer data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoomTypeColor = (type: string) => {
    const colors = {
      RANKED: 'bg-gradient-to-r from-purple-500 to-pink-500',
      SPEED: 'bg-gradient-to-r from-red-500 to-orange-500',
      CASUAL: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      EDUCATIONAL: 'bg-gradient-to-r from-green-500 to-emerald-500',
    };
    return (
      colors[type as keyof typeof colors] ||
      'bg-gradient-to-r from-gray-500 to-gray-600'
    );
  };

  const renderLobby = () => (
    <div className="space-y-8">
      {/* Bienvenida con Loggie */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-6"
      >
        <LoggieAvatar
          emotion="celebrating"
          size="xl"
          accessory="scarf"
          isAnimated={true}
        />
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">
            ¡Bienvenido a las Batallas Lógicas! 🎮
          </h1>
          <p className="text-xl text-blue-200">
            Donde los mejores pensadores se enfrentan en épicos duelos de lógica
          </p>
        </div>
      </motion.div>

      {/* Opciones principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentView('rooms')}
          className="magic-card text-center p-6 space-y-4"
        >
          <div className="text-4xl">🏟️</div>
          <h3 className="text-xl font-bold text-white">Salas de Juego</h3>
          <p className="text-blue-200">Únete a batallas épicas</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentView('leaderboard')}
          className="magic-card text-center p-6 space-y-4"
        >
          <div className="text-4xl">🏆</div>
          <h3 className="text-xl font-bold text-white">Clasificación</h3>
          <p className="text-blue-200">Los mejores lógicos</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentView('stats')}
          className="magic-card text-center p-6 space-y-4"
        >
          <div className="text-4xl">📊</div>
          <h3 className="text-xl font-bold text-white">Mis Stats</h3>
          <p className="text-blue-200">Tu progreso lógico</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="magic-card text-center p-6 space-y-4 opacity-75"
          disabled
        >
          <div className="text-4xl">🎪</div>
          <h3 className="text-xl font-bold text-white">Torneos</h3>
          <p className="text-blue-200">Próximamente...</p>
        </motion.button>
      </div>

      {/* Estadísticas rápidas */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="magic-card p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">🔥 Estado Actual</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-yellow-400">12</div>
            <div className="text-blue-200">Salas Activas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">89</div>
            <div className="text-blue-200">Jugadores Online</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">156</div>
            <div className="text-blue-200">Batallas Hoy</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-pink-400">3m 42s</div>
            <div className="text-blue-200">Tiempo Promedio</div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderRooms = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">🏟️ Salas de Batalla</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold"
        >
          + Crear Sala
        </motion.button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Cargando salas épicas...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rooms.map(room => (
            <motion.div
              key={room.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="magic-card p-6"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-bold text-white">
                      {room.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getRoomTypeColor(room.type)}`}
                    >
                      {room.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-blue-200">
                    <span>
                      👥 {room.currentPlayers}/{room.maxPlayers}
                    </span>
                    <span>🌟 Dificultad {room.difficulty.join('-')}</span>
                    <span>🌍 {room.worlds.join(', ')}</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold"
                  disabled={room.status !== 'WAITING'}
                >
                  {room.status === 'WAITING' ? 'Unirse' : 'En Juego'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLeaderboard = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">🏆 Clasificación Global</h2>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Cargando campeones...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.rank}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`magic-card p-4 ${entry.rank <= 3 ? 'border-2 border-yellow-400' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`text-2xl font-bold ${
                      entry.rank === 1
                        ? 'text-yellow-400'
                        : entry.rank === 2
                          ? 'text-gray-300'
                          : entry.rank === 3
                            ? 'text-amber-600'
                            : 'text-blue-300'
                    }`}
                  >
                    #{entry.rank}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {entry.username}
                    </h3>
                    <p className="text-blue-200">{entry.gamesWon} victorias</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-yellow-400">
                    {entry.score}
                  </div>
                  <div className="text-blue-200">puntos</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">📊 Mis Estadísticas</h2>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Analizando tu progreso...</p>
        </div>
      ) : (
        playerStats && (
          <div className="space-y-6">
            {/* Estadísticas principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="magic-card p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  #{playerStats.globalRank}
                </div>
                <div className="text-blue-200">Ranking Global</div>
              </div>
              <div className="magic-card p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {playerStats.eloRating}
                </div>
                <div className="text-blue-200">ELO Rating</div>
              </div>
              <div className="magic-card p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {playerStats.winRate}
                </div>
                <div className="text-blue-200">Tasa de Victoria</div>
              </div>
              <div className="magic-card p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {playerStats.currentStreak}
                </div>
                <div className="text-blue-200">Racha Actual</div>
              </div>
            </div>

            {/* Detalles adicionales */}
            <div className="magic-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                📈 Progreso Detallado
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-blue-200">Partidas Jugadas</div>
                  <div className="text-xl font-bold text-white">
                    {playerStats.totalGamesPlayed}
                  </div>
                </div>
                <div>
                  <div className="text-blue-200">Partidas Ganadas</div>
                  <div className="text-xl font-bold text-white">
                    {playerStats.totalGamesWon}
                  </div>
                </div>
                <div>
                  <div className="text-blue-200">Tiempo Promedio</div>
                  <div className="text-xl font-bold text-white">
                    {playerStats.averageTime}s
                  </div>
                </div>
                <div>
                  <div className="text-blue-200">Mundo Favorito</div>
                  <div className="text-xl font-bold text-white">
                    {playerStats.favoriteWorld}
                  </div>
                </div>
                <div>
                  <div className="text-blue-200">Mejor Racha</div>
                  <div className="text-xl font-bold text-white">
                    {playerStats.maxStreak}
                  </div>
                </div>
              </div>
            </div>

            {/* Logros */}
            <div className="magic-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                🏅 Logros Desbloqueados
              </h3>
              <div className="flex flex-wrap gap-3">
                {playerStats.achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full font-semibold"
                  >
                    {achievement}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Navegación */}
        {currentView !== 'lobby' && (
          <motion.button
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView('lobby')}
            className="mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold border border-white/20"
          >
            ← Volver al Lobby
          </motion.button>
        )}

        {/* Contenido principal */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentView === 'lobby' && renderLobby()}
            {currentView === 'rooms' && renderRooms()}
            {currentView === 'leaderboard' && renderLeaderboard()}
            {currentView === 'stats' && renderStats()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MultiplayerHub;
