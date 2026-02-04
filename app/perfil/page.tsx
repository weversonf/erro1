'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { ChevronLeft, User, DollarSign, Trash2, Save, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function Perfil() {
  const [userData, setUserData] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [receita, setReceita] = useState('');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setUsername(data.username);
          setReceita(data.receitaFixa);
        }
        setLoading(false);
      } else {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setSalvando(true);

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        username: username,
        receitaFixa: Number(receita)
      });
      setFeedback('Perfil atualizado!');
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      alert("Erro ao atualizar.");
    } finally {
      setSalvando(false);
    }
  };

  const zerarMes = async () => {
    if (!auth.currentUser) return;
    const confirmacao = confirm("CUIDADO: Isso apagará TODOS os seus gastos registrados. Deseja iniciar um novo mês?");
    
    if (confirmacao) {
      setSalvando(true);
      const q = query(collection(db, "transactions"), where("userId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const promises = querySnapshot.docs.map(documento => deleteDoc(doc(db, "transactions", documento.id)));
      await Promise.all(promises);
      
      alert("Gastos zerados! Bom novo mês, capitão.");
      router.push('/dashboard');
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-ubuntu italic">MUCURIPE...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-ubuntu pb-12">
      {/* Header com Voltar */}
      <header className="flex items-center gap-4 mb-10">
        <Link href="/dashboard" className="p-2 bg-slate-900 rounded-xl text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h2 className="text-xl font-bold tracking-tight">Ajustes da Rota</h2>
      </header>

      {/* Foto de Perfil Simbolizada */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-sky-400 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-4">
          <User size={40} className="text-white" />
        </div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{userData?.email}</p>
      </div>

      {/* Formulário de Edição */}
      <form onSubmit={handleUpdate} className="space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 tracking-widest">Seu Username</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500 font-bold">@</span>
            <input 
              type="text" 
              className="w-full p-4 pl-8 bg-slate-900 border border-slate-800 rounded-2xl outline-none focus:border-sky-500 transition-all font-bold"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 tracking-widest">Renda Fixa Mensal</label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
            <input 
              type="number" 
              className="w-full p-4 pl-12 bg-slate-900 border border-slate-800 rounded-2xl outline-none focus:border-emerald-500 transition-all font-bold"
              value={receita}
              onChange={(e) => setReceita(e.target.value)}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={salvando}
          className="w-full bg-sky-600 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
        >
          {salvando ? 'PROCESSANDO...' : feedback ? <><CheckCircle2 size={18} /> {feedback}</> : <><Save size={18} /> Salvar Alterações</>}
        </button>
      </form>

      {/* Perigo: Zerar Mês */}
      <div className="mt-16 pt-8 border-t border-slate-900 max-w-md mx-auto text-center">
        <h3 className="text-[10px] uppercase font-bold text-rose-500 mb-4 tracking-widest italic">Zona de Risco</h3>
        <button 
          onClick={zerarMes}
          className="w-full bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <Trash2 size={16} />
          Zerar Gastos do Mês
        </button>
        <p className="text-slate-600 text-[9px] mt-4 leading-relaxed">
          Ao zerar o mês, todos os lançamentos atuais serão removidos. <br/>
          Ideal para quando seu salário cai e você começa um novo ciclo.
        </p>
      </div>
    </div>
  );
}