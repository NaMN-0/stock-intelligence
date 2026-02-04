import React from 'react';
import { Activity, ShieldAlert, Database, Clock } from 'lucide-react';

const MetricsBar = ({ metrics }) => {
    const formatUptime = (seconds) => {
        if (!seconds) return '0s';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h}h ${m}m ${s}s`;
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
        }}>
            <div className="glass terminal-border" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }} title="Total unique symbols currently tracked by Quant Sourcer">
                <Activity className="text-secondary" size={20} />
                <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>ACTIVE UNIVERSE</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{metrics?.total_tickers || 0} ASSETS</p>
                </div>
            </div>

            <div className="glass terminal-border" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Database className="text-secondary" size={20} />
                <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>MARKET INTEL SYNCED</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{metrics?.data_processed_mb?.toFixed(2) || '0.00'} MB</p>
                </div>
            </div>

            <div className="glass terminal-border" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldAlert className={metrics?.errors_count > 0 ? "text-danger" : "text-secondary"} size={20} />
                <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>SYSTEM ERRORS</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: metrics?.errors_count > 0 ? 'var(--danger)' : 'white' }}>{metrics?.errors_count || 0} ALERTS</p>
                </div>
            </div>

            <div className="glass terminal-border" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock className="text-secondary" size={20} />
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>ENGINE UPTIME</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{formatUptime(metrics?.uptime_seconds)}</p>
                </div>
                <div style={{ paddingLeft: '1rem', borderLeft: '1px solid var(--border)', minWidth: '100px' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>SESSION</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--accent-secondary)' }}>
                        {metrics?.market_session?.toUpperCase() || 'OFFLINE'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MetricsBar;
