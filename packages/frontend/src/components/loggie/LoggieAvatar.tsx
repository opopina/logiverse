import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Tipos para los estados emocionales de Loggie
export type LoggieEmotion =
  | 'happy'
  | 'thinking'
  | 'surprised'
  | 'celebrating'
  | 'friendly'
  | 'challenging';

// Tipos para los accesorios de Loggie
export type LoggieAccessory = 'glasses' | 'scarf' | 'none';

interface LoggieAvatarProps {
  emotion?: LoggieEmotion;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  accessory?: LoggieAccessory;
  isAnimated?: boolean;
  onClick?: () => void;
  className?: string;
}

export const LoggieAvatar: React.FC<LoggieAvatarProps> = ({
  emotion = 'friendly',
  size = 'md',
  accessory = 'none',
  isAnimated = true,
  onClick,
  className = '',
}) => {
  const [currentEmotion, setCurrentEmotion] = useState<LoggieEmotion>(emotion);

  useEffect(() => {
    setCurrentEmotion(emotion);
  }, [emotion]);

  // Configuración de tamaños
  const sizeConfig = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  // Configuración de emociones (colores de ojos y expresiones)
  const emotionConfig = {
    happy: {
      eyeColor: '#2563EB',
      eyeExpression: 'rounded-full',
      mouthCurve: 'smile',
      earPosition: 'up',
    },
    thinking: {
      eyeColor: '#7C3AED',
      eyeExpression: 'rounded-sm',
      mouthCurve: 'neutral',
      earPosition: 'forward',
    },
    surprised: {
      eyeColor: '#F59E0B',
      eyeExpression: 'rounded-full scale-110',
      mouthCurve: 'surprise',
      earPosition: 'alert',
    },
    celebrating: {
      eyeColor: '#10B981',
      eyeExpression: 'rounded-full',
      mouthCurve: 'big-smile',
      earPosition: 'up',
    },
    friendly: {
      eyeColor: '#2563EB',
      eyeExpression: 'rounded-full',
      mouthCurve: 'gentle-smile',
      earPosition: 'relaxed',
    },
    challenging: {
      eyeColor: '#EF4444',
      eyeExpression: 'rounded-sm',
      mouthCurve: 'smirk',
      earPosition: 'alert',
    },
  };

  const currentConfig = emotionConfig[currentEmotion];

  return (
    <motion.div
      className={`${sizeConfig[size]} relative cursor-pointer select-none ${className}`}
      onClick={onClick}
      whileHover={isAnimated ? { scale: 1.05 } : {}}
      whileTap={isAnimated ? { scale: 0.95 } : {}}
      animate={
        isAnimated
          ? {
              rotate: [-1, 1, -1],
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }
          : {}
      }
    >
      {/* Cuerpo principal de Loggie */}
      <div className="relative w-full h-full">
        {/* Cabeza (círculo principal) */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-loggie-orange to-orange-600 rounded-full shadow-loggie"
          animate={{
            boxShadow:
              currentEmotion === 'celebrating'
                ? '0 0 30px rgba(249, 115, 22, 0.8)'
                : '0 4px 20px rgba(249, 115, 22, 0.3)',
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Orejas */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          <motion.div
            className="w-3 h-6 bg-gradient-to-t from-loggie-orange to-orange-400 rounded-t-full transform rotate-12"
            animate={{
              rotate:
                currentConfig.earPosition === 'alert'
                  ? 20
                  : currentConfig.earPosition === 'up'
                    ? 15
                    : currentConfig.earPosition === 'forward'
                      ? 10
                      : 12,
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="w-3 h-6 bg-gradient-to-t from-loggie-orange to-orange-400 rounded-t-full transform -rotate-12"
            animate={{
              rotate:
                currentConfig.earPosition === 'alert'
                  ? -20
                  : currentConfig.earPosition === 'up'
                    ? -15
                    : currentConfig.earPosition === 'forward'
                      ? -10
                      : -12,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Puntas de orejas púrpuras */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
          <div className="w-2 h-3 bg-magic-purple rounded-t-full transform rotate-12" />
          <div className="w-2 h-3 bg-magic-purple rounded-t-full transform -rotate-12" />
        </div>

        {/* Ojos */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          <motion.div
            className={`w-3 h-3 bg-white ${currentConfig.eyeExpression} relative overflow-hidden`}
            whileHover={{ scale: 1.1 }}
          >
            <motion.div
              className={`w-2 h-2 rounded-full absolute top-0.5 left-0.5`}
              style={{ backgroundColor: currentConfig.eyeColor }}
              animate={{
                scale: currentEmotion === 'surprised' ? 1.2 : 1,
              }}
            />
          </motion.div>
          <motion.div
            className={`w-3 h-3 bg-white ${currentConfig.eyeExpression} relative overflow-hidden`}
            whileHover={{ scale: 1.1 }}
          >
            <motion.div
              className={`w-2 h-2 rounded-full absolute top-0.5 left-0.5`}
              style={{ backgroundColor: currentConfig.eyeColor }}
              animate={{
                scale: currentEmotion === 'surprised' ? 1.2 : 1,
              }}
            />
          </motion.div>
        </div>

        {/* Nariz */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-1.5 h-1 bg-gray-800 rounded-full" />
        </div>

        {/* Boca */}
        <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2">
          {currentConfig.mouthCurve === 'smile' && (
            <motion.div
              className="w-4 h-2 border-2 border-gray-800 border-t-0 rounded-b-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            />
          )}
          {currentConfig.mouthCurve === 'big-smile' && (
            <motion.div
              className="w-6 h-3 border-2 border-gray-800 border-t-0 rounded-b-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            />
          )}
          {currentConfig.mouthCurve === 'gentle-smile' && (
            <motion.div
              className="w-3 h-1.5 border-2 border-gray-800 border-t-0 rounded-b-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            />
          )}
          {currentConfig.mouthCurve === 'surprise' && (
            <motion.div
              className="w-2 h-2 bg-gray-800 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            />
          )}
          {currentConfig.mouthCurve === 'smirk' && (
            <motion.div
              className="w-3 h-1 border-2 border-gray-800 border-t-0 rounded-br-full transform rotate-12"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            />
          )}
        </div>

        {/* Pecho blanco */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <div className="w-8 h-6 bg-white rounded-t-full" />
        </div>

        {/* Accesorios */}
        <AnimatePresence>
          {accessory === 'glasses' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <div className="w-8 h-4 border-2 border-intelligence-blue rounded-full bg-blue-100/30" />
            </motion.div>
          )}

          {accessory === 'scarf' && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
            >
              <div className="w-12 h-3 bg-gradient-to-r from-magic-purple to-intelligence-blue rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Efectos especiales para celebración */}
        <AnimatePresence>
          {currentEmotion === 'celebrating' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-energy-yellow rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    x: Math.cos((i * 45 * Math.PI) / 180) * 40,
                    y: Math.sin((i * 45 * Math.PI) / 180) * 40,
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Exportar tipos explícitamente
export type { LoggieEmotion, LoggieAccessory };

export default LoggieAvatar;
