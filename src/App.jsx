import { useCallback, useEffect, useMemo, useState } from 'react'
import useLocalStorage from './useLocalStorage'
import { searchShows, topShows } from './api'
import ShowCard from './ShowCard'
import ShowModal from './ShowModal'

const PER_PAGE = 12

export default function App() {
  const [tab, setTab] = useState('browse')
  const [input, setInput] = useState('')
  const [term, setTerm] = useState('')
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [genre, setGenre] = useState('All')
  const [sort, setSort] = useState('rating')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [watchlist, setWatchlist] = useLocalStorage('ss-watchlist', [])

  useEffect(() => {
    const id = setTimeout(() => setTerm(input.trim()), 450)
    return () => clearTimeout(id)
  }, [input])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    const job = term ? searchShows(term) : topShows()
    job
      .then((data) => {
        if (cancelled) return
        setShows(data)
        setGenre('All')
        setPage(1)
      })
      .catch((err) => {
        if (cancelled) return
        setShows([])
        setError(err.message || 'Something went wrong.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [term, reloadKey])

  const source = tab === 'watchlist' ? watchlist : shows

  const genres = useMemo(
    () => ['All', ...[...new Set(source.flatMap((s) => s.genres))].sort()],
    [source],
  )

  const list = useMemo(() => {
    const out =
      genre === 'All' ? [...source] : source.filter((s) => s.genres.includes(genre))
    if (sort === 'rating') out.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    else if (sort === 'new') out.sort((a, b) => b.premiered.localeCompare(a.premiered))
    else out.sort((a, b) => a.name.localeCompare(b.name))
    return out
  }, [source, genre, sort])

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE))
  const current = Math.min(page, pages)
  const visible = list.slice((current - 1) * PER_PAGE, current * PER_PAGE)

  const isSaved = (id) => watchlist.some((s) => s.id === id)
  const toggleSaved = (show) =>
    setWatchlist(
      isSaved(show.id)
        ? watchlist.filter((s) => s.id !== show.id)
        : [show, ...watchlist],
    )

  const goPage = (n) => {
    setPage(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const switchTab = (t) => {
    setTab(t)
    setGenre('All')
    setPage(1)
  }
  const onSearch = (e) => {
    setInput(e.target.value)
    if (tab !== 'browse') switchTab('browse')
  }
  const closeModal = useCallback(() => setSelected(null), [])

  const busy = tab === 'browse' && loading
  const failed = tab === 'browse' && error

  let heading = 'Top Rated Shows'
  if (tab === 'watchlist') heading = 'My Watchlist'
  else if (term) heading = `Results for "${term}"`

  let emptyText = 'No shows found. Try another title.'
  if (tab === 'watchlist') {
    emptyText = 'Your watchlist is empty. Tap the heart on any show to save it.'
  }

  return (
    <>
      <header className="bar">
        <div className="wrap bar-in">
          <h1 className="logo">
            Show<span>Spot</span>
          </h1>
          <input
            className="search"
            type="search"
            value={input}
            onChange={onSearch}
            placeholder="Search TV shows..."
            aria-label="Search TV shows"
          />
        </div>
        <div className="wrap tabs">
          <button
            type="button"
            className={tab === 'browse' ? 'on' : ''}
            onClick={() => switchTab('browse')}
          >
            Browse
          </button>
          <button
            type="button"
            className={tab === 'watchlist' ? 'on' : ''}
            onClick={() => switchTab('watchlist')}
          >
            Watchlist <small>{watchlist.length}</small>
          </button>
        </div>
      </header>

      <main className="wrap">
        <div className="head">
          <h2>{heading}</h2>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value)
              setPage(1)
            }}
            aria-label="Sort shows"
          >
            <option value="rating">Top rated</option>
            <option value="new">Newest</option>
            <option value="az">A to Z</option>
          </select>
        </div>

        {genres.length > 1 && (
          <div className="genres">
            {genres.map((g) => (
              <button
                key={g}
                type="button"
                className={genre === g ? 'on' : ''}
                onClick={() => {
                  setGenre(g)
                  setPage(1)
                }}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {failed && (
          <div className="notice" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
              Try again
            </button>
          </div>
        )}

        {busy && (
          <ul className="grid">
            {Array.from({ length: PER_PAGE }, (_, i) => (
              <li key={i} className="skel" />
            ))}
          </ul>
        )}

        {!busy && !failed && visible.length === 0 && (
          <p className="empty">{emptyText}</p>
        )}

        {!busy && visible.length > 0 && (
          <ul className="grid">
            {visible.map((s) => (
              <ShowCard
                key={s.id}
                show={s}
                saved={isSaved(s.id)}
                onOpen={setSelected}
                onToggle={toggleSaved}
              />
            ))}
          </ul>
        )}

        {!busy && pages > 1 && (
          <nav className="pager" aria-label="Pagination">
            <button
              type="button"
              disabled={current === 1}
              onClick={() => goPage(current - 1)}
            >
              ← Prev
            </button>
            <span>
              Page {current} of {pages}
            </span>
            <button
              type="button"
              disabled={current === pages}
              onClick={() => goPage(current + 1)}
            >
              Next →
            </button>
          </nav>
        )}
      </main>

      <footer className="wrap foot">
        Data by{' '}
        <a href="https://www.tvmaze.com/" target="_blank" rel="noreferrer">
          TVmaze
        </a>
      </footer>

      {selected && (
        <ShowModal
          show={selected}
          saved={isSaved(selected.id)}
          onClose={closeModal}
          onToggle={toggleSaved}
        />
      )}
    </>
  )
}
