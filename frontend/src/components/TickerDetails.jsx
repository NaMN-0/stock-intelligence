import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { X, Target, AlertCircle, AlertTriangle, ShieldCheck, RefreshCw, Activity } from 'lucide-react';

const TickerDetails = ({ ticker, data, forecast, loading, metrics, onClose }) => {
    if (!ticker) return null;

    // Ensure data is an array to prevent "is not iterable" errors in Recharts
    const chartData = Array.isArray(data) ? data : [];

    // Custom Tick Formatter for better intuition
    const formatXAxis = (tickItem) => {
        try {
            const date = new Date(tickItem);
            const now = new Date();
            if (date.toLocaleDateString() === now.toLocaleDateString()) {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } catch {
            return tickItem;
        }
    };

    return (
        <div className="glass terminal-border" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '95vw',
            maxWidth: '1200px',
            height: '85vh',
            zIndex: 1000,
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: '0 0 100px rgba(0,0,0,0.8)',
            animation: 'fadeIn 0.3s ease-out',
            overflow: 'hidden'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--accent-primary)', letterSpacing: '-1px' }}>{ticker} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '400' }}>Terminal View</span></h2>
                    <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={16} color="var(--success)" /> Live Market Intel Sync Active
                    </p>
                </div>
                <button onClick={onClose} style={{ color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}>
                    <X size={28} />
                </button>
            </div>

            <div style={{ flex: 1, minHeight: 0, position: 'relative', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1rem' }}>
                {loading && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-primary)',
                        flexDirection: 'column',
                        gap: '1rem',
                        backdropFilter: 'blur(5px)'
                    }}>
                        <RefreshCw className="animate-spin" style={{ width: '48px', height: '48px' }} />
                        <span style={{ fontWeight: 'bold' }}>SYNCHRONIZING QUANT FLOW...</span>
                    </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis
                            dataKey="Datetime"
                            stroke="#444"
                            fontSize={11}
                            tickFormatter={formatXAxis}
                            minTickGap={30}
                        />
                        <YAxis
                            stroke="#444"
                            fontSize={11}
                            domain={['auto', 'auto']}
                            tickFormatter={(val) => `$${val.toFixed(2)}`}
                        />
                        <Tooltip
                            contentStyle={{ background: 'rgba(10,10,10,0.95)', border: '1px solid #333', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                            itemStyle={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}
                            labelStyle={{ color: '#888', marginBottom: '4px' }}
                            labelFormatter={(label) => new Date(label).toLocaleString()}
                        />

                        {/* Visual Intelligence Layers */}
                        {forecast?.expected_range && (
                            <ReferenceArea
                                y1={forecast.expected_range.min}
                                y2={forecast.expected_range.max}
                                fill="var(--accent-primary)"
                                fillOpacity={0.05}
                                strokeWidth={0}
                            />
                        )}
                        {forecast?.expected_range && (
                            <ReferenceLine y={forecast.expected_range.max} stroke="var(--accent-primary)" strokeDasharray="5 5" label={{ position: 'right', value: 'RANGE TOP', fill: 'var(--accent-primary)', fontSize: 10 }} />
                        )}
                        {forecast?.expected_range && (
                            <ReferenceLine y={forecast.expected_range.min} stroke="var(--accent-primary)" strokeDasharray="5 5" label={{ position: 'right', value: 'RANGE BOTTOM', fill: 'var(--accent-primary)', fontSize: 10 }} />
                        )}
                        {forecast?.invalidation_point && (
                            <ReferenceLine y={forecast.invalidation_point} stroke="var(--danger)" strokeWidth={2} label={{ position: 'left', value: 'INVALIDATION', fill: 'var(--danger)', fontSize: 10, fontWeight: 'bold' }} />
                        )}

                        <Line
                            type="monotone"
                            dataKey="Close"
                            stroke="var(--accent-primary)"
                            dot={false}
                            strokeWidth={3}
                            animationDuration={1000}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', opacity: loading ? 0.5 : 1 }}>
                <div className="terminal-border glass" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                        <Target size={18} />
                        <span style={{ fontWeight: '600' }}>EXPECTED RANGE</span>
                    </div>
                    <p style={{ fontSize: '1.2rem' }}>
                        {forecast?.expected_range?.min ? `$${forecast.expected_range.min.toFixed(2)}` : 'ANALYZING...'}
                        {forecast?.expected_range?.max ? ` - $${forecast.expected_range.max.toFixed(2)}` : ''}
                    </p>
                </div>

                <div className="terminal-border glass" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '600' }}>INVALIDATION POINT</span>
                    </div>
                    <p style={{ fontSize: '1.2rem' }}>
                        {forecast?.invalidation_point ? `$${forecast.invalidation_point.toFixed(2)}` : 'ANALYZING...'}
                    </p>
                </div>

                <div className="terminal-border glass" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '600' }}>BIAS</span>
                    </div>
                    <p style={{ fontSize: '1.2rem', color: forecast?.bias === 'bullish' ? 'var(--success)' : forecast?.bias === 'bearish' ? 'var(--danger)' : 'var(--text-secondary)' }}>
                        {forecast?.bias?.toUpperCase() || 'CALCULATING...'}
                    </p>
                </div>

                <div className="terminal-border glass" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>
                        <Activity size={18} />
                        <span style={{ fontWeight: '600' }}>QUANT SNAPSHOT</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {!forecast ? (
                            <div style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>
                                {metrics?.is_syncing ? (
                                    <>
                                        <RefreshCw size={12} className="animate-spin" style={{ display: 'inline', marginRight: '5px' }} />
                                        Engine is processing historical data. Please try again in 30s.
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle size={12} style={{ display: 'inline', marginRight: '5px' }} />
                                        Forecast currently unavailable for this asset class.
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>ATR Volatility:</span>
                                    <span style={{ color: 'white' }}>${forecast?.volatility_atr?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Confidence:</span>
                                    <span style={{ color: 'var(--accent-primary)' }}>{(forecast?.confidence * 100 || 0).toFixed(0)}%</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TickerDetails;
