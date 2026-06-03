import { useState, useEffect } from 'react'
import { siteConfig } from '../config/site'

interface HeaderProps {
  search: string
  onSearchChange: (value: string) => void
  user: {username: string, isAdmin: boolean} | null
  onLoginClick: () => void
  onLogoutClick: () => void
  onAdminClick: () => void
}

export function Header({ search, onSearchChange, user, onLoginClick, onLogoutClick, onAdminClick }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Cambia el estado si el scroll es mayor a 50px
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <a href="#" className="header__logo" aria-label={siteConfig.name}>
        <img src="/logo.png" alt="" width={40} height={40} />
      </a>
      <label className="header__search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          placeholder="Buscar videos..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Buscar videos"
        />
      </label>
      
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {user ? (
          <>
            {user.isAdmin && (
              <button onClick={onAdminClick} className="header__yt" style={{ background: 'var(--lavender)', color: 'white' }}>
                Panel Admin
              </button>
            )}
            <button onClick={onLogoutClick} className="header__yt" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'white' }}>
              Salir
            </button>
          </>
        ) : (
          <button onClick={onLoginClick} className="header__yt">
            Acceder
          </button>
        )}
        <a
          className="header__yt"
          href={siteConfig.youtubeChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          YouTube
        </a>
      </div>
    </header>
  )
}
