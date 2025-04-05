// components/MarketBreadth.jsx

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MarketBreadth = ({ breadth, signalStrength }) => {
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

    // Helper to get color based on value
    const getColorForValue = (value, threshold = 0) => {
        return value >= threshold ? '#4caf50' : '#f44336';
    };

    // Format percentage for display
    const formatPercent = (value) => {
        return `${(value * 100).toFixed(1)}%`;
    };

    // Prepare data for the new highs vs new lows chart
    const highsLowsData = [
        {
            name: 'New Highs vs Lows',
            value: breadth.newHighsVsNewLows
        }
    ];

    return (
        <div className="dashboard-card market-breadth">
            <h3>Market Breadth Indicators</h3>

            <div className="breadth-metrics">
                <div className="breadth-metric">
                    <div className="metric-label">Advance/Decline Ratio</div>
                    <div
                        className="metric-value"
                        style={{ color: getColorForValue(breadth.advanceDeclineRatio, 1) }}
                    >
                        {breadth.advanceDeclineRatio.toFixed(2)}
                    </div>
                    <div className="metric-description">
                        {breadth.advanceDeclineRatio >= 1
                            ? 'More advancing than declining stocks (positive)'
                            : 'More declining than advancing stocks (negative)'}
                    </div>
                </div>

                <div className="breadth-percentages">
                    <div className="percent-above-ma">
                        <div className="percent-header">
                            <div className="percent-label">Stocks Above 50-Day MA</div>
                            <div
                                className="percent-value"
                                style={{ color: getColorForValue(breadth.percentAbove50DMA, 0.5) }}
                            >
                                {formatPercent(breadth.percentAbove50DMA)}
                            </div>
                        </div>
                        <div className="percent-bar-container">
                            <div
                                className="percent-bar-fill"
                                style={{
                                    width: `${breadth.percentAbove50DMA * 100}%`,
                                    backgroundColor: getColorForValue(breadth.percentAbove50DMA, 0.5)
                                }}
                            ></div>
                        </div>
                    </div>

                    <div className="percent-above-ma">
                        <div className="percent-header">
                            <div className="percent-label">Stocks Above 200-Day MA</div>
                            <div
                                className="percent-value"
                                style={{ color: getColorForValue(breadth.percentAbove200DMA, 0.5) }}
                            >
                                {formatPercent(breadth.percentAbove200DMA)}
                            </div>
                        </div>
                        <div className="percent-bar-container">
                            <div
                                className="percent-bar-fill"
                                style={{
                                    width: `${breadth.percentAbove200DMA * 100}%`,
                                    backgroundColor: getColorForValue(breadth.percentAbove200DMA, 0.5)
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="highs-lows-chart">
                <h4>New 52-Week Highs vs. Lows</h4>
                <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={highsLowsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[-100, 100]} />
                        <YAxis type="category" dataKey="name" hide />
                        <Tooltip formatter={(value) => [`${value} stocks`, 'Net New Highs']} />
                        <Bar
                            dataKey="value"
                            fill={breadth.newHighsVsNewLows >= 0 ? '#4caf50' : '#f44336'}
                            radius={[4, 4, 4, 4]}
                        />
                    </BarChart>
                </ResponsiveContainer>
                <div className="chart-caption">
                    {breadth.newHighsVsNewLows >= 0
                        ? `${breadth.newHighsVsNewLows} more stocks making new highs than lows`
                        : `${Math.abs(breadth.newHighsVsNewLows)} more stocks making new lows than highs`}
                </div>
            </div>

            <div className="oscillator">
                <h4>McClellan Oscillator</h4>
                <div
                    className="oscillator-value"
                    style={{ color: getColorForValue(breadth.mcClellanOscillator, 0) }}
                >
                    {breadth.mcClellanOscillator.toFixed(1)}
                </div>
                <div className="oscillator-scale">
                    <span>-100</span>
                    <span>0</span>
                    <span>+100</span>
                </div>
                <div className="oscillator-bar-container">
                    <div
                        className="oscillator-bar"
                        style={{
                            width: `${Math.abs(breadth.mcClellanOscillator / 2)}%`,
                            marginLeft: breadth.mcClellanOscillator >= 0 ? '50%' : `${50 - Math.abs(breadth.mcClellanOscillator / 2)}%`,
                            backgroundColor: getColorForValue(breadth.mcClellanOscillator, 0)
                        }}
                    ></div>
                </div>
                <div className="oscillator-description">
                    {breadth.mcClellanOscillator <= -70 ? 'Deeply oversold (potential bottom)' :
                        breadth.mcClellanOscillator <= -30 ? 'Oversold' :
                            breadth.mcClellanOscillator >= 70 ? 'Overbought' :
                                breadth.mcClellanOscillator >= 30 ? 'Moderately overbought' :
                                    'Neutral'}
                </div>
            </div>

            <div className="bottom-signal" style={{ backgroundColor: signal.color }}>
                <div className="signal-text">{signal.text}</div>
            </div>

            <div className="breadth-notes">
                <p><strong>Key market bottom breadth signals:</strong></p>
                <ul>
                    <li>McClellan Oscillator deeply oversold (&lt; -70) then turning up</li>
                    <li>Low percentage of stocks above moving averages followed by improvement</li>
                    <li>Advance/Decline ratio improving after prolonged weakness</li>
                </ul>
            </div>
        </div>
    );
};

export default MarketBreadth;
