import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import LoggieAvatar from '../loggie/LoggieAvatar';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
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
            Verificando acceso...
          </h2>
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-white/80 font-source">
              Loggie está preparando tu aventura
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Si no está autenticado, mostrar fallback
  if (!isAuthenticated) {
    return (
      <>
        {fallback || (
          <div className="min-h-screen bg-gradient-to-br from-intelligence-blue via-magic-purple to-loggie-orange flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-md mx-4"
            >
              <div className="mb-6">
                <LoggieAvatar
                  emotion="friendly"
                  size="xl"
                  accessory="scarf"
                  isAnimated={true}
                />
              </div>
              <h2 className="text-3xl font-orbitron font-bold text-white mb-4">
                ¡Hola, aventurero!
              </h2>
              <p className="text-white/80 font-source text-lg mb-6">
                Para acceder a esta área, necesitas iniciar sesión en LogiVerse.
              </p>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                <p className="text-white/70 font-source text-sm">
                  🔒 Esta es un área protegida que requiere autenticación
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </>
    );
  }

  // Si está autenticado, renderizar children
  return <>{children}</>;
};

export default ProtectedRoute;
