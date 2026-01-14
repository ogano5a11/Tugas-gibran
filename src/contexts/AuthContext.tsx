import { createContext } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'partner';
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);