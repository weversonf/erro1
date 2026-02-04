'use client';

import { useEffect, useState, useRef } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, addDoc, query, where, onSnapshot, limit, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { 
  LogOut, CircleDollarSign, X, ReceiptText, 
  Clock, Trash2, Fuel, Utensils, ShoppingBag, CreditCard, 
  PieChart, Settings, Eye, EyeOff, Target, ChevronRight, Plus 
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<'value' | 'percent' | 'hidden'>('value');
  const [isScrolling, setIsScrolling] = useState(false);
  const [valorGasto, setValorGasto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('Outros');
  const [totalGastos, setTotalGastos] = useState(0);
  const [totalGuardadoMetas, setTotalGuardadoMetas] = useState(0);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [gastosPorCategoria, setGastosPorCategoria] = useState<any>({});
  const router = useRouter();
  
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const categorias = [
    { nome: 'Combustível', icon: <Fuel size={18} />, color: '#0ea5e9' },
    { nome: 'Comida', icon: <Utensils size={18} />, color: '#f97316' },
    { nome: 'Compras', icon: <ShoppingBag size={18} />, color: '#10b981' },
    { nome: 'Fixo', icon: <CreditCard size={18} />, color: '#a855f7' },
    { nome: 'Outros', icon: <ReceiptText size={18} />, color: '#64748b' },
  ];

  // Lógica para detetar Scroll e recolher o botão
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1000); // Volta a expandir após 1 segundo sem scroll
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) setUserData(docSnap.data());

          const qTrans = query(collection(db, "transactions"), where("userId", "==", user.uid), limit(10));
          const unsubTrans = onSnapshot(qTrans, (snapshot) => {
            let soma = 0;
            const lista: any[] = [];
            const categoriasSoma: any = {};
            snapshot.forEach((doc) => {
              const data = doc.data();
              const valor = Number(data.valor || 0);
              soma += valor;
              const cat = data.categoria || 'Outros';
              categoriasSoma[cat] = (categoriasSoma[cat] || 0) + valor;
              lista.push({ id: doc.id, ...data });
            });
            lista.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
            setTotalGastos(soma);
            setGastosPorCategoria(categoriasSoma);
            setTransacoes(lista);
          });

          const qMetas = query(collection(db, "goals"), where("userId", "==", user.uid));
          const unsubMetas = onSnapshot(qMetas, (snapshot) => {
            let guardado = 0;
            snapshot.forEach((doc) => {
              guardado += Number(doc.data().guardado || 0);
            });
            setTotalGuardadoMetas(guardado);
            setLoading(false);
          });

          return () => { unsubTrans(); unsubMetas(); };
        } catch (err) { setLoading(false); }
      } else { router.push('/'); }
    });
    return () => unsubscribe();
  }, [router]);

  const receita = userData?.receitaFixa || 0;
  const saldoDisponivel = receita - totalGastos - totalGuardadoMetas;
  const percentagemGasta = Math.min((totalGastos / receita) * 100, 100);

  const formatDisplay = (valor: number) => {
    if (displayMode === 'hidden') return '••••••';
    if (displayMode === 'percent') return `${((valor / receita) * 100).toFixed(1)}%`;
    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const cycleDisplayMode = () => {
    if (displayMode === 'value') setDisplayMode('percent');
    else if (displayMode === 'percent') setDisplayMode('hidden');
    else setDisplayMode('value');
  };

  const handleAddGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valorGasto || !auth.currentUser) return;
    try {
      await addDoc(collection(db, "transactions"), {
        userId: auth.currentUser.uid,
        valor: Number(valorGasto),
        descricao: descricao || categoria,
        categoria: categoria,
        date: new Date()
      });
      setIsModalOpen(false); setValorGasto(''); setDescricao('');
    } catch (e) { alert("Erro ao salvar."); }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-ubuntu italic">MUCURIPE...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-ubuntu antialiased pb-40">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50">
        <div className="flex gap-2">
          <Link href="/perfil" className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-sky-400"><Settings size={20} /></Link>
          <Link href="/metas" className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 relative">
            <Target size={20} />
            {totalGuardadoMetas > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={cycleDisplayMode} className="p-2.5 bg-slate-800 rounded-xl text-slate-400">
            {displayMode === 'value' && <Eye size={20} />}
            {displayMode === 'percent' && <span className="text-xs font-bold px-1">%</span>}
            {displayMode === 'hidden' && <EyeOff size={20} />}
          </button>
          <button onClick={() => signOut(auth)} className="p-2.5 bg-slate-800/50 rounded-xl text-slate-500"><LogOut size={20} /></button>
        </div>
      </header>

      {/* Saldo */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-[2.5rem] shadow-2xl mb-8 border border-blue-400/20">
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100/60 mb-1">Saldo Livre</p>
        <h1 className="text-4xl font-bold tracking-tight mb-6">{formatDisplay(saldoDisponivel)}</h1>
        <div className="w-full h-1.5 bg-blue-950/40 rounded-full overflow-hidden">
          <div className="h-full bg-sky-300 transition-all duration-1000" style={{ width: `${100 - percentagemGasta}%` }}></div>
        </div>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800/50">
          <p className="text-emerald-500/80 text-[9px] font-bold uppercase tracking-widest mb-1">Receita</p>
          <p className="text-base font-bold">{formatDisplay(receita)}</p>
        </div>
        <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800/50 text-right">
          <p className="text-rose-500/80 text-[9px] font-bold uppercase tracking-widest mb-1">Gastos</p>
          <p className="text-base font-bold">{formatDisplay(totalGastos)}</p>
        </div>
      </div>

      {/* Histórico com Link para Extrato Completo */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-slate-600" />
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Últimos</h3>
        </div>
        <Link href="/extrato" className="text-[10px] font-bold uppercase text-sky-500 flex items-center gap-1">
          Ver Tudo <ChevronRight size={12} />
        </Link>
      </div>

      <div className="space-y-3 mb-10">
        {transacoes.map((t) => (
          <div key={t.id} className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 flex justify-between items-center transition-all">
            <div className="flex items-center gap-4">
              <div className="bg-slate-800 p-3 rounded-xl text-sky-400">
                {categorias.find(c => c.nome === t.categoria)?.icon || <ReceiptText size={18} />}
              </div>
              <div>
                <p className="font-bold text-sm text-slate-200">{t.descricao}</p>
                <p className="text-[9px] text-slate-500 uppercase font-black">{t.categoria}</p>
              </div>
            </div>
            <p className="font-bold text-rose-400 text-sm">{formatDisplay(t.valor)}</p>
          </div>
        ))}
      </div>

      {/* Botão Dinâmico "+" / "Novo Lançamento" */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-20 px-6">
        <button 
          onClick={() => setIsModalOpen(true)} 
          className={`bg-white text-slate-950 font-black shadow-2xl transition-all duration-300 flex items-center justify-center gap-2
            ${isScrolling 
              ? 'w-16 h-16 rounded-full' 
              : 'w-full py-5 rounded-2xl text-xs uppercase tracking-[0.2em]'
            }`}
        >
          <Plus size={24} />
          {!isScrolling && <span>Novo Lançamento</span>}
        </button>
      </div>

      {/* Modal permanece igual... */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-end p-4 z-50">
           <div className="bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 border border-slate-700 animate-in slide-in-from-bottom">
             <form onSubmit={handleAddGasto} className="space-y-6">
                <div className="grid grid-cols-5 gap-1">
                  {categorias.map(cat => (
                    <button key={cat.nome} type="button" onClick={() => setCategoria(cat.nome)} className={`flex flex-col items-center p-2 rounded-xl border ${categoria === cat.nome ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800'}`}>
                      <span className={categoria === cat.nome ? 'text-sky-400' : 'text-slate-600'}>{cat.icon}</span>
                    </button>
                  ))}
                </div>
                <input type="number" step="0.01" autoFocus className="w-full p-5 bg-slate-950 border border-slate-800 rounded-2xl text-3xl font-bold text-sky-400 text-center outline-none" placeholder="0,00" value={valorGasto} onChange={(e) => setValorGasto(e.target.value)} required />
                <input type="text" placeholder="Descrição" className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-sm outline-none" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
                <button type="submit" className="w-full bg-sky-600 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs">Confirmar</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-slate-500 text-xs mt-2">Fechar</button>
             </form>
           </div>
        </div>
      )}
    </div>
  );
}