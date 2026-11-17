const BASE = 'https://api.tvmaze.com'
let topCache = null

async function get(path) {
  let res
  try {
    res = await fetch(BASE + path)
  } catch {
    throw new Error('No internet connection. Check your network and try again.')
  }
  if (res.status === 429) throw new Error('Too many requests. Wait a moment and try again.')
  if (!res.ok) throw new Error('The TV database is unavailable. Try again shortly.')
  return res.json()
}

const stripHtml = (html) =>
  html ? new DOMParser().parseFromString(html, 'text/html').body.textContent.trim() : ''

export function normalize(s) {
  return {
    id: s.id,
    name: s.name,
    poster: s.image ? s.image.medium : null,
    posterLarge: s.image ? s.image.original || s.image.medium : null,
    rating: s.rating && s.rating.average ? s.rating.average : null,
    genres: s.genres || [],
    premiered: s.premiered || '',
    year: s.premiered ? s.premiered.slice(0, 4) : '',
    status: s.status || '',
    network: (s.network && s.network.name) || (s.webChannel && s.webChannel.name) || '',
    runtime: s.runtime || s.averageRuntime || null,
    summary: stripHtml(s.summary),
    site: s.officialSite || s.url || '',
  }
}

export async function topShows() {
  if (topCache) return topCache
  const data = await get('/shows?page=0')
  topCache = data.map(normalize).filter((s) => s.poster && s.rating)
  return topCache
}

export async function searchShows(query) {
  const data = await get(`/search/shows?q=${encodeURIComponent(query)}`)
  return data.map((r) => normalize(r.show)).filter((s) => s.poster)
}

export async function showDetails(id) {
  const s = await get(`/shows/${id}?embed=cast`)
  const cast = ((s._embedded && s._embedded.cast) || []).slice(0, 10).map((c) => ({
    id: c.person.id + '-' + c.character.id,
    name: c.person.name,
    character: c.character.name,
    image: c.person.image ? c.person.image.medium : null,
  }))
  return { ...normalize(s), cast }
}
