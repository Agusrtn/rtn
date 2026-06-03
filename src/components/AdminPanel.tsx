import type { Video, VideoCategory } from '../data/videos'
import { categoryLabels } from '../data/videos'

interface AdminPanelProps {
  onClose: () => void
  videos: Video[]
  setVideos: (v: Video[]) => void
  sections: VideoCategory[]
  setSections: (s: VideoCategory[]) => void
}

export function AdminPanel({ onClose, videos, setVideos, sections, setSections }: AdminPanelProps) {
  const removeSection = (cat: VideoCategory) => {
    setSections(sections.filter(s => s !== cat))
  }

  const addSection = () => {
    const name = prompt('Nombre de la nueva categoría (slug):') as VideoCategory
    if (name && !sections.includes(name)) setSections([...sections, name])
  }

  const resetData = () => {
    if (confirm('¿Restablecer toda la web a su estado original? Se perderán tus cambios.')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const updateVideoCategory = (id: string, newCat: VideoCategory) => {
    setVideos(videos.map(v => v.id === id ? { ...v, category: newCat } : v))
  }

  const toggleLive = (id: string) => {
    const video = videos.find(v => v.id === id);
    const willBeLive = !video?.isLive;
    
    setVideos(videos.map(v => {
      if (v.id === id) return { ...v, isLive: willBeLive };
      if (willBeLive) return { ...v, isLive: false }; // Solo puede haber un video en directo a la vez
      return v;
    }));
  }

  const addNewVideo = () => {
    const youtubeId = prompt('Introduce el ID de YouTube (ej: jfKfPfyJRdk):')
    const title = prompt('Título del video:')
    
    if (youtubeId && title) {
      if (sections.length === 0) {
        alert('Primero debes crear al menos una sección.')
        return
      }
      
      const newVideo: Video = {
        id: Date.now().toString(),
        youtubeId: youtubeId,
        title: title,
        description: 'Añadido manualmente',
        category: sections[0], // Por defecto a la primera sección
        publishedAt: new Date().toISOString().split('T')[0],
      }
      setVideos([newVideo, ...videos])
    }
  }

  const deleteVideo = (id: string) => {
    if (confirm('¿Eliminar este video?')) {
      setVideos(videos.filter(v => v.id !== id))
    }
  }

  return (
    <div className="player" style={{ zIndex: 400 }}>
      <div className="player__backdrop" onClick={onClose} />
      <div className="player__shell" style={{ width: '90%', height: '90%', margin: 'auto', borderRadius: '15px', overflow: 'hidden' }}>
        <div className="player__sidebar" style={{ width: '300px', background: '#111' }}>
          <h2 style={{ marginBottom: '1rem' }}>Secciones</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sections.map(s => (
              <div key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#222', borderRadius: '5px' }}>
                <span>{s}</span>
                <button onClick={() => removeSection(s)} style={{ color: 'var(--live-red)' }}>✕</button>
              </div>
            ))}
            <button onClick={addSection} className="header__yt" style={{ marginTop: '1rem' }}>+ Añadir Sección</button>
            <button onClick={resetData} style={{ marginTop: 'auto', color: 'var(--text-dim)', fontSize: '0.7rem', opacity: 0.5 }}>Limpiar Todo</button>
          </div>
        </div>
        <div className="player__main" style={{ padding: '2rem', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1>Gestión de Videos</h1>
            <button onClick={onClose} className="player__close">✕</button>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>Título</th>
                <th>Categoría</th>
                <th style={{ textAlign: 'center' }}>Vivo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {videos.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{v.title}</td>
                  <td>
                    <select 
                      value={v.category} 
                      onChange={(e) => updateVideoCategory(v.id, e.target.value as VideoCategory)}
                      style={{ background: '#222', color: 'white', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.25rem' }}
                    >
                      {sections.map(s => (
                        <option key={s} value={s}>{categoryLabels[s] || s}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <label className="switch">
                      <input type="checkbox" checked={v.isLive || false} onChange={() => toggleLive(v.id)} />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td>
                    <button onClick={() => deleteVideo(v.id)} style={{ color: 'var(--live-red)' }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={addNewVideo}
            className="header__yt"
            style={{ marginTop: '2rem', background: 'var(--cyan)', color: 'black' }}
          >
            + Añadir Nuevo Video
          </button>
        </div>
      </div>
    </div>
  )
}