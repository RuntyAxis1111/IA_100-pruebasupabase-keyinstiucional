"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestPage() {
  const [connectionStatus, setConnectionStatus] = useState<{
    loading: boolean
    success?: boolean
    message?: string
    data?: any
  }>({
    loading: true,
  })

  const testConnection = async () => {
    setConnectionStatus({ loading: true })
    try {
      const response = await fetch("/api/test-connection")
      const data = await response.json()

      if (data.success) {
        setConnectionStatus({
          loading: false,
          success: true,
          message: "Conexión exitosa a Supabase",
          data: data.data,
        })
      } else {
        setConnectionStatus({
          loading: false,
          success: false,
          message: `Error: ${data.error || "Error desconocido"}`,
        })
      }
    } catch (error) {
      setConnectionStatus({
        loading: false,
        success: false,
        message: `Error inesperado: ${error instanceof Error ? error.message : "Error desconocido"}`,
      })
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Prueba de Conexión a Supabase</CardTitle>
        </CardHeader>
        <CardContent>
          {connectionStatus.loading ? (
            <p>Probando conexión...</p>
          ) : connectionStatus.success ? (
            <div>
              <p className="text-green-600 mb-4">✅ {connectionStatus.message}</p>
              <div className="bg-gray-100 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(connectionStatus.data, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-red-600 mb-4">❌ {connectionStatus.message}</p>
              <Button onClick={testConnection}>Reintentar</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
