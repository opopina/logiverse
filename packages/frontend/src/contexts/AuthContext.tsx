import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import type {
  AuthContextType,
  AuthState,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from '../types/auth';

// Actions para el reducer
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

// Reducer para manejar el estado de autenticación
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Configuración de la API
const API_BASE_URL = 'http://localhost:3001/api';

// Función para hacer peticiones a la API
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('logiverse_token');

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Provider del contexto
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Cargar token del localStorage al inicializar
  useEffect(() => {
    const token = localStorage.getItem('logiverse_token');
    const userData = localStorage.getItem('logiverse_user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('logiverse_token');
        localStorage.removeItem('logiverse_user');
      }
    }
  }, []);

  const login = async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success && response.user && response.token) {
        // Guardar en localStorage
        localStorage.setItem('logiverse_token', response.token);
        localStorage.setItem('logiverse_user', JSON.stringify(response.user));

        // Actualizar estado
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.user, token: response.token },
        });

        return {
          success: true,
          user: response.user,
          token: response.token,
          message: response.message || '¡Bienvenido de vuelta! 🦊',
        };
      } else {
        dispatch({ type: 'AUTH_FAILURE' });
        return {
          success: false,
          message: response.message || 'Error en el login',
        };
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión',
      };
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.success && response.user && response.token) {
        // Guardar en localStorage
        localStorage.setItem('logiverse_token', response.token);
        localStorage.setItem('logiverse_user', JSON.stringify(response.user));

        // Actualizar estado
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.user, token: response.token },
        });

        return {
          success: true,
          user: response.user,
          token: response.token,
          message: response.message || '¡Bienvenido a LogiVerse! 🦊',
        };
      } else {
        dispatch({ type: 'AUTH_FAILURE' });
        return {
          success: false,
          message: response.message || 'Error en el registro',
          errors: response.errors,
        };
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión',
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Intentar hacer logout en el backend
      if (state.token) {
        await apiRequest('/auth/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Limpiar localStorage y estado
      localStorage.removeItem('logiverse_token');
      localStorage.removeItem('logiverse_user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!state.token) return;

    try {
      const response = await apiRequest('/auth/me');
      if (response.success && response.user) {
        localStorage.setItem('logiverse_user', JSON.stringify(response.user));
        dispatch({ type: 'UPDATE_USER', payload: response.user });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      // Si el token es inválido, hacer logout
      logout();
    }
  };

  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
