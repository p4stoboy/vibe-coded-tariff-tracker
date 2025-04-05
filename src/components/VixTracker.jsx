// components/VixTracker.jsx

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const VixTracker = ({ currentVix, historicalVix, signalStrength }) => {
    // Prepare data for the chart
    const chartData = historicalVix.daily.map((value, index) => ({
        day: index - historicalVix.daily.length + 1, // Negative days to show days ago
        vix: value
    }));

    // Add current day
    chartData.push({
        day: 0,
        vix: currentVix
    });

    // Calculate signal status
    const getSignalStatus = () => {
        switch(signalStrength) {
            case 0:
                return { text: 'No bottom signal', color: '#f44336' };
            case 1:
                return { text: 'Weak bottom signal', color: '#ff9800' };
            case 2:
                return { text: 'Moderate bottom signal', color: '#2196f3' };
            case 3:
                return { text: 'Strong bottom signal', color: '#4caf50' };
            default:
                return { text: 'Unknown', color: '#9e9e9e' };
        }
    };

    const signal = getSignalStatus();

    // VIX level interpretations
    const getVixInterpretation = (vixValue) => {
        if (vixValue < 15) return 'Low volatility - market complacency';
        if (vixValue < 20) return 'Normal market conditions';
        if (vixValue < 30) return 'Elevated uncertainty';
        if (vixValue < 40) return 'High fear/uncertainty';
        return 'Extreme market stress/panic';
    };

    return (
        <div className="dashboard-card vix-tracker">
            <h3>VIX Volatility Tracker</h3>

            <div className="vix-current">
                <div className="vix-value">{currentVix.toFixed(2)}</div>
                <div className="vix-label">CBOE Volatility Index</div>
                <div className="vix-interpretation">{getVixInterpretation(currentVix)}</div>
            </div>

            <div className="vix-chart">
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="day"
                            label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                            domain={['dataMin - 5', 'dataMax + 5']}
                            label={{ value: 'VIX', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            formatter={(value) => [value.toFixed(2), 'VIX']}
                            labelFormatter={(value) => value === 0 ? 'Today' : `${Math.abs(value)} days ago`}
                        />
                        <Line
                            type="monotone"
                            dataKey="vix"
                            stroke="#8884d8"
                            dot={{ r: 1 }}
                            activeDot={{ r: 5 }}
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="vix-metrics">
                <div className="metric">
                    <div className="metric-label">30-Day Avg</div>
                    <div className="metric-value">{historicalVix.avg30Day.toFixed(2)}</div>
                </div>
                <div className="metric">
                    <div className="metric-label">90-Day Avg</div>
                    <div className="metric-value">{historicalVix.avg90Day.toFixed(2)}</div>
                </div>
                <div className="metric">
                    <div className="metric-label">Daily Change</div>
                    <div className={`metric-value ${currentVix > historicalVix.yesterday ? 'up' : 'down'}`}>
                        {((currentVix - historicalVix.yesterday) / historicalVix.yesterday * 100).toFixed(2)}%
                    </div>
                </div>
            </div>

            <div className="bottom-signal" style={{ backgroundColor: signal.color }}>
                <div className="signal-text">{signal.text}</div>
            </div>

            <div className="vix-notes">
                <p><strong>Bottom indicators:</strong></p>
                <ul>
                    <li>VIX spike above 30 followed by decline</li>
                    <li>VIX significantly above 90-day average</li>
                    <li>Lower highs forming in VIX as market finds support</li>
                </ul>
            </div>
        </div>
    );
};

export default VixTracker;
