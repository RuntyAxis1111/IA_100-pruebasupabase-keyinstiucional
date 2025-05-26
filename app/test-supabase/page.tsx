"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestSupabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<string>("No verificado")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await fetch("/api/test-supabase", {
        method: "GET",
      })

      if (!response.ok) {
        const errorText = await response.text()
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.error || `Error HTTP: ${response.status}`)
        } catch (jsonError) {
          throw new Error(`Error del servidor: ${errorText || response.statusText || response.status}`)
        }
      }

      const result = await response.json()

      if (result.success) {
        setConnectionStatus("✅ Conexión exitosa a Supabase")
        setData(result.data)
      } else {
        setConnectionStatus("❌ Error al conectar con Supabase")
        setError(result.error || "Error desconocido")
      }
    } catch (error) {
      setConnectionStatus("❌ Error al conectar con Supabase")
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto mb-4">
        <CardHeader>
          <CardTitle>Prueba de Conexión a Supabase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="mb-2 font-medium">Estado de la conexión:</p>
              <p className="mb-2">{connectionStatus}</p>
              <Button onClick={testConnection} disabled={loading} size="sm">
                {loading ? "Probando..." : "Probar Conexión"}
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                <p className="font-bold">Error:</p>
                <p>{error}</p>
              </div>
            )}

            {data && (
              <div className="p-4 bg-green-100 text-green-700 rounded-lg">
                <p className="font-bold">Datos de muestra:</p>
                <pre className="text-xs overflow-auto max-h-60 mt-2">{JSON.stringify(data, null, 2)}</pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button onClick={() => (window.location.href = "/")} variant="outline">
          Volver al Chat
        </Button>
      </div>
    </div>
  )
}
