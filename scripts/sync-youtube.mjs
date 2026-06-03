/**
 * Sincroniza múltiples canales de YouTube → src/data/videos.generated.json
 */
import { Innertube } from 'youtubei.js'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const CHANNELS = [
  {
    url: 'https://www.youtube.com/@RTN_Events',
    id: 'UCto7W4AT09ZcOOcONZu7wRA',
    uploadsPlaylist: 'UUto7W4AT09ZcOOcONZu7wRA',
    handle: 'RTN_Events',
    name: 'RTN Events',
  },
  {
    url: 'https://www.youtube.com/@RTNTV-c6d',
    id: null, // Se obtendrá dinámicamente
    uploadsPlaylist: null,
    handle: 'RTNTV-c6d',
    name: 'RTNTV',
  },
  {
    url: 'https://www.youtube.com/@rtnmusicrbx',
    id: null, // Se obtendrá dinámicamente
    uploadsPlaylist: null,
    handle: 'rtnmusicrbx',
    name: 'RTN MUSIC',
  },
]

const MAX_VIDEOS = 60
const DELAY_MS = 120

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outFile = path.join(root, 'src/data/videos.generated.json')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function toIsoDate(val) {
  if (!val) return new Date().toISOString().slice(0, 10)
  if (val instanceof Date) return val.toISOString().slice(0, 10)
  if (typeof val === 'string') return val.slice(0, 10)
  return new Date().toISOString().slice(0, 10)
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return undefined
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

async function getChannelId(innertube, channelUrl) {
  try {
    const handle = channelUrl.split('@')[1]
    console.log(`    Obteniendo ID del canal @${handle}...`)
    
    // Intenta usar Innertube para buscar el canal por su handle
    try {
      const results = await innertube.search(handle)
      const channel = results.results?.find((r) => r.type === 'Channel')
      if (channel?.id) {
        console.log(`    ✓ ID encontrado: ${channel.id}`)
        return channel.id
      }
    } catch (e) {
      console.log(`    Búsqueda Innertube falló, intentando HTML scraping...`)
    }

    // Fallback: intenta scraping HTML
    const result = await fetch(channelUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    })
    const html = await result.text()
    
    // Intenta varios patrones regex
    let match = html.match(/"externalChannelId":"(UC[a-zA-Z0-9_-]{22})"/)
    if (!match) match = html.match(/"browseId":"(UC[a-zA-Z0-9_-]{22})"/)
    if (!match) match = html.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/)
    
    if (match?.[1]) {
      console.log(`    ✓ ID encontrado: ${match[1]}`)
      return match[1]
    }
  } catch (e) {
    console.warn(`    Error al obtener ID: ${e.message}`)
  }
  return null
}

async function getUploadsPlaylistId(channelId) {
  if (channelId?.startsWith('UC')) {
    return 'UU' + channelId.slice(2)
  }
  return null
}

async function scrapeVideoIds(channelUrl, tab = 'streams') {
  try {
    const r = await fetch(`${channelUrl}/${tab}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    })
    const html = await r.text()
    const re = /"videoId":"([a-zA-Z0-9_-]{11})"/g
    return [...new Set([...html.matchAll(re)].map((m) => m[1]))]
  } catch (e) {
    return []
  }
}

async function fetchUploadIds(innertube, playlistId, channelName) {
  const ids = []
  try {
    let playlist = await innertube.getPlaylist(playlistId)
    ids.push(...(playlist.videos ?? []).map((v) => v.id))
    while (playlist.has_continuation) {
      playlist = await playlist.getContinuation()
      ids.push(...(playlist.videos ?? []).map((v) => v.id))
    }
  } catch (e) {
    console.warn(`    Playlist API (${channelName}): ${e.message}`)
  }
  return ids
}

async function fetchVideoDetails(innertube, videoId) {
  const info = await innertube.getBasicInfo(videoId)
  const b = info.basic_info ?? {}
  const title = b.title ?? 'Sin título'
  const description = b.short_description ?? ''
  const publishedAt = toIsoDate(b.start_timestamp ?? b.publish_date)
  const duration = formatDuration(b.duration)
  const isLive = Boolean(b.is_live || b.is_upcoming)
  const viewCount = b.view_count ? String(b.view_count) : undefined

  return {
    id: videoId,
    youtubeId: videoId,
    title: title.trim(),
    description: description.trim(),
    publishedAt,
    duration,
    isLive,
    viewCount,
  }
}

async function syncChannel(innertube, channel) {
  console.log(`Sincronizando ${channel.name}...`)

  // Obtener ID del canal si no lo tenemos
  if (!channel.id) {
    channel.id = await getChannelId(innertube, channel.url)
    if (!channel.id) {
      console.warn(`  ⚠ No se pudo obtener el ID de ${channel.name}, omitiendo...`)
      return []
    }
  }

  // Obtener ID de playlist de subidas si no lo tenemos
  if (!channel.uploadsPlaylist) {
    channel.uploadsPlaylist = await getUploadsPlaylistId(channel.id)
  }

  console.log(`  ID: ${channel.id}`)

  // Obtener videos en vivo
  const streamIds = await scrapeVideoIds(channel.url, 'streams')
  console.log(`  Directos (pestaña En vivo): ${streamIds.length}`)

  // Obtener videos subidos
  const uploadIds = await fetchUploadIds(innertube, channel.uploadsPlaylist, channel.name)
  console.log(`  Vídeos: ${uploadIds.length}`)

  const allIds = [...new Set([...streamIds, ...uploadIds])]
  const streamSet = new Set(streamIds)
  const videos = []

  for (let i = 0; i < allIds.length; i++) {
    const id = allIds[i]
    process.stdout.write(`\r  Detalles ${i + 1}/${allIds.length}...`)
    try {
      const v = await fetchVideoDetails(innertube, id)
      videos.push({
        ...v,
        channel: channel.name,
        channelId: channel.id,
        category: channel.name === 'RTN Events' && streamSet.has(id) ? 'streams-pasados' : 'entretenimiento',
        isLive: v.isLive,
      })
    } catch (e) {
      console.warn(`\n  Omitido ${id}: ${e.message}`)
    }
    await sleep(DELAY_MS)
  }

  console.log('\n')
  return videos
}

async function main() {
  const innertube = await Innertube.create({ generate_session_locally: true })
  let allVideos = []

  // Sincronizar cada canal
  for (const channel of CHANNELS) {
    const videos = await syncChannel(innertube, channel)
    allVideos.push(...videos)
  }

  // Eliminar duplicados por videoId
  const seen = new Set()
  const uniqueVideos = []
  for (const v of allVideos) {
    if (!seen.has(v.youtubeId)) {
      seen.add(v.youtubeId)
      uniqueVideos.push(v)
    }
  }

  // Ordenar por fecha descendente
  uniqueVideos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

  console.log('')

  const meta = {
    syncedAt: new Date().toISOString(),
    channels: CHANNELS.map((c) => ({
      id: c.id,
      handle: c.handle,
      name: c.name,
      url: c.url,
    })),
    liveCount: uniqueVideos.filter((v) => v.category === 'streams-pasados').length,
    count: uniqueVideos.length,
  }

  writeFileSync(outFile, JSON.stringify({ meta, videos: uniqueVideos }, null, 2), 'utf8')
  console.log(
    `✓ Guardado ${uniqueVideos.length} videos únicos (${meta.liveCount} en vivo) de ${CHANNELS.length} canales`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
