"use client";

import { useState } from "react";
import { login } from "@/lib/auth";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>(null); // pour afficher la réponse backend

  const handleLogin = async () => {
    try {
      const userData = await login(email, motDePasse);

      // Afficher la réponse dans la console pour debug
      console.log("Login réussi :", userData);

      // Afficher sur la page pour test
      setDebugInfo(userData);
    } catch (err: any) {
      console.error("Erreur login :", err.message);
      setDebugInfo({ error: err.message });
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Page de Test Login</h1>

      <input
        type="email"
        placeholder="Email"
        className="border p-2 w-full mb-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Mot de passe"
        className="border p-2 w-full mb-2"
        value={motDePasse}
        onChange={(e) => setMotDePasse(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white p-2 w-full rounded"
      >
        Tester Login
      </button>

      {debugInfo && (
        <pre className="mt-4 bg-gray-100 p-2 rounded">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      )}
    </div>
  );
}
