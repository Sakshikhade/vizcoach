import { PropsWithChildren, createContext, useState } from 'react';
import { ClientResponseError } from 'pocketbase';
import client, { User, UserRole } from 'db';

interface AuthContextValue {
  user: User | null;
  login: (
    email: string,
    password: string,
    callback: (error: ClientResponseError | null) => void,
  ) => void;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    callback: (error: ClientResponseError | null) => void,
  ) => void;
  logout: () => void;
}

const defaultAuthContextValue: AuthContextValue = {
  user: null,
  login: () => {},
  register: () => {},
  logout: () => {},
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(client.getUser());

  const value: AuthContextValue = {
    user,
    login: (
      email: string,
      password: string,
      callback: (error: ClientResponseError | null) => void,
    ) => {
      client
        .authWithPassword(email, password)
        .then(() => {
          setUser(client.getUser());
          callback(null);
        })
        .catch(callback);
    },
    register: (
      name: string,
      email: string,
      password: string,
      role: UserRole,
      callback: (error: ClientResponseError | null) => void,
    ) => {
      client
        .registerUser(name, email, password, role)
        .then(() => {
          setUser(client.getUser());
          callback(null);
        })
        .catch(callback);
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
