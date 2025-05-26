export async function fetchLatestNews(q: string) {
  try {
    const url =
      `https://newsapi.org/v2/everything?` +
      `q=${encodeURIComponent(q)}&language=es&sortBy=publishedAt&pageSize=1&apiKey=${process.env.NEWSAPI_KEY}`

    const res = await fetch(url)
    const data = await res.json()

    if (!data.articles?.length) return null

    const { title, url: link, source, publishedAt } = data.articles[0]
    return { title, link, source: source.name, date: publishedAt.slice(0, 10) }
  } catch (error) {
    console.error("Error al obtener noticias:", error)
    return null
  }
}
