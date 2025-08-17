import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoggieAvatar from './LoggieAvatar';
import type { LoggieEmotion } from './LoggieAvatar';

interface LoggieSpeechProps {
  message: string;
  emotion?: LoggieEmotion;
  autoType?: boolean;
  typingSpeed?: number;
  onComplete?: () => void;
  showAvatar?: boolean;
  position?: 'left' | 'right' | 'center';
  className?: string;
}

export const LoggieSpeech: React.FC<LoggieSpeechProps> = ({
  message,
  emotion = 'friendly',
  autoType = true,
  typingSpeed = 50,
  onComplete,
  showAvatar = true,
  position = 'left',
  className = ''
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(autoType);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoType) {
      setDisplayedText(message);
      return;
    }

    setDisplayedText('');
    setCurrentIndex(0);
    setIsTyping(true);
  }, [message, autoType]);

  useEffect(() => {
    if (!isTyping || !autoType) return;

    if (currentIndex < message.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + message[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
      onComplete?.();
    }
  }, [currentIndex, message, typingSpeed, isTyping, autoType, onComplete]);

  const speechBubblePositions = {
    left: 'ml-4',
    right: 'mr-4 ml-auto',
    center: 'mx-auto'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex items-start space-x-3 max-w-md ${className}`}
    >
      {/* Avatar de Loggie */}
      {showAvatar && position === 'left' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <LoggieAvatar
            emotion={emotion}
            size="md"
            accessory="scarf"
            isAnimated={true}
          />
        </motion.div>
      )}

      {/* Burbuja de diálogo */}
      <motion.div
        className={`relative max-w-xs ${speechBubblePositions[position]}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: showAvatar ? 0.4 : 0 }}
      >
        {/* Fondo de la burbuja */}
        <div className="magic-card relative">
          {/* Flecha de la burbuja */}
          {position === 'left' && (
            <div className="absolute left-0 top-4 transform -translate-x-1 translate-y-1">
              <div className="w-3 h-3 bg-white/10 border-l border-b border-white/20 transform rotate-45" />
            </div>
          )}
          
          {/* Contenido del mensaje */}
          <div className="relative z-10">
            <p className="text-white text-sm leading-relaxed font-source">
              {displayedText}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="inline-block w-2 h-4 bg-loggie-orange ml-1"
                />
              )}
            </p>
          </div>

          {/* Efectos de partículas para emociones especiales */}
          <AnimatePresence>
            {emotion === 'celebrating' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-energy-yellow rounded-full"
                    style={{
                      left: `${20 + i * 10}%`,
                      top: '10%',
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            )}

            {emotion === 'thinking' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-2 right-2"
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-magic-purple rounded-full"
                    style={{ right: i * 4 }}
                    animate={{
                      y: [-2, -6, -2],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Avatar de Loggie a la derecha */}
      {showAvatar && position === 'right' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <LoggieAvatar
            emotion={emotion}
            size="md"
            accessory="scarf"
            isAnimated={true}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

// Componente para conversaciones múltiples
interface LoggieConversationProps {
  messages: Array<{
    id: string;
    text: string;
    emotion?: LoggieEmotion;
    delay?: number;
  }>;
  onConversationComplete?: () => void;
  className?: string;
}

export const LoggieConversation: React.FC<LoggieConversationProps> = ({
  messages,
  onConversationComplete,
  className = ''
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState<typeof messages>([]);

  useEffect(() => {
    if (messages.length === 0) return;
    
    setCurrentMessageIndex(0);
    setVisibleMessages([]);
  }, [messages]);

  const showNextMessage = () => {
    if (currentMessageIndex < messages.length) {
      const message = messages[currentMessageIndex];
      
      setTimeout(() => {
        setVisibleMessages(prev => [...prev, message]);
        setCurrentMessageIndex(prev => prev + 1);
        
        if (currentMessageIndex === messages.length - 1) {
          onConversationComplete?.();
        }
      }, message.delay || 1000);
    }
  };

  useEffect(() => {
    if (currentMessageIndex === 0 && messages.length > 0) {
      showNextMessage();
    }
  }, [messages]);

  return (
    <div className={`space-y-4 ${className}`}>
      <AnimatePresence>
        {visibleMessages.map((message, index) => (
          <LoggieSpeech
            key={message.id}
            message={message.text}
            emotion={message.emotion}
            onComplete={index === visibleMessages.length - 1 ? showNextMessage : undefined}
            showAvatar={index === 0} // Solo mostrar avatar en el primer mensaje
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default LoggieSpeech;
