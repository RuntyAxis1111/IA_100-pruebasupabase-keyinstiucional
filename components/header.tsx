"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Header() {
  const [connectionStatus, setConnectionStatus] = useState<"loading" | "connected" | "error">("loading")
  const [isChecking, setIsChecking] = useState(false)

  const checkConnection = async () => {
    if (isChecking) return

    setIsChecking(true)
    setConnectionStatus("loading")

    try {
      const response = await fetch("/api/test-supabase")
      const data = await response.json()

      if (data.success) {
        setConnectionStatus("connected")
      } else {
        setConnectionStatus("error")
      }
    } catch (error) {
      setConnectionStatus("error")
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <header className="p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">ASISTENTE DE PALF</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={checkConnection}
          className="flex items-center gap-2 h-8 px-2"
          disabled={isChecking}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              connectionStatus === "connected"
                ? "bg-green-500"
                : connectionStatus === "error"
                  ? "bg-red-500"
                  : "bg-yellow-500"
            }`}
          ></span>
          <span className="text-xs">
            {connectionStatus === "connected"
              ? "Conectado"
              : connectionStatus === "error"
                ? "Desconectado"
                : "Verificando..."}
          </span>
        </Button>
      </div>
    </header>
  )
}
