"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import ChatBubble from "@/components/chat-bubble"
import ChatInput from "@/components/chat-input"
import Header from "@/components/header"

interface Message {
  role: "user" | "assistant"
  content: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    content: `🛈 Aún estamos en proceso de aprobación de permisos para Instagram y TikTok; por eso sus paneles pueden verse sin datos recientes.

🛈 Estamos trabajando en la conexión que extraerá todas las noticias sobre "Pase a la Fama". Cuando esté lista, las encontrarás en la pestaña PUBLIC RELATIONS de los dashboards de PALF.

🛈 Este modelo sigue en entrenamiento, así que su margen de error puede ser relativamente volátil.

¿En qué puedo ayudarte hoy?`,
  },
]

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      // Crear un mensaje temporal del asistente
      const tempIndex = messages.length + 1
      setMessages((prev) => [...prev, { role: "assistant", content: "" }])

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        // Intentar leer el error como texto primero
        const errorText = await response.text()

        // Intentar analizar como JSON si es posible
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.error || `Error HTTP: ${response.status}`)
        } catch (jsonError) {
          // Si no es JSON válido, usar el texto directamente
          throw new Error(`Error del servidor: ${errorText || response.statusText || response.status}`)
        }
      }

      // Verificar si la respuesta es un stream
      const contentType = response.headers.get("Content-Type") || ""
      if (!contentType.includes("text/event-stream")) {
        throw new Error(`Tipo de contenido inesperado: ${contentType}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No se pudo leer la respuesta")
      }

      const decoder = new TextDecoder()
      let assistantMessage = ""

      try {
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
                  assistantMessage += data.content
                  // Actualizar el mensaje del asistente en tiempo real
                  setMessages((prev) => {
                    const newMessages = [...prev]
                    newMessages[tempIndex] = { role: "assistant", content: assistantMessage }
                    return newMessages
                  })
                }
              } catch (e) {
                // Ignorar errores de parsing
                console.warn("Error al analizar línea:", line, e)
              }
            }
          }
        }
      } catch (streamError) {
        console.error("Error en el stream:", streamError)
        if (!assistantMessage) {
          throw new Error("Error al leer la respuesta del asistente")
        }
      } finally {
        reader.releaseLock()
      }

      if (!assistantMessage) {
        throw new Error("No se recibió respuesta del asistente")
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error)

      let errorMessage = "Error desconocido"
      if (error instanceof Error) {
        errorMessage = error.message
      }

      // Si hay un error de conexión, sugerir el chat simple
      if (errorMessage.includes("servidor") || errorMessage.includes("Internal")) {
        errorMessage += "\n\nPuedes intentar usar el chat simple en la página de diagnóstico."
      }

      setError(errorMessage)

      // Eliminar el mensaje vacío del asistente si hubo un error
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <ChatBubble key={index} role={message.role} content={message.content} />
        ))}

        {error && (
          <div className="p-4 my-2 bg-red-100 text-red-700 rounded-lg">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {isLoading && !error && (
          <div className="flex justify-start mb-4">
            <div className="bg-[#e8f0ff] rounded-2xl px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <ChatInput
          input={input}
          handleInputChange={(e) => setInput(e.target.value)}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
