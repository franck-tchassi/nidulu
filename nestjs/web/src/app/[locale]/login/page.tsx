// web/src/app/[locale]/(marketing)/account/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';
import { Page } from '@/types';

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, user, login, register, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (activeTab === "signin") {
        await login(formData.email, formData.password);
        toast.success('Connexion réussie !');
      } else {
        if (!formData.firstName || !formData.lastName) {
          toast.error('Veuillez remplir tous les champs');
          setIsLoading(false);
          return;
        }
        await register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
        toast.success('Inscription réussie !');
      }
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    // À implémenter avec votre backend
    toast.info('Connexion avec Google à venir');
    // Exemple : router.push('/api/auth/google');
  };

  // Si l'utilisateur est déjà connecté, afficher un message
  if (isAuthenticated) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-black mb-4">Vous êtes déjà connecté</h1>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-black text-white rounded-full text-sm font-medium"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col md:flex-row bg-white overflow-hidden">

      {/* IMAGE GAUCHE */}
      <div className="hidden md:block w-1/2 relative">
        <Image
          src="/account/account-image2.jpg"
          alt="Nidolu artisanat"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>

      {/* FORMULAIRE */}
      <div className="w-full md:w-1/2 flex flex-col">

        {/* EN-TÊTE AVEC FLÈCHE ET LOGO */}
        <div className="p-6 md:p-8 border-b border-gray-100">
          <button
            onClick={() => router.push(Page.Home)}
            className="flex items-center gap-1 text-black group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <div className="relative w-28 h-12">
              <Image
                src="/nidolu-logo.png"
                alt="Nidolu Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-8">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm space-y-6"
          >
            {/* Titre dynamique selon l'onglet */}
            <div className="text-center mb-2">
              <h1 className="text-3xl font-black mb-2">
                {activeTab === "signin" ? "Connectez-vous" : "Créer un compte"}
              </h1>
              <p className="text-gray-500 text-sm">
                {activeTab === "signin" 
                  ? "Entrez vos identifiants pour accéder à votre compte" 
                  : "Remplissez le formulaire pour créer votre compte"
                }
              </p>
            </div>

            {/* CONTINUER AVEC GOOGLE */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full py-3 border cursor-pointer border-gray-200 rounded-full text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </button>

            {/* Séparateur */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-white text-gray-500">Ou</span>
              </div>
            </div>

            {activeTab === "signup" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Prénom"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                    required={activeTab === "signup"}
                  />
                </div>
                <div>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Nom"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                    required={activeTab === "signup"}
                  />
                </div>
              </div>
            )}

            <div>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Mot de passe"
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {activeTab === "signin" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-xs  cursor-pointer text-gray-500 hover:text-black transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 cursor-pointer border border-black text-black hover:bg-black hover:text-white rounded-full text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Chargement...
                </span>
              ) : activeTab === "signin" ? "Se connecter" : "Créer mon compte"}
            </button>

            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-gray-500 text-sm">
                {activeTab === "signin" ? "Pas encore de compte ? " : "Déjà un compte ? "}
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === "signin" ? "signup" : "signin")}
                  className="text-black cursor-pointer font-medium hover:underline ml-1"
                >
                  {activeTab === "signin" ? "Créer un compte" : "Se connecter"}
                </button>
              </p>
            </div>

            {/* Bouton retour boutique - Mobile seulement */}
            <button
              type="button"
              onClick={() => router.push(Page.Home)}
              className="md:hidden w-full py-3 border border-gray-200 text-gray-500 rounded-full text-sm hover:border-black hover:text-black transition-colors mt-4"
            >
              Retour à la boutique
            </button>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 text-center">
          <p className="text-[9px] text-gray-300 font-bold tracking-wider uppercase">
            En continuant, vous acceptez nos Conditions Générales
          </p>
        </div>
      </div>
    </div>
  );
}