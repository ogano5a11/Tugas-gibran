import { createContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'partner';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
}

// Named Export 1: Context Object
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Named Export 2: Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ... (Kode logika getProfile/setSafeUser sama seperti sebelumnya) ...
  // Silakan gunakan kode logika dari jawaban saya sebelumnya
  // Intinya pastikan logic setSafeUser dan useEffect ada di sini.
  
  // Kode singkat untuk contoh struktur (Gunakan logika lengkap Anda):
  const setSafeUser = async (sessionUser: any) => {
      // ...logika fallback...
      // (Boleh copy dari jawaban sebelumnya)
       try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        if (profile) {
          setUser({ id: sessionUser.id, email: sessionUser.email!, name: profile.name, role: profile.role });
        } else {
          setUser({ id: sessionUser.id, email: sessionUser.email!, name: sessionUser.user_metadata?.name || 'Pengguna', role: 'customer' });
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) await setSafeUser(session.user);
      else setLoading(false);
    };
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (ev, session) => {
       if (ev === 'SIGNED_OUT') { setUser(null); setLoading(false); }
       else if (session?.user) await setSafeUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};