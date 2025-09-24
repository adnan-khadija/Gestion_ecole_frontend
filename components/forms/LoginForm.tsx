'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/lib/auth';

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Connexion</h2>
        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-600">
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="nom@exemple.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {state?.errors?.email && <p className="mt-1 text-sm text-red-600">{state.errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-600">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Votre mot de passe"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {state?.errors?.password && <p className="mt-1 text-sm text-red-600">{state.errors.password}</p>}
          </div>

          {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

          <div>
            <button
              disabled={pending}
              type="submit"
              className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-700 disabled:opacity-50"
            >
              {pending ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm">
          <span>Pas encore de compte ? </span>
          <Link href="/signup" className="text-indigo-500 hover:underline">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  )
}