import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import TickerCard from './components/TickerCard';
import TickerDetails from './components/TickerDetails';
import MetricsBar from './components/MetricsBar';
import LandingPage from './components/LandingPage';
import { LayoutGrid, BarChart3, Settings, ShieldCheck, Zap, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [tickers, setTickers] = useState([]);
  const [data, setData] = useState({});
  const [metrics, setMetrics] = useState(null);
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const init = async () => {
      try {
        const tickerList = await api.getTickers();
        setTickers(tickerList);
        setLoading(false);
      } catch (err) {
        console.error('Initialization failed', err);
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const states = await api.getAllStates();
        if (!states || typeof states !== 'object') return;

        const newData = {};
        Object.keys(states).forEach(ticker => {
          newData[ticker] = {
            price: states[ticker].last_price,
            signal: states[ticker].last_signal
          };
        });
        setData(newData);
      } catch (err) {
        console.error('Bulk fetch failed', err);
      }
    };

    const fetchMetrics = async () => {
      try {
        const m = await api.getSystemMetrics();
        setMetrics(m);
      } catch (err) {
        console.error('Metrics fetch failed', err);
      }
    };

    if (tickers.length > 0) {
      fetchData();
      fetchMetrics();
      const interval = setInterval(() => {
        fetchData();
        fetchMetrics();
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [tickers]);

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  const filteredTickers = tickers.filter(t => {
    const matchesSearch = t.toLowerCase().includes(search.toLowerCase());
    const tickerData = data[t];
    const isPenny = tickerData?.price > 0 && tickerData?.price < 5.0;

    if (filter === 'all') return matchesSearch;
    if (filter === 'bullish') return matchesSearch && tickerData?.signal?.signal === 'bullish';
    if (filter === 'bearish') return matchesSearch && tickerData?.signal?.signal === 'bearish';
    if (filter === 'neutral') return matchesSearch && tickerData?.signal?.signal === 'neutral';
    if (filter === 'penny') return matchesSearch && isPenny;
    return matchesSearch;
  });

  const handleTickerClick = async (ticker) => {
    setSelectedTicker(ticker);
    setModalLoading(true);
    setHistoricalData([]); // Reset old data
    setForecast(null);

    try {
      const [hist, move] = await Promise.all([
        api.getHistoricalData(ticker),
        api.getExpectedMove(ticker)
      ]);
      setHistoricalData(hist);
      setForecast(move);
    } catch (err) {
      console.error('Failed to fetch details', err);
      // Even if it fails (404), keep the modal open to show "Analyzing"
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', background: '#000' }}>
        <Zap className="animate-pulse" size={48} />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div onClick={() => setShowLanding(true)} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
            <Zap size={24} fill="currentColor" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '2px' }}>QUANT SOURCER</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>High-Velocity Market Intelligence Engine</p>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div className="glass" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }} />
            ENGINE LIVE
          </div>
        </div>
      </header>

      <MetricsBar metrics={metrics} />

      {metrics?.last_error && (
        <div className="glass terminal-border" style={{ padding: '0.8rem 1rem', marginBottom: '2rem', borderLeft: '4px solid var(--danger)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={18} style={{ color: 'var(--danger)' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--danger)', fontWeight: 'bold' }}>SYSTEM ALERT:</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{metrics.last_error}</span>
        </div>
      )}

      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search symbols..."
            className="glass"
            style={{
              padding: '0.8rem 1.5rem',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.02)',
              color: 'white',
              width: '100%',
              outline: 'none',
              fontSize: '0.9rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="glass terminal-border" style={{ display: 'flex', padding: '4px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)' }}>
          <button
            onClick={() => setFilter('all')}
            style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', background: filter === 'all' ? 'var(--accent-primary)' : 'transparent', color: filter === 'all' ? 'black' : 'white', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', transition: 'all 0.2s' }}
          >
            <LayoutGrid size={16} /> ALL ({tickers.length})
          </button>
          <button
            onClick={() => setFilter('bullish')}
            style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', background: filter === 'bullish' ? 'var(--success)' : 'transparent', color: filter === 'bullish' ? 'black' : 'white', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', transition: 'all 0.2s' }}
          >
            <TrendingUp size={16} /> BULL {tickers.filter(t => data[t]?.signal?.signal === 'bullish').length}
          </button>
          <button
            onClick={() => setFilter('bearish')}
            style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', background: filter === 'bearish' ? 'var(--danger)' : 'transparent', color: filter === 'bearish' ? 'black' : 'white', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', transition: 'all 0.2s' }}
          >
            <TrendingDown size={16} /> BEAR {tickers.filter(t => data[t]?.signal?.signal === 'bearish').length}
          </button>
          <button
            onClick={() => setFilter('neutral')}
            style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', background: filter === 'neutral' ? 'var(--text-secondary)' : 'transparent', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', transition: 'all 0.2s' }}
          >
            <Minus size={16} /> NEUT {tickers.filter(t => data[t]?.signal?.signal === 'neutral').length}
          </button>
          <button
            onClick={() => setFilter('penny')}
            style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', borderLeft: '1px solid var(--border)', background: filter === 'penny' ? 'var(--accent-secondary)' : 'transparent', color: filter === 'penny' ? 'white' : 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', transition: 'all 0.2s' }}
          >
            <Zap size={16} /> PENNY {tickers.filter(t => data[t]?.price > 0 && data[t]?.price < 5.0).length}
          </button>
        </div>
      </div>

      {filteredTickers.length === 0 ? (
        <div className="glass terminal-border" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <RefreshCw className="animate-spin" style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} size={48} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>NO TICKERS FOUND</h3>
          <p>Syncing data or waiting for market signals...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredTickers.map(ticker => (
            <TickerCard
              key={ticker}
              ticker={ticker}
              price={data[ticker]?.price}
              signal={data[ticker]?.signal}
              onClick={handleTickerClick}
            />
          ))}
        </div>
      )}

      {selectedTicker && (
        <>
          <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 90 }}
            onClick={() => setSelectedTicker(null)}
          />
          <TickerDetails
            ticker={selectedTicker}
            data={historicalData}
            forecast={forecast}
            loading={modalLoading}
            onClose={() => setSelectedTicker(null)}
          />
        </>
      )}

      <footer style={{ marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
        <p style={{ marginBottom: '1rem', opacity: 0.6 }}>
          <b>Market Intel Synced:</b> The total volume of live market data analyzed and cached by the backend engine in real-time.
        </p>
        <p>&copy; 2026 QUANT SOURCER ENGINE</p>
      </footer>
    </div>
  );
}

export default App;
