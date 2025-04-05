// components/ValuationMetrics.jsx

import React from 'react';

const ValuationMetrics = ({ valuations, signalStrength }) => {
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

    // Calculate the relative valuation (current vs historical)
    const calculateRelativeValuation = (current, historical) => {
        const percentage = (current / historical) * 100;
        return percentage.toFixed(1);
    };

    // Get color based on relative valuation
    const getValueColor = (current, historical, lowerIsBetter = true) => {
        const ratio = current / historical;

        if (lowerIsBetter) {
            if (ratio < 0.8) return '#4caf50'; // Significantly below historical (good)
            if (ratio < 0.95) return '#8bc34a'; // Moderately below historical (good)
            if (ratio < 1.05) return '#ffeb3b'; // Around historical (neutral)
            if (ratio < 1.2) return '#ff9800'; // Moderately above historical (caution)
            return '#f44336'; // Significantly above historical (expensive)
        } else {
            if (ratio > 1.2) return '#4caf50'; // Significantly above historical (good)
            if (ratio > 1.05) return '#8bc34a'; // Moderately above historical (good)
            if (ratio > 0.95) return '#ffeb3b'; // Around historical (neutral)
            if (ratio > 0.8) return '#ff9800'; // Moderately below historical (caution)
            return '#f44336'; // Significantly below historical (bad)
        }
    };

    // Render a comparison bar for visual representation
    const renderComparisonBar = (current, historical, lowerIsBetter = true) => {
        const ratio = current / historical;
        const percentage = lowerIsBetter
            ? Math.min(ratio * 100, 150) // Cap at 150% for visualization
            : Math.min((1/ratio) * 100, 150); // Inverse for higher is better metrics

        return (
            <div className="comparison-bar-container">
                <div className="comparison-marker historical"></div>
                <div
                    className="comparison-bar"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: getValueColor(current, historical, lowerIsBetter),
                        marginLeft: lowerIsBetter ? '0' : 'auto'
                    }}
                ></div>
                <div className="comparison-scale">
                    <span>{lowerIsBetter ? '0' : '2x'}</span>
                    <span className="historical-marker">{historical.toFixed(2)}</span>
                    <span>{lowerIsBetter ? '2x' : '0'}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard-card valuation-metrics">
            <h3>Market Valuation Metrics</h3>

            <div className="valuation-grid">
                <div className="valuation-metric">
                    <div className="metric-header">
                        <h4>Price-to-Earnings (P/E)</h4>
                        <div className="relative-value">
                            <div className="current-value" style={{ color: getValueColor(valuations.averagePE, valuations.historicalPE) }}>
                                {valuations.averagePE.toFixed(2)}
                            </div>
                            <div className="historical-value">
                                vs. Historical: {valuations.historicalPE.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    {renderComparisonBar(valuations.averagePE, valuations.historicalPE)}
                    <div className="relative-percentage" style={{ color: getValueColor(valuations.averagePE, valuations.historicalPE) }}>
                        {calculateRelativeValuation(valuations.averagePE, valuations.historicalPE)}% of historical
                        {valuations.averagePE < valuations.historicalPE * 0.9 &&
                            <span className="value-signal positive-signal"> 📉 Potentially Undervalued</span>
                        }
                    </div>
                </div>

                <div className="valuation-metric">
                    <div className="metric-header">
                        <h4>Price-to-Book (P/B)</h4>
                        <div className="relative-value">
                            <div className="current-value" style={{ color: getValueColor(valuations.averagePB, valuations.historicalPB) }}>
                                {valuations.averagePB.toFixed(2)}
                            </div>
                            <div className="historical-value">
                                vs. Historical: {valuations.historicalPB.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    {renderComparisonBar(valuations.averagePB, valuations.historicalPB)}
                    <div className="relative-percentage" style={{ color: getValueColor(valuations.averagePB, valuations.historicalPB) }}>
                        {calculateRelativeValuation(valuations.averagePB, valuations.historicalPB)}% of historical
                        {valuations.averagePB < valuations.historicalPB * 0.9 &&
                            <span className="value-signal positive-signal"> 📉 Potentially Undervalued</span>
                        }
                    </div>
                </div>

                <div className="valuation-metric">
                    <div className="metric-header">
                        <h4>Earnings Yield</h4>
                        <div className="relative-value">
                            <div className="current-value" style={{ color: getValueColor(valuations.earningsYield, valuations.historicalEarningsYield, false) }}>
                                {(valuations.earningsYield * 100).toFixed(2)}%
                            </div>
                            <div className="historical-value">
                                vs. Historical: {(valuations.historicalEarningsYield * 100).toFixed(2)}%
                            </div>
                        </div>
                    </div>
                    {renderComparisonBar(valuations.earningsYield, valuations.historicalEarningsYield, false)}
                    <div className="relative-percentage" style={{ color: getValueColor(valuations.earningsYield, valuations.historicalEarningsYield, false) }}>
                        {calculateRelativeValuation(valuations.earningsYield, valuations.historicalEarningsYield)}% of historical
                        {valuations.earningsYield > valuations.historicalEarningsYield * 1.1 &&
                            <span className="value-signal positive-signal"> 📈 Potentially Attractive</span>
                        }
                    </div>
                </div>
            </div>

            <div className="bottom-signal" style={{ backgroundColor: signal.color }}>
                <div className="signal-text">{signal.text}</div>
            </div>

            <div className="valuation-notes">
                <p><strong>Market bottom valuation signals:</strong></p>
                <ul>
                    <li>P/E ratio significantly below historical average (especially during non-recessionary periods)</li>
                    <li>P/B ratio approaching or below historical lows</li>
                    <li>Earnings yield significantly higher than historical average and/or bond yields</li>
                </ul>
            </div>
        </div>
    );
};

export default ValuationMetrics;
