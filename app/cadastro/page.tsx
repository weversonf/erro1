'use client';

import { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, DollarSign, ArrowRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function Registo() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [receita, setReceita] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegisto = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Cria o utilizador no Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Salva o perfil no Firestore com os padrões que você já tinha
      await setDoc(doc(db, "users", user.uid), {
        username: username.toLowerCase().replace('@', '').replace(/\s/g, ''),
        email: email,
        receitaFixa: Number(receita),
        cidadeBase: "Fortaleza",
        motoConsumo: 29, 
        createdAt: new Date()
      });

      router.push('/dashboard');
    } catch (error: any) {
      alert("Erro ao criar conta: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-ubuntu flex flex-col justify-center p-6 antialiased">
      {/* Botão Voltar */}
      <Link href="/" className="fixed top-8 left-6 text-slate-500 flex items-center gap-2 text-xs uppercase font-bold tracking-widest hover:text-white transition-colors">
        <ChevronLeft size={16} /> Voltar
      </Link>

      <div className="flex flex-col items-center mb-10 mt-12">
        <h1 className="text-3xl font-black tracking-tighter uppercase italic text-sky-500">Recrutamento</h1>
        <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase mt-2 text-center">Crie seu perfil de elite no Mucuripe</p>
      </div>

      <div className="w-full max-w-md mx-auto bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-sm shadow-2xl">
        <form onSubmit={handleRegisto} className="space-y-5">
          
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-500 ml-1 tracking-widest">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                type="text" placeholder="@capitao_nemo"
                className="w-full p-4 pl-12 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-sky-500 transition-all text-sm font-medium"
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-500 ml-1 tracking-widest">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                type="email" placeholder="seu@email.com"
                className="w-full p-4 pl-12 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-sky-500 transition-all text-sm font-medium"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-500 ml-1 tracking-widest">Renda Fixa Mensal</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
              <input 
                type="number" placeholder="0,00"
                className="w-full p-4 pl-12 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-emerald-500 transition-all text-lg font-bold"
                onChange={(e) => setReceita(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-slate-500 ml-1 tracking-widest">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                type="password" placeholder="••••••••"
                className="w-full p-4 pl-12 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-sky-500 transition-all text-sm font-medium"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-slate-950 font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {loading ? 'PROCESSANDO...' : 'Finalizar Registro'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>

      <p className="text-center mt-8 text-slate-600 text-[10px] uppercase font-bold tracking-widest">
        Protegido por Mucuripe Security
      </p>
    </div>
  );
}