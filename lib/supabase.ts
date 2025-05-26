import { createClient } from "@supabase/supabase-js"

// Creamos el cliente de Supabase usando las variables de entorno
const supabaseUrl = process.env.SUPABASE_URL || "https://reilyngaidrxfsoglnqz.supabase.co"
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON || ""

export const supabase = createClient(supabaseUrl, supabaseKey)

// Función para probar la conexión
export async function testConnection() {
  try {
    const { data, error } = await supabase.from("DATA_PALF_FACEBOOK").select("*").limit(1)

    if (error) {
      console.error("Error al conectar con Supabase:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error inesperado:", error)
    return { success: false, error: "Error inesperado al conectar con Supabase" }
  }
}

// Función para ejecutar consultas SQL
export async function executeQuery(query: string) {
  try {
    const { data, error } = await supabase.rpc("execute_sql", { sql_query: query })

    if (error) {
      console.error("Error al ejecutar la consulta SQL:", error)
      return { error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error en la consulta SQL:", error)
    return { error: "Error al ejecutar la consulta SQL" }
  }
}

// Función para obtener datos de Facebook
export async function getFacebookData(limit = 10) {
  try {
    const { data, error } = await supabase.from("DATA_PALF_FACEBOOK").select("*").limit(limit)

    if (error) {
      console.error("Error al obtener datos de Facebook:", error)
      return { error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error inesperado:", error)
    return { error: "Error al obtener datos de Facebook" }
  }
}

// Función para obtener datos de Instagram
export async function getInstagramData(limit = 10) {
  try {
    const { data, error } = await supabase.from("DATA_PALF_INSTAGRAM").select("*").limit(limit)

    if (error) {
      console.error("Error al obtener datos de Instagram:", error)
      return { error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error inesperado:", error)
    return { error: "Error al obtener datos de Instagram" }
  }
}

// Función para obtener datos de Twitter
export async function getTwitterData(limit = 10) {
  try {
    const { data, error } = await supabase.from("DATA_PALF_TWITTER").select("*").limit(limit)

    if (error) {
      console.error("Error al obtener datos de Twitter:", error)
      return { error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error inesperado:", error)
    return { error: "Error al obtener datos de Twitter" }
  }
}

// Función para obtener datos de TikTok
export async function getTikTokData(limit = 10) {
  try {
    const { data, error } = await supabase.from("DATA_PALF_TIKTOK").select("*").limit(limit)

    if (error) {
      console.error("Error al obtener datos de TikTok:", error)
      return { error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error inesperado:", error)
    return { error: "Error al obtener datos de TikTok" }
  }
}

// Función para obtener datos de YouTube
export async function getYouTubeData(limit = 10) {
  try {
    const { data, error } = await supabase.from("DATA_PALF_YOUTUBE").select("*").limit(limit)

    if (error) {
      console.error("Error al obtener datos de YouTube:", error)
      return { error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error inesperado:", error)
    return { error: "Error al obtener datos de YouTube" }
  }
}

// Función para obtener todos los datos disponibles
export async function getAllData() {
  const facebook = await getFacebookData(5)
  const instagram = await getInstagramData(5)
  const twitter = await getTwitterData(5)
  const tiktok = await getTikTokData(5)
  const youtube = await getYouTubeData(5)

  return {
    facebook: facebook.success ? facebook.data : null,
    instagram: instagram.success ? instagram.data : null,
    twitter: twitter.success ? twitter.data : null,
    tiktok: tiktok.success ? tiktok.data : null,
    youtube: youtube.success ? youtube.data : null,
  }
}
