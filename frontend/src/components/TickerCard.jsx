import React from 'react';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

const TickerCard = ({ ticker, price, signal, onClick }) => {
    const isBullish = signal?.signal === 'bullish';
    const isBearish = signal?.signal === 'bearish';
    const isPenny = price > 0 && price < 5.0;

    const SignalIcon = isBullish ? TrendingUp : isBearish ? TrendingDown : Minus;
    const signalColor = isBullish ? 'var(--success)' : isBearish ? 'var(--danger)' : 'var(--text-dim)';

    return (
        <div
            className="glass premium-card animate-fade-in"
            onClick={() => onClick(ticker)}
            style={{
                padding: '1.25rem',
                cursor: 'pointer',
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                border: isPenny ? '1px solid var(--accent-secondary)' : '1px solid var(--border-glass)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}
        >
            {/* Scanning Line Animation */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: `linear-gradient(90deg, transparent, ${signalColor}, transparent)`,
                opacity: 0.3,
                animation: 'scanline 3s linear infinite'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '900',
                        color: 'white',
                        letterSpacing: '1px'
                    }}>{ticker}</h3>
                    {isPenny && (
                        <span style={{
                            fontSize: '0.6rem',
                            background: 'rgba(0, 162, 255, 0.15)',
                            color: 'var(--accent-secondary)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            border: '1px solid rgba(0, 162, 255, 0.3)'
                        }}>LOW_VAL</span>
                    )}
                </div>
                <div style={{
                    fontSize: '1.2rem',
                    fontWeight: '800',
                    fontFamily: 'var(--font-mono)',
                    color: 'white'
                }}>
                    ${price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '---'}
                </div>
            </div>

            <div className="glass" style={{
                padding: '0.75rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(0,0,0,0.2)'
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: `rgba(${isBullish ? '0,255,136' : isBearish ? '255,45,85' : '148,163,184'}, 0.1)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: signalColor
                }}>
                    <SignalIcon size={18} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {signal?.signal || 'IDENTIFYING'}
                        </span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'white', fontFamily: 'var(--font-mono)' }}>
                            {((signal?.confidence || 0) * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div
                            style={{
                                height: '100%',
                                width: `${(signal?.confidence || 0) * 100}%`,
                                background: signalColor,
                                boxShadow: `0 0 10px ${signalColor}`,
                                borderRadius: '2px'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                fontWeight: '600',
                letterSpacing: '0.5px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Activity size={12} color="var(--accent-primary)" />
                    <span style={{ color: 'var(--text-dim)' }}>{signal?.strategy?.toUpperCase() || 'CORE_ENGINE'}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)' }}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
            </div>
        </div>
    );
};

export default TickerCard;
