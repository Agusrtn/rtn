import { useRef } from 'react'
import type { Video } from '../data/videos'
import { youtubeThumbnail, youtubeWatchUrl } from '../utils/youtube'

interface VideoRowProps {
  title: string
  videos: Video[]
  ranked?: boolean
  onPlay: (video: Video) => void
}

export function VideoRow({ title, videos, ranked, onPlay }: VideoRowProps) {
  const trackRef = useRef<HTMLDivElement | null>(null)

  if (videos.length === 0) return null

  const scrollBy = (offset: number) => {
    if (!trackRef.current) return
    trackRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  return (
    <section className="video-row">
      <div className="video-row__headline">
        <h2 className="video-row__title">
          <span className="video-row__bar" aria-hidden />
          {title}
        </h2>
        <div className="video-row__nav">
          <button
            type="button"
            className="video-row__nav-button"
            aria-label="Mostrar videos anteriores"
            onClick={() => scrollBy(-220)}
          >
            ‹
          </button>
          <button
            type="button"
            className="video-row__nav-button"
            aria-label="Mostrar videos siguientes"
            onClick={() => scrollBy(220)}
          >
            ›
          </button>
        </div>
      </div>
      <div ref={trackRef} className="video-row__track">
        {videos.map((video, i) => (
          <article key={video.id} className="tile">
            <button
              type="button"
              className="tile__thumb"
              onClick={() => onPlay(video)}
              aria-label={`Reproducir: ${video.title}`}
            >
              <img
                src={youtubeThumbnail(video.youtubeId)}
                alt=""
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = youtubeThumbnail(video.youtubeId, 'default')
                }}
              />
              {ranked && <span className="tile__rank">{i + 1}</span>}
            {video.duration && <span className="tile__duration">{video.duration}</span>}
            {video.isLive && <span className="tile__live">EN VIVO</span>}
            </button>
            <div className="tile__meta">
              <h3>
                <button type="button" onClick={() => onPlay(video)}>
                  {video.title}
                </button>
              </h3>
              <div className="tile__foot">
                <span className="tile__date">
                  {new Date(video.publishedAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
                <a
                  href={youtubeWatchUrl(video.youtubeId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tile__yt"
                  onClick={(e) => e.stopPropagation()}
                >
                  ↗
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
