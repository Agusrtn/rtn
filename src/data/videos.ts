import generated from './videos.generated.json'

export type VideoCategory =
  | 'en-vivo'
  | 'noticias'
  | 'musica'
  | 'entretenimiento'
  | 'documentales'

export interface Video {
  id: string
  youtubeId: string
  title: string
  description: string
  category: VideoCategory
  publishedAt: string
  duration?: string
  isLive?: boolean
  viewCount?: string
}

export const channelMeta = generated.meta

/** Videos sincronizados desde YouTube — ejecuta: npm run sync:youtube */
export const videos: Video[] = generated.videos as Video[]

export const categoryLabels: Record<VideoCategory, string> = {
  'en-vivo': 'En vivo',
  noticias: 'Noticias',
  musica: 'Música',
  entretenimiento: 'Entretenimiento',
  documentales: 'Documentales',
}

export const categoryOrder: VideoCategory[] = [
  'en-vivo',
  'noticias',
  'musica',
  'entretenimiento',
  'documentales',
]
