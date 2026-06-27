import React, { useState, useContext, useEffect, useMemo } from 'react'
import './trade.css'
import { CoinContext } from '../../context/CoinContext'
import { Link } from 'react-router-dom'

// Generate fake order book entries
const generateOrders = (basePrice, side) => {
  return Array.from({ length: 8 }, (_, i) => {
    const offset = (i + 1) * (basePrice * 0.0005)
    const price = side === 'ask' ? basePrice + offset : basePrice - offset
    const amount = (Math.random() * 2 + 0.01).toFixed(4)
    const total = (price * parseFloat(amount)).toFixed(2)
    return { price: price.toFixed(2), amount, total }
  })
}

// Generate fake recent trades
const generateTrades = (basePrice) => {
  return Array.from({ length: 12 }, (_, i) => {
    const offset = (Math.random() - 0.5) * basePrice * 0.002
    const price = (basePrice + offset).toFixed(2)
    const amount = (Math.random() * 1.5 + 0.01).toFixed(4)
    const isBuy = Math.random() > 0.5
    const time = new Date(Date.now() - i * 18000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    return { price, amount, isBuy, time }
  })
}

const Trade = () => {
  const { allCoin, currency } = useContext(CoinContext)

  const [selectedCoin, setSelectedCoin] = useState(null)
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [side, setSide] = useState('buy')
  const [orderType, setOrderType] = useState('market')
  const [amount, setAmount] = useState('')
  const [limitPrice, setLimitPrice] = useState('')
  const [orders, setOrders] = useState([])
  const [notification, setNotification] = useState(null)

  // Default to Bitcoin on load
  useEffect(() => {
    if (allCoin.length > 0 && !selectedCoin) {
      setSelectedCoin(allCoin[0])
    }
  }, [allCoin])

  const currentPrice = selectedCoin?.current_price || 0
  const priceChange = selectedCoin?.price_change_percentage_24h || 0
  const isUp = priceChange >= 0

  // Order book and trades
  const asks = useMemo(
    () => generateOrders(currentPrice, 'ask'),
    [selectedCoin],
  )
  const bids = useMemo(
    () => generateOrders(currentPrice, 'bid'),
    [selectedCoin],
  )
  const trades = useMemo(() => generateTrades(currentPrice), [selectedCoin])

  // Calculated total
  const execPrice =
    orderType === 'limit' ? parseFloat(limitPrice) || 0 : currentPrice
  const total = (parseFloat(amount) || 0) * execPrice

  // Filtered coins
  const filteredCoins = allCoin
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase()),
    )
    .slice(0, 8)

  const fmtPrice = (p) => {
    if (!p) return '—'
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

  const handleTrade = () => {
    if (!amount || parseFloat(amount) <= 0) return
    if (orderType === 'limit' && !limitPrice) return

    const order = {
      id: Date.now(),
      coin: selectedCoin.symbol.toUpperCase(),
      side,
      type: orderType,
      amount: parseFloat(amount),
      price: execPrice,
      total,
      status: 'filled',
      time: new Date().toLocaleTimeString(),
    }

    setOrders((prev) => [order, ...prev.slice(0, 9)])
    setNotification({
      type: side,
      message: `${side === 'buy' ? '✅ Bought' : '✅ Sold'} ${amount} ${selectedCoin.symbol.toUpperCase()} at ${fmtPrice(execPrice)}`,
    })
    setAmount('')

    setTimeout(() => setNotification(null), 4000)
  }

  const quickAmounts = [25, 50, 75, 100]

  return (
    <div className='trade-page'>
      {/* ── NOTIFICATION ── */}
      {notification && (
        <div className={`trade-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* ── TOP BAR ── */}
      <div className='trade-topbar'>
        {/* Coin selector */}
        <div
          className='coin-selector'
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {selectedCoin && (
            <>
              <img
                src={selectedCoin.image}
                alt={selectedCoin.name}
                className='selector-img'
              />
              <span className='selector-name'>
                {selectedCoin.symbol.toUpperCase()}/USD
              </span>
            </>
          )}
          <span className='selector-arrow'>▾</span>

          {showDropdown && (
            <div
              className='selector-dropdown'
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type='text'
                placeholder='Search...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='selector-search'
                autoFocus
              />
              {filteredCoins.map((coin) => (
                <div
                  key={coin.id}
                  className='selector-option'
                  onClick={() => {
                    setSelectedCoin(coin)
                    setShowDropdown(false)
                    setSearch('')
                  }}
                >
                  <img src={coin.image} alt={coin.name} />
                  <span>{coin.symbol.toUpperCase()}/USD</span>
                  <span className='option-price'>
                    {fmtPrice(coin.current_price)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price info */}
        {selectedCoin && (
          <div className='trade-price-info'>
            <span className='trade-current-price'>
              {fmtPrice(currentPrice)}
            </span>
            <span className={`trade-change ${isUp ? 'up' : 'down'}`}>
              {isUp ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
            </span>
            <div className='trade-stats'>
              <div className='trade-stat'>
                <span>24h High</span>
                <span>{fmtPrice(selectedCoin.high_24h)}</span>
              </div>
              <div className='trade-stat'>
                <span>24h Low</span>
                <span>{fmtPrice(selectedCoin.low_24h)}</span>
              </div>
              <div className='trade-stat'>
                <span>24h Volume</span>
                <span>
                  {currency.symbol}
                  {(selectedCoin.total_volume / 1e9).toFixed(2)}B
                </span>
              </div>
              <div className='trade-stat'>
                <span>Market Cap</span>
                <span>
                  {currency.symbol}
                  {(selectedCoin.market_cap / 1e9).toFixed(2)}B
                </span>
              </div>
            </div>
          </div>
        )}

        <Link to={`/coin/${selectedCoin?.id}`} className='view-chart-btn'>
          📈 View Chart
        </Link>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className='trade-layout'>
        {/* ORDER BOOK */}
        <div className='trade-panel order-book-panel'>
          <h3 className='panel-title'>Order Book</h3>

          <div className='ob-header'>
            <span>Price (USD)</span>
            <span>Amount</span>
            <span>Total</span>
          </div>

          {/* Asks */}
          <div className='ob-asks'>
            {asks
              .slice()
              .reverse()
              .map((a, i) => (
                <div key={i} className='ob-row ask-row'>
                  <span className='ob-price ask'>{a.price}</span>
                  <span className='ob-amount'>{a.amount}</span>
                  <span className='ob-total'>{a.total}</span>
                  <div
                    className='ob-bar ask-bar'
                    style={{ width: `${Math.random() * 60 + 20}%` }}
                  />
                </div>
              ))}
          </div>

          {/* Spread */}
          <div className='ob-spread'>
            <span className={isUp ? 'spread-price up' : 'spread-price down'}>
              {fmtPrice(currentPrice)}
            </span>
            <span className='spread-label'>Spread</span>
          </div>

          {/* Bids */}
          <div className='ob-bids'>
            {bids.map((b, i) => (
              <div key={i} className='ob-row bid-row'>
                <span className='ob-price bid'>{b.price}</span>
                <span className='ob-amount'>{b.amount}</span>
                <span className='ob-total'>{b.total}</span>
                <div
                  className='ob-bar bid-bar'
                  style={{ width: `${Math.random() * 60 + 20}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ORDER FORM */}
        <div className='trade-panel order-form-panel'>
          {/* Buy / Sell toggle */}
          <div className='side-toggle'>
            <button
              className={`side-btn buy-btn ${side === 'buy' ? 'active' : ''}`}
              onClick={() => setSide('buy')}
            >
              Buy
            </button>
            <button
              className={`side-btn sell-btn ${side === 'sell' ? 'active' : ''}`}
              onClick={() => setSide('sell')}
            >
              Sell
            </button>
          </div>

          {/* Order type */}
          <div className='order-type-tabs'>
            {['market', 'limit'].map((t) => (
              <button
                key={t}
                className={`type-tab ${orderType === t ? 'active' : ''}`}
                onClick={() => setOrderType(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Price display */}
          <div className='form-field'>
            <label>Price (USD)</label>
            {orderType === 'market' ? (
              <div className='market-price-display'>
                <span>Market Price</span>
                <span>{fmtPrice(currentPrice)}</span>
              </div>
            ) : (
              <input
                type='number'
                className='trade-input'
                placeholder={fmtPrice(currentPrice)}
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
              />
            )}
          </div>

          {/* Amount */}
          <div className='form-field'>
            <label>Amount ({selectedCoin?.symbol?.toUpperCase()})</label>
            <input
              type='number'
              className='trade-input'
              placeholder='0.00'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min='0'
              step='any'
            />
          </div>

          {/* Quick % buttons */}
          <div className='quick-amounts'>
            {quickAmounts.map((pct) => (
              <button
                key={pct}
                className='quick-btn'
                onClick={() => {
                  const bal = 10000
                  const qty = (bal * (pct / 100)) / execPrice
                  setAmount(qty.toFixed(6))
                }}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Total */}
          <div className='form-field'>
            <label>Total (USD)</label>
            <div className='total-display'>
              {currency.symbol}
              {total.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            className={`submit-btn ${side === 'buy' ? 'buy-submit' : 'sell-submit'}`}
            onClick={handleTrade}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            {side === 'buy' ? '🟢' : '🔴'} {side === 'buy' ? 'Buy' : 'Sell'}{' '}
            {selectedCoin?.symbol?.toUpperCase()}
          </button>

          {/* Balance */}
          <div className='balance-row'>
            <span>Available Balance</span>
            <span>{currency.symbol}10,000.00</span>
          </div>
        </div>

        {/* RECENT TRADES */}
        <div className='trade-panel recent-trades-panel'>
          <h3 className='panel-title'>Recent Trades</h3>

          <div className='ob-header'>
            <span>Price</span>
            <span>Amount</span>
            <span>Time</span>
          </div>

          <div className='recent-trades-list'>
            {trades.map((t, i) => (
              <div key={i} className='trade-row'>
                <span className={t.isBuy ? 'ob-price bid' : 'ob-price ask'}>
                  {t.price}
                </span>
                <span className='ob-amount'>{t.amount}</span>
                <span className='trade-time'>{t.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ORDER HISTORY ── */}
      {orders.length > 0 && (
        <div className='order-history'>
          <h3 className='panel-title'>Order History</h3>
          <div className='history-table'>
            <div className='history-head'>
              <span>Time</span>
              <span>Pair</span>
              <span>Type</span>
              <span>Side</span>
              <span>Price</span>
              <span>Amount</span>
              <span>Total</span>
              <span>Status</span>
            </div>
            {orders.map((o) => (
              <div key={o.id} className='history-row'>
                <span className='history-time'>{o.time}</span>
                <span>{o.coin}/USD</span>
                <span className='history-type'>{o.type}</span>
                <span className={o.side === 'buy' ? 'up' : 'down'}>
                  {o.side.charAt(0).toUpperCase() + o.side.slice(1)}
                </span>
                <span>{fmtPrice(o.price)}</span>
                <span>
                  {o.amount} {o.coin}
                </span>
                <span>
                  {currency.symbol}
                  {o.total.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className='status-filled'>Filled</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Trade
