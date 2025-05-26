// Este archivo carga las claves de API desde el archivo keys.py
// y las exporta para su uso en la aplicación

import fs from "fs"
import path from "path"

export function loadKeys() {
  try {
    // Leer el archivo keys.py
    const keysPath = path.join(process.cwd(), "keys.py")
    const keysContent = fs.readFileSync(keysPath, "utf8")

    // Extraer las claves usando expresiones regulares
    const openaiKeyMatch = keysContent.match(/OPENAI_API_KEY\s*=\s*"([^"]+)"/)
    const modelNameMatch = keysContent.match(/MODEL_NAME\s*=\s*"([^"]+)"/)
    const supabaseUrlMatch = keysContent.match(/SUPABASE_URL\s*=\s*"([^"]+)"/)
    const supabaseAnonMatch = keysContent.match(/SUPABASE_ANON\s*=\s*"([^"]+)"/)

    // Extraer los valores
    const openaiKey = openaiKeyMatch ? openaiKeyMatch[1] : null
    const modelName = modelNameMatch ? modelNameMatch[1] : null
    const supabaseUrl = supabaseUrlMatch ? supabaseUrlMatch[1] : null
    const supabaseAnon = supabaseAnonMatch ? supabaseAnonMatch[1] : null

    // Limpiar la clave de Supabase (eliminar saltos de línea y espacios)
    const cleanSupabaseAnon = supabaseAnon ? supabaseAnon.replace(/\s+/g, "") : null

    return {
      OPENAI_API_KEY: openaiKey,
      MODEL_NAME: modelName,
      SUPABASE_URL: supabaseUrl,
      SUPABASE_ANON: cleanSupabaseAnon,
    }
  } catch (error) {
    console.error("Error al cargar las claves:", error)
    return {
      OPENAI_API_KEY: null,
      MODEL_NAME: null,
      SUPABASE_URL: null,
      SUPABASE_ANON: null,
    }
  }
}
