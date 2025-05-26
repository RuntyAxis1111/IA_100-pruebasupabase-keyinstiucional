"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import ChatBubble from "@/components/chat-bubble"
import ChatInput from "@/components/chat-input"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"

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

export default function SimpleChat() {
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
      const response = await fetch("/api/chat-simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
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

      if (data.response) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
      } else {
        throw new Error("No se recibió respuesta del asistente")
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
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
            <div className="mt-2">
              <Button onClick={() => (window.location.href = "/diagnostico")} size="sm" variant="outline">
                Ir a Diagnóstico
              </Button>
            </div>
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
