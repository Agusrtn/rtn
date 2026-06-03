import { useMemo } from 'react'
import type { Video } from '../data/videos'
import { siteConfig } from '../config/site'
import { youtubeEmbedUrl, youtubeThumbnail, youtubeWatchUrl } from '../utils/youtube'

interface VideoModalProps {
  video: Video | null
  onClose: () => void
  allVideos: Video[]
  onPlay: (video: Video) => void
}

function formatViews(count?: string) {
  if (!count) return '—'
  const n = Number(String(count).replace(/\D/g, ''))
  if (Number.isNaN(n)) return count
  return n.toLocaleString('es-ES')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function VideoModal({ video, onClose, allVideos, onPlay }: VideoModalProps) {
  const similar = useMemo(() => {
    if (!video) return []
    return allVideos
      .filter((v) => v.id !== video.id && v.category === video.category)
      .slice(0, 4)
  }, [video, allVideos])

  if (!video) return null

  const year = video.publishedAt.slice(0, 4)

  return (
    <div className="player" role="dialog" aria-modal="true" aria-labelledby="player-title">
      <button type="button" className="player__backdrop" onClick={onClose} aria-label="Cerrar" />
      <div className="player__shell">
        <div className="player__main">
          <header className="player__top">
            <div className="player__channel">
              <img src="/logo.png" alt="" width={36} height={36} />
              <div>
                <p className="player__video-title">{video.title}</p>
                <p className="player__channel-name">{siteConfig.channelName}</p>
              </div>
            </div>
            <button type="button" className="player__close" onClick={onClose} aria-label="Cerrar">
              ×
            </button>
          </header>
          <div className="player__frame">
            <iframe
              title={video.title}
              src={youtubeEmbedUrl(video.youtubeId, true)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        <aside className="player__sidebar">
          <div className="player__meta-row">
            <span>{year}</span>
            {video.isLive && <span className="badge badge--live">EN VIVO</span>} {/* Texto unificado */}
            <span className="badge badge--hd">HD</span>
          </div>
          <h2 id="player-title" className="player__title">
            {video.title}
          </h2>
          <ul className="player__stats">
            <li>
              <span>Canal</span>
              <strong>{siteConfig.channelName}</strong>
            </li>
            <li>
              <span>Visualizaciones</span>
              <strong>{formatViews(video.viewCount)}</strong>
            </li>
            <li>
              <span>Fecha</span>
              <strong>{formatDate(video.publishedAt)}</strong>
            </li>
          </ul>
          <section className="player__desc-box">
            <h3>Descripción</h3>
            <p>{video.description || 'Sin descripción.'}</p>
          </section>
          {similar.length > 0 && (
            <section className="player__similar">
              <h3>Contenido similar</h3>
              <ul>
                {similar.map((v) => (
                  <li key={v.id}>
                    <button type="button" className="similar-card" onClick={() => onPlay(v)}>
                      <img src={youtubeThumbnail(v.youtubeId)} alt="" loading="lazy" />
                      <span>{v.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <a
            href={youtubeWatchUrl(video.youtubeId)}
            target="_blank"
            rel="noopener noreferrer"
            className="player__yt-link"
          >
            Ver en YouTube ↗
          </a>
        </aside>
      </div>
    </div>
  )
}
