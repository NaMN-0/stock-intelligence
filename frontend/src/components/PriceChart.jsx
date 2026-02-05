import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';

const PriceChart = ({ data, forecast, isBullish }) => {
    // Determine colors based on bias
    const strokeColor = 'var(--accent-primary)';

    // Fallback for empty data to prevent crashes
    if (!data || data.length === 0) {
        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="mono" style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>NO MARKET DATA AVAILABLE</span>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '350px' }}>
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="timestamp"
                        hide
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        orientation="right"
                        tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'monospace' }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                        allowDecimals={true}
                    />
                    <Tooltip
                        contentStyle={{
                            background: '#000',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                        }}
                        itemStyle={{ color: 'var(--accent-primary)' }}
                        labelStyle={{ color: 'var(--text-dim)', marginBottom: '0.5rem' }}
                        cursor={{ stroke: 'var(--text-dim)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />

                    {forecast?.expected_range && (
                        <ReferenceArea
                            y1={forecast.expected_range.min}
                            y2={forecast.expected_range.max}
                            fill={isBullish ? 'var(--success)' : 'var(--danger)'}
                            fillOpacity={0.05}
                        />
                    )}

                    {forecast?.invalidation_point && (
                        <ReferenceLine
                            y={forecast.invalidation_point}
                            stroke="var(--danger)"
                            strokeDasharray="3 3"
                            label={{
                                position: 'insideBottomRight',
                                value: 'INVALIDATION',
                                fill: 'var(--danger)',
                                fontSize: 9,
                                fontFamily: 'monospace'
                            }}
                        />
                    )}

                    <Line
                        type="monotone"
                        dataKey="Close"
                        stroke={strokeColor}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0, fill: '#fff' }}
                        animationDuration={800}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PriceChart;
