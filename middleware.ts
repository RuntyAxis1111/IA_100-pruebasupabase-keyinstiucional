import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { loadKeys } from "./lib/load-keys"

export function middleware(request: NextRequest) {
  // Cargar las claves desde keys.py
  const keys = loadKeys()

  // Crear un nuevo objeto de respuesta
  const response = NextResponse.next()

  // Establecer las variables de entorno para la solicitud actual
  if (keys.OPENAI_API_KEY) {
    response.headers.set("x-openai-api-key", keys.OPENAI_API_KEY)
  }

  if (keys.MODEL_NAME) {
    response.headers.set("x-model-name", keys.MODEL_NAME)
  }

  if (keys.SUPABASE_URL) {
    response.headers.set("x-supabase-url", keys.SUPABASE_URL)
  }

  if (keys.SUPABASE_ANON) {
    response.headers.set("x-supabase-anon", keys.SUPABASE_ANON)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
