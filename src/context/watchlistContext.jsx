import { createContext, useState, useEffect, useContext } from 'react'

export const WatchlistContext = createContext()

const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('crypto_watchlist')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('crypto_watchlist', JSON.stringify(watchlist))
  }, [watchlist])

  const addToWatchlist = (coin) => {
    setWatchlist((prev) =>
      prev.find((c) => c.id === coin.id) ? prev : [...prev, coin],
    )
  }

  const removeFromWatchlist = (coinId) => {
    setWatchlist((prev) => prev.filter((c) => c.id !== coinId))
  }

  const isWatched = (coinId) => watchlist.some((c) => c.id === coinId)

  const toggleWatchlist = (coin) => {
    isWatched(coin.id) ? removeFromWatchlist(coin.id) : addToWatchlist(coin)
  }

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isWatched,
        toggleWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  )
}

export default WatchlistProvider
