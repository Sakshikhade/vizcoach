import { createContext, useEffect, useState } from 'react';
import { User } from 'db/types';
import client from 'db/client';

const AuthContext = createContext<User | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(client.getUser());
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};

export default AuthContext;
