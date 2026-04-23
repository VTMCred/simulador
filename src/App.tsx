/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Ticket, 
  CheckCircle2, 
  MessageCircle,
  TrendingDown,
  Info,
  CreditCard,
  Building2,
  Zap,
  Smartphone,
  CreditCard as CardIcon,
  Search,
  Wallet,
  LayoutGrid,
  Lock
} from 'lucide-react';

type Step = 'hub' | 'welcome' | 'amount' | 'key' | 'results' | 'card_brand' | 'card_bank' | 'card_method' | 'card_amount' | 'card_results';

export default function App() {
  const [step, setStep] = useState<Step>('hub');
  const [amount, setAmount] = useState<number>(0);
  const [credKey, setCredKey] = useState<string>('');
  const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);

  // Card Simulator State
  const [cardBrand, setCardBrand] = useState<string>('');
  const [cardBank, setCardBank] = useState<string>('');
  const [cardMethod, setCardMethod] = useState<string>('');
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [cardInstallment, setCardInstallment] = useState<number | null>(null);

  const APROXIMACAO_RATES: Record<number, number> = {
    1: 0.06,
    2: 0.12,
    3: 0.18,
    4: 0.22,
    5: 0.26,
    6: 0.29,
    7: 0.31,
    8: 0.33,
    9: 0.34,
    10: 0.348,
    11: 0.352,
    12: 0.356
  };

  const LINK_RATES: Record<number, number> = {
    1: 0.07,
    2: 0.1422,
    3: 0.2089,
    4: 0.2530,
    5: 0.2968,
    6: 0.3294,
    7: 0.3736,
    8: 0.4000,
    9: 0.4151,
    10: 0.4276,
    11: 0.4390,
    12: 0.4500
  };

  const DISCOUNT_KEY = "VTMCLIENTE4";
  const baseRate = amount > 0 && amount < 1000 ? 0.20 : 0.15;
  const currentRate = credKey.toUpperCase() === DISCOUNT_KEY ? baseRate - 0.04 : baseRate;

  const handleStart = () => setStep('amount');
  const handleAmountSubmit = () => {
    if (amount > 0) setStep('key');
  };
  const handleKeySubmit = () => setStep('results');
  
  const maxInstallments = amount < 1000 ? 5 : 12;
  
  const simulations = Array.from({ length: maxInstallments }, (_, i) => {
    const months = i + 1;
    const totalAmount = Math.round(amount * (1 + currentRate * months));
    const installmentValue = Math.round(totalAmount / months);
    return {
      months,
      totalAmount,
      installmentValue
    };
  });

  const sendWhatsApp = (months: number, installmentValue: number, total: number) => {
    const phoneNumber = "5593996589790";
    const message = `Fiz a minha simulação e escolhi pagar com *${months} parcelas de R$ ${installmentValue.toLocaleString('pt-BR')}*.\n\n*[VTMCred Simulador]*`;
    
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const goBack = () => {
    if (step === 'welcome' || step === 'card_brand') setStep('hub');
    if (step === 'amount') setStep('welcome');
    if (step === 'key') setStep('amount');
    if (step === 'results') setStep('key');
    if (step === 'card_bank') setStep('card_brand');
    if (step === 'card_method') setStep('card_bank');
    if (step === 'card_amount') setStep('card_method');
    if (step === 'card_results') {
      if (cardMethod === 'Aproximação' || cardMethod === 'Inserir Cartão' || cardMethod === 'Link de Pagamento') setStep('card_amount');
      else setStep('card_method');
    }
  };

  const isCardPath = step.startsWith('card_');
  const headerSubtitle = step === 'hub' ? 'Compromisso claro. Crédito direto!' : (isCardPath ? 'Simulador Cartão' : 'Simulador de Crédito');

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#333333]">
      {/* Royal Blue Header */}
      <header className="bg-fintech-royal pt-10 pb-5 px-6 sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between mb-3">
          {step !== 'hub' ? (
            <button onClick={goBack} className="p-2 -ml-2 text-white">
              <ChevronLeft size={24} />
            </button>
          ) : (
            <div className="w-8" />
          )}
          <h1 className="font-extrabold text-3xl md:text-4xl tracking-tight text-white leading-none">VTMCred</h1>
          <div className="w-8" />
        </div>
        <div className="flex justify-center">
          {step === 'hub' ? (
            <span className="text-white/80 text-[10px] uppercase tracking-[0.15em] font-medium text-center">
              {headerSubtitle}
            </span>
          ) : (
            <div className="inline-flex bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 items-center gap-2 border border-white/20">
              <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
              <span className="text-white/90 text-xs uppercase tracking-widest leading-none">{headerSubtitle}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 flex flex-col min-h-[calc(100vh-140px)]">
        <AnimatePresence mode="wait">
          {step === 'hub' && (
            <motion.div
              key="hub"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col gap-4 py-2"
            >
              <div className="text-center mb-1">
                <p className="text-slate-500 font-medium leading-tight">
                  Simule agora e veja<br />suas opções em segundos.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setStep('welcome')}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 text-left transition-all active:scale-95 group hover:border-[#3483FA]"
                >
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#3483FA] shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <TrendingDown size={32} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-800">Simulador Crédito</h3>
                    <p className="text-sm text-slate-500">Taxas claras e análise rápida com responsabilidade.</p>
                  </div>
                  <ChevronRight size={20} className="text-slate-300" />
                </button>

                <button
                  onClick={() => setStep('card_brand')}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 text-left transition-all active:scale-95 group hover:border-[#3483FA]"
                >
                  <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <CreditCard size={32} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-800">Simulador Cartão</h3>
                    <p className="text-sm text-slate-500">Converta seu limite em PIX com condições transparentes.</p>
                  </div>
                  <ChevronRight size={20} className="text-slate-300" />
                </button>

                <div
                  className="bg-slate-100 p-6 rounded-2xl border border-dashed border-slate-300 flex items-center gap-5 text-left opacity-60"
                >
                  <div className="w-14 h-14 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                    <LayoutGrid size={32} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-400">Em breve...</h3>
                    <p className="text-sm text-slate-400">Novas facilidades para o seu dia a dia.</p>
                  </div>
                  <Lock size={20} className="text-slate-300" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <section>
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-blue-900/5">
                  <p className="text-[#333333] text-xl leading-snug mb-8">
                    Simulação <span className="font-bold text-fintech-royal">transparente</span> em segundos, com condições claras.
                  </p>
                  <button
                    onClick={handleStart}
                    className="w-full bg-[#3483FA] text-white py-5 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-blue-200 transition-all uppercase tracking-widest"
                  >
                    SIMULAR AGORA
                  </button>
                </div>
              </section>

              <section className="mt-2">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Por que a VTMCred?</h2>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-fintech-royal shrink-0">
                      <TrendingDown size={24} />
                    </div>
                    <div>
                       <p className="font-bold text-slate-800">Condições Transparentes</p>
                       <p className="text-sm text-slate-500">Condições a partir de <span className="font-bold">15%</span> ao mês.</p>
                     </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                       <p className="font-bold text-slate-800">Atendimento Rápido e Digital</p>
                       <p className="text-sm text-slate-500">Atendimento rápido e direto via WhatsApp.</p>
                     </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {step === 'card_brand' && (
            <motion.div
              key="card_brand"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6 py-4"
            >
              <h2 className="text-lg font-bold px-1 text-slate-400 uppercase tracking-tight">Qual a bandeira?</h2>
              <div className="grid grid-cols-2 gap-3">
                {['Visa', 'Mastercard', 'Elo', 'American Express', 'Hipercard', 'Outra'].map((brand) => (
                  <button
                    key={brand}
                    onClick={() => { setCardBrand(brand); setStep('card_bank'); }}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm font-bold text-slate-700 hover:border-[#3483FA] active:scale-95 transition-all text-center"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'card_bank' && (
            <motion.div
              key="card_bank"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6 py-4"
            >
              <h2 className="text-lg font-bold px-1 text-slate-400 uppercase tracking-tight">Qual o banco?</h2>
              <div className="grid grid-cols-1 gap-3">
                {['Banco do Brasil', 'Itaú', 'Bradesco', 'Santander', 'Nubank', 'Caixa', 'Inter', 'Outro'].map((bank) => (
                  <button
                    key={bank}
                    onClick={() => { setCardBank(bank); setStep('card_method'); }}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between font-bold text-slate-700 hover:border-[#3483FA] active:scale-95 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 size={20} className="text-slate-400" />
                      {bank}
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'card_method' && (
            <motion.div
              key="card_method"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6 py-4"
            >
              <h2 className="text-lg font-bold px-1 text-slate-400 uppercase tracking-tight">COMO VOCÊ VAI PASSAR SEU CARTÃO?</h2>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'aproximacao', label: 'Aproximação', icon: <Zap className="text-yellow-500" /> },
                  { id: 'inserir', label: 'Inserir Cartão', icon: <CardIcon className="text-blue-500" /> },
                  { id: 'link', label: 'Link de Pagamento', icon: <Smartphone className="text-purple-500" /> }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => { 
                      setCardMethod(method.label); 
                      setStep('card_amount'); 
                    }}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 text-left transition-all active:scale-95 group hover:border-[#3483FA]"
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-800">{method.label}</h3>
                    </div>
                    <ChevronRight size={20} className="text-slate-300" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'card_amount' && (
            <motion.div
              key="card_amount"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col gap-6"
            >
              <h2 className="text-lg font-bold px-1 text-slate-400 uppercase tracking-tighter">Valor</h2>
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-blue-900/5">
                <p className="text-slate-600 text-lg mb-8 leading-relaxed">Quanto você quer usar do seu limite?</p>
                <div className="relative border-b-2 border-fintech-royal py-2 mb-10 group">
                  <span className="text-2xl font-bold mr-2 text-fintech-royal">R$</span>
                  <input
                    autoFocus
                    type="number"
                    placeholder="0,00"
                    value={cardAmount || ''}
                    onChange={(e) => setCardAmount(Number(e.target.value))}
                    className="w-full bg-transparent text-4xl font-black focus:outline-none placeholder:text-slate-100"
                  />
                </div>
                <button
                  disabled={!cardAmount || cardAmount <= 0}
                  onClick={() => setStep('card_results')}
                  className="w-full bg-fintech-royal text-white py-5 rounded-xl font-bold transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  Continuar
                  <ChevronRight size={22} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'card_results' && (
            <motion.div
              key="card_results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-6 py-4"
            >
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">Simulação Pronta!</h2>
                
                <div className="space-y-3 mb-8 text-left bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold uppercase">Bandeira:</span>
                    <span className="font-bold text-slate-700">{cardBrand}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold uppercase">Banco:</span>
                    <span className="font-bold text-slate-700">{cardBank}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold uppercase">Método:</span>
                    <span className="font-bold text-slate-700">{cardMethod}</span>
                  </div>
                  {cardAmount > 0 && (
                    <div className="flex justify-between text-sm border-t border-slate-200 pt-2 mt-2">
                      <span className="text-slate-400 font-bold uppercase">Limite Utilizado:</span>
                      <span className="font-bold text-fintech-royal">R$ {cardAmount.toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                </div>

                {(cardMethod === 'Aproximação' || cardMethod === 'Inserir Cartão' || cardMethod === 'Link de Pagamento') && cardAmount > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest text-left px-1">Selecione o parcelamento:</p>
                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                      {Object.entries(cardMethod === 'Link de Pagamento' ? LINK_RATES : APROXIMACAO_RATES).map(([months, rate]) => {
                        const m = Number(months);
                        const totalWithTax = cardAmount * (1 + rate);
                        const installment = totalWithTax / m;
                        return (
                          <div
                            key={m}
                            onClick={() => setCardInstallment(m)}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                              cardInstallment === m ? 'border-fintech-royal bg-blue-50' : 'border-slate-100 hover:border-slate-200'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-black text-lg">{m}x de R$ {installment.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Total: R$ {totalWithTax.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <button
                      disabled={!cardInstallment}
                      onClick={() => {
                        const m = cardInstallment!;
                        const rates = cardMethod === 'Link de Pagamento' ? LINK_RATES : APROXIMACAO_RATES;
                        const rate = rates[m];
                        const total = cardAmount * (1 + rate);
                        const installment = total / m;
                        const phoneNumber = "5593996589790";
                        const message = `Olá! Fiz uma simulação de CARTÃO (${cardMethod.toUpperCase()}) no VTMCred:\n\n*Limite:* R$ ${cardAmount.toLocaleString('pt-BR')}\n*Bandeira:* ${cardBrand}\n*Banco:* ${cardBank}\n*Parcelado em:* ${m}x de R$ ${installment.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n*Total:* R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n*[VTMCred Simulador Cartão]*`;
                        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                      className="w-full bg-[#25D366] text-white py-5 rounded-xl flex items-center justify-center gap-3 text-lg font-bold shadow-lg active:scale-95 transition-all disabled:opacity-50 mt-4"
                    >
                      <MessageCircle fill="currentColor" size={24} />
                      Chamar no WhatsApp
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const phoneNumber = "5593996589790";
                      const message = `Olá! Fiz uma simulação de CARTÃO no VTMCred:\n\n*Bandeira:* ${cardBrand}\n*Banco:* ${cardBank}\n*Método:* ${cardMethod}\n\n*[VTMCred Simulador Cartão]*`;
                      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                    className="w-full bg-[#25D366] text-white py-5 rounded-xl flex items-center justify-center gap-3 text-lg font-bold shadow-lg active:scale-95 transition-all"
                  >
                    <MessageCircle fill="currentColor" size={24} />
                    Chamar no WhatsApp
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {step === 'amount' && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col gap-6"
            >
              <h2 className="text-lg font-bold px-1 text-slate-400 uppercase tracking-tighter">Início</h2>
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-blue-900/5">
                <p className="text-slate-600 text-lg mb-8 leading-relaxed">Que valor foi disponibilizado pra você?</p>
                <div className="relative border-b-2 border-fintech-royal py-2 mb-10 group">
                  <span className="text-2xl font-bold mr-2 text-fintech-royal">R$</span>
                  <input
                    autoFocus
                    type="number"
                    placeholder="0,00"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-transparent text-4xl font-black focus:outline-none placeholder:text-slate-100"
                  />
                </div>
                <button
                  disabled={!amount || amount <= 0}
                  onClick={handleAmountSubmit}
                  className="w-full bg-fintech-royal text-white py-5 rounded-xl font-bold transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  Continuar
                  <ChevronRight size={22} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'key' && (
            <motion.div
              key="key"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col gap-6"
            >
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mt-4">
                <div className="flex items-center gap-3 mb-4 text-[#3483FA]">
                  <Ticket size={24} />
                  <span className="font-bold">Possui uma CredKey?</span>
                </div>
                <input
                  autoFocus
                  type="text"
                  placeholder="DIGITE SUA CHAVE"
                  value={credKey}
                  onChange={(e) => setCredKey(e.target.value)}
                  className="w-full border-2 border-slate-100 rounded-lg p-4 mb-4 text-center font-bold uppercase focus:border-[#3483FA] outline-none transition-colors"
                />
                
                {credKey.toUpperCase() === DISCOUNT_KEY && (
                  <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-md text-xs font-bold border border-green-100 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Key Ativada! Desconto Aplicado
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleKeySubmit}
                    className="w-full bg-[#3483FA] text-white py-4 rounded-md font-bold"
                  >
                    Ver simulação
                  </button>
                  <button
                    onClick={() => { setCredKey(''); handleKeySubmit(); }}
                    className="w-full text-[#3483FA] font-bold text-sm py-2"
                  >
                    Não tenho uma CredKey
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col gap-4"
            >
              <header className="px-1 flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Simulação</h2>
                <div className="text-[#3483FA] flex items-center gap-1">
                  <Info size={16} />
                  <span className="text-xs font-bold font-mono">{(currentRate * 100).toFixed(0)}% a.m.</span>
                </div>
              </header>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm font-bold uppercase">VALOR TOTAL</span>
                  <span className="text-lg font-bold">R$ {Math.round(amount).toLocaleString('pt-BR')}</span>
                </div>
              </div>
              <p className="text-[13px] text-slate-500 font-medium px-1 mb-4 leading-relaxed">
                Selecione o parcelamento que deseja e clique em Enviar pelo WhatsApp.
              </p>

              <div className="flex flex-col gap-2 overflow-y-auto max-h-[420px] pr-1 custom-scrollbar">
                {simulations.map((sim) => (
                  <div
                    key={sim.months}
                    onClick={() => setSelectedInstallment(sim.months)}
                    className={`bg-white p-4 rounded-lg border transition-all active:scale-[0.98] ${
                      selectedInstallment === sim.months 
                        ? 'border-[#3483FA] ring-1 ring-[#3483FA]' 
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-md font-bold">{sim.months}x Parcelas</span>
                      <span className="text-xs text-slate-400">Total: R$ {sim.totalAmount.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="text-2xl font-bold text-[#333333]">
                      R$ {sim.installmentValue.toLocaleString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>

              {selectedInstallment && (
                <div className="mt-auto pt-6 border-t border-slate-200">
                  <button
                    onClick={() => {
                      const sim = simulations[selectedInstallment-1];
                      sendWhatsApp(selectedInstallment, sim.installmentValue, sim.totalAmount);
                    }}
                    className="w-full bg-[#25D366] text-white py-5 rounded-md flex items-center justify-center gap-3 text-lg font-bold shadow-lg active:scale-95 transition-all"
                  >
                    <MessageCircle fill="currentColor" size={24} />
                    Enviar pelo WhatsApp
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-auto p-8 text-center">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">VTMCred © 2026</p>
      </footer>
    </div>
  );
}
