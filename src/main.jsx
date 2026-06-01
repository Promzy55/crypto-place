import React from 'react'
import ReactDOM from 'react-dom/client' // Correct casing for ReactDOM
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import CoinContextProvider from './context/CoinContext.jsx'
ReactDOM.createRoot(document.getElementById('root')).render(
  // Use createRoot here
  <React.StrictMode>
    <BrowserRouter>
      <CoinContextProvider>
        <App />
      </CoinContextProvider>
    </BrowserRouter>
  </React.StrictMode>
)
