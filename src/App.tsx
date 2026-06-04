import { useMemo, useState, useEffect } from 'react'
import type { Video, VideoCategory } from './data/videos'
import { categoryLabels, categoryOrder } from './data/videos'
import { Header } from './components/Header'
import { HeroLive } from './components/HeroLive'
import { Filters, CategoryPills, type SortOption } from './components/Filters'
import { VideoRow } from './components/VideoRow'
import { VideoModal } from './components/VideoModal'
import { AdminPanel } from './components/AdminPanel'
import { HeroCarousel } from './components/HeroCarousel'
import { LoginModal } from './components/LoginModal'
import videosData from './data/videos.generated.json'

function sortVideos(list: Video[], sort: SortOption): Video[] {
  const copy = [...list]
  if (sort === 'recientes') {
    return copy.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  }
  if (sort === 'antiguos') {
    return copy.sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))
  }
  return copy.sort((a, b) => a.title.localeCompare(b.title, 'es'))
}

function filterVideos(
  list: Video[],
  search: string,
  category: VideoCategory | 'todos',
): Video[] {
  let result = list
  if (category !== 'todos') {
    result = result.filter((v) => v.categories.includes(category))
  }
  const q = search.trim().toLowerCase()
  if (q) {
    result = result.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        // Evita crash si la categoría no existe en los labels
        v.categories.some(cat => (categoryLabels[cat] || "").toLowerCase().includes(q)),
    )
  }
  return result
}

function getVideosByChannel(list: Video[], channelName: string): Video[] {
  return list.filter((v) => v.channel === channelName)
}

// Helper to convert YouTube duration format (PT#M#S) to a displayable string
function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return ''
  const [, hours, minutes, seconds] = match.map(Number)
  
  let formatted = ''
  if (hours) formatted += `${hours}:`
  formatted += `${minutes || 0}`.padStart(hours ? 2 : 1, '0') + ':'
  formatted += `${seconds || 0}`.padStart(2, '0')
  return formatted
}


function App() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<VideoCategory | 'todos'>('todos')
  const [sort, setSort] = useState<SortOption>('recientes')
  const [activeVideo, setActiveVideo] = useState<Video | null>(null)
  
  // Estado de Autenticación
  const [user, setUser] = useState<{username: string, isAdmin: boolean} | null>(() => {
    try {
      const saved = localStorage.getItem('rtn_user')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })
  const [showLogin, setShowLogin] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  // Estado para el directo detectado automáticamente
  const [autoDetectedLive, setAutoDetectedLive] = useState<Video | null>(null)

  // Efecto para detectar directos de RTN automáticamente
  // YouTube API Key (IMPORTANT: In a real app, this should be handled server-side or securely)
  // For demonstration, we'll use a placeholder. You need to replace this with your actual key.
  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || 'AIzaSyC4fwT3QpMiWckJ11u4hwzcp4V_Xkeeuus';

  const RTN_CHANNELS = useMemo(() => ([
    { id: 'UCto7W4AT09ZcOOcONZu7wRA', name: 'RTN Events' },
    { id: 'UC3dufZUkO9F7u1dSDHPCfCA', name: 'RTNTV' },
    { id: 'UCnZM04AcNHq318JvA1781Rg', name: 'RTN MUSIC' }
  ]), []);

  useEffect(() => {
    const checkYouTubeLive = async (channelId: string, channelName: string) => {
      if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY.includes('YOUR_')) {
        console.warn("YouTube API Key is not configured. Live stream detection will not work.");
        return false;
      }

      try {
        // Use YouTube Data API v3 to check for live streams
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${YOUTUBE_API_KEY}`;
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(searchUrl)}`);
        const data = await response.json();
        const content = JSON.parse(data.contents);

        if (content.items && content.items.length > 0) {
          const liveItem = content.items[0];
          const videoId = liveItem.id.videoId;
          
          // Fetch full details for the live video
          const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`;
          const detailsResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(videoDetailsUrl)}`);
          const detailsData = await detailsResponse.json();
          const detailsContent = JSON.parse(detailsData.contents);

          if (detailsContent.items && detailsContent.items.length > 0) {
            const videoDetails = detailsContent.items[0];
            const liveObj: Video = {
              id: videoId,
              youtubeId: videoId,
              title: videoDetails.snippet.title,
              description: videoDetails.snippet.description,
              channel: channelName,
              channelId: channelId,
              publishedAt: videoDetails.snippet.publishedAt.split('T')[0],
              duration: formatDuration(videoDetails.contentDetails.duration),
              viewCount: videoDetails.statistics.viewCount,
              isLive: true,
              categories: ['entretenimiento']
            };
            setAutoDetectedLive(liveObj);
            return true; // Live stream found and set
          }
        }
        return false;
      } catch (err) {
        console.error(`Error auto-detecting live stream for channel ${channelName}:`, err);
        return false;
      }
    };

    const pollLiveStreams = async () => {
      for (const channel of RTN_CHANNELS) {
        const foundLive = await checkYouTubeLive(channel.id, channel.name);
        if (foundLive) return; // Si encuentra un live, para la búsqueda
      }
      setAutoDetectedLive(null); // Si llega aquí, no hay directos en ninguno
    };

    pollLiveStreams();
    const interval = setInterval(pollLiveStreams, 60000);
    return () => clearInterval(interval); // Clean up interval on component unmount
  }, [RTN_CHANNELS, YOUTUBE_API_KEY]); // Depend on RTN_CHANNELS and YOUTUBE_API_KEY

  // Estado de Datos (Persistente en LocalStorage)
  const [allVideos, setAllVideos] = useState<Video[]>(() => {
    try {
      const saved = localStorage.getItem('rtn_videos')
      const data = (saved && saved !== 'undefined') ? JSON.parse(saved) : (videosData.videos as any[])
      // Normalizamos para asegurar que siempre haya un array de categorías
      return data.map((v: any) => ({
        ...v,
        categories: v.categories || (v.category ? [v.category] : ['entretenimiento'])
      })) as Video[]
    } catch { 
      return (videosData.videos as any[]).map(v => ({ ...v, categories: v.categories || [v.category] })) as Video[] 
    }
  })
  
  const [activeSections, setActiveCategories] = useState<VideoCategory[]>(() => {
    try {
      const saved = localStorage.getItem('rtn_sections')
      return (saved && saved !== 'undefined') ? JSON.parse(saved) : categoryOrder
    } catch { return categoryOrder }
  })

  useEffect(() => {
    localStorage.setItem('rtn_videos', JSON.stringify(allVideos))
    localStorage.setItem('rtn_sections', JSON.stringify(activeSections))
  }, [allVideos, activeSections])

  // Effect to fetch and add new non-live videos automatically
  useEffect(() => {
    const fetchNewVideos = async () => {
      if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY.includes('YOUR_')) { // Verifica si la clave es la placeholder
        console.warn("YouTube API Key is not configured. Automatic new video fetching will not work.");
        return;
      }

      let newVideosFound: Video[] = [];
      for (const channel of RTN_CHANNELS) {
        try {
          // Search for recent videos from the channel, excluding live ones
          const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel.id}&type=video&order=date&maxResults=10&key=${YOUTUBE_API_KEY}`;
          const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(searchUrl)}`);
          const data = await response.json();
          const content = JSON.parse(data.contents);

          if (content.items && content.items.length > 0) {
            const videoIdsToFetchDetails: string[] = [];
            for (const item of content.items) {
              // Check if video already exists in our current allVideos state
              if (!allVideos.some(v => v.youtubeId === item.id.videoId)) {
                videoIdsToFetchDetails.push(item.id.videoId);
              }
            }

            if (videoIdsToFetchDetails.length > 0) {
              // Fetch full details for new videos
              const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIdsToFetchDetails.join(',')}&key=${YOUTUBE_API_KEY}`;
              const detailsResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(videoDetailsUrl)}`);
              const detailsData = await detailsResponse.json();
              const detailsContent = JSON.parse(detailsData.contents);

              if (detailsContent.items) {
                detailsContent.items.forEach((videoDetail: any) => {
                  const newVid: Video = {
                    id: videoDetail.id,
                    youtubeId: videoDetail.id,
                    title: videoDetail.snippet.title,
                    description: videoDetail.snippet.description,
                    channel: channel.name,
                    channelId: channel.id,
                    publishedAt: videoDetail.snippet.publishedAt.split('T')[0],
                    duration: formatDuration(videoDetail.contentDetails.duration),
                    viewCount: videoDetail.statistics.viewCount,
                    isLive: false, // These are non-live videos
                    categories: ['entretenimiento']
                  };
                  newVideosFound.push(newVid);
                });
              }
            }
          }
        } catch (err) {
          console.error(`Error fetching new videos for channel ${channel.name}:`, err);
        }
      }

      if (newVideosFound.length > 0) {
        setAllVideos(prevVideos => [...newVideosFound, ...prevVideos]);
        console.log(`Added ${newVideosFound.length} new videos.`);
      }
    };

    fetchNewVideos();
    const interval = setInterval(fetchNewVideos, 300000); // Check every 5 minutes (300000 ms)
    return () => clearInterval(interval);
  }, [allVideos, RTN_CHANNELS, YOUTUBE_API_KEY]); // Depend on allVideos to re-evaluate new videos, and API key

  const filtered = useMemo(
    () => sortVideos(filterVideos(allVideos, search, category), sort),
    [allVideos, search, category, sort],
  )

  // Prioridad: 1. Video marcado como vivo en Admin, 2. Video detectado por el script, 3. Nada (Loop)
  const primaryLiveVideo = useMemo(() => 
    allVideos.find((v) => v.isLive) || autoDetectedLive, 
  [allVideos, autoDetectedLive])

  const rtnMusicVideos = useMemo(() => sortVideos(getVideosByChannel(allVideos, 'RTN MUSIC'), sort), [allVideos, sort])
  const rtnTvVideos = useMemo(() => sortVideos(getVideosByChannel(allVideos, 'RTNTV'), sort), [allVideos, sort])

  const rows = useMemo(() => {
    if (category !== 'todos' || search.trim()) {
      return [
        {
          title: search.trim() ? 'Resultados' : categoryLabels[category as VideoCategory],
          items: filtered,
        },
      ]
    }
    const sorted = sortVideos(allVideos, sort)
    const groups: { title: string; items: Video[]; ranked?: boolean }[] = []
    const recent = sorted.slice(0, 10)
    if (recent.length) groups.push({ title: 'Más Recientes', items: recent })

    for (const cat of activeSections) {
      const items = sorted.filter((v) => v.categories.includes(cat))
      if (items.length) {
        groups.push({ title: categoryLabels[cat] || `Sección ${cat}`, items })
      }
    }
    return groups
  }, [allVideos, activeSections, category, search, sort, filtered])

  const handleLogout = () => {
    localStorage.removeItem('rtn_user')
    setUser(null)
    setShowAdmin(false)
  }

  return (
    <div className="app">
      <Header 
        search={search} 
        onSearchChange={setSearch} 
        user={user}
        onLoginClick={() => setShowLogin(true)}
        onLogoutClick={handleLogout}
        onAdminClick={() => setShowAdmin(true)}
      />
      <main>
        <HeroCarousel onPlay={setActiveVideo} allVideos={allVideos} />
        
        <HeroLive liveVideo={primaryLiveVideo ?? null} />

        <div className="toolbar">
          <CategoryPills 
            category={category} 
            onCategoryChange={setCategory} 
            availableCategories={activeSections}
          />
          {(search.trim() || category !== 'todos') && (
            <Filters sort={sort} onSortChange={setSort} />
          )}
        </div>

        {filtered.length === 0 ? (
          <p className="empty-state">No hay videos que coincidan con tu búsqueda.</p>
        ) : (
          rows.map((row) => (
            <VideoRow
              key={row.title}
              title={row.title}
              videos={row.items}
              ranked={row.ranked}
              onPlay={setActiveVideo}
            />
          ))
        )}
        {!search.trim() && category === 'todos' && (
          <>
            {rtnMusicVideos.length > 0 && (
              <VideoRow
                title="RTN MUSIC"
                videos={rtnMusicVideos}
                onPlay={setActiveVideo}
              />
            )}
            {rtnTvVideos.length > 0 && (
              <VideoRow
                title="RTN TV"
                videos={rtnTvVideos}
                onPlay={setActiveVideo}
              />
            )}
          </>
        )}
      </main>
      <footer className="site-footer">
        <img src="/logo.png" alt="" width={32} height={32} />
        <span>© {new Date().getFullYear()} rtn</span>
      </footer>
      <VideoModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
        allVideos={allVideos}
        onPlay={setActiveVideo}
      />

      {/* Componentes de Admin/Login */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={setUser} />}
      {showAdmin && (
        <AdminPanel 
          onClose={() => setShowAdmin(false)} 
          videos={allVideos} 
          setVideos={setAllVideos}
          sections={activeSections}
          setSections={setActiveCategories}
        />
      )}
    </div>
  )
}

export default App
