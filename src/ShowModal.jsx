import { useEffect, useState } from 'react'
import { showDetails } from './api'

export default function ShowModal({ show, saved, onClose, onToggle }) {
  const [cast, setCast] = useState([])
  const [castLoading, setCastLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    showDetails(show.id)
      .then((d) => {
        if (!cancelled) setCast(d.cast)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCastLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [show.id])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    const prev = document.body.style.overflow
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div className="overlay" onClick={onClose}>
      <article
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={show.name}
      >
        <img
          className="m-poster"
          src={show.posterLarge || show.poster}
          alt={`${show.name} poster`}
        />
        <div className="m-body">
          <h2 className="m-title">{show.name}</h2>
          <div className="m-meta">
            {show.rating && <span className="chip star">★ {show.rating.toFixed(1)}</span>}
            {show.year && <span className="chip">{show.year}</span>}
            {show.status && <span className="chip">{show.status}</span>}
            {show.network && <span className="chip">{show.network}</span>}
            {show.runtime && <span className="chip">{show.runtime} min</span>}
          </div>
          {show.genres.length > 0 && (
            <p className="m-genres">{show.genres.join(' · ')}</p>
          )}
          <p className="m-sum">{show.summary || 'No summary available.'}</p>

          <div className="m-actions">
            <button type="button" className="btn" onClick={() => onToggle(show)}>
              {saved ? '♥ In watchlist' : '♡ Add to watchlist'}
            </button>
            {show.site && (
              <a className="btn ghost" href={show.site} target="_blank" rel="noreferrer">
                Official page
              </a>
            )}
          </div>

          <h3 className="m-sub">Cast</h3>
          {castLoading ? (
            <p className="muted">Loading cast...</p>
          ) : cast.length ? (
            <ul className="cast">
              {cast.map((c) => (
                <li key={c.id}>
                  {c.image ? (
                    <img src={c.image} alt={c.name} loading="lazy" />
                  ) : (
                    <span className="cast-fb">{c.name[0]}</span>
                  )}
                  <b>{c.name}</b>
                  <small>{c.character}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Cast information unavailable.</p>
          )}
        </div>
      </article>
      <button type="button" className="m-close" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  )
}
