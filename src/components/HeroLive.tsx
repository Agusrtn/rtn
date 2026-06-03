import { useState } from 'react'
import type { Video } from '../data/videos'
import { youtubeEmbedUrl } from '../utils/youtube'

interface HeroLiveProps {
  liveVideo?: Video | null
}

export function HeroLive({ liveVideo }: HeroLiveProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasLive = Boolean(liveVideo)
  const fallbackVideo = '/comp1_17.mp4'

  return (
    <section 
      className={`hero-live ${isExpanded ? 'hero-live--expanded' : ''}`} 
      aria-label="Transmisión principal"
    >
      <div className="hero-live__container">
        <div className="hero-live__video-wrapper">
          <div className="hero-live__media">
            <video
              className={`hero-live__fallback ${hasLive ? 'hero-live__fallback--hidden' : ''}`}
              src={fallbackVideo}
              autoPlay
              loop
              muted
              playsInline
              aria-hidden={hasLive}
            />
            <iframe
              className={`hero-live__iframe ${hasLive ? 'hero-live__iframe--visible' : ''}`}
              title={hasLive ? liveVideo?.title ?? 'RTN en directo' : 'Transmisión de espera'}
              src={hasLive ? youtubeEmbedUrl(liveVideo!.youtubeId, true) : undefined}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              aria-hidden={!hasLive}
            />
          </div>
          {isExpanded && (
            <button 
              className="hero-live__expand-btn"
              onClick={() => setIsExpanded(false)}
              aria-label="Cerrar"
              title="Cerrar"
            >
              ✕
            </button>
          )}
        </div>

        {!isExpanded && (
          <div className="hero-live__side-panel">
            <div className="hero-live__info-box" style={{ border: 'none', padding: 0, background: 'transparent' }}>
              <span className={`hero-live__label ${hasLive ? 'hero-live__label--live' : ''}`}>
                {hasLive ? 'EN VIVO' : 'EN SEÑAL'} {/* Texto unificado */}
              </span>
              <h2 className="hero-live__title-sidebar" style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>
                {hasLive ? liveVideo?.title : 'RTN Studio — En Señal'}
              </h2>
              {hasLive && liveVideo?.title.includes('EN VIVO') && (
                <p style={{ color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 'bold' }}>📡 SEÑAL AUTOMÁTICA ACTIVADA</p>
              )}
              {!hasLive && (
                <p style={{ color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 'bold' }}>⚠️ MODO LOOP ACTIVADO (No hay directo en la base de datos)</p>
              )}
              <p className="hero-live__description-sidebar">
                {hasLive
                  ? liveVideo?.description || 'La señal en vivo ya está al aire.'
                  : 'Reproduciendo video de espera mientras no hay directo.'}
              </p>
            </div>
            {/* El botón AGRANDAR ha sido eliminado por petición del usuario.
                La información del video ahora siempre se muestra en el panel lateral cuando no está expandido. */}
          </div>
        )}

        {isExpanded && (
          <div className="hero-live__sidebar">
            <div className="hero-live__info-box">
              <span className={`hero-live__label ${hasLive ? 'hero-live__label--live' : ''}`}>
                {hasLive ? 'EN VIVO' : 'OFFLINE'} {/* Texto unificado */}
              </span>
              <h2 className="hero-live__title-sidebar">
                {hasLive ? liveVideo?.title : 'Transmisión no disponible'}
              </h2>
              
              {hasLive && liveVideo && (
                <div className="hero-live__details">
                  <div className="hero-live__detail-item">
                    <span className="hero-live__detail-label">Canal:</span>
                    <span className="hero-live__detail-value">{liveVideo.channel || 'RTN Events'}</span>
                  </div>
                  <div className="hero-live__detail-item">
                    <span className="hero-live__detail-label">Publicado:</span>
                    <span className="hero-live__detail-value">{liveVideo.publishedAt}</span>
                  </div>
                  {liveVideo.duration && (
                    <div className="hero-live__detail-item">
                      <span className="hero-live__detail-label">Duración:</span>
                      <span className="hero-live__detail-value">{liveVideo.duration}</span>
                    </div>
                  )}
                </div>
              )}

              <p className="hero-live__description-sidebar">
                {hasLive
                  ? liveVideo?.description || 'La transmisión está en vivo ahora.'
                  : 'No hay transmisión disponible en este momento. Vuelve pronto.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
