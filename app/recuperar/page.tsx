'use client';

import { useState } from 'react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Mail, ChevronLeft, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleRecuperar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      await sendPasswordResetEmail(auth, email);
      setEnviado(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setErro('E-mail não cadastrado no sistema.');
      } else {
        setErro('Erro ao processar pedido. Tente novamente.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-ubuntu flex flex-col justify-center p-6 antialiased">
      {/* Voltar */}
      <Link href="/" className="fixed top-8 left-6 text-slate-500 flex items-center gap-2 text-xs uppercase font-bold tracking-widest hover:text-white transition-colors">
        <ChevronLeft size={16} /> Voltar ao Login
      </Link>

      <div className="flex flex-col items-center mb-10">
        <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 mb-6">
          <Send size={32} className="text-sky-500" />
        </div>
        <h1 className="text-2xl font-black tracking-tighter uppercase italic text-center">Resgatar Acesso</h1>
        <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase mt-2 text-center max-w-[200px]">
          Enviaremos um link de redefinição para o seu e-mail
        </p>
      </div>

      <div className="w-full max-w-md mx-auto">
        {!enviado ? (
          <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-sm">
            <form onSubmit={handleRecuperar} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 tracking-widest">E-mail Cadastrado</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    type="email" 
                    placeholder="seu@email.com"
                    className="w-full p-4 pl-12 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-sky-500 transition-all text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {erro && <p className="text-rose-500 text-[10px] font-bold uppercase text-center">{erro}</p>}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white text-slate-950 font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? 'SOLICITANDO...' : 'Enviar Link de Resgate'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-emerald-500/10 p-8 rounded-[2.5rem] border border-emerald-500/20 text-center animate-in zoom-in duration-300">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-emerald-400 mb-2">E-mail Enviado!</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Verifique sua caixa de entrada (e a pasta de spam) para redefinir sua senha.
            </p>
            <Link href="/" className="inline-block bg-emerald-500 text-slate-950 font-black px-8 py-4 rounded-2xl text-[10px] uppercase tracking-widest">
              Ir para o Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}