/** Extrae el ID de YouTube desde URL o devuelve el ID si ya lo es */
export function parseYoutubeId(input: string): string {
  const trimmed = input.trim()
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed)
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.slice(1).split('/')[0]
    }
    const v = url.searchParams.get('v')
    if (v) return v
    const embed = url.pathname.match(/\/embed\/([\w-]{11})/)
    if (embed) return embed[1]
    const shorts = url.pathname.match(/\/shorts\/([\w-]{11})/)
    if (shorts) return shorts[1]
  } catch {
    /* not a URL */
  }
  return trimmed
}

export function youtubeEmbedUrl(videoId: string, autoplay = false): string {
  const id = parseYoutubeId(videoId)
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    ...(autoplay ? { autoplay: '1' } : {}),
  })
  return `https://www.youtube.com/embed/${id}?${params}`
}

export function youtubeThumbnail(videoId: string, quality: 'default' | 'hq' | 'max' = 'hq'): string {
  const id = parseYoutubeId(videoId)
  const map = { default: 'default', hq: 'hqdefault', max: 'maxresdefault' }
  return `https://img.youtube.com/vi/${id}/${map[quality]}.jpg`
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${parseYoutubeId(videoId)}`
}
