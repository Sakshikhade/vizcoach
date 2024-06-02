import { createContext, useEffect, useState } from 'react';
import { User } from 'db/types';
import client from 'db/client';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string, callback: () => void) => void;
  logout: () => void;
}

const defaultAuthContextValue: AuthContextValue = {
  user: null,
  login: (email: string, password: string, callback: () => void) => {},
  logout: () => {},
};

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(client.getUser());
  }, []);

  const value: AuthContextValue = {
    user,
    login: (email: string, password: string, callback: () => void) => {
      client.authWithPassword(email, password).then(() => {
        setUser(client.getUser());
        callback();
      });
    },
    logout: () => {
      client.clearAuthStore();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const AuthContext = createContext<AuthContextValue>(defaultAuthContextValue);
export default AuthContext;
