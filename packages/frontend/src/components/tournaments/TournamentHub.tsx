// 🏆 TournamentHub - Centro de Torneos de LogiVerse
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Clock, Calendar, Star, Zap, Crown, Target, Gift } from 'lucide-react';

interface Tournament {
  id: string;
  name: string;
  type: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN';
  maxParticipants: number;
  registrationStart: string;
  registrationEnd: string;
  tournamentStart: string;
  entryFee: number;
  prizePool: number;
  description: string;
  status: 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  participants: Array<{
    id: string;
    user: {
      id: string;
      username: string;
      avatar?: string;
    };
  }>;
  _count: {
    participants: number;
  };
}

interface TournamentHubProps {
  onBack: () => void;
}

const TournamentHub: React.FC<TournamentHubProps> = ({ onBack }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [joinLoading, setJoinLoading] = useState<string | null>(null);

  // 🔄 Cargar torneos activos
  const fetchTournaments = async () => {
    try {
      const response = await fetch('/api/tournaments/active');
      const data = await response.json();

      if (data.success) {
        setTournaments(data.tournaments);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Unirse a un torneo
  const joinTournament = async (tournamentId: string) => {
    setJoinLoading(tournamentId);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/tournaments/${tournamentId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // 🎉 Actualizar lista de torneos
        await fetchTournaments();
        alert('¡Te has unido al torneo exitosamente! 🎉');
      } else {
        alert(data.message || 'Error al unirse al torneo');
      }
    } catch (error) {
      console.error('Error joining tournament:', error);
      alert('Error al unirse al torneo');
    } finally {
      setJoinLoading(null);
    }
  };

  // 🎮 Crear torneo de prueba
  const createTestTournament = async () => {
    try {
      const response = await fetch('/api/dev/create-tournament', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        await fetchTournaments();
        alert('¡Torneo de prueba creado! 🧪');
      }
    } catch (error) {
      console.error('Error creating test tournament:', error);
    }
  };

  useEffect(() => {
    fetchTournaments();
    // 🔄 Actualizar cada 30 segundos
    const interval = setInterval(fetchTournaments, 30000);
    return () => clearInterval(interval);
  }, []);

  // 🎨 Obtener color según el tipo de torneo
  const getTournamentColor = (type: string) => {
    switch (type) {
      case 'SINGLE_ELIMINATION': return 'from-red-500 to-orange-500';
      case 'DOUBLE_ELIMINATION': return 'from-purple-500 to-pink-500';
      case 'ROUND_ROBIN': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // 🕐 Formatear fecha
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ⏰ Tiempo restante para registro
  const getTimeUntilRegistration = (registrationEnd: string) => {
    const now = new Date();
    const end = new Date(registrationEnd);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Registro cerrado';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m restantes`;
    return `${minutes}m restantes`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🏆
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      {/* 🎯 Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-white hover:bg-white/30 transition-all duration-300"
          >
            ← Volver al Dashboard
          </button>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              🏆 Centro de Torneos
            </h1>
            <p className="text-xl text-purple-200">
              ¡Compite contra los mejores lógicos del mundo!
            </p>
          </div>

          <button
            onClick={createTestTournament}
            className="bg-orange-500 hover:bg-orange-600 rounded-xl px-6 py-3 text-white transition-all duration-300"
          >
            🧪 Crear Torneo de Prueba
          </button>
        </div>

        {/* 📊 Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
          >
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{tournaments.length}</div>
            <div className="text-sm text-purple-200">Torneos Activos</div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
          >
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {tournaments.reduce((sum, t) => sum + t._count.participants, 0)}
            </div>
            <div className="text-sm text-purple-200">Participantes</div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
          >
            <Gift className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {tournaments.reduce((sum, t) => sum + t.prizePool, 0)}
            </div>
            <div className="text-sm text-purple-200">Premio Total</div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
          >
            <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">LIVE</div>
            <div className="text-sm text-purple-200">En Vivo</div>
          </motion.div>
        </div>
      </motion.div>

      {/* 🏟️ Lista de Torneos */}
      <div className="max-w-7xl mx-auto">
        {tournaments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Trophy className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              No hay torneos activos
            </h3>
            <p className="text-purple-200 mb-6">
              ¡Crea un torneo de prueba para empezar!
            </p>
            <button
              onClick={createTestTournament}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl px-8 py-4 text-white font-bold transition-all duration-300"
            >
              🧪 Crear Torneo de Prueba
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {tournaments.map((tournament, index) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20"
              >
                {/* 🎨 Header colorido */}
                <div className={`bg-gradient-to-r ${getTournamentColor(tournament.type)} p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Crown className="w-6 h-6 text-white" />
                      <span className="text-white font-bold text-sm">
                        {tournament.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      tournament.status === 'REGISTRATION_OPEN' 
                        ? 'bg-green-500 text-white'
                        : tournament.status === 'IN_PROGRESS'
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-500 text-white'
                    }`}>
                      {tournament.status === 'REGISTRATION_OPEN' && '🟢 ABIERTO'}
                      {tournament.status === 'IN_PROGRESS' && '🟡 EN CURSO'}
                      {tournament.status === 'COMPLETED' && '🏁 TERMINADO'}
                    </div>
                  </div>
                </div>

                {/* 📋 Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {tournament.name}
                  </h3>
                  <p className="text-purple-200 text-sm mb-4">
                    {tournament.description}
                  </p>

                  {/* 📊 Información del torneo */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-200 flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        Participantes
                      </span>
                      <span className="text-white font-bold">
                        {tournament._count.participants}/{tournament.maxParticipants}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-200 flex items-center">
                        <Gift className="w-4 h-4 mr-1" />
                        Premio
                      </span>
                      <span className="text-yellow-400 font-bold">
                        {tournament.prizePool} puntos
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-200 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Inicio
                      </span>
                      <span className="text-white">
                        {formatDateTime(tournament.tournamentStart)}
                      </span>
                    </div>

                    {tournament.status === 'REGISTRATION_OPEN' && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-200 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Registro
                        </span>
                        <span className="text-orange-400 font-bold">
                          {getTimeUntilRegistration(tournament.registrationEnd)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 📈 Barra de progreso */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-purple-200 mb-1">
                      <span>Progreso</span>
                      <span>{Math.round((tournament._count.participants / tournament.maxParticipants) * 100)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${(tournament._count.participants / tournament.maxParticipants) * 100}%` 
                        }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                      />
                    </div>
                  </div>

                  {/* 🎯 Botones de acción */}
                  <div className="space-y-2">
                    {tournament.status === 'REGISTRATION_OPEN' && (
                      <button
                        onClick={() => joinTournament(tournament.id)}
                        disabled={joinLoading === tournament.id || tournament._count.participants >= tournament.maxParticipants}
                        className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
                          tournament._count.participants >= tournament.maxParticipants
                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                            : joinLoading === tournament.id
                            ? 'bg-orange-500 text-white cursor-wait'
                            : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
                        }`}
                      >
                        {joinLoading === tournament.id ? (
                          <span className="flex items-center justify-center">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                            Uniéndose...
                          </span>
                        ) : tournament._count.participants >= tournament.maxParticipants ? (
                          '🔒 Torneo Lleno'
                        ) : (
                          '🎯 ¡Unirse al Torneo!'
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedTournament(tournament)}
                      className="w-full py-2 rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all duration-300"
                    >
                      👁️ Ver Detalles
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 🔍 Modal de detalles del torneo */}
      <AnimatePresence>
        {selectedTournament && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedTournament(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  {selectedTournament.name}
                </h2>
                <button
                  onClick={() => setSelectedTournament(null)}
                  className="text-white hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-white">
                <p>{selectedTournament.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Tipo:</strong> {selectedTournament.type.replace('_', ' ')}
                  </div>
                  <div>
                    <strong>Participantes:</strong> {selectedTournament._count.participants}/{selectedTournament.maxParticipants}
                  </div>
                  <div>
                    <strong>Premio:</strong> {selectedTournament.prizePool} puntos
                  </div>
                  <div>
                    <strong>Estado:</strong> {selectedTournament.status}
                  </div>
                </div>

                <div>
                  <strong>Participantes registrados:</strong>
                  <div className="mt-2 space-y-1">
                    {selectedTournament.participants.map((participant, index) => (
                      <div key={participant.id} className="flex items-center space-x-2">
                        <span className="text-purple-200">#{index + 1}</span>
                        <span>{participant.user.username}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TournamentHub;
