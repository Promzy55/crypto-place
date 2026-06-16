import React, { useContext } from 'react'
import './Watchlist.css'
import { Link } from 'react-router-dom'
import { WatchlistContext } from '../../context/watchlistContext'
import { CoinContext } from '../../context/CoinContext'

const Watchlist = () => {
  const { watchlist, removeFromWatchlist } = useContext(WatchlistContext)
  const { currency, allCoin } = useContext(CoinContext)

  // Merge live prices into watchlist coins
  const enriched = watchlist.map((wCoin) => {
    const live = allCoin.find((c) => c.id === wCoin.id)
    return live || wCoin
  })

  const fmt = (n) => {
    if (!n && n !== 0) return 'N/A'
    if (n >= 1e12) return currency.symbol + (n / 1e12).toFixed(2) + 'T'
    if (n >= 1e9) return currency.symbol + (n / 1e9).toFixed(2) + 'B'
    if (n >= 1e6) return currency.symbol + (n / 1e6).toFixed(2) + 'M'
    return currency.symbol + n.toLocaleString()
  }

  const fmtPrice = (p) => {
    if (!p) return 'N/A'
    if (p >= 1)
      return (
        currency.symbol +
        p.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      )
    return currency.symbol + p.toFixed(6)
  }

  return (
    <div className='watchlist-page'>
      {/* Header */}
      <div className='wl-header'>
        <div>
          <h1 className='wl-title'>My Watchlist</h1>
          <p className='wl-sub'>
            {enriched.length > 0
              ? `Tracking ${enriched.length} asset${enriched.length > 1 ? 's' : ''} · Live prices`
              : 'No assets added yet'}
          </p>
        </div>
        <Link to='/' className='wl-browse-btn'>
          + Browse Markets
        </Link>
      </div>

      {/* Empty State */}
      {enriched.length === 0 && (
        <div className='wl-empty'>
          <div className='wl-empty-icon'>⭐</div>
          <h2>Your watchlist is empty</h2>
          <p>
            Star any coin from the markets or coin detail page to track it here.
          </p>
          <Link to='/' className='wl-browse-btn'>
            Browse Markets
          </Link>
        </div>
      )}

      {/* Watchlist Table */}
      {enriched.length > 0 && (
        <div className='wl-table'>
          {/* Table Header */}
          <div className='wl-row wl-head'>
            <span>#</span>
            <span>Coin</span>
            <span>Price</span>
            <span>24h Change</span>
            <span>Market Cap</span>
            <span>Volume</span>
            <span></span>
          </div>

          {enriched.map((coin, index) => {
            const change = coin.price_change_percentage_24h || 0
            const isUp = change >= 0

            return (
              <div key={coin.id} className='wl-row wl-data-row'>
                <span className='wl-rank'>
                  {coin.market_cap_rank || index + 1}
                </span>

                <Link to={`/coin/${coin.id}`} className='wl-coin-cell'>
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className='wl-coin-img'
                  />
                  <div>
                    <p className='wl-coin-name'>{coin.name}</p>
                    <p className='wl-coin-sym'>{coin.symbol?.toUpperCase()}</p>
                  </div>
                </Link>

                <span className='wl-price'>{fmtPrice(coin.current_price)}</span>

                <span className={`wl-change ${isUp ? 'up' : 'down'}`}>
                  <span className='change-pill'>
                    {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                  </span>
                </span>

                <span className='wl-mcap'>{fmt(coin.market_cap)}</span>

                <span className='wl-vol'>{fmt(coin.total_volume)}</span>

                <button
                  className='wl-remove-btn'
                  onClick={() => removeFromWatchlist(coin.id)}
                  title='Remove from watchlist'
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Summary Cards */}
      {enriched.length > 0 && (
        <div className='wl-summary'>
          <div className='wl-summary-card'>
            <p className='wl-summary-label'>Total Assets</p>
            <p className='wl-summary-val'>{enriched.length}</p>
          </div>
          <div className='wl-summary-card'>
            <p className='wl-summary-label'>Gainers Today</p>
            <p className='wl-summary-val green'>
              {enriched.filter((c) => c.price_change_percentage_24h > 0).length}
            </p>
          </div>
          <div className='wl-summary-card'>
            <p className='wl-summary-label'>Losers Today</p>
            <p className='wl-summary-val red'>
              {enriched.filter((c) => c.price_change_percentage_24h < 0).length}
            </p>
          </div>
          <div className='wl-summary-card'>
            <p className='wl-summary-label'>Best Performer</p>
            <p className='wl-summary-val green'>
              {enriched.length > 0
                ? enriched
                    .sort(
                      (a, b) =>
                        (b.price_change_percentage_24h || 0) -
                        (a.price_change_percentage_24h || 0),
                    )[0]
                    ?.symbol?.toUpperCase()
                : '—'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Watchlist
