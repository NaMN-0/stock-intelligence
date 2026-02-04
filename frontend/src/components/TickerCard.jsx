import React from 'react';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

const TickerCard = ({ ticker, price, signal, onClick }) => {
    const isBullish = signal?.signal === 'bullish';
    const isBearish = signal?.signal === 'bearish';
    const isPenny = price > 0 && price < 5.0;

    const SignalIcon = isBullish ? TrendingUp : isBearish ? TrendingDown : Minus;
    const signalColor = isBullish ? 'var(--success)' : isBearish ? 'var(--danger)' : 'var(--text-secondary)';

    return (
        <div
            className="glass terminal-border animate-fade-in"
            onClick={() => onClick(ticker)}
            style={{
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                borderTop: isPenny ? '2px solid var(--accent-secondary)' : '1px solid var(--border)'
            }}
        >
            {isPenny && (
                <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '10px',
                    background: 'var(--accent-secondary)',
                    color: 'white',
                    fontSize: '0.6rem',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: '800',
                    letterSpacing: '1px',
                    boxShadow: '0 0 10px var(--accent-secondary)'
                }}>
                    PENNY
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-primary)', letterSpacing: '-0.5px' }}>{ticker}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: '700', fontFamily: 'monospace' }}>
                        ${price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '---'}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: signalColor }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: '80px' }}>
                    <SignalIcon size={18} />
                    <span style={{ fontSize: '0.8rem', fontWeight: '800' }}>{signal?.signal?.toUpperCase() || 'STABLE'}</span>
                </div>
                <div style={{ height: '4px', flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                        style={{
                            height: '100%',
                            width: `${(signal?.confidence || 0) * 100}%`,
                            background: signalColor,
                            boxShadow: `0 0 10px ${signalColor}`
                        }}
                    />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', fontFamily: 'monospace' }}>
                    {((signal?.confidence || 0) * 100).toFixed(0)}%
                </span>
            </div>

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Activity size={12} />
                    {signal?.strategy || 'Analyzing...'}
                </div>
                <div>
                    {new Date().toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
};

export default TickerCard;
