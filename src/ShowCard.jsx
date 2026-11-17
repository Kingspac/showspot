export default function ShowCard({ show, saved, onOpen, onToggle }) {
  return (
    <li className="card">
      <button
        type="button"
        className="poster"
        onClick={() => onOpen(show)}
        aria-label={`Open ${show.name}`}
      >
        <img src={show.poster} alt="" loading="lazy" />
        {show.rating && <span className="badge">★ {show.rating.toFixed(1)}</span>}
      </button>
      <button
        type="button"
        className={`heart${saved ? ' on' : ''}`}
        onClick={() => onToggle(show)}
        aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        {saved ? '♥' : '♡'}
      </button>
      <div className="info">
        <h3>{show.name}</h3>
        <p>
          {show.year}
          {show.genres[0] ? ` · ${show.genres[0]}` : ''}
        </p>
      </div>
    </li>
  )
}
