import { NextResponse } from "next/server"
import OpenAI from "openai"
import { fetchLatestNews } from "@/lib/news"
import { getAllData } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    // Verificar que tenemos la API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("API key de OpenAI no configurada")
      return NextResponse.json({ error: "API key de OpenAI no configurada" }, { status: 500 })
    }

    // Extraer los mensajes de la solicitud
    const body = await req.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Mensajes no válidos" }, { status: 400 })
    }

    // Crear cliente de OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Obtener datos de contexto
    let contextData = ""
    try {
      const [socialData, newsData] = await Promise.all([getAllData(), fetchLatestNews("Pase a la Fama OR PALF")])

      if (socialData) {
        contextData += "\n\nDatos recientes de redes sociales disponibles para consulta."
      }

      if (newsData) {
        contextData += `\n\nÚltima noticia sobre PALF: "${newsData.title}" (${newsData.date})`
      }
    } catch (error) {
      console.warn("Error al obtener datos de contexto:", error)
    }

    // Preparar el mensaje del sistema
    const systemMessage = {
      role: "system",
      content: `Eres **PALF Assistant**, el asistente virtual oficial de "Pase a la Fama".

Tu misión:
• Genera reportes breves y accionables basados en datos de redes sociales
• Responde SIEMPRE en español con tono profesional y respetuoso
• Incluye insights sobre el rendimiento en redes sociales cuando sea relevante
• Puedes responder preguntas generales sobre PALF y marketing digital
• Mantén un tono amigable pero profesional

${contextData}

Información importante:
🛈 Aún estamos en proceso de aprobación para Instagram y TikTok
🛈 La conexión de noticias está en desarrollo
🛈 Este modelo sigue en entrenamiento`,
    }

    // Crear la respuesta usando OpenAI con streaming
    const stream = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || "gpt-4o",
      messages: [systemMessage, ...messages],
      temperature: 0.3,
      max_tokens: 1000,
      stream: true,
    })

    // Crear un stream de respuesta
    const encoder = new TextEncoder()

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ""
            if (content) {
              const data = JSON.stringify({ content })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (error) {
          console.error("Error en el stream:", error)
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error en la API de chat:", error)

    // Respuesta de error más detallada
    const errorMessage = error instanceof Error ? error.message : "Error desconocido"
    const errorStack = error instanceof Error ? error.stack : ""

    console.error("Detalles del error:", {
      message: errorMessage,
      stack: errorStack,
      hasApiKey: !!process.env.OPENAI_API_KEY,
      modelName: process.env.MODEL_NAME,
    })

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: errorMessage,
        suggestion: "Intenta usar el chat simple en /chat-simple",
      },
      { status: 500 },
    )
  }
}
