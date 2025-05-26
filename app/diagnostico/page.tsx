"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DiagnosticoPage() {
  const [apiKeyStatus, setApiKeyStatus] = useState<string>("No verificado")
  const [openaiStatus, setOpenaiStatus] = useState<string>("No verificado")
  const [simpleApiStatus, setSimpleApiStatus] = useState<string>("No verificado")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<string | null>(null)

  const checkApiKey = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/diagnostico", {
        method: "GET",
      })

      const data = await response.json()

      if (data.apiKeyConfigured) {
        setApiKeyStatus(`✅ API Key configurada: ${data.apiKeyMasked}`)
      } else {
        setApiKeyStatus("❌ API Key no configurada")
      }
    } catch (error) {
      setApiKeyStatus("❌ Error al verificar API Key")
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const testOpenAI = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    setOpenaiStatus("Probando...")

    try {
      const response = await fetch("/api/test-openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "Hola, soy PALF Assistant. ¿Qué día es hoy?",
        }),
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

      const data = await response.json()
      setOpenaiStatus("✅ Conexión exitosa con OpenAI")
      setResponse(data.response)
    } catch (error) {
      setOpenaiStatus("❌ Error al conectar con OpenAI")
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const testSimpleAPI = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    setSimpleApiStatus("Probando...")

    try {
      const response = await fetch("/api/chat-simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hola, ¿puedes presentarte brevemente?" }],
        }),
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

      const data = await response.json()
      setSimpleApiStatus("✅ API simple funcionando correctamente")
      setResponse(data.response)
    } catch (error) {
      setSimpleApiStatus("❌ Error en la API simple")
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto mb-4">
        <CardHeader>
          <CardTitle>Diagnóstico de PALF Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <p className="mb-2 font-medium">1. Estado de API Key de OpenAI:</p>
              <p className="mb-2 text-sm">{apiKeyStatus}</p>
              <Button onClick={checkApiKey} disabled={loading} size="sm">
                Verificar API Key
              </Button>
            </div>

            <div>
              <p className="mb-2 font-medium">2. Prueba directa de OpenAI:</p>
              <p className="mb-2 text-sm">{openaiStatus}</p>
              <Button onClick={testOpenAI} disabled={loading} size="sm">
                Probar OpenAI
              </Button>
            </div>

            <div>
              <p className="mb-2 font-medium">3. Prueba de API Simple:</p>
              <p className="mb-2 text-sm">{simpleApiStatus}</p>
              <Button onClick={testSimpleAPI} disabled={loading} size="sm">
                Probar API Simple
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                <p className="font-bold">Error:</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {response && (
              <div className="p-4 bg-green-100 text-green-700 rounded-lg">
                <p className="font-bold">Respuesta de OpenAI:</p>
                <p className="text-sm whitespace-pre-wrap">{response}</p>
              </div>
            )}

            {loading && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Probando...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button onClick={() => (window.location.href = "/")} variant="outline">
          Volver al Chat Principal
        </Button>
      </div>
    </div>
  )
}
