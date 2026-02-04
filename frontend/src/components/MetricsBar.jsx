import React from 'react';
import { Activity, ShieldAlert, Database, Clock } from 'lucide-react';

const MetricsBar = ({ metrics }) => {
    const formatUptime = (seconds) => {
        if (!seconds) return '00:00:00';
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem'
        }}>
            <div className="glass terminal-border" style={{ padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '10px', background: 'rgba(0, 255, 213, 0.1)', borderRadius: '10px', color: 'var(--accent-primary)' }}>
                    <Activity size={20} />
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '900', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>Global Universe</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '900', color: 'white' }}>{metrics?.total_tickers || 0}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>ASSETS</span>
                    </div>
                </div>
            </div>

            <div className="glass terminal-border" style={{ padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '10px', background: 'rgba(0, 162, 255, 0.1)', borderRadius: '10px', color: 'var(--accent-secondary)' }}>
                    <Database size={20} />
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '900', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>Intel Cache</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '900', color: 'white' }}>{metrics?.data_processed_mb?.toFixed(2) || '0.00'}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>MB</span>
                    </div>
                </div>
            </div>

            <div className="glass terminal-border" style={{ padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                    padding: '10px',
                    background: metrics?.errors_count > 0 ? 'rgba(255, 45, 85, 0.1)' : 'rgba(255, 183, 0, 0.1)',
                    borderRadius: '10px',
                    color: metrics?.errors_count > 0 ? 'var(--danger)' : 'var(--warning)'
                }}>
                    <ShieldAlert size={20} />
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '900', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>System Integrity</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '900', color: metrics?.errors_count > 0 ? 'var(--danger)' : 'white' }}>
                            {metrics?.errors_count || 0}
                        </span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>ALERTS</span>
                    </div>
                </div>
            </div>

            <div className="glass terminal-border" style={{ padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '100px', color: 'var(--text-dim)' }}>
                    <Clock size={20} />
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '900', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>Runtime</p>
                    <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'white', fontFamily: 'var(--font-mono)' }}>{formatUptime(metrics?.uptime_seconds)}</span>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-glass)', paddingLeft: '12px', textAlign: 'right' }}>
                    <p style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '900', textTransform: 'uppercase', marginBottom: '2px' }}>Session</p>
                    <p style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--accent-secondary)' }}>{metrics?.market_session?.split(',')[0].toUpperCase() || 'OFFLINE'}</p>
                </div>
            </div>
        </div>
    );
};

export default MetricsBar;
