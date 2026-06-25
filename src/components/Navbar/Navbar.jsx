import React, { useContext, useState } from 'react'
import './Navbar.css'
import arrow from '../../assets/icons8-arrow-32.png'
import { CoinContext } from '../../context/CoinContext'
import { WatchlistContext } from '../../context/watchlistContext'
import { Link, useLocation } from 'react-router-dom'
import StarButton from '../../components/StarButton/starButton'

const Navbar = () => {
  const { setCurrency } = useContext(CoinContext)
  const { watchlist } = useContext(WatchlistContext)
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const handleNavClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className='navbar'>
      <div className='brand'>
        <span className='brand-icon'>🟨</span>
        <Link to='/' className='brand-name'>
          Cryptoplace
        </Link>
        <div className='market-status'>
          <span></span>
          Markets Open
        </div>
      </div>

      {/* Hamburger Menu Button */}
      <button
        className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label='Toggle menu'
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className='mobile-menu-overlay'
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Nav Links */}
      <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <li>
          <Link
            to='/'
            className={isActive('/') ? 'nav-active' : ''}
            onClick={handleNavClick}
          >
            Markets
          </Link>
        </li>
        <li>
          <Link
            to='/watchlist'
            className={isActive('/watchlist') ? 'nav-active' : ''}
            onClick={handleNavClick}
          >
            Watchlist
            {watchlist.length > 0 && (
              <span className='wl-count'>{watchlist.length}</span>
            )}
          </Link>
        </li>
        <li>
          <Link
            to='/portfolio'
            className={isActive('/portfolio') ? 'nav-active' : ''}
            onClick={handleNavClick}
          >
            Portfolio
          </Link>
        </li>
        <li>
          <span className='nav-soon'>Trade</span>
        </li>
        <li>
          <span className='nav-soon'>News</span>
        </li>
      </ul>

      <div className='nav-right'>
        <select onChange={currencyHandler}>
          <option value='usd'>USD</option>
          <option value='eur'>EUR</option>
          <option value='ngn'>NGN</option>
        </select>

        <button className='signup-btn'>
          Sign Up
          <img src={arrow} alt='' />
        </button>
      </div>
    </div>
  )
}

export default Navbar
