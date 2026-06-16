import React, { useContext, useEffect, useState } from 'react'
import './Coin.css'
import { useParams, Link } from 'react-router-dom'
import StarButton from '../../components/starButton/StarButton'
import { CoinContext } from '../../context/CoinContext'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label, symbol }) => {
  if (active && payload && payload.length) {
    const price = payload[0].value
    return (
      <div className='chart-tooltip'>
        <p className='tooltip-date'>{label}</p>
        <p className='tooltip-price'>
          {symbol}
          {price >= 1
            ? price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : price.toFixed(6)}
        </p>
      </div>
    )
  }
  return null
}

const Coin = () => {
  const { coinId } = useParams()
  const { fetchCoinData, fetchCoinHistory, currency } = useContext(CoinContext)

  const [coinData, setCoinData] = useState(null)
  const [historicalData, setHistoricalData] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [error, setError] = useState(null)
  const [days, setDays] = useState(7)
  const [showFullDesc, setShowFullDesc] = useState(false)

  // Load coin details
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchCoinData(coinId)
        setCoinData(data)
      } catch (e) {
        setError('Failed to load coin data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [coinId])

  // Load chart data
  useEffect(() => {
    const loadHistory = async () => {
      try {
        if (!coinId) return
        setChartLoading(true)
        const prices = await fetchCoinHistory(coinId, days, currency.name)
        const formatted = prices.map(([t, p]) => ({
          date: new Date(t).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            ...(days === 365 ? { year: '2-digit' } : {}),
          }),
          price: p,
        }))
        setHistoricalData(formatted)
      } catch (e) {
        console.log('Chart error:', e)
      } finally {
        setChartLoading(false)
      }
    }
    loadHistory()
  }, [coinId, days, currency])

  // Helpers
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

  const fmtPct = (n) => {
    if (!n && n !== 0) return 'N/A'
    const sign = n >= 0 ? '+' : ''
    return sign + n.toFixed(2) + '%'
  }

  // Y-axis domain — tight around actual data so movement is visible
  const prices = historicalData.map((d) => d.price)
  const minPrice = prices.length ? Math.min(...prices) * 0.998 : 'auto'
  const maxPrice = prices.length ? Math.max(...prices) * 1.002 : 'auto'

  // Determine chart color from first vs last price
  const chartUp =
    prices.length >= 2 ? prices[prices.length - 1] >= prices[0] : true
  const lineColor = chartUp ? '#00ffae' : '#ff4d4d'
  const gradientTop = chartUp ? 'rgba(0,255,174,0.25)' : 'rgba(255,77,77,0.25)'
  const gradientBot = 'rgba(8,8,12,0)'

  if (loading) {
    return (
      <div className='coin-page coin-loading'>
        <div className='spinner'></div>
        <p>Loading market data...</p>
      </div>
    )
  }

  if (error || !coinData) {
    return (
      <div className='coin-page coin-error'>
        <p>⚠️ {error || 'Coin not found'}</p>
        <Link to='/' className='back-link'>
          ← Back to Markets
        </Link>
      </div>
    )
  }

  const md = coinData.market_data || {}
  const priceChange = md.price_change_percentage_24h || 0
  const isPositive = priceChange >= 0
  const currentPrice = md.current_price?.[currency.name] || 0

  const description = coinData.description?.en || ''
  const shortDesc = description.replace(/<[^>]*>/g, '').slice(0, 300)
  const fullDesc = description.replace(/<[^>]*>/g, '')

  const PERIOD_LABELS = { 7: '7D', 30: '30D', 365: '1Y' }

  return (
    <div className='coin-page'>
      {/* ── BREADCRUMB ────────────────────────── */}
      <div className='breadcrumb'>
        <Link to='/'>Markets</Link>
        <span>/</span>
        <span>{coinData.name}</span>
      </div>

      {/* ── HERO HEADER ───────────────────────── */}
      <div className='coin-hero'>
        <div className='coin-left'>
          <img
            src={coinData.image?.large}
            className='coin-logo'
            alt={coinData.name}
          />
          <div>
            <div className='coin-name-row'>
              <h1>{coinData.name}</h1>
              <span className='coin-sym-badge'>
                {coinData.symbol?.toUpperCase()}
              </span>
              {coinData.market_cap_rank && (
                <span className='rank-badge'>#{coinData.market_cap_rank}</span>
              )}
            </div>
            <div className='coin-meta-row'>
              <StarButton
                coin={{
                  id: coinData.id,
                  name: coinData.name,
                  symbol: coinData.symbol,
                  image: coinData.image?.large,
                  market_cap_rank: coinData.market_cap_rank,
                  current_price: md.current_price?.[currency.name],
                  price_change_percentage_24h: priceChange,
                  market_cap: md.market_cap?.[currency.name],
                  total_volume: md.total_volume?.[currency.name],
                }}
              />
              <span className='live-badge'>● LIVE</span>
              <span className='meta-tag'>
                {isPositive ? '📈 Bullish' : '📉 Bearish'}
              </span>
            </div>
          </div>
        </div>

        <div className='coin-right'>
          <div className='coin-price-main'>{fmtPrice(currentPrice)}</div>
          <div className={`coin-change-pill ${isPositive ? 'up' : 'down'}`}>
            {isPositive ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
            <span className='change-period'> 24h</span>
          </div>
          {md.price_change_24h && (
            <div className='coin-change-abs'>
              {isPositive ? '+' : ''}
              {fmtPrice(md.price_change_24h?.[currency.name])} today
            </div>
          )}
        </div>
      </div>

      {/* ── STATS GRID ────────────────────────── */}
      <div className='stats-grid'>
        <div className='stat-card'>
          <p className='stat-label'>Market Cap</p>
          <p className='stat-val'>{fmt(md.market_cap?.[currency.name])}</p>
        </div>
        <div className='stat-card'>
          <p className='stat-label'>24h Volume</p>
          <p className='stat-val'>{fmt(md.total_volume?.[currency.name])}</p>
        </div>
        <div className='stat-card'>
          <p className='stat-label'>Circulating Supply</p>
          <p className='stat-val'>
            {md.circulating_supply
              ? md.circulating_supply.toLocaleString('en-US', {
                  maximumFractionDigits: 0,
                })
              : 'N/A'}
          </p>
        </div>
        <div className='stat-card'>
          <p className='stat-label'>All-Time High</p>
          <p className='stat-val ath'>{fmtPrice(md.ath?.[currency.name])}</p>
          <p className='stat-sub red'>
            {fmtPct(md.ath_change_percentage?.[currency.name])} from ATH
          </p>
        </div>
        <div className='stat-card'>
          <p className='stat-label'>All-Time Low</p>
          <p className='stat-val'>{fmtPrice(md.atl?.[currency.name])}</p>
          <p className='stat-sub green'>
            +{md.atl_change_percentage?.[currency.name]?.toFixed(0)}% from ATL
          </p>
        </div>
        <div className='stat-card'>
          <p className='stat-label'>7d / 30d Change</p>
          <p className='stat-val'>
            <span
              className={
                md.price_change_percentage_7d_in_currency?.[currency.name] >= 0
                  ? 'green'
                  : 'red'
              }
            >
              {fmtPct(
                md.price_change_percentage_7d_in_currency?.[currency.name],
              )}
            </span>
            {' / '}
            <span
              className={
                md.price_change_percentage_30d_in_currency?.[currency.name] >= 0
                  ? 'green'
                  : 'red'
              }
            >
              {fmtPct(
                md.price_change_percentage_30d_in_currency?.[currency.name],
              )}
            </span>
          </p>
        </div>
      </div>

      {/* ── CHART ─────────────────────────────── */}
      <div className='chart-card'>
        <div className='chart-header'>
          <div>
            <h3 className='chart-title'>Price Chart</h3>
            <p className='chart-sub'>
              {coinData.name} · {currency.name.toUpperCase()} ·{' '}
              {PERIOD_LABELS[days]}
            </p>
          </div>
          <div className='chart-buttons'>
            {[7, 30, 365].map((d) => (
              <button
                key={d}
                className={days === d ? 'active' : ''}
                onClick={() => setDays(d)}
              >
                {PERIOD_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        <div className='chart-body'>
          {chartLoading ? (
            <div className='chart-loading'>
              <div className='spinner'></div>
            </div>
          ) : (
            <ResponsiveContainer width='100%' height={380}>
              <AreaChart
                data={historicalData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id='chartGradient'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop offset='0%' stopColor={gradientTop} />
                    <stop offset='100%' stopColor={gradientBot} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke='rgba(255,255,255,0.04)'
                  vertical={false}
                />

                <XAxis
                  dataKey='date'
                  stroke='#333'
                  tick={{ fill: '#555', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval='preserveStartEnd'
                />

                <YAxis
                  stroke='#333'
                  tick={{ fill: '#555', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[minPrice, maxPrice]}
                  tickFormatter={(v) =>
                    v >= 1000
                      ? '$' + (v / 1000).toFixed(1) + 'k'
                      : '$' + v.toFixed(v < 1 ? 4 : 2)
                  }
                  width={70}
                />

                <Tooltip
                  content={<CustomTooltip symbol={currency.symbol} />}
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                />

                <Area
                  type='monotone'
                  dataKey='price'
                  stroke={lineColor}
                  strokeWidth={2}
                  fill='url(#chartGradient)'
                  dot={false}
                  activeDot={{ r: 4, fill: lineColor, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── DESCRIPTION ───────────────────────── */}
      {fullDesc && (
        <div className='desc-card'>
          <h3 className='desc-title'>About {coinData.name}</h3>
          <p className='desc-text'>
            {showFullDesc ? fullDesc : shortDesc}
            {fullDesc.length > 300 && (
              <button
                className='desc-toggle'
                onClick={() => setShowFullDesc(!showFullDesc)}
              >
                {showFullDesc ? ' Show less' : '... Read more'}
              </button>
            )}
          </p>
          {coinData.links?.homepage?.[0] && (
            <a
              href={coinData.links.homepage[0]}
              target='_blank'
              rel='noreferrer'
              className='website-link'
            >
              🌐 Official Website ↗
            </a>
          )}
        </div>
      )}

      {/* ── BACK ──────────────────────────────── */}
      <div className='back'>
        <Link to='/' className='back-link'>
          ← Back to Markets
        </Link>
      </div>
    </div>
  )
}

export default Coin
