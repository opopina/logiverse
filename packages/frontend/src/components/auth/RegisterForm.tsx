import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import LoggieAvatar from '../loggie/LoggieAvatar';
import type { RegisterData } from '../../types/auth';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
  onSuccess,
}) => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    age: undefined,
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');

    // Validaciones básicas
    if (!formData.username || !formData.email || !formData.password) {
      setErrors('Por favor completa todos los campos obligatorios');
      return;
    }

    if (formData.username.length < 3) {
      setErrors('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    if (formData.password.length < 6) {
      setErrors('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.password !== confirmPassword) {
      setErrors('Las contraseñas no coinciden');
      return;
    }

    if (formData.age && (formData.age < 8 || formData.age > 120)) {
      setErrors('La edad debe estar entre 8 y 120 años');
      return;
    }

    try {
      const response = await register(formData);

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

    if (name === 'age') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? parseInt(value) : undefined,
      }));
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

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
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-4"
        >
          <LoggieAvatar
            emotion="celebrating"
            size="lg"
            accessory="scarf"
            isAnimated={true}
          />
        </motion.div>
        <h2 className="text-3xl font-orbitron font-bold text-white mb-2">
          ¡Únete a LogiVerse!
        </h2>
        <p className="text-white/80 font-source">
          Loggie te está esperando para una aventura lógica 🎉
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="magic-card space-y-5">
        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-white/90 mb-2"
          >
            Nombre de usuario *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-loggie-orange focus:border-transparent transition-all"
            placeholder="Tu nombre de lógico"
            required
            minLength={3}
            maxLength={20}
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-white/90 mb-2"
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-loggie-orange focus:border-transparent transition-all"
            placeholder="tu-email@ejemplo.com"
            required
          />
        </div>

        {/* Age */}
        <div>
          <label
            htmlFor="age"
            className="block text-sm font-medium text-white/90 mb-2"
          >
            Edad (opcional)
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-loggie-orange focus:border-transparent transition-all"
            placeholder="¿Cuántos años tienes?"
            min="8"
            max="120"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-white/90 mb-2"
          >
            Contraseña *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-loggie-orange focus:border-transparent transition-all pr-12"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
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

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-white/90 mb-2"
          >
            Confirmar contraseña *
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-loggie-orange focus:border-transparent transition-all"
            placeholder="Repite tu contraseña"
            required
          />
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
              Creando cuenta...
            </div>
          ) : (
            '🦊 ¡Unirse a LogiVerse!'
          )}
        </motion.button>

        {/* Switch to login */}
        <div className="text-center pt-4 border-t border-white/10">
          <p className="text-white/70 font-source">
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-loggie-orange font-semibold hover:text-orange-400 transition-colors underline"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </form>

      {/* Info adicional */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <p className="text-white/50 text-sm font-source">
          🔒 Tu información está segura con nosotros
          <br />
          🎯 Comenzarás en Villa Verdad, el primer mundo lógico
        </p>
      </motion.div>
    </motion.div>
  );
};

export default RegisterForm;
