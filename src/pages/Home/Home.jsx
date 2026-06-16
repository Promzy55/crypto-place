import React, { useContext, useEffect, useState, useMemo } from 'react'
import './Home.css'
import { CoinContext } from '../../context/CoinContext'
import { Link } from 'react-router-dom'
import StarButton from '../../components/StarButton/starButton'

const Home = () => {
  const { allCoin, currency, loading, error, refetch } = useContext(CoinContext)
  const [displayCoin, setDisplayCoin] = useState([])
  const [input, setInput] = useState('')
  const [visibleCount, setVisibleCount] = useState(10)

  const inputHandler = (event) => {
    setInput(event.target.value)
    if (event.target.value === '') {
      setDisplayCoin(allCoin)
    }
  }

  const searchHandler = async (event) => {
    event.preventDefault()
    const coins = allCoin.filter((item) =>
      item.name.toLowerCase().includes(input.toLowerCase()),
    )
    setDisplayCoin(coins)
  }

  useEffect(() => {
    setDisplayCoin(allCoin)
  }, [allCoin])

  // Live market stats from real data
  const marketStats = useMemo(() => {
    if (!allCoin || allCoin.length === 0) return null
    const totalMarketCap = allCoin.reduce(
      (sum, c) => sum + (c.market_cap || 0),
      0,
    )
    const totalVolume = allCoin.reduce(
      (sum, c) => sum + (c.total_volume || 0),
      0,
    )
    const btc = allCoin.find((c) => c.symbol === 'btc')
    const btcDominance =
      btc && totalMarketCap > 0
        ? ((btc.market_cap / totalMarketCap) * 100).toFixed(1)
        : '—'
    return { totalMarketCap, totalVolume, btcDominance }
  }, [allCoin])

  const fmt = (n) => {
    if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B'
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M'
    return '$' + (n || 0).toFixed(2)
  }

  // Top 3 gainers and losers
  const topGainers = useMemo(
    () =>
      [...allCoin]
        .filter((c) => c.price_change_percentage_24h > 0)
        .sort(
          (a, b) =>
            b.price_change_percentage_24h - a.price_change_percentage_24h,
        )
        .slice(0, 3),
    [allCoin],
  )

  const topLosers = useMemo(
    () =>
      [...allCoin]
        .filter((c) => c.price_change_percentage_24h < 0)
        .sort(
          (a, b) =>
            a.price_change_percentage_24h - b.price_change_percentage_24h,
        )
        .slice(0, 3),
    [allCoin],
  )

  return (
    <div className='home'>
      {/* ── HERO ─────────────────────────────────── */}
      <section className='hero'>
        <div className='hero-text'>
          <span className='hero-eyebrow'>Live Market Data • 250+ Assets</span>
          <h1>
            Trade Crypto
            <br />
            <span className='hero-gradient'>Like a Pro</span>
          </h1>
          <p>
            The world's largest cryptocurrency marketplace. Real-time prices,
            charts, and market insights — all in one place.
          </p>

          <form className='search-form' onSubmit={searchHandler}>
            <div className='search-box'>
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#666'
                strokeWidth='2'
              >
                <circle cx='11' cy='11' r='8' />
                <path d='m21 21-4.35-4.35' />
              </svg>
              <input
                onChange={inputHandler}
                list='coinlist'
                value={input}
                type='text'
                placeholder='Search Bitcoin, Ethereum...'
                disabled={loading}
              />
              <datalist id='coinlist'>
                {allCoin.map((item, i) => (
                  <option key={i} value={item.name} />
                ))}
              </datalist>
            </div>
            <button type='submit' className='search-btn' disabled={loading}>
              {loading ? 'Loading...' : 'Search'}
            </button>
          </form>

          {error && (
            <div className='error-bar'>
              <span>⚠️ {error.message}</span>
              <button onClick={refetch} className='retry-btn'>
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Live ticker strip */}
        <div className='ticker-strip'>
          {allCoin.slice(0, 8).map((coin) => (
            <Link to={`/coin/${coin.id}`} key={coin.id} className='ticker-item'>
              <img src={coin.image} alt={coin.name} />
              <span className='ticker-symbol'>{coin.symbol.toUpperCase()}</span>
              <span className='ticker-price'>
                {currency.symbol}
                {coin.current_price?.toLocaleString()}
              </span>
              <span
                className={
                  coin.price_change_percentage_24h > 0
                    ? 'ticker-up'
                    : 'ticker-down'
                }
              >
                {coin.price_change_percentage_24h > 0 ? '+' : ''}
                {coin.price_change_percentage_24h?.toFixed(2)}%
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── MARKET OVERVIEW STATS ────────────────── */}
      {marketStats && (
        <section className='stats-section'>
          <div className='stat-card'>
            <p className='stat-label'>Global Market Cap</p>
            <p className='stat-value'>{fmt(marketStats.totalMarketCap)}</p>
            <p className='stat-sub'>All tracked assets</p>
          </div>
          <div className='stat-card'>
            <p className='stat-label'>24h Trading Volume</p>
            <p className='stat-value'>{fmt(marketStats.totalVolume)}</p>
            <p className='stat-sub'>Across all pairs</p>
          </div>
          <div className='stat-card'>
            <p className='stat-label'>BTC Dominance</p>
            <p className='stat-value'>{marketStats.btcDominance}%</p>
            <p className='stat-sub'>Market share</p>
          </div>
          <div className='stat-card'>
            <p className='stat-label'>Assets Tracked</p>
            <p className='stat-value'>{allCoin.length}+</p>
            <p className='stat-sub'>Live coin data</p>
          </div>
        </section>
      )}

      {/* ── GAINERS & LOSERS ─────────────────────── */}
      {!loading && allCoin.length > 0 && (
        <section className='movers-section'>
          <div className='movers-col'>
            <h2 className='section-heading'>
              <span className='heading-dot green-dot'></span>
              Top Gainers <span className='heading-badge'>24h</span>
            </h2>
            <div className='movers-grid'>
              {topGainers.map((coin) => (
                <Link
                  to={`/coin/${coin.id}`}
                  key={coin.id}
                  className='mover-card gainer-card'
                >
                  <div className='mover-left'>
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className='mover-img'
                    />
                    <div>
                      <p className='mover-name'>{coin.name}</p>
                      <p className='mover-symbol'>
                        {coin.symbol.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className='mover-right'>
                    <p className='mover-price'>
                      {currency.symbol}
                      {coin.current_price?.toLocaleString()}
                    </p>
                    <span className='badge badge-green'>
                      +{coin.price_change_percentage_24h?.toFixed(2)}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className='movers-col'>
            <h2 className='section-heading'>
              <span className='heading-dot red-dot'></span>
              Top Losers <span className='heading-badge'>24h</span>
            </h2>
            <div className='movers-grid'>
              {topLosers.map((coin) => (
                <Link
                  to={`/coin/${coin.id}`}
                  key={coin.id}
                  className='mover-card loser-card'
                >
                  <div className='mover-left'>
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className='mover-img'
                    />
                    <div>
                      <p className='mover-name'>{coin.name}</p>
                      <p className='mover-symbol'>
                        {coin.symbol.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className='mover-right'>
                    <p className='mover-price'>
                      {currency.symbol}
                      {coin.current_price?.toLocaleString()}
                    </p>
                    <span className='badge badge-red'>
                      {coin.price_change_percentage_24h?.toFixed(2)}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── COIN TABLE ───────────────────────────── */}
      <section className='table-section'>
        <div className='table-heading-row'>
          <div>
            <h2 className='section-heading' style={{ marginBottom: '4px' }}>
              Top Cryptocurrencies
            </h2>
            <p className='table-sub'>Live prices updated in real-time</p>
          </div>
        </div>

        {loading && (
          <div className='loading-container'>
            <div className='spinner'></div>
            <p>Loading market data...</p>
          </div>
        )}

        {!loading && displayCoin.length === 0 && !error && (
          <div className='empty-state'>
            <p>
              No coins found for "<strong>{input}</strong>". Try a different
              search.
            </p>
          </div>
        )}

        {!loading && displayCoin.length > 0 && (
          <div className='crypto-table'>
            <div className='table-row table-header-row'>
              <span>#</span>
              <span>Coin</span>
              <span>Price</span>
              <span>24H Change</span>
              <span>24H Volume</span>
              <span className='col-right'>Market Cap</span>
              <span></span>
            </div>

            {displayCoin.slice(0, visibleCount).map((item) => {
              const isUp = item.price_change_percentage_24h > 0
              return (
                <Link
                  to={`/coin/${item.id}`}
                  className='table-row table-data-row'
                  key={item.id}
                >
                  <span className='col-rank'>{item.market_cap_rank}</span>

                  <span className='col-coin'>
                    <img
                      src={item.image}
                      alt={item.name}
                      className='table-coin-img'
                    />
                    <span className='col-coin-info'>
                      <span className='col-coin-name'>{item.name}</span>
                      <span className='col-coin-sym'>
                        {item.symbol.toUpperCase()}
                      </span>
                    </span>
                  </span>

                  <span className='col-price'>
                    {currency.symbol}
                    {item.current_price?.toLocaleString()}
                  </span>

                  <span
                    className={isUp ? 'col-change green' : 'col-change red'}
                  >
                    <span className='change-pill'>
                      {isUp ? '▲' : '▼'}{' '}
                      {Math.abs(item.price_change_percentage_24h)?.toFixed(2)}%
                    </span>
                  </span>

                  <span className='col-volume'>{fmt(item.total_volume)}</span>

                  <span className='col-right col-mcap'>
                    {fmt(item.market_cap)}
                  </span>

                  <StarButton coin={item} />
                </Link>
              )
            })}

            {visibleCount < displayCoin.length && (
              <div className='load-more-container'>
                <button
                  className='load-more-btn'
                  onClick={(e) => {
                    e.preventDefault()
                    setVisibleCount((prev) => prev + 10)
                  }}
                >
                  Load More ({displayCoin.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
