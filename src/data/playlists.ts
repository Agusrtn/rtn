import type { VideoCategory } from './videos'

export interface PlaylistTile {
  id: VideoCategory | 'todos'
  label: string
  gradient: string
}

/** Colores de marca RTN */
export const playlistTiles: PlaylistTile[] = [
  {
    id: 'en-vivo',
    label: 'En vivo',
    gradient: 'linear-gradient(135deg, #e11d48 0%, #aa2de1 100%)',
  },
  {
    id: 'noticias',
    label: 'Noticias',
    gradient: 'linear-gradient(135deg, #aa2de1 0%, #af97df 100%)',
  },
  {
    id: 'musica',
    label: 'Música',
    gradient: 'linear-gradient(135deg, #d878e3 0%, #1bd6d6 100%)',
  },
  {
    id: 'entretenimiento',
    label: 'Shows',
    gradient: 'linear-gradient(135deg, #1bd6d6 0%, #85bedd 100%)',
  },
  {
    id: 'documentales',
    label: 'Docs',
    gradient: 'linear-gradient(135deg, #85bedd 0%, #af97df 100%)',
  },
  {
    id: 'todos',
    label: 'Catálogo',
    gradient: 'linear-gradient(135deg, #0a0a0f 0%, #1a1028 100%)',
  },
]
