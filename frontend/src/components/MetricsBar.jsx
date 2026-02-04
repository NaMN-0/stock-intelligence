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
            gridTemplateColumns: '1fr',
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
        </div>
    );
};

export default MetricsBar;
