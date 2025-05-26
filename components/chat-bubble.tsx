import { cn } from "@/lib/utils"

interface ChatBubbleProps {
  role: string
  content: string
}

export default function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === "user"

  return (
    <div className={cn("flex mb-4", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 whitespace-pre-wrap",
          isUser ? "bg-[#f0f0f0]" : "bg-[#e8f0ff]",
        )}
      >
        {content}
      </div>
    </div>
  )
}
