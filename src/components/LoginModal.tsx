import { useState } from 'react'

export function LoginModal({ onClose, onLogin }: { onClose: () => void, onLogin: (user: any) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === 'RTNEVENTS' && password === '1234') {
      const user = { username: 'RTNEVENTS', isAdmin: true }
      localStorage.setItem('rtn_user', JSON.stringify(user))
      onLogin(user)
      onClose()
    } else {
      setError('Usuario o contraseña incorrectos')
    }
  }

  return (
    <div className="player" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="player__backdrop" onClick={onClose} />
      <div className="player__desc-box" style={{ width: '320px', zIndex: 10, background: 'var(--surface)', padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>RTN Access</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Usuario" 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: '8px', background: 'black', border: '1px solid var(--border)', color: 'white' }}
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: '8px', background: 'black', border: '1px solid var(--border)', color: 'white' }}
          />
          {error && <p style={{ color: 'var(--live-red)', fontSize: '0.8rem' }}>{error}</p>}
          <button type="submit" className="header__yt" style={{ width: '100%', marginTop: '1rem' }}>
            Entrar
          </button>
          <button type="button" onClick={onClose} style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Cancelar
          </button>
        </form>
      </div>
    </div>
  )
}