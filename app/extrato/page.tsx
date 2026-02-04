'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, Filter, ArrowDownCircle, ReceiptText } from 'lucide-react';
import Link from 'next/link';

export default function Extrato() {
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
  const router = useRouter();

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(
          collection(db, "transactions"), 
          where("userId", "==", user.uid),
          orderBy("date", "desc")
        );

        const unsubStore = onSnapshot(q, (snapshot) => {
          const lista: any[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            const dataObjeto = data.date?.toDate();
            // Filtra pelo mês selecionado (do ano atual)
            if (dataObjeto && dataObjeto.getMonth() === mesSelecionado && dataObjeto.getFullYear() === new Date().getFullYear()) {
              lista.push({ id: doc.id, ...data, dataFormatada: dataObjeto });
            }
          });
          setTransacoes(lista);
          setLoading(false);
        });
        return () => unsubStore();
      } else {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [mesSelecionado, router]);

  const totalDoMes = transacoes.reduce((acc, curr) => acc + curr.valor, 0);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-ubuntu italic">CARREGANDO HISTÓRICO...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 font-ubuntu pb-12">
      <header className="flex items-center justify-between mb-8">
        <Link href="/dashboard" className="p-2 bg-slate-900 rounded-xl text-slate-400">
          <ChevronLeft size={24} />
        </Link>
        <h2 className="text-lg font-bold uppercase tracking-widest text-sky-500">Relatório</h2>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      {/* Seletor de Mês */}
      <div className="flex overflow-x-auto gap-3 mb-8 no-scrollbar pb-2">
        {meses.map((mes, index) => (
          <button
            key={mes}
            onClick={() => setMesSelecionado(index)}
            className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
              mesSelecionado === index 
              ? 'bg-sky-600 border-sky-500 text-white shadow-lg shadow-sky-900/20' 
              : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {mes}
          </button>
        ))}
      </div>

      {/* Card de Resumo do Mês */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-[2.5rem] border border-slate-800 mb-8 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Total em {meses[mesSelecionado]}</p>
          <h3 className="text-3xl font-black text-rose-500">R$ {totalDoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
        <ArrowDownCircle size={32} className="text-rose-500/20" />
      </div>

      {/* Lista de Transações */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2 mb-2">
          <ReceiptText size={14} className="text-slate-600" />
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600">Lançamentos Detalhados</h4>
        </div>

        {transacoes.length === 0 ? (
          <div className="text-center py-20 opacity-30 italic text-sm">Sem registros neste mês.</div>
        ) : (
          transacoes.map((t) => (
            <div key={t.id} className="bg-slate-900/30 p-5 rounded-3xl border border-slate-800/40 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-[10px] font-black text-slate-700 bg-slate-900 w-10 h-10 flex items-center justify-center rounded-full border border-slate-800">
                  {t.dataFormatada.getDate()}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">{t.descricao}</p>
                  <p className="text-[9px] text-slate-500 uppercase font-bold">{t.categoria}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-300">R$ {t.valor.toLocaleString('pt-BR')}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}