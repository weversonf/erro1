'use client';

import { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { CircleDollarSign, Lock, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      router.push('/dashboard');
    } catch (err: any) {
      setErro('E-mail ou senha incorretos.');
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-ubuntu flex flex-col justify-center p-6 antialiased">
      {/* Logo e Boas-vindas */}
      <div className="flex flex-col items-center mb-12">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-[2rem] shadow-2xl shadow-blue-900/20 mb-6">
          <CircleDollarSign size={48} className="text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase italic">Mucuripe</h1>
        <p className="text-slate-500 text-xs font-bold tracking-[0.3em] uppercase mt-2">Finance • Control</p>
      </div>

      {/* Formulário */}
      <div className="w-full max-w-md mx-auto bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-sm shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 tracking-widest">E-mail de Acesso</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                type="email" 
                placeholder="seu@email.com"
                className="w-full p-4 pl-12 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 tracking-widest">Senha secreta</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full p-4 pl-12 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-sm"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
            
            {/* LINK DE RECUPERAÇÃO ADICIONADO AQUI */}
            <div className="flex justify-end pr-2">
              <Link href="/recuperar" className="text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-sky-500 transition-colors">
                Esqueceu a senha?
              </Link>
            </div>
          </div>

          {erro && <p className="text-rose-500 text-[10px] font-bold uppercase text-center">{erro}</p>}

          <button 
            type="submit" 
            disabled={carregando}
            className="w-full bg-white text-slate-950 font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {carregando ? 'AUTENTICANDO...' : 'Acessar Painel'}
            {!carregando && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-xs">Ainda não é capitão?</p>
          <Link href="/cadastro" className="text-blue-400 text-xs font-bold uppercase tracking-widest mt-2 inline-block border-b border-blue-400/30 pb-1">
            Criar conta gratuita
          </Link>
        </div>
      </div>

      <footer className="mt-16 text-center">
        <p className="text-slate-800 text-[8px] uppercase font-bold tracking-[0.5em]">Tecnologia Mucuripe • 2026</p>
      </footer>
    </div>
  );
}