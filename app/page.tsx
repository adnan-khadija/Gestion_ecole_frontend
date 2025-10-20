"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation basique
    if (!email || !motDePasse) {
      setError("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError("Veuillez entrer une adresse email valide");
      setLoading(false);
      return;
    }

    try {
      const userData = await login(email, motDePasse);
      
      setSuccess(`Connexion réussie ! Redirection en cours...`);
      
      // Redirection basée sur le rôle
      setTimeout(() => {
        switch (userData.role) {
          case 'ADMINISTRATION':
            router.push('/admin/dashboard');
            break;
          case 'ENSEIGNANT':
            router.push('/enseignant/dashboard');
            break;
          case 'ETUDIANT':
            router.push('/etudiant/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      }, 1500);

    } catch (err: any) {
      console.error("Erreur login :", err.message);
      setError(err.message || "Une erreur est survenue lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7EE] to-[#F5E9DA] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Carte de connexion */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* En-tête avec logo et titre */}
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <Image 
                src="/images/logo.png" 
                alt="Logo" 
                width={140} 
                height={36} 
                className="h-11 object-contain" 
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Connexion
            </h1>
            <p className="text-gray-600 text-sm">
              Accédez à votre espace personnel
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleLogin} className="px-8 pb-8 space-y-6">
            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Message de succès */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Champ Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017] transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017] transition-colors"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Options supplémentaires */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#D4A017] focus:ring-[#D4A017] border-gray-300 rounded"
                />
                <span className="text-gray-600">Se souvenir de moi</span>
              </label>
              <button
                type="button"
                className="text-[#A52A2A] hover:text-[#8B1A1A] font-medium"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#A52A2A] to-[#D4A017] text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <FiLogIn className="text-lg" />
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </form>

         
        </div>

      
      </div>
    </div>
  );
}