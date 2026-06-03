import { useState, useMemo, useEffect } from 'react'
import { HeroLive } from './components/HeroLive'
import { AdminPanel } from './components/AdminPanel'
import initialData from './data/videos.generated.json'
import type { Video, VideoCategory } from './data/videos'
import { categoryLabels } from './data/videos'

export default function App() {
  // Persistencia básica en LocalStorage para el modo demo/admin
  const [videos, setVideos] = useState<Video[]>(() => {
    const saved = localStorage.getItem('rtn_videos')
    return saved ? JSON.parse(saved) : initialData.videos
  })

  const [sections, setSections] = useState<VideoCategory[]>(() => {
    const saved = localStorage.getItem('rtn_sections')
    return saved ? JSON.parse(saved) : ['entretenimiento', 'streams-pasados']
  })

  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    localStorage.setItem('rtn_videos', JSON.stringify(videos))
    localStorage.setItem('rtn_sections', JSON.stringify(sections))
  }, [videos, sections])

  const liveVideo = useMemo(() => videos.find(v => v.isLive), [videos])

  const filteredVideos = useMemo(() => {
    if (!search) return videos
    return videos.filter(v => v.title.toLowerCase().includes(search.toLowerCase()))
  }, [videos, search])

  return (
    <div className="app">
      <header className="header">
        <a href="/" className="header__logo" onClick={(e) => { e.preventDefault(); window.scrollTo(0,0) }}>
          <img src="/logo.png" alt="RTN Logo" />
          <span className="header__brand">rtn</span>
        </a>
        
        <div className="header__search">
          <span>🔍</span>
          <input 
            type="text" 
            placeholder="Buscar videos..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="header__yt" onClick={() => setIsAdminOpen(true)}>
          Admin
        </button>
      </header>

      <main>
        <HeroLive liveVideo={liveVideo} />

        <div className="toolbar">
          <div className="category-pills">
            <button className="pill pill--active">Todo</button>
            {sections.map(s => (
              <button key={s} className="pill">{categoryLabels[s] || s}</button>
            ))}
          </div>
        </div>

        {sections.map(section => {
          const sectionVideos = filteredVideos.filter(v => v.category === section)
          if (sectionVideos.length === 0) return null

          return (
            <section key={section} className="video-row">
              <div className="video-row__headline">
                <h2 className="video-row__title">
                  <div className="video-row__bar" />
                  {categoryLabels[section] || section}
                </h2>
              </div>
              <div className="video-row__track">
                {sectionVideos.map(video => (
                  <article key={video.id} className="tile">
                    <div className="tile__thumb">
                      <img 
                        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} 
                        alt={video.title} 
                      />
                      <span className="tile__duration">{video.duration}</span>
                    </div>
                    <div className="tile__meta">
                      <h3><button>{video.title}</button></h3>
                      <p className="tile__sub">{video.channel} • {video.publishedAt}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )
        })}
      </main>

      <footer className="site-footer">
        <img src="/logo.png" width="20" alt="" />
        <span>© 2026 RTN Events. Todos los derechos reservados.</span>
      </footer>

      {isAdminOpen && (
        <AdminPanel 
          onClose={() => setIsAdminOpen(false)}
          videos={videos} setVideos={setVideos}
          sections={sections} setSections={setSections}
        />
      )}
    </div>
  )
}