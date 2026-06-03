import { useEffect, useState, useMemo, useCallback } from 'react'
import type { Video } from '../data/videos'
import { youtubeThumbnail } from '../utils/youtube'

interface HeroCarouselProps {
  onPlay: (video: Video) => void
  allVideos: Video[]
}

export function HeroCarousel({ onPlay, allVideos }: HeroCarouselProps) {
  const items = useMemo(() => {
    // Función para mezclar un array de forma aleatoria
    const shuffleArray = (array: Video[]) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const live = allVideos.filter((v) => v.isLive)
    let pool = live.length > 0 ? live : allVideos;

    // Si hay videos en vivo, priorizarlos y luego añadir aleatorios no-live si es necesario
    if (live.length > 0) {
      const nonLive = allVideos.filter(v => !v.isLive);
      const shuffledNonLive = shuffleArray(nonLive);
      pool = [...live, ...shuffledNonLive];
    } else {
      // Si no hay videos en vivo, simplemente mezclar todos los videos
      pool = shuffleArray(allVideos);
    }
    
    // Seleccionar los primeros 5 (o menos si no hay suficientes videos)
    return pool.slice(0, 5);
  }, [allVideos])

  const [index, setIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const current = items[index]

  const goToSlide = useCallback((newIndex: number) => {
    if (newIndex === index || isTransitioning) return
    setIsTransitioning(true)
    setIndex(newIndex)
    setTimeout(() => setIsTransitioning(false), 600)
  }, [index, isTransitioning])

  const goToNext = useCallback(() => {
    if (items.length <= 1) return
    goToSlide((index + 1) % items.length)
  }, [index, items.length, goToSlide])

  const goToPrev = useCallback(() => {
    if (items.length <= 1) return
    goToSlide((index - 1 + items.length) % items.length)
  }, [index, items.length, goToSlide])

  useEffect(() => {
    if (items.length <= 1 || isHovering) return
    const t = setInterval(goToNext, 6000)
    return () => clearInterval(t)
  }, [items.length, isHovering, goToNext])

  if (!current) return null

  return (
    <section 
      className="hero-carousel" 
      aria-label="Destacados"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="hero-carousel__track">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            className={`hero-carousel__slide ${i === index ? 'hero-carousel__slide--active' : ''}`}
            onClick={() => onPlay(item)}
            aria-label={`Reproducir: ${item.title}`}
            aria-hidden={i !== index}
          >
            <img
              className="hero-carousel__bg"
              src={youtubeThumbnail(item.youtubeId, 'max')}
              alt=""
              onError={(e) => {
                e.currentTarget.src = youtubeThumbnail(item.youtubeId, 'hq')
              }}
            />
            <div className="hero-carousel__shade" />
            <div className="hero-carousel__gradient-overlay" />
            
            <div className="hero-carousel__info">
              {item.isLive && <span className="tag tag--live">EN VIVO</span>}
              <h1>{item.title}</h1>
              <p>{item.description}</p>
              
              <div className="hero-carousel__play-btn">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button 
            type="button"
            className="hero-carousel__nav hero-carousel__nav--prev" 
            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
          >
            ‹
          </button>
          <button 
            type="button"
            className="hero-carousel__nav hero-carousel__nav--next" 
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
          >
            ›
          </button>
          
          <div className="hero-carousel__dots">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`hero-carousel__dot ${i === index ? 'hero-carousel__dot--active' : ''}`}
                onClick={(e) => { e.stopPropagation(); goToSlide(i); }}
              />
            ))}
          </div>
          
          {!isHovering && (
            <div className="hero-carousel__progress">
              <div className="hero-carousel__progress-bar" key={index} />
            </div>
          )}
        </>
      )}
    </section>
  )
}
