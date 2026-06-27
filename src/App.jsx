import React from 'react'
import Navbar from './components/Navbar/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Coin from './pages/Coin/Coin'
import Watchlist from './pages/watchlist/Watchlist'
import Portfolio from './pages/Portfolio/Portfolio'
import News from './pages/News/news'
import Trade from './pages/Trade/trade'
import Footer from './components/Footer/Footer'
import WatchlistProvider from './context/watchlistContext'

const App = () => {
  return (
    <WatchlistProvider>
      <div className='app'>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/coin/:coinId' element={<Coin />} />
          <Route path='/watchlist' element={<Watchlist />} />
          <Route path='/portfolio' element={<Portfolio />} />
          <Route path='/news' element={<News />} />
          <Route path='/trade' element={<Trade />} />
        </Routes>
        <Footer />
      </div>
    </WatchlistProvider>
  )
}

export default App
