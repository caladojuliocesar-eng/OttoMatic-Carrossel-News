"use client";

import { useState } from 'react';
import { Sparkles, CheckCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function VipPage() {
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.whatsapp) return;
    
    setStatus('loading');
    
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500"></div>
          
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">Solicitação Recebida!</h2>
            <p className="text-zinc-400 text-base leading-relaxed">
              Como estamos em fase Beta Exclusiva, o Júlio validará seu acesso em breve.
            </p>
          </div>
          
          <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50 mt-6 text-left">
            <p className="text-zinc-300 text-sm mb-2">
              <strong className="text-white">O que acontece agora?</strong>
            </p>
            <ol className="text-zinc-400 text-sm space-y-2 list-decimal list-inside">
              <li>Sua vaga na fila de testes foi reservada.</li>
              <li>O link VIP será gerado para o seu perfil.</li>
              <li>Você receberá o acesso no seu WhatsApp ou E-mail nas próximas horas.</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans text-zinc-100">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-[420px] w-full z-10">
        
        {/* Header Header */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Beta Exclusiva
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Crie Carrosséis Profissionais <span className="text-blue-500">com IA</span>
          </h1>
          <p className="text-zinc-400 text-base">
            Teste gratuitamente a ferramenta restrita que gera conteúdo perfeito para LinkedIn e Instagram em segundos.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-3 text-red-500 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>Ocorreu um erro ao enviar sua solicitação. Tente novamente mais tarde.</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-zinc-300 block">Primeiro Nome</label>
              <input 
                id="name"
                name="name"
                type="text" 
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Júlio"
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="whatsapp" className="text-sm font-medium text-zinc-300 block">WhatsApp com DDD</label>
              <input 
                id="whatsapp"
                name="whatsapp"
                type="tel" 
                required
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-300 block">Melhor E-mail</label>
              <input 
                id="email"
                name="email"
                type="email" 
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com.br"
                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-600"
              />
            </div>

            <button 
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  Quero meu acesso VIP
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-zinc-500 text-xs text-center mt-4">
              Sem spam. Seus dados estão seguros conosco.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
