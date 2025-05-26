import { NextResponse } from "next/server"
import { testConnection } from "@/lib/supabase"

export async function GET() {
  try {
    const result = await testConnection()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error en la ruta de prueba:", error)
    return NextResponse.json({ success: false, error: "Error inesperado en la ruta de prueba" }, { status: 500 })
  }
}
