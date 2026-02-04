import React from 'react';
import { Zap, Shield, TrendingUp, BarChart3, ChevronRight, Globe, Cpu } from 'lucide-react';

const LandingPage = ({ onEnter }) => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-dark)',
            color: 'var(--text-main)',
            padding: '2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient Glows */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '20%',
                width: '40vw',
                height: '40vw',
                background: 'var(--accent-primary)',
                filter: 'blur(150px)',
                opacity: 0.05,
                zIndex: 0
            }} />
            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '10%',
                width: '30vw',
                height: '30vw',
                background: 'var(--accent-secondary)',
                filter: 'blur(150px)',
                opacity: 0.05,
                zIndex: 0
            }} />

            <div style={{ zIndex: 1, maxWidth: '1000px', width: '100%' }}>
                <div className="animate-fade-in" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '2.5rem', padding: '0.6rem 1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '2px', color: 'var(--accent-primary)' }}>
                    <Zap size={14} fill="currentColor" />
                    BETA ACCESS • v1.2.0
                </div>

                <h1 className="animate-fade-in" style={{
                    fontSize: 'clamp(3rem, 8vw, 6rem)',
                    fontWeight: '900',
                    marginBottom: '1.5rem',
                    letterSpacing: '-3px',
                    lineHeight: '0.9',
                    background: 'linear-gradient(to bottom, #fff 40%, rgba(255,255,255,0.4))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textTransform: 'uppercase'
                }}>
                    The Future of <br />
                    <span style={{ color: 'var(--accent-primary)', WebkitTextFillColor: 'initial' }}>Quant Intelligence</span>
                </h1>

                <p className="animate-fade-in" style={{
                    fontSize: 'clamp(1rem, 2vw, 1.4rem)',
                    color: 'var(--text-dim)',
                    marginBottom: '3.5rem',
                    maxWidth: '800px',
                    marginInline: 'auto',
                    lineHeight: '1.6',
                    fontWeight: '400'
                }}>
                    Quant Sourcer utilizes high-frequency data streams and adaptive neural models to provide institutional-grade signals for the global asset universe.
                </p>

                <div className="animate-fade-in" style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '6rem' }}>
                    <button
                        onClick={onEnter}
                        className="glass"
                        style={{
                            padding: '1.4rem 3.5rem',
                            fontSize: '1.1rem',
                            fontWeight: '900',
                            borderRadius: '12px',
                            background: 'var(--accent-primary)',
                            color: '#000',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            letterSpacing: '1px',
                            boxShadow: '0 0 30px rgba(0, 255, 213, 0.3)'
                        }}
                    >
                        LAUNCH CORE <ChevronRight size={20} />
                    </button>
                    <button
                        className="glass"
                        style={{
                            padding: '1.4rem 3.5rem',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            borderRadius: '12px',
                            color: '#fff',
                            cursor: 'pointer',
                            border: '1px solid var(--border-glass)',
                            transition: 'all 0.3s'
                        }}
                    >
                        READ SPEC
                    </button>
                </div>

                <div className="animate-fade-in" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.5rem',
                }}>
                    <div className="glass terminal-border" style={{ padding: '2rem', borderRadius: '16px', textAlign: 'left' }}>
                        <div style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem' }}>
                            <Shield size={24} />
                        </div>
                        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: '800' }}>ULTRA-LOW LATENCY</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: '1.5' }}>Proprietary data ingestion engine processing global market ticks with sub-second precision.</p>
                    </div>
                    <div className="glass terminal-border" style={{ padding: '2rem', borderRadius: '16px', textAlign: 'left' }}>
                        <div style={{ color: 'var(--accent-secondary)', marginBottom: '1.5rem' }}>
                            <Cpu size={24} />
                        </div>
                        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: '800' }}>NEURAL SELECTION</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: '1.5' }}>Machine learning models that dynamically rotate strategies based on volatility regimes.</p>
                    </div>
                    <div className="glass terminal-border" style={{ padding: '2rem', borderRadius: '16px', textAlign: 'left' }}>
                        <div style={{ color: 'var(--success)', marginBottom: '1.5rem' }}>
                            <Globe size={24} />
                        </div>
                        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: '800' }}>GLOBAL UNIVERSE</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: '1.5' }}>Seamless coverage across US Equities, Indian NSE/BSE, and Global Crypto markets.</p>
                    </div>
                </div>
            </div>

            <footer style={{
                position: 'absolute',
                bottom: '2.5rem',
                color: 'var(--text-muted)',
                fontSize: '0.7rem',
                letterSpacing: '2px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
            }}>
                &copy; 2026 QUANT SOURCER • ENCRYPTED DATA STREAM PHASE III
            </footer>
        </div>
    );
};

export default LandingPage;
