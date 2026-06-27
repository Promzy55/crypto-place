import React, { useState, useEffect } from 'react'
import './news.css'

const News = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState('crypto')
  const [page, setPage] = useState(null)
  const [nextPage, setNextPage] = useState(null)

  const categories = [
    { label: 'Crypto', value: 'crypto' },
    { label: 'Bitcoin', value: 'bitcoin' },
    { label: 'Ethereum', value: 'ethereum' },
    { label: 'Blockchain', value: 'blockchain' },
    { label: 'DeFi', value: 'defi' },
    { label: 'NFT', value: 'nft' },
  ]

  const fetchNews = async (pageToken = null) => {
    try {
      setLoading(true)
      setError(null)

      let url = `https://newsdata.io/api/1/news?apikey=pub_c47face917444384abb442f15e2feb7f&q=${category}&language=en&size=10`
      if (pageToken) url += `&page=${pageToken}`

      const res = await fetch(url)
      const data = await res.json()

      if (data.status !== 'success')
        throw new Error(data.message || 'Failed to fetch news')

      // Filter out articles without images or descriptions
      const filtered = data.results.filter((a) => a.title && a.description)

      setArticles(filtered)
      setNextPage(data.nextPage || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(null)
    setNextPage(null)
    fetchNews()
  }, [category])

  const handleLoadMore = () => {
    setPage(nextPage)
    fetchNews(nextPage)
  }

  const timeAgo = (dateStr) => {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className='news-page'>
      {/* ── HEADER ── */}
      <div className='news-header'>
        <div>
          <h1 className='news-title'>Crypto News</h1>
          <p className='news-sub'>Latest headlines from the crypto world</p>
        </div>
        <div className='live-indicator'>
          <span className='live-dot'></span>
          Live Feed
        </div>
      </div>

      {/* ── CATEGORY TABS ── */}
      <div className='news-tabs'>
        {categories.map((cat) => (
          <button
            key={cat.value}
            className={`news-tab ${category === cat.value ? 'active' : ''}`}
            onClick={() => setCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div className='news-loading'>
          <div className='news-spinner'></div>
          <p>Fetching latest news...</p>
        </div>
      )}

      {/* ── ERROR ── */}
      {error && !loading && (
        <div className='news-error'>
          <p>⚠️ {error}</p>
          <button onClick={() => fetchNews()} className='retry-btn'>
            Retry
          </button>
        </div>
      )}

      {/* ── NEWS GRID ── */}
      {!loading && !error && articles.length > 0 && (
        <>
          {/* Featured article */}
          <a
            href={articles[0].link}
            target='_blank'
            rel='noreferrer'
            className='news-featured'
          >
            {articles[0].image_url && (
              <img
                src={articles[0].image_url}
                alt={articles[0].title}
                className='featured-img'
                onError={(e) => (e.target.style.display = 'none')}
              />
            )}
            <div className='featured-overlay'>
              <span className='featured-badge'>Featured</span>
              <h2 className='featured-title'>{articles[0].title}</h2>
              <p className='featured-desc'>
                {articles[0].description?.slice(0, 150)}...
              </p>
              <div className='article-meta'>
                <span className='article-source'>{articles[0].source_id}</span>
                <span className='article-time'>
                  {timeAgo(articles[0].pubDate)}
                </span>
              </div>
            </div>
          </a>

          {/* News grid */}
          <div className='news-grid'>
            {articles.slice(1).map((article, index) => (
              <a
                key={index}
                href={article.link}
                target='_blank'
                rel='noreferrer'
                className='news-card'
              >
                {article.image_url && (
                  <div className='card-img-wrapper'>
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className='card-img'
                      onError={(e) =>
                        (e.target.parentElement.style.display = 'none')
                      }
                    />
                  </div>
                )}
                <div className='card-body'>
                  <div className='card-tags'>
                    {article.category?.slice(0, 2).map((cat, i) => (
                      <span key={i} className='card-tag'>
                        {cat}
                      </span>
                    ))}
                  </div>
                  <h3 className='card-title'>{article.title}</h3>
                  <p className='card-desc'>
                    {article.description?.slice(0, 100)}...
                  </p>
                  <div className='article-meta'>
                    <span className='article-source'>{article.source_id}</span>
                    <span className='article-time'>
                      {timeAgo(article.pubDate)}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Load more */}
          {nextPage && (
            <div className='news-load-more'>
              <button className='load-more-btn' onClick={handleLoadMore}>
                Load More News
              </button>
            </div>
          )}
        </>
      )}

      {/* ── EMPTY ── */}
      {!loading && !error && articles.length === 0 && (
        <div className='news-empty'>
          <p>
            No news found for "<strong>{category}</strong>". Try another
            category.
          </p>
        </div>
      )}
    </div>
  )
}

export default News
