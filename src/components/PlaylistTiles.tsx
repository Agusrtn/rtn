import { playlistTiles } from '../data/playlists'
import type { VideoCategory } from '../data/videos'

interface PlaylistTilesProps {
  active: VideoCategory | 'todos'
  onSelect: (id: VideoCategory | 'todos') => void
}

export function PlaylistTiles({ active, onSelect }: PlaylistTilesProps) {
  return (
    <div className="playlist-tiles">
      {playlistTiles.map((tile) => (
        <button
          key={tile.id}
          type="button"
          className={`playlist-tile ${active === tile.id ? 'playlist-tile--active' : ''}`}
          style={{ background: tile.gradient }}
          onClick={() => onSelect(tile.id)}
        >
          <span className="playlist-tile__label">{tile.label}</span>
        </button>
      ))}
    </div>
  )
}
