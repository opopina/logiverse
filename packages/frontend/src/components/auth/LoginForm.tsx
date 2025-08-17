import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import LoggieAvatar from '../loggie/LoggieAvatar';
import type { LoginCredentials } from '../../types/auth';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onSuccess }) => {
  const { login, isLoading } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');

    // Validaciones básicas
    if (!credentials.email || !credentials.password) {
      setErrors('Por favor completa todos los campos');
      return;
    }

    try {
      const response = await login(credentials);
      
      if (response.success) {
        onSuccess?.();
      } else {
        setErrors(response.message);
      }
    } catch (error) {
      setErrors('Error de conexión. Inténtalo de nuevo.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors) setErrors('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header con Loggie */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-4"
        >
          <LoggieAvatar
            emotion="friendly"
            size="lg"
            accessory="glasses"
            isAnimated={true}
          />
        </motion.div>
        <h2 className="text-3xl font-orbitron font-bold text-white mb-2">
          ¡Bienvenido de vuelta!
        </h2>
        <p className="text-white/80 font-source">
          Loggie te estaba esperando 🦊
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="magic-card space-y-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-loggie-orange focus:border-transparent transition-all"
            placeholder="tu-email@ejemplo.com"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-loggie-orange focus:border-transparent transition-all pr-12"
              placeholder="Tu contraseña secreta"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Error message */}
        {errors && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-challenge-red/20 border border-challenge-red/40 rounded-lg p-3"
          >
            <p className="text-challenge-red text-sm font-medium">{errors}</p>
          </motion.div>
        )}

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          className={`w-full loggie-button py-3 text-lg font-semibold ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
          }`}
          whileHover={!isLoading ? { scale: 1.02 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Ingresando...
            </div>
          ) : (
            '🦊 Ingresar a LogiVerse'
          )}
        </motion.button>

        {/* Switch to register */}
        <div className="text-center pt-4 border-t border-white/10">
          <p className="text-white/70 font-source">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-loggie-orange font-semibold hover:text-orange-400 transition-colors underline"
            >
              ¡Únete a la aventura!
            </button>
          </p>
        </div>
      </form>

      {/* Quick login hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <p className="text-white/50 text-sm font-source">
          💡 Pista: Usa las credenciales de prueba:<br/>
          <span className="text-loggie-orange font-mono">loggie@logiverse.com</span> / 
          <span className="text-loggie-orange font-mono">password123</span>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LoginForm;
