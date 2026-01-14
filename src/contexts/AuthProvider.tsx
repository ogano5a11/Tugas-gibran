import { useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext, User } from './AuthContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setSafeUser = async (sessionUser: any) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (profile) {
        setUser({
          id: sessionUser.id,
          email: sessionUser.email!,
          name: profile.name,
          role: profile.role
        });
      } else {
        setUser({
          id: sessionUser.id,
          email: sessionUser.email!,
          name: sessionUser.user_metadata?.name || 'Pengguna',
          role: sessionUser.user_metadata?.role || 'customer'
        });
      }
    } catch (error) {
      console.error("Error ambil profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      try {
        console.log("Cek sesi Supabase...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && isMounted) {
          console.log("User ditemukan:", session.user.email);
          await setSafeUser(session.user);
        } else if (isMounted) {
          console.log("Tidak ada user login.");
          setLoading(false);
        }
      } catch (error) {
        console.error("Gagal cek sesi:", error);
        if (isMounted) setLoading(false);
      }
    };

    checkUser();

    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Loading terlalu lama, memaksa tampilkan aplikasi.");
        setLoading(false);
      }
    }, 2000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (session?.user) {
        await setSafeUser(session.user);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, signOut }}>
      {!loading ? children : <div className="h-screen flex items-center justify-center">Loading...</div>}
    </AuthContext.Provider>
  );
};