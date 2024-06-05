import { PropsWithChildren, createContext, useState } from 'react';
import client, { User } from 'db';

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

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(client.getUser());

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
