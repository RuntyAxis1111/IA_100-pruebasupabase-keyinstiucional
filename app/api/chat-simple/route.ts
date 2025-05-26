import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(req: Request) {
  try {
    // Verificar que tenemos la API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "API key de OpenAI no configurada" }, { status: 500 })
    }

    // Crear cliente de OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Extraer los mensajes de la solicitud
    const { messages } = await req.json()

    // Preparar los mensajes para OpenAI
    const systemMessage = {
      role: "system",
      content: "Eres PALF Assistant. Responde en español de manera profesional y concisa.",
    }

    // Llamar a OpenAI sin streaming
    const completion = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || "gpt-4o",
      messages: [systemMessage, ...messages],
      temperature: 0.3,
    })

    const response = completion.choices[0].message.content

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error en la API de chat simple:", error)

    return NextResponse.json(
      {
        error: "Error al conectar con OpenAI",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
