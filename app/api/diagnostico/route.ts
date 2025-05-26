import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    return NextResponse.json({
      apiKeyConfigured: !!apiKey,
      apiKeyMasked: apiKey ? `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}` : null,
      modelName: process.env.MODEL_NAME || "gpt-4o",
    })
  } catch (error) {
    console.error("Error en diagnóstico:", error)
    return NextResponse.json({ error: "Error en diagnóstico" }, { status: 500 })
  }
}
