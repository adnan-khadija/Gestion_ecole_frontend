// /utils/apiFetch.ts

export interface APIError {
  error?: string
  message?: string
  [key: string]: any
}

type Options = RequestInit & {
  data?: Record<any, any>
  pureData?: any
  params?: URLSearchParams
  serverSide?: boolean
  token?: string
  fullErrorResponse?: boolean
  isSecure?: boolean
  isJsonContent?: boolean
}

export const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_URL || ''

export async function apiFetch<T, E = APIError>(
  url: string,
  options: Options = {},
): Promise<T | never> {
  const {
    data,
    pureData,
    params,
    serverSide = true,
    token: initialToken,
    fullErrorResponse,
    isSecure,
    isJsonContent = true,
    ...restOptions
  } = options

  const newUrl = `${BASE_API_URL}/${url}${params ? `?${params.toString()}` : ''}`

  let headers: any = {
    ...options.headers,
  }

  if (isJsonContent) {
    headers = {
      'Content-Type': 'application/json',
      ...headers,
    }
  }

  let token = initialToken

  /* Uncomment and implement if you want automatic token retrieval
  if (!token && isSecure) {
    token = serverSide
      ? await getServerSessionToken()
      : await getClientSessionToken()
  }
  */

  if (token) {
    headers = {
      ...headers,
      Authorization: `Bearer ${token}`,
    }
  }

  try {
    const result = await fetch(newUrl, {
      headers,
      body: pureData || (data ? JSON.stringify(data) : undefined),
      ...restOptions,
    })

    const body = await result.json()

    if (!serverSide && !body?.success) {
      throw {
        ...(fullErrorResponse && body),
        error: body?.error || body?.message || 'Something went wrong!',
      } as E
    }

    return {
      status: result.status,
      ...body,
    }
  } catch (e: any) {
    throw { ...e } as E
  }
}

// Simple cookie helper
export function getCookie(name: string) {
  const cookieArr = document.cookie.split(';')
  for (let i = 0; i < cookieArr.length; i++) {
    const cookiePair = cookieArr[i].split('=')
    if (name === cookiePair[0].trim()) {
      return decodeURIComponent(cookiePair[1])
    }
  }
  return null
}

// Add fetchAuthenticatedUser here
interface APIResponse<T> {
  success: boolean
  data: T
  error?: string
}
export interface IUser {
  id: string
  name: string
  email: string
}

const ENDPOINT = 'users'
export async function fetchAuthenticatedUser(token: string) {
  return await apiFetch<APIResponse<IUser>>(`${ENDPOINT}/me`, {
    token,
    isSecure: true,
  })
}
