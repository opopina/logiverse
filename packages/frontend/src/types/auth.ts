// Tipos para autenticación en LogiVerse

export interface User {
  id: string;
  username: string;
  email: string;
  age?: number;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  currentWorld: string;
  currentLevel: number;
  totalScore: number;
  logicPoints: number;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message: string;
  errors?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  age?: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
