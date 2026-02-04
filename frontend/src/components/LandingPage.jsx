import React from 'react';
import { Zap, Shield, TrendingUp, BarChart3, ChevronRight, Globe, Cpu } from 'lucide-react';

const LandingPage = ({ onEnter }) => {
    return (
        <div className="landing-container" style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #111 0%, #000 100%)',
            color: 'white',
            padding: '2rem',
            textAlign: 'center',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Animated Background Elements */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '5%',
                width: '300px',
                height: '300px',
                background: 'var(--accent-primary)',
                filter: 'blur(150px)',
                opacity: 0.1,
                zIndex: 0
            }} />
            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '5%',
                width: '400px',
                height: '400px',
                background: 'var(--accent-secondary)',
                filter: 'blur(150px)',
                opacity: 0.1,
                zIndex: 0
            }} />

            <div style={{ zIndex: 1, maxWidth: '900px' }}>
                <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    marginBottom: '2rem',
                    padding: '0.5rem 1.5rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '100px',
                    fontSize: '0.8rem',
                    letterSpacing: '2px',
                    color: 'var(--accent-primary)'
                }}>
                    <Zap size={14} fill="currentColor" />
                    BETA ACCESS v1.0.0
                </div>

                <h1 style={{ 
                    fontSize: '4.5rem', 
                    fontWeight: '900', 
                    marginBottom: '1.5rem',
                    letterSpacing: '-2px',
                    lineHeight: '1',
                    background: 'linear-gradient(to bottom, #fff 0%, #888 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    QUANT SOURCER
                </h1>

                <p style={{ 
                    fontSize: '1.4rem', 
                    color: 'var(--text-secondary)', 
                    marginBottom: '3rem',
                    maxWidth: '700px',
                    marginInline: 'auto',
                    lineHeight: '1.6'
                }}>
                    Democratizing institutional-grade market intelligence. 
                    Complexity simplified into actionable real-time insights for the modern digital asset landscape.
                </p>

                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '5rem' }}>
                    <button 
                        onClick={onEnter}
                        className="btn-primary"
                        style={{
                            padding: '1.2rem 2.5rem',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            background: 'var(--accent-primary)',
                            color: 'black',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                    >
                        LAUNCH TERMINAL <ChevronRight size={20} />
                    </button>
                    <button 
                        style={{
                            padding: '1.2rem 2.5rem',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'white',
                            border: '1px solid var(--border)',
                            cursor: 'pointer'
                        }}
                    >
                        READ VISION
                    </button>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '2rem',
                    textAlign: 'left'
                }}>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                        <Shield className="text-secondary" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>CORE STABILITY</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Built on resilient, high-availability architecture for non-stop polling.</p>
                    </div>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                        <Cpu className="text-secondary" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>MULTI-STRAT</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Dynamic strategy selection engine that adapts to market volatility.</p>
                    </div>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                        <Globe className="text-secondary" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>GLOBAL SCOPE</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>A massive, incrementally growing universe of over 2,000 assets.</p>
                    </div>
                </div>
            </div>

            <footer style={{ 
                position: 'absolute', 
                bottom: '2rem', 
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                opacity: 0.5
            }}>
                &copy; 2026 QUANT SOURCER ENGINE. ALL RIGHTS RESERVED.
            </footer>
        </div>
    );
};

export default LandingPage;
