// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { RoleUtilisateur } from './lib/types'

// Définition des types pour les cookies
interface AuthCookies {
  token?: string
  role?: RoleUtilisateur
  userId?: string
  email?: string
}

export function middleware(request: NextRequest) {
  // 1. Récupérer les cookies d'authentification
  const token = request.cookies.get('token')?.value
  const role = request.cookies.get('role')?.value as RoleUtilisateur
  const userId = request.cookies.get('userId')?.value

  const pathname = request.nextUrl.pathname

  // 2. Définir les permissions par rôle
  const rolePermissions = {
    ADMINISTRATION: [
      '/admin',
      '/api/admin',
      '/notes',
      '/api/notes',
      '/users',
      '/api/users',
      '/teacher',
      '/student'
    ],
    ENSEIGNANT: [
      '/teacher',
      '/api/teacher',
      '/notes',
      '/api/notes',
      '/students'
    ],
    ETUDIANT: [
      '/student', 
      '/api/student',
      '/notes' // Les étudiants peuvent voir leurs notes
    ]
  }

  // 3. Vérifier l'authentification pour les routes protégées
  const isProtectedRoute = Object.values(rolePermissions).some(routes => 
    routes.some(route => pathname.startsWith(route))
  )

  if (isProtectedRoute && !token) {
    // Rediriger vers la page de login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 4. Vérifier les autorisations par rôle
  if (token && role) {
    const allowedRoutes = rolePermissions[role] || []
    const hasAccess = allowedRoutes.some(route => pathname.startsWith(route))

    if (!hasAccess) {
      // Retourner une erreur 403 ou rediriger vers une page non autorisée
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'Accès non autorisé pour votre rôle' 
        }),
        { 
          status: 403, 
          headers: { 'content-type': 'application/json' } 
        }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Protéger toutes les routes admin
    '/admin/:path*',
    '/api/admin/:path*',
    
    // Protéger les routes teacher
    '/teacher/:path*',
    '/api/teacher/:path*',
    
    // Protéger les routes student
    '/student/:path*',
    '/api/student/:path*',
    
    // Protéger les routes notes
    '/notes/:path*',
    '/api/notes/:path*',
    
    // Protéger les routes users
    '/users/:path*',
    '/api/users/:path*'
  ]
}