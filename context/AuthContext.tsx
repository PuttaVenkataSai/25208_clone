import { createContext, useState, useContext, FC, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../constants';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const syncUsersToDatabase = async () => {
      try {
        const { data: existingProfiles } = await supabase
          .from('user_profiles')
          .select('email');

        const existingEmails = new Set(existingProfiles?.map(p => p.email) || []);

        for (const mockUser of MOCK_USERS) {
          const email = `${mockUser.username}@rakenet.com`;

          if (!existingEmails.has(email)) {
            const { error } = await supabase
              .from('user_profiles')
              .insert({
                full_name: mockUser.name,
                email: email,
                role: mockUser.role.toLowerCase(),
                preferences: {
                  baseId: mockUser.baseId,
                  baseName: mockUser.baseName,
                },
              });

            if (error && error.code !== '23505') {
              console.error(`Error syncing user ${mockUser.name}:`, error);
            }
          }
        }
      } catch (err) {
        console.error('Failed to sync users to database:', err);
      }
    };

    syncUsersToDatabase();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const userToLogin = MOCK_USERS.find(u => u.username === username && u.password === password);
    if (userToLogin) {
      const { password: _, ...loggedInUser } = userToLogin;
      setUser(loggedInUser);

      const email = `${username}@rakenet.com`;
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (profile) {
        await supabase
          .from('user_profiles')
          .update({ updated_at: new Date().toISOString() })
          .eq('email', email);
      }

      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, users: MOCK_USERS, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};