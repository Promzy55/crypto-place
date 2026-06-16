import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import CoinContextProvider from './context/CoinContext.jsx'
import WatchlistProvider from './context/watchlistContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CoinContextProvider>
        <WatchlistProvider>
          <App />
        </WatchlistProvider>
      </CoinContextProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
