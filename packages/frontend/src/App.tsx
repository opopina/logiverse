import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoggieAvatar from './components/loggie/LoggieAvatar';
import type { LoggieEmotion } from './components/loggie/LoggieAvatar';
import LoggieSpeech, {
  LoggieConversation,
} from './components/loggie/LoggieSpeech';
import AuthModal from './components/auth/AuthModal';
import UserDashboard from './components/dashboard/UserDashboard';

// Componente principal de la app que maneja autenticación
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentEmotion, setCurrentEmotion] =
    useState<LoggieEmotion>('friendly');
  const [showConversation, setShowConversation] = useState(false);

  const emotions: LoggieEmotion[] = [
    'friendly',
    'happy',
    'thinking',
    'surprised',
    'celebrating',
    'challenging',
  ];

  // 🎯 Handlers estables para evitar re-renders
  const handleRandomEmotion = useCallback(() => {
    setCurrentEmotion(emotions[Math.floor(Math.random() * emotions.length)]);
  }, []);

  const handleEmotionClick = useCallback((emotion: LoggieEmotion) => {
    setCurrentEmotion(emotion);
  }, []);

  const handleToggleConversation = useCallback(() => {
    setShowConversation(!showConversation);
  }, [showConversation]);

  const handleShowAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const sampleConversation = [
    {
      id: '1',
      text: '¡Hola! Soy Loggie, tu compañero en LogiVerse 🦊',
      emotion: 'happy' as LoggieEmotion,
      delay: 500,
    },
    {
      id: '2',
      text: 'Para acceder a todas mis características, ¡necesitas registrarte!',
      emotion: 'challenging' as LoggieEmotion,
      delay: 2000,
    },
    {
      id: '3',
      text: '¿Estás listo para una aventura lógica increíble?',
      emotion: 'celebrating' as LoggieEmotion,
      delay: 2000,
    },
  ];

  // Si está cargando, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-intelligence-blue via-magic-purple to-loggie-orange flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mb-6">
            <LoggieAvatar
              emotion="thinking"
              size="xl"
              accessory="glasses"
              isAnimated={true}
            />
          </div>
          <h2 className="text-2xl font-orbitron font-bold text-white mb-4">
            Cargando LogiVerse...
          </h2>
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Si está autenticado, mostrar dashboard
  if (isAuthenticated) {
    return <UserDashboard />;
  }

  // Si no está autenticado, mostrar landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-intelligence-blue via-magic-purple to-loggie-orange p-8">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h1 className="text-6xl font-orbitron font-bold text-white mb-4">
          LogiVerse
        </h1>
        <p className="text-xl text-white/80 font-source">
          El universo donde la lógica cobra vida 🦊✨
        </p>
      </motion.div>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel izquierdo - Loggie Interactive */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="magic-card"
        >
          <h2 className="text-2xl font-orbitron font-bold text-white mb-6 text-center">
            Conoce a Loggie
          </h2>

          {/* Avatar principal */}
          <div className="flex justify-center mb-6">
            <LoggieAvatar
              emotion={currentEmotion}
              size="xl"
              accessory="scarf"
              isAnimated={true}
              onClick={handleRandomEmotion}
            />
          </div>

          {/* Selector de emociones */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {emotions.map(emotion => (
              <button
                key={emotion}
                onClick={() => handleEmotionClick(emotion)}
                className={`loggie-button text-xs py-2 px-3 ${
                  currentEmotion === emotion ? 'bg-energy-yellow' : ''
                }`}
              >
                {emotion}
              </button>
            ))}
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <button
              onClick={handleToggleConversation}
              className="w-full loggie-button"
            >
              {showConversation
                ? 'Detener Conversación'
                : 'Iniciar Conversación'}
            </button>

            <button
              onClick={handleShowAuthModal}
              className="w-full bg-growth-green hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105"
            >
              🚀 ¡Unirse a LogiVerse!
            </button>
          </div>
        </motion.div>

        {/* Panel derecho - Chat y auth */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="magic-card min-h-96"
        >
          <h2 className="text-2xl font-orbitron font-bold text-white mb-6">
            Conversación con Loggie
          </h2>

          <div className="space-y-4 max-h-80 overflow-y-auto">
            {showConversation ? (
              <LoggieConversation
                messages={sampleConversation}
                onConversationComplete={() =>
                  console.log('Conversación completada!')
                }
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-white/60 py-8"
              >
                <p className="font-source mb-4">
                  Haz clic en "Iniciar Conversación" para charlar con Loggie
                </p>
                <p className="text-sm mb-6">
                  O toca a Loggie para cambiar su expresión 😊
                </p>

                {/* Botones de autenticación */}
                <div className="space-y-3">
                  <button
                    onClick={handleShowAuthModal}
                    className="w-full bg-intelligence-blue hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    🔐 Iniciar Sesión
                  </button>
                  <p className="text-white/50 text-xs">
                    ¿No tienes cuenta? El modal te permitirá registrarte también
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Panel inferior - Estados de Loggie */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="max-w-4xl mx-auto mt-8 magic-card"
      >
        <h3 className="text-xl font-orbitron font-bold text-white mb-4 text-center">
          Estados Emocionales de Loggie
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {emotions.map(emotion => (
            <motion.div
              key={emotion}
              className="text-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => handleEmotionClick(emotion)}
            >
              <LoggieAvatar
                emotion={emotion}
                size="sm"
                accessory="none"
                isAnimated={false}
              />
              <p className="text-white/80 text-xs mt-2 font-source capitalize">
                {emotion}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Call to action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-center mt-12"
      >
        <motion.button
          onClick={() => setShowAuthModal(true)}
          className="bg-loggie-orange hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 hover:scale-105 shadow-loggie"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🦊 ¡Comenzar Aventura Lógica!
        </motion.button>
        <p className="text-white/60 font-source mt-4">
          Únete a miles de usuarios que ya están mejorando su lógica con Loggie
        </p>
      </motion.div>

      {/* Modal de autenticación */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </div>
  );
};

// App principal con provider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
