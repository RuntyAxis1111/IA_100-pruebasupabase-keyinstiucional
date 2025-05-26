"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface ChatInputProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
}

export default function ChatInput({ input, handleInputChange, handleSubmit, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() && !isLoading) {
        // Crear un evento de submit sintético
        const form = e.currentTarget.closest("form")
        if (form) {
          const event = new Event("submit", { bubbles: true, cancelable: true })
          form.dispatchEvent(event)
        }
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Escribe tu consulta aquí..."
        className="flex-1 min-h-[40px] max-h-[200px] resize-none border rounded-lg p-3"
        rows={1}
        disabled={isLoading}
      />
      <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="h-10 w-10 rounded-full">
        <Send className="h-5 w-5" />
        <span className="sr-only">Enviar mensaje</span>
      </Button>
    </form>
  )
}
