import React, { useContext, useState } from 'react'
import './Navbar.css'
import arrow from '../../assets/icons8-arrow-32.png'
import { CoinContext } from '../../context/CoinContext'
import { WatchlistContext } from '../../context/watchlistContext'
import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const { setCurrency } = useContext(CoinContext)
  const { watchlist } = useContext(WatchlistContext)
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const currencyHandler = (event) => {
    switch (event.target.value) {
      case 'usd':
        setCurrency({ name: 'usd', symbol: '$' })
        break
      case 'eur':
        setCurrency({ name: 'eur', symbol: '€' })
        break
      case 'ngn':
        setCurrency({ name: 'ngn', symbol: '₦' })
        break
      default:
        setCurrency({ name: 'usd', symbol: '$' })
    }
  }

  const isActive = (path) => location.pathname === path
  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <div className='navbar'>
        <div className='brand'>
          <span className='brand-icon'>🟨</span>
          <Link to='/' className='brand-name' onClick={closeMenu}>
            Cryptoplace
          </Link>
          <div className='market-status'>
            <span></span>
            Markets Open
          </div>
        </div>

        <ul className='nav-links'>
          <li>
            <Link to='/' className={isActive('/') ? 'nav-active' : ''}>
              Markets
            </Link>
          </li>
          <li>
            <Link
              to='/watchlist'
              className={isActive('/watchlist') ? 'nav-active' : ''}
            >
              Watchlist{' '}
              {watchlist.length > 0 && (
                <span className='wl-count'>{watchlist.length}</span>
              )}
            </Link>
          </li>
          <li>
            <Link
              to='/portfolio'
              className={isActive('/portfolio') ? 'nav-active' : ''}
            >
              Portfolio
            </Link>
          </li>
          <li>
            <Link
              to='/trade'
              className={isActive('/trade') ? 'nav-active' : ''}
            >
              Trade
            </Link>
          </li>
          <li>
            <Link to='/news' className={isActive('/news') ? 'nav-active' : ''}>
              News
            </Link>
          </li>
        </ul>

        <div className='nav-right'>
          <select onChange={currencyHandler}>
            <option value='usd'>USD</option>
            <option value='eur'>EUR</option>
            <option value='ngn'>NGN</option>
          </select>
          <button className='signup-btn'>
            Sign Up <img src={arrow} alt='' />
          </button>
          <button
            className='hamburger'
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label='Toggle menu'
          >
            {menuOpen ? (
              <span style={{ fontSize: '22px', color: '#fff', lineHeight: 1 }}>
                ✕
              </span>
            ) : (
              <>
                <span></span>
                <span></span>
                <span></span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu — rendered OUTSIDE navbar so it's not clipped */}
      {menuOpen && (
        <div className='mobile-nav'>
          <Link
            to='/'
            className={`mobile-link ${isActive('/') ? 'mobile-active' : ''}`}
            onClick={closeMenu}
          >
            🏠 Markets
          </Link>
          <Link
            to='/watchlist'
            className={`mobile-link ${isActive('/watchlist') ? 'mobile-active' : ''}`}
            onClick={closeMenu}
          >
            ⭐ Watchlist{' '}
            {watchlist.length > 0 && (
              <span className='wl-count'>{watchlist.length}</span>
            )}
          </Link>
          <Link
            to='/portfolio'
            className={`mobile-link ${isActive('/portfolio') ? 'mobile-active' : ''}`}
            onClick={closeMenu}
          >
            💼 Portfolio
          </Link>
          <Link
            to='/trade'
            className={`mobile-link ${isActive('/trade') ? 'mobile-active' : ''}`}
            onClick={closeMenu}
          >
            📈 Trade
          </Link>
          <Link
            to='/news'
            className={`mobile-link ${isActive('/news') ? 'mobile-active' : ''}`}
            onClick={closeMenu}
          >
            📰 News
          </Link>
          <div className='mobile-currency'>
            <select onChange={currencyHandler} className='mobile-select'>
              <option value='usd'>USD</option>
              <option value='eur'>EUR</option>
              <option value='ngn'>NGN</option>
            </select>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {menuOpen && <div className='mobile-backdrop' onClick={closeMenu} />}
    </>
  )
}

export default Navbar
