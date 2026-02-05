import { X, Target, AlertCircle, AlertTriangle, ShieldCheck, RefreshCw, Scan, BarChart3, Zap, Cpu, Orbit, Database } from 'lucide-react';
import { formatPrice, getCurrencySymbol } from '../utils/formatters';
import PriceChart from './PriceChart';

const TickerDetails = ({ ticker, data, forecast, loading, metrics, onClose }) => {
    if (!ticker) return null;

    const chartData = Array.isArray(data) ? data : [];
    const isBullish = forecast?.bias === 'bullish';
    const highlightColor = isBullish ? 'var(--success)' : (forecast?.bias === 'bearish' ? 'var(--danger)' : 'var(--accent-secondary)');

    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95vw',
            maxWidth: '1200px',
            height: '85vh',
            maxHeight: '800px',
            background: 'var(--bg-deep)',
            border: '1px solid var(--border-glass)',
            borderRadius: '24px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 0 100px rgba(0,0,0,0.8), 0 0 40px rgba(0, 255, 213, 0.05)',
            animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }} className="glass">
            {/* Modal Header */}
            <div style={{
                padding: '1.5rem 2rem',
                borderBottom: '1px solid var(--border-glass)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        padding: '10px',
                        background: 'rgba(0, 255, 213, 0.1)',
                        borderRadius: '10px',
                        color: 'var(--accent-primary)'
                    }}>
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '1px' }}>{ticker} <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>/ LIVE {getCurrencySymbol(ticker)} INTEL</span></h2>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>STRATEGY: {forecast?.strategy || 'QUANT_V2'}</span>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                            <span className="mono" style={{ fontSize: '0.7rem', color: highlightColor, fontWeight: 'bold' }}>BIAS: {forecast?.bias?.toUpperCase() || 'CALIBRATING'}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="terminal-border"
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-glass)',
                        color: 'white',
                        padding: '8px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <X size={20} />
                </button>
            </div>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', overflow: 'hidden' }}>
                {/* Main Analysis View */}
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', height: '100%' }}>

                    {/* Primary Chart Area */}
                    <div className="glass terminal-border" style={{
                        height: '400px',
                        minHeight: '400px',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        position: 'relative',
                        display: 'block',
                        overflow: 'hidden'
                    }}>
                        {loading ? (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                <RefreshCw className="animate-spin" size={32} color="var(--accent-primary)" />
                                <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '2px' }}>DECRYPTING MARKET DATA...</span>
                            </div>
                        ) : (
                            <div style={{ position: 'absolute', top: 20, left: 20, right: 20, bottom: 20 }}>
                                <PriceChart data={chartData} forecast={forecast} isBullish={isBullish} />
                            </div>
                        )}
                    </div>

                    {/* Technical Snapshot Board */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div className="glass terminal-border" style={{ padding: '1rem', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                                <Orbit size={14} />
                                <span style={{ fontSize: '0.65rem', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>Expected Range</span>
                            </div>
                            <div className="mono" style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                                {formatPrice(ticker, forecast?.expected_range?.min)} - {formatPrice(ticker, forecast?.expected_range?.max)}
                            </div>
                        </div>
                        <div className="glass terminal-border" style={{ padding: '1rem', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                                <ShieldCheck size={14} />
                                <span style={{ fontSize: '0.65rem', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>Invalidation Point</span>
                            </div>
                            <div className="mono" style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--danger)' }}>
                                {formatPrice(ticker, forecast?.invalidation_point)}
                            </div>
                        </div>
                        <div className="glass terminal-border" style={{ padding: '1rem', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                                <Target size={14} />
                                <span style={{ fontSize: '0.65rem', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>Model Confidence</span>
                            </div>
                            <div className="mono" style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                                {((forecast?.confidence || 0) * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Insight Panel */}
                <div style={{
                    borderLeft: '1px solid var(--border-glass)',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                }}>
                    <div className="glass terminal-border" style={{ padding: '1.25rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-secondary)', marginBottom: '1rem' }}>
                            <Cpu size={18} />
                            <span style={{ fontWeight: '900', fontSize: '0.8rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Neural Analysis</span>
                        </div>

                        {!forecast ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {metrics?.is_syncing ? (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: '1.5', fontStyle: 'italic' }}>
                                        <RefreshCw size={12} className="animate-spin" style={{ display: 'inline', marginRight: '6px' }} />
                                        Primary engine is currently indexing historical volatility. Analysis will resume shortly.
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '0.75rem', color: 'var(--warning)', lineHeight: '1.5' }}>
                                        <AlertTriangle size={14} style={{ display: 'inline', marginRight: '6px' }} />
                                        Insufficient liquidity or historical data for reliable quant forecast at this time.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-dim)' }}>ATR Volatility</span>
                                    <span className="mono" style={{ color: 'white' }}>{formatPrice(ticker, forecast?.volatility_atr)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-dim)' }}>Price Variance</span>
                                    <span className="mono" style={{ color: highlightColor }}>HIGH</span>
                                </div>
                                <div style={{ marginTop: '0.5rem', padding: '0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>
                                    Asset exhibits {forecast.bias} skew within current timeframe. Strategy {forecast.strategy} recommending entry adjustment near {formatPrice(ticker, forecast.expected_range.min)}.
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="glass" style={{ flex: 1, borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', gap: '1rem' }}>
                        <div style={{ opacity: 0.3 }}>
                            <Zap size={32} style={{ margin: '0 auto' }} />
                        </div>
                        <p className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', lineHeight: '1.6', textTransform: 'uppercase' }}>
                            This analysis is generated by an autonomous engine. Use for educational and research purposes only.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TickerDetails;
