"use client";

import React, { useState } from 'react';

const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] animate-in fade-in duration-500 text-[#1b2d3d] pb-20">
      <div className="max-w-3xl mx-auto px-6 py-16">
        
        {/* En-tête de la page */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-[64px] font-black leading-none tracking-tight text-[#1b2d3d]" style={{ fontFamily: 'Quicksand' }}>
            Contact
          </h1>
          <p className="text-[15px] text-slate-700 font-bold leading-relaxed max-w-xl mx-auto">
            Veuillez utiliser le formulaire ci-dessous pour toute question, commentaire ou information relative à votre commande. Pour toute demande de retour ou d'échange, veuillez utiliser notre <span className="underline cursor-pointer">formulaire de retour et d'échange.</span>
          </p>
        </div>

        {submitted ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-6 animate-in zoom-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-500 mx-auto">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 className="text-2xl font-bold uppercase tracking-tight">Message envoyé !</h3>
            <p className="text-slate-500 font-medium">Nous vous répondrons dans les plus brefs délais.</p>
            <button onClick={() => setSubmitted(false)} className="text-[#1b2d3d] font-bold underline uppercase text-xs tracking-widest">Envoyer un autre message</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Prénom et Nom */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[15px] font-bold text-[#1b2d3d]">Prénom</label>
                <input 
                  required 
                  type="text" 
                  name="firstName"
                  className="w-full bg-white border border-slate-200 px-5 py-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all text-[14px]" 
                  placeholder="Prénom" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[15px] font-bold text-[#1b2d3d]">Nom de famille</label>
                <input 
                  required 
                  type="text" 
                  name="lastName"
                  className="w-full bg-white border border-slate-200 px-5 py-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all text-[14px]" 
                  placeholder="Nom de famille" 
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-3">
              <label className="text-[15px] font-bold text-[#1b2d3d]">E-mail *</label>
              <input 
                required 
                type="email" 
                name="email"
                className="w-full bg-white border border-slate-200 px-5 py-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all text-[14px]" 
                placeholder="E-mail" 
              />
            </div>

            {/* Commentaire */}
            <div className="space-y-3">
              <label className="text-[15px] font-bold text-[#1b2d3d]">Commentaire</label>
              <textarea 
                required 
                rows={8} 
                name="message"
                className="w-full bg-white border border-slate-200 px-5 py-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all text-[14px] resize-none" 
                placeholder="Commentaire" 
              />
            </div>

            <div className="space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}
              <p className="text-[14px] text-slate-500 font-medium italic">
                Les demandes seront traitées par ordre d'arrivée.
              </p>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#2d333b] text-white font-bold py-5 rounded-full text-[16px] hover:bg-slate-700 transition-all transform active:scale-[0.99] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer mon message'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactPage;
