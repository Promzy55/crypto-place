import React, { useState, useContext, useEffect } from 'react'
import './Portfolio.css'
import { Link } from 'react-router-dom'
import { CoinContext } from '../../context/CoinContext'

const Portfolio = () => {
  const { allCoin, currency } = useContext(CoinContext)

  const [holdings, setHoldings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('crypto_portfolio')) || []
    } catch {
      return []
    }
  })

  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCoin, setSelectedCoin] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [editId, setEditId] = useState(null)

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('crypto_portfolio', JSON.stringify(holdings))
  }, [holdings])

  // Enrich holdings with live prices
  const enriched = holdings.map((h) => {
    const live = allCoin.find((c) => c.id === h.coinId)
    const currentPrice = live?.current_price || h.buyPrice
    const currentValue = currentPrice * h.quantity
    const costBasis = h.buyPrice * h.quantity
    const pnl = currentValue - costBasis
    const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0
    return {
      ...h,
      name: live?.name || h.name,
      symbol: live?.symbol || h.symbol,
      image: live?.image || h.image,
      currentPrice,
      currentValue,
      costBasis,
      pnl,
      pnlPct,
      priceChange24h: live?.price_change_percentage_24h || 0,
    }
  })

  // Portfolio totals
  const totalValue = enriched.reduce((s, h) => s + h.currentValue, 0)
  const totalCost = enriched.reduce((s, h) => s + h.costBasis, 0)
  const totalPnl = totalValue - totalCost
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0
  const bestPerformer = enriched.length
    ? enriched.reduce((a, b) => (a.pnlPct > b.pnlPct ? a : b))
    : null

  // Helpers
  const fmtPrice = (p) => {
    if (!p && p !== 0) return 'N/A'
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

  const fmt = (n) => {
    if (!n && n !== 0) return 'N/A'
    if (n >= 1e12) return currency.symbol + (n / 1e12).toFixed(2) + 'T'
    if (n >= 1e9) return currency.symbol + (n / 1e9).toFixed(2) + 'B'
    if (n >= 1e6) return currency.symbol + (n / 1e6).toFixed(2) + 'M'
    return (
      currency.symbol +
      n.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    )
  }

  // Filtered coins for search
  const filteredCoins = allCoin
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase()),
    )
    .slice(0, 8)

  const openAdd = () => {
    setSelectedCoin(null)
    setQuantity('')
    setBuyPrice('')
    setSearch('')
    setEditId(null)
    setShowModal(true)
  }

  const openEdit = (h) => {
    const coin = allCoin.find((c) => c.id === h.coinId)
    setSelectedCoin(
      coin || { id: h.coinId, name: h.name, symbol: h.symbol, image: h.image },
    )
    setQuantity(String(h.quantity))
    setBuyPrice(String(h.buyPrice))
    setSearch(h.name)
    setEditId(h.id)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!selectedCoin || !quantity || !buyPrice) return
    const entry = {
      id: editId || Date.now(),
      coinId: selectedCoin.id,
      name: selectedCoin.name,
      symbol: selectedCoin.symbol,
      image: selectedCoin.image,
      quantity: parseFloat(quantity),
      buyPrice: parseFloat(buyPrice),
      addedAt: editId
        ? holdings.find((h) => h.id === editId)?.addedAt
        : new Date().toISOString(),
    }
    setHoldings((prev) =>
      editId
        ? prev.map((h) => (h.id === editId ? entry : h))
        : [...prev, entry],
    )
    setShowModal(false)
  }

  const handleDelete = (id) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id))
  }

  const selectCoin = (coin) => {
    setSelectedCoin(coin)
    setSearch(coin.name)
    setBuyPrice(coin.current_price?.toFixed(2) || '')
  }

  return (
    <div className='portfolio-page'>
      {/* ── HEADER ── */}
      <div className='port-header'>
        <div>
          <h1 className='port-title'>My Portfolio</h1>
          <p className='port-sub'>Track your crypto investments in real time</p>
        </div>
        <button className='add-btn' onClick={openAdd}>
          + Add Asset
        </button>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className='port-summary'>
        <div className='summary-card main-card'>
          <p className='summary-label'>Total Portfolio Value</p>
          <p className='summary-big'>{fmt(totalValue)}</p>
          <div className={`summary-pnl ${totalPnl >= 0 ? 'up' : 'down'}`}>
            <span>
              {totalPnl >= 0 ? '▲' : '▼'} {fmt(Math.abs(totalPnl))}
            </span>
            <span className='pnl-pct'>
              ({totalPnlPct >= 0 ? '+' : ''}
              {totalPnlPct.toFixed(2)}%)
            </span>
            <span className='pnl-label'>All time</span>
          </div>
        </div>

        <div className='summary-card'>
          <p className='summary-label'>Total Invested</p>
          <p className='summary-val'>{fmt(totalCost)}</p>
          <p className='summary-sub'>
            {holdings.length} asset{holdings.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className='summary-card'>
          <p className='summary-label'>Total P&L</p>
          <p className={`summary-val ${totalPnl >= 0 ? 'green' : 'red'}`}>
            {totalPnl >= 0 ? '+' : ''}
            {fmt(totalPnl)}
          </p>
          <p className={`summary-sub ${totalPnlPct >= 0 ? 'green' : 'red'}`}>
            {totalPnlPct >= 0 ? '+' : ''}
            {totalPnlPct.toFixed(2)}% return
          </p>
        </div>

        <div className='summary-card'>
          <p className='summary-label'>Best Performer</p>
          {bestPerformer ? (
            <>
              <div className='best-coin'>
                <img src={bestPerformer.image} alt='' />
                <p className='summary-val'>
                  {bestPerformer.symbol?.toUpperCase()}
                </p>
              </div>
              <p
                className={`summary-sub ${bestPerformer.pnlPct >= 0 ? 'green' : 'red'}`}
              >
                {bestPerformer.pnlPct >= 0 ? '+' : ''}
                {bestPerformer.pnlPct.toFixed(2)}%
              </p>
            </>
          ) : (
            <p className='summary-val' style={{ color: '#555' }}>
              —
            </p>
          )}
        </div>
      </div>

      {/* ── EMPTY STATE ── */}
      {holdings.length === 0 && (
        <div className='port-empty'>
          <div className='port-empty-icon'>📊</div>
          <h2>No assets yet</h2>
          <p>
            Add your first crypto holding to start tracking your portfolio
            performance.
          </p>
          <button className='add-btn' onClick={openAdd}>
            + Add Your First Asset
          </button>
        </div>
      )}

      {/* ── HOLDINGS TABLE ── */}
      {enriched.length > 0 && (
        <div className='holdings-table'>
          <div className='holdings-row holdings-head'>
            <span>Coin</span>
            <span>Price</span>
            <span>Holdings</span>
            <span>Avg Buy Price</span>
            <span>Current Value</span>
            <span>P&L</span>
            <span>24h</span>
            <span></span>
          </div>

          {enriched.map((h) => (
            <div key={h.id} className='holdings-row holdings-data'>
              <Link to={`/coin/${h.coinId}`} className='hold-coin'>
                <img src={h.image} alt={h.name} className='hold-img' />
                <div>
                  <p className='hold-name'>{h.name}</p>
                  <p className='hold-sym'>{h.symbol?.toUpperCase()}</p>
                </div>
              </Link>

              <span className='hold-price'>{fmtPrice(h.currentPrice)}</span>

              <span className='hold-qty'>
                <p>
                  {h.quantity} {h.symbol?.toUpperCase()}
                </p>
                <p className='hold-cost'>{fmt(h.costBasis)} invested</p>
              </span>

              <span className='hold-buy'>{fmtPrice(h.buyPrice)}</span>

              <span className='hold-val'>{fmt(h.currentValue)}</span>

              <span className={`hold-pnl ${h.pnl >= 0 ? 'up' : 'down'}`}>
                <p>
                  {h.pnl >= 0 ? '+' : ''}
                  {fmt(h.pnl)}
                </p>
                <p className='pnl-pct-small'>
                  {h.pnlPct >= 0 ? '+' : ''}
                  {h.pnlPct.toFixed(2)}%
                </p>
              </span>

              <span
                className={`hold-24h ${h.priceChange24h >= 0 ? 'green' : 'red'}`}
              >
                {h.priceChange24h >= 0 ? '+' : ''}
                {h.priceChange24h?.toFixed(2)}%
              </span>

              <span className='hold-actions'>
                <button
                  className='edit-btn'
                  onClick={() => openEdit(h)}
                  title='Edit'
                >
                  ✏️
                </button>
                <button
                  className='del-btn'
                  onClick={() => handleDelete(h.id)}
                  title='Remove'
                >
                  ✕
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div className='modal-overlay' onClick={() => setShowModal(false)}>
          <div className='modal' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>{editId ? 'Edit Asset' : 'Add Asset'}</h2>
              <button
                className='modal-close'
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Coin Search */}
            <div className='modal-field'>
              <label>Search Coin</label>
              <input
                type='text'
                placeholder='Bitcoin, Ethereum...'
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setSelectedCoin(null)
                }}
                className='modal-input'
              />
              {search && !selectedCoin && filteredCoins.length > 0 && (
                <div className='coin-dropdown'>
                  {filteredCoins.map((coin) => (
                    <div
                      key={coin.id}
                      className='coin-option'
                      onClick={() => selectCoin(coin)}
                    >
                      <img src={coin.image} alt={coin.name} />
                      <span>{coin.name}</span>
                      <span className='option-sym'>
                        {coin.symbol.toUpperCase()}
                      </span>
                      <span className='option-price'>
                        {fmtPrice(coin.current_price)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected coin preview */}
            {selectedCoin && (
              <div className='selected-coin'>
                <img src={selectedCoin.image} alt='' />
                <span>{selectedCoin.name}</span>
                <span className='option-sym'>
                  {selectedCoin.symbol?.toUpperCase()}
                </span>
              </div>
            )}

            {/* Quantity */}
            <div className='modal-field'>
              <label>Quantity</label>
              <input
                type='number'
                placeholder='0.00'
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className='modal-input'
                min='0'
                step='any'
              />
            </div>

            {/* Buy Price */}
            <div className='modal-field'>
              <label>Buy Price ({currency.symbol})</label>
              <input
                type='number'
                placeholder='0.00'
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className='modal-input'
                min='0'
                step='any'
              />
              {selectedCoin?.current_price && (
                <p className='current-price-hint'>
                  Current price: {fmtPrice(selectedCoin.current_price)}
                  <button
                    className='use-current'
                    onClick={() =>
                      setBuyPrice(selectedCoin.current_price?.toFixed(2))
                    }
                  >
                    Use current
                  </button>
                </p>
              )}
            </div>

            {/* Preview */}
            {selectedCoin && quantity && buyPrice && (
              <div className='modal-preview'>
                <span>Total invested</span>
                <span>{fmt(parseFloat(quantity) * parseFloat(buyPrice))}</span>
              </div>
            )}

            <button
              className='save-btn'
              onClick={handleSave}
              disabled={!selectedCoin || !quantity || !buyPrice}
            >
              {editId ? 'Save Changes' : 'Add to Portfolio'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Portfolio
