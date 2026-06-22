import React, { useContext } from 'react'
import { WatchlistContext } from '../../context/watchlistContext'
import './starButton.css'

const StarButton = ({ coin }) => {
  const { isWatched, toggleWatchlist } = useContext(WatchlistContext)
  const watched = isWatched(coin.id)

  return (
    <button
      className={`star-btn ${watched ? 'starred' : ''}`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleWatchlist(coin)
      }}
      title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      {watched ? '★' : '☆'}
    </button>
  )
}

export default StarButton
