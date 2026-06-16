import { createContext, useEffect, useState, useCallback, useRef } from 'react'
export const CoinContext = createContext()

const CoinContextProvider = (props) => {
  const [allCoin, setAllCoin] = useState([])
  const [currency, setCurrency] = useState({
    name: 'usd',
    symbol: '$',
  })

  // New state management
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const cacheRef = useRef({})
  const abortControllerRef = useRef(null)

  // Configuration
  const API_KEY =
    import.meta.env.VITE_COINGECKO_API_KEY || 'CG-75y9xS3NXtZG1tgyaVePDUZt' // Move to .env file
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  const MAX_RETRIES = 3
  const INITIAL_RETRY_DELAY = 1000 // 1 second

  // Check if cached data is still valid
  const isCacheValid = (currency) => {
    const cached = cacheRef.current[currency.name]
    if (!cached) return false
    return Date.now() - cached.timestamp < CACHE_DURATION
  }

  // Exponential backoff retry logic
  const fetchWithRetry = async (url, options, retries = 0) => {
    try {
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current?.signal,
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      // Don't retry on abort
      if (err.name === 'AbortError') {
        throw err
      }

      if (retries < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retries)
        console.warn(
          `Retry attempt ${retries + 1}/${MAX_RETRIES} after ${delay}ms`,
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
        return fetchWithRetry(url, options, retries + 1)
      }

      throw err
    }
  }

  const fetchAllCoin = async () => {
    // Use cache if valid
    if (isCacheValid(currency)) {
      console.log(`Using cached data for ${currency.name}`)
      setAllCoin(cacheRef.current[currency.name].data)
      setLoading(false)
      return
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()
    setLoading(true)
    setError(null)

    try {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-cg-demo-api-key': API_KEY,
        },
      }

      // Fetch top 250 coins (or adjust per_page as needed)
      const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency.name}&order=market_cap_desc&per_page=250&page=1&sparkline=false`

      const data = await fetchWithRetry(url, options)

      // Cache the successful response
      cacheRef.current[currency.name] = {
        data,
        timestamp: Date.now(),
      }

      setAllCoin(data)
      setError(null)
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Fetch was cancelled')
        return
      }

      console.error('Failed to fetch coins:', err)
      setError({
        message: 'Failed to load cryptocurrency data. Please try again.',
        details: err.message,
      })

      // Fallback to cached data if available (even if expired)
      const fallbackData = cacheRef.current[currency.name]
      if (fallbackData) {
        console.log('Using stale cache as fallback')
        setAllCoin(fallbackData.data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllCoin()

    // Cleanup on unmount
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [currency])

  const fetchCoinData = useCallback(async (coinId) => {
    try {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-cg-demo-api-key': import.meta.env.VITE_COINGECKO_API_KEY,
        },
      }

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}`,
        options,
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch coin data`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error fetching coin data:', err)
      throw err
    }
  }, [])

  // NEW: Function to fetch historical price data for charts
  const fetchCoinHistory = useCallback(
    async (coinId, days = 7, currency = 'usd') => {
      try {
        const options = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            'x-cg-demo-api-key': API_KEY,
          },
        }

        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`,
          options,
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch coin history`)
        }

        const data = await response.json()
        return data.prices
      } catch (err) {
        console.error('Error fetching coin history:', err)
        throw err
      }
    },
    [API_KEY],
  )
  const contextValue = {
    allCoin,
    currency,
    setCurrency,
    loading,
    error,
    refreshData: fetchAllCoin,
    fetchCoinData,
    fetchCoinHistory,
    refetch: fetchAllCoin, // Allow manual refetch
  }

  return (
    <CoinContext.Provider value={contextValue}>
      {props.children}
    </CoinContext.Provider>
  )
}

export default CoinContextProvider
