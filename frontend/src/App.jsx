import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import TickerCard from './components/TickerCard';
import TickerDetails from './components/TickerDetails';
import MetricsBar from './components/MetricsBar';
import LandingPage from './components/LandingPage';
import { getMarketRegion, getMarketStatus } from './utils/marketHours';
import { Grid3X3, BarChart3, Terminal, ShieldCheck, ShieldAlert, Zap, TrendingUp, TrendingDown, Minus, RefreshCw, Plus, Globe, ScanSearch, Activity, Layers, Coins, Flag } from 'lucide-react';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [showUniverseModal, setShowUniverseModal] = useState(false);
  const [newTickersInput, setNewTickersInput] = useState('');
  const [isAddingTickers, setIsAddingTickers] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
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
  const [activeMarket, setActiveMarket] = useState('US');
  const [marketStatus, setMarketStatus] = useState({ isOpen: false, status: 'CHECKING' });

  // Update market status when activeMarket changes
  useEffect(() => {
    const status = getMarketStatus(activeMarket);
    setMarketStatus(status);

    // Notify engine to prioritize this region
    api.setEngineFocus(activeMarket);

    // Update every minute
    const interval = setInterval(() => {
      setMarketStatus(getMarketStatus(activeMarket));
    }, 60000);
    return () => clearInterval(interval);
  }, [activeMarket]);

  useEffect(() => {
    const init = async (retries = 3) => {
      try {
        const tickerList = await api.getTickers();
        setTickers(tickerList);
        setLoading(false);
      } catch (err) {
        if (retries > 0) {
          console.warn(`Init failed, retrying... (${retries} left)`);
          setTimeout(() => init(retries - 1), 2000);
        } else {
          console.error('Initialization failed permanently', err);
          setLoading(false);
        }
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

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter === 'bullish') {
      // Trigger Hyper-Live Mode for Penny/Bullish stocks
      api.setEngineMode('HYPER_LIVE', 'bullish_penny');
    } else {
      // Revert to Standard Mode
      api.setEngineMode('STANDARD');
    }
  };

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  const filteredTickers = tickers.filter(t => {
    const region = getMarketRegion(t);
    if (region !== activeMarket) return false;

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
      // Fetch historical data (1h for 7-day view)
      const hist = await api.getHistoricalData(ticker, '1h');
      if (Array.isArray(hist) && hist.length > 0) {
        setHistoricalData(hist);
      }

      // Fetch other data in parallel
      const strategyRes = await api.getBestStrategy(ticker);
      const signalRes = await api.getCurrentSignal(ticker);
      const moveRes = await api.getExpectedMove(ticker);
      const priceRes = await api.getLivePrice(ticker);

      setForecast({
        strategy: strategyRes.best_strategy,
        bias: signalRes.signal,
        confidence: signalRes.confidence,
        volatility_atr: signalRes.volatility_atr || 0,
        expected_range: moveRes.range,
        invalidation_point: moveRes.invalidation,
        price: priceRes.price
      });
    } catch (e) {
      console.error("Failed to load ticker details", e);
    } finally {
      setModalLoading(false);
    }
  };


  const handleAddTickers = async () => {
    if (!newTickersInput.trim()) return;
    setIsAddingTickers(true);
    try {
      const symbols = newTickersInput.split(/[\s,]+/).map(s => s.trim().toUpperCase()).filter(s => s);
      await fetch(`${api.baseUrl}/tickers/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(symbols)
      });
      setNewTickersInput('');
      setShowUniverseModal(false);

      // Refresh local ticker list
      const updated = await api.getTickers();
      setTickers(updated);
    } catch (e) {
      console.error(e);
      alert('Failed to ingst assets. Check console.');
    } finally {
      setIsAddingTickers(false);
    }
  };

  const handleEnhanceUniverse = async () => {
    if (confirm('Start Auto-Discovery? We will scan the market for high-volume movers and add them to your dashboard.')) {
      setModalLoading(true);
      try {
        const res = await api.enhanceUniverse();
        if (res.status === 'success') {
          alert(res.message);
          const updated = await api.getTickers();
          setTickers(updated);
        } else {
          alert(res.message);
        }
      } catch (err) {
        console.error(err);
        alert('Discovery sequence failed.');
      } finally {
        setModalLoading(false);
      }
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
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4rem',
        padding: '1.5rem 0',
        borderBottom: '1px solid var(--border-glass)'
      }}>
        <div onClick={() => setShowLanding(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-glass)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px'
          }}>
            <img src="/logo.png" alt="Quant Sourcer" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '900',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: 'white',
              marginBottom: '-4px'
            }}>QUANT <span style={{ color: 'var(--accent-primary)' }}>SOURCER</span></h1>
            <p className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '4px', fontWeight: 'bold' }}>SYSTEMS_CORE_v1.2</p>
          </div>
        </div>


        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div className="glass mono" style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '100px',
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 'bold',
            letterSpacing: '1px',
            border: '1px solid var(--border-glow)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              animation: 'pulse-soft 2s infinite',
              boxShadow: '0 0 10px var(--accent-primary)'
            }} />
            CORE STATUS: NOMINAL
          </div>

          <div className="glass mono" style={{
            padding: '0.6rem 1.2rem',
            borderRadius: '100px',
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 'bold',
            letterSpacing: '1px',
            border: `1px solid ${marketStatus.isOpen ? 'var(--success)' : 'var(--text-muted)'}`,
            color: marketStatus.isOpen ? 'var(--success)' : 'var(--text-muted)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: marketStatus.isOpen ? 'var(--success)' : 'var(--text-muted)',
              boxShadow: marketStatus.isOpen ? '0 0 10px var(--success)' : 'none'
            }} />
            {marketStatus.status.replace('_', ' ')}
          </div>

          <button
            onClick={handleEnhanceUniverse}
            className="glass mono"
            disabled={modalLoading}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '100px',
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: '900',
              letterSpacing: '1px',
              border: '1px solid var(--accent-primary)',
              color: 'var(--accent-primary)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              background: 'rgba(0, 255, 213, 0.05)'
            }}
          >
            <Zap size={14} />
            AUTO-DISCOVER
          </button>

          <button
            onClick={() => setShowUniverseModal(true)}
            className="glass mono"
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '100px',
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: '900',
              letterSpacing: '1px',
              border: '1px solid var(--accent-secondary)',
              color: 'var(--accent-secondary)',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            <Plus size={14} />
            EXPAND UNIVERSE
          </button>

          <div
            onClick={() => setShowTerminal(!showTerminal)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1px solid var(--border-glass)',
              background: showTerminal ? 'var(--accent-primary)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              color: showTerminal ? '#000' : 'var(--text-dim)'
            }} className="terminal-border">
            <Terminal size={18} />
          </div>
        </div>
      </header >

      <MetricsBar metrics={metrics} />

      <div style={{
        position: 'fixed',
        bottom: '2.5rem',
        right: '2.5rem',
        width: showTerminal ? '600px' : '400px',
        maxHeight: showTerminal ? '400px' : 'none',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {showTerminal && (
          <div className="glass terminal-border animate-fade-in" style={{
            background: 'rgba(0,0,0,0.95)',
            borderRadius: '16px',
            border: '1px solid var(--accent-primary)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 0 50px rgba(0, 255, 213, 0.15)'
          }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={12} color="var(--accent-primary)" />
                <span className="mono" style={{ fontSize: '0.65rem' }}>SYSTEM_LOGS_STREAM</span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f' }} />
              </div>
            </div>
            <div className="mono" style={{ padding: '1.25rem', height: '300px', overflowY: 'auto', fontSize: '0.7rem', lineHeight: '1.8', color: 'var(--text-dim)' }}>
              <span style={{ color: 'var(--accent-primary)' }}>[SYSTEM]</span> Market Core v1.2.0 active.<br />
              <span style={{ color: 'var(--accent-secondary)' }}>[STABLE]</span> Connected to Render cloud.<br />
              <span style={{ color: 'var(--success)' }}>[OK]</span> Database ready.<br />
              <span style={{ color: 'var(--text-muted)' }}>[INFO]</span> Connecting to global data feeds (N={metrics?.total_tickers || '---'})...<br />
              <span style={{ color: 'var(--accent-primary)' }}>[PROCESS]</span> Analyzing {metrics?.total_tickers || '---'} assets for patterns...<br />
              {metrics?.processed_tickers > 0 && (
                <>
                  <span style={{ color: 'var(--success)' }}>[OK]</span> {metrics.processed_tickers}/{metrics?.total_tickers || '?'} assets analyzed and ready.<br />
                </>
              )}
              <span style={{ color: 'var(--accent-primary)' }}>&gt;</span> System status: <span style={{ color: 'var(--success)' }}>NOMINAL</span><br />
              <span className="animate-pulse">_</span>
            </div>
          </div>
        )}

        {(metrics?.is_syncing || metrics?.last_error) && !showTerminal && (
          <div
            onClick={() => setShowTerminal(true)}
            className="glass terminal-border animate-fade-in"
            style={{
              padding: '1.25rem',
              background: 'var(--bg-deep)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              borderRadius: '16px',
              cursor: 'pointer'
            }}
          >
            {metrics?.is_syncing && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <RefreshCw size={14} className="animate-spin" color="var(--accent-primary)" />
                    <span className="mono" style={{ fontWeight: '900', letterSpacing: '2px', fontSize: '0.65rem', color: 'white' }}>SYNCING_SYSTEM_CORE</span>
                  </div>
                  <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: '900' }}>
                    {Math.round((metrics.processed_tickers / metrics.total_tickers) * 100)}%
                  </span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(metrics.processed_tickers / metrics.total_tickers) * 100}%`,
                    background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                    boxShadow: '0 0 15px var(--accent-glow)',
                    transition: 'width 0.8s'
                  }} />
                </div>
              </>
            )}

            {metrics?.last_error && (
              <div style={{
                marginTop: metrics?.is_syncing ? '1rem' : 0,
                padding: '0.5rem',
                background: 'rgba(255, 45, 85, 0.05)',
                borderLeft: '4px solid var(--danger)',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldAlert size={14} color="var(--danger)" />
                  <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--danger)', fontWeight: '900' }}>KERNEL_EXCEPTION</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Market Selector Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        {['US', 'IN', 'CRYPTO'].map(m => (
          <button
            key={m}
            onClick={() => setActiveMarket(m)}
            className="glass mono"
            style={{
              padding: '1rem 2rem',
              minWidth: '120px',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: '900',
              color: activeMarket === m ? '#fff' : 'var(--text-dim)',
              background: activeMarket === m ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
              border: activeMarket === m ? '1px solid var(--accent-glow)' : '1px solid var(--border-glass)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeMarket === m ? '0 0 20px rgba(0, 162, 255, 0.3)' : 'none'
            }}
          >
            {m === 'US' && <Flag size={14} style={{ marginRight: '8px', display: 'inline', verticalAlign: 'middle' }} />}
            {m === 'IN' && <span style={{ marginRight: '8px', fontSize: '1.2em', verticalAlign: 'middle' }}>🇮🇳</span>}
            {m === 'CRYPTO' && <Coins size={14} style={{ marginRight: '8px', display: 'inline', verticalAlign: 'middle' }} />}
            {m === 'US' ? 'US MARKET' : (m === 'IN' ? 'INDIA' : 'CRYPTO')}
          </button>
        ))}
      </div>

      {/* Signal Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => handleFilterChange('all')}
          className="glass mono"
          style={{
            padding: '0.8rem 1.5rem',
            borderRadius: '100px',
            fontSize: '0.75rem',
            fontWeight: '900',
            color: filter === 'all' ? '#000' : 'var(--text-dim)',
            background: filter === 'all' ? 'var(--text-muted)' : 'transparent',
            border: filter === 'all' ? '1px solid var(--text-muted)' : '1px solid var(--border-glass)',
            cursor: 'pointer',
            transition: 'all 0.3s',
            minWidth: '100px'
          }}
        >
          VIEW ALL
        </button>
        <button
          onClick={() => handleFilterChange('bullish')}
          className="glass mono"
          style={{
            padding: '0.8rem 1.5rem',
            borderRadius: '100px',
            fontSize: '0.75rem',
            fontWeight: '900',
            color: filter === 'bullish' ? '#000' : 'var(--text-dim)',
            background: filter === 'bullish' ? 'var(--success)' : 'transparent',
            border: filter === 'bullish' ? '1px solid var(--success)' : '1px solid var(--border-glass)',
            cursor: 'pointer',
            transition: 'all 0.3s',
            minWidth: '140px',
            boxShadow: filter === 'bullish' ? '0 0 15px rgba(39, 201, 63, 0.4)' : 'none'
          }}
        >
          <TrendingUp size={14} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
          BULLISH GEMS
        </button>
        <button
          onClick={() => handleFilterChange('bearish')}
          className="glass mono"
          style={{
            padding: '0.8rem 1.5rem',
            borderRadius: '100px',
            fontSize: '0.75rem',
            fontWeight: '900',
            color: filter === 'bearish' ? '#000' : 'var(--text-dim)',
            background: filter === 'bearish' ? 'var(--danger)' : 'transparent',
            border: filter === 'bearish' ? '1px solid var(--danger)' : '1px solid var(--border-glass)',
            cursor: 'pointer',
            transition: 'all 0.3s',
            minWidth: '140px',
            boxShadow: filter === 'bearish' ? '0 0 15px rgba(255, 95, 86, 0.4)' : 'none'
          }}
        >
          <TrendingDown size={14} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
          BEARISH RISKS
        </button>
      </div>

      <div style={{ marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <ScanSearch size={18} />
          </div>
          <input
            type="text"
            placeholder="Search assets..."
            className="glass mono"
            style={{
              padding: '1.1rem 1.25rem 1.1rem 3.5rem',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              color: 'white',
              width: '100%',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              letterSpacing: '1px',
              transition: 'all 0.3s'
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {
        filteredTickers.length === 0 ? (
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
        )
      }

      {
        selectedTicker && (
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
              metrics={metrics}
              onClose={() => setSelectedTicker(null)}
            />
          </>
        )
      }

      {
        showUniverseModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }} onClick={() => setShowUniverseModal(false)}>
            <div className="glass terminal-border animate-fade-in" style={{
              width: '90vw',
              maxWidth: '500px',
              padding: '2.5rem',
              background: 'var(--bg-deep)',
              borderRadius: '24px',
              boxShadow: '0 0 100px rgba(0, 162, 255, 0.1)'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                <div style={{ padding: '10px', background: 'rgba(0, 162, 255, 0.1)', borderRadius: '12px', color: 'var(--accent-secondary)' }}>
                  <Globe size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '1px' }}>EXPAND UNIVERSE</h2>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>MANUAL ASSET INGESTION CORE</p>
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Paste ticker symbols below (comma or space separated). The engine will automatically initialize historical backtests and neural weights.
              </p>

              <textarea
                className="glass mono"
                placeholder="AAPL, TSLA, BTC-USD, MSFT..."
                style={{
                  width: '100%',
                  height: '150px',
                  padding: '1.25rem',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.85rem',
                  letterSpacing: '1px',
                  marginBottom: '2rem',
                  resize: 'none'
                }}
                value={newTickersInput}
                onChange={(e) => setNewTickersInput(e.target.value)}
              />

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  className="glass mono"
                  style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'transparent', border: '1px solid var(--border-glass)', color: 'white', cursor: 'pointer', fontWeight: '900' }}
                  onClick={() => setShowUniverseModal(false)}
                >
                  ABORT
                </button>
                <button
                  className="glass mono"
                  style={{
                    flex: 1,
                    padding: '1rem',
                    borderRadius: '12px',
                    background: 'var(--accent-secondary)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '900',
                    boxShadow: '0 0 20px rgba(0, 162, 255, 0.3)'
                  }}
                  disabled={isAddingTickers}
                  onClick={handleAddTickers}
                >
                  {isAddingTickers ? 'INITIALIZING...' : 'INGEST ASSETS'}
                </button>
              </div>
            </div>
          </div>
        )
      }

      <footer style={{ marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
        <p style={{ marginBottom: '1rem', opacity: 0.6 }}>
          <b>Market Intel Synced:</b> The total volume of live market data analyzed and cached by the backend engine in real-time.
        </p>
        <p>&copy; 2026 QUANT SOURCER ENGINE</p>
      </footer>
    </div >
  );
}

export default App;
