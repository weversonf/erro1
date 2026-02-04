'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext<{ user: User | null }>({ user: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      // Proteção de Rota: Se não está logado e tenta aceder ao dashboard, perfil, metas ou extrato
      const rotasPrivadas = ['/dashboard', '/perfil', '/metas', '/extrato'];
      if (!user && rotasPrivadas.includes(pathname)) {
        router.push('/');
      }
      
      // Se já está logado e tenta ir para a tela de login (home)
      if (user && pathname === '/') {
        router.push('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user }}>
      {loading ? (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-ubuntu italic tracking-[0.3em]">
          MUCURIPE SECURITY...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);