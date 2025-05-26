"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestOpenAI() {
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const testOpenAI = async () => {
    setLoading(true)
    setError("")
    setResult("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hola, ¿qué día es hoy?" }],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error en la respuesta")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No se pudo leer la respuesta")
      }

      let fullResponse = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ") && !line.includes("[DONE]")) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                fullResponse += data.content
                setResult(fullResponse)
              }
            } catch (e) {
              // Ignorar errores de parsing
            }
          }
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Prueba de Conexión con OpenAI</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testOpenAI} disabled={loading} className="mb-4">
            {loading ? "Probando..." : "Probar OpenAI"}
          </Button>

          {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">Error: {error}</div>}

          {result && (
            <div className="p-4 bg-green-100 text-green-700 rounded-lg">
              <h3 className="font-bold mb-2">Respuesta de OpenAI:</h3>
              <p>{result}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
