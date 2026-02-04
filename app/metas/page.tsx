'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Target, Plus, Trash2, TrendingUp, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function Metas() {
  const [metas, setMetas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nomeMeta, setNomeMeta] = useState('');
  const [valorObjetivo, setValorObjetivo] = useState('');
  const [valorGuardado, setValorGuardado] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, "goals"), where("userId", "==", user.uid));
        const unsubStore = onSnapshot(q, (snapshot) => {
          const lista: any[] = [];
          snapshot.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
          setMetas(lista);
          setLoading(false);
        });
        return () => unsubStore();
      } else {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleAddMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    await addDoc(collection(db, "goals"), {
      userId: auth.currentUser.uid,
      nome: nomeMeta,
      objetivo: Number(valorObjetivo),
      guardado: Number(valorGuardado),
      createdAt: new Date()
    });

    setIsModalOpen(false);
    setNomeMeta(''); setValorObjetivo(''); setValorGuardado('');
  };

  const deleteMeta = async (id: string) => {
    if (confirm("Deseja remover esta meta?")) {
      await deleteDoc(doc(db, "goals", id));
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-ubuntu italic">MUCURIPE METAS...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-ubuntu pb-32">
      <header className="flex items-center gap-4 mb-10">
        <Link href="/dashboard" className="p-2 bg-slate-900 rounded-xl text-slate-400 hover:text-white">
          <ChevronLeft size={24} />
        </Link>
        <h2 className="text-xl font-bold tracking-tight uppercase italic text-sky-500">Meus Cofres</h2>
      </header>

      <div className="space-y-6">
        {metas.length === 0 && (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-[2.5rem]">
            <Target size={40} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500 text-sm italic">Nenhum objetivo traçado ainda.</p>
          </div>
        )}

        {metas.map((meta) => {
          const progresso = Math.min((meta.guardado / meta.objetivo) * 100, 100);
          return (
            <div key={meta.id} className="bg-slate-900/60 p-6 rounded-[2rem] border border-slate-800/50 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold text-white">{meta.nome}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Alvo: R$ {meta.objetivo.toLocaleString('pt-BR')}</p>
                </div>
                <button onClick={() => deleteMeta(meta.id)} className="text-slate-700 hover:text-rose-500">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-black text-emerald-400">R$ {meta.guardado.toLocaleString('pt-BR')}</span>
                  <span className="text-[10px] font-bold text-slate-400">{progresso.toFixed(0)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full transition-all duration-1000 ${progresso === 100 ? 'bg-emerald-500' : 'bg-sky-500'}`} 
                    style={{ width: `${progresso}%` }}
                  ></div>
                </div>
              </div>
              
              {progresso === 100 && (
                <div className="mt-4 flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                  <CheckCircle2 size={14} /> Meta Alcançada!
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-8 left-6 right-6">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-white text-slate-950 font-bold py-5 rounded-2xl shadow-2xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Criar Novo Objetivo
        </button>
      </div>

      {/* Modal Meta */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-4 font-ubuntu">
          <div className="bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 border border-slate-700 shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center mb-8 text-sky-500">
              <h3 className="text-lg font-bold italic uppercase tracking-widest">Novo Alvo</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500"><X /></button>
            </div>
            <form onSubmit={handleAddMeta} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Nome do Objetivo</label>
                <input type="text" placeholder="Ex: Viagem, Carro, Reserva..." className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-sky-500" value={nomeMeta} onChange={(e) => setNomeMeta(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Quanto você precisa?</label>
                <input type="number" className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xl font-bold text-emerald-400 outline-none" value={valorObjetivo} onChange={(e) => setValorObjetivo(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Já tem quanto guardado?</label>
                <input type="number" className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xl font-bold text-sky-400 outline-none" value={valorGuardado} onChange={(e) => setValorGuardado(e.target.value)} required />
              </div>
              <button type="submit" className="w-full bg-sky-600 py-5 rounded-2xl font-bold text-white uppercase tracking-widest shadow-lg">Salvar Objetivo</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}