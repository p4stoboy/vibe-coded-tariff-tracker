// components/TechnicalSignals.jsx

import React from 'react';

const TechnicalSignals = ({ indicators, signalStrength }) => {
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

    // Helper function to determine price relative to moving averages
    const getPriceToMAStatus = (price, ma) => {
        const percentage = ((price / ma) - 1) * 100;

        if (percentage > 5) return { text: 'Well Above', color: '#4caf50' };
        if (percentage > 0) return { text: 'Above', color: '#8bc34a' };
        if (percentage > -5) return { text: 'Below', color: '#ff9800' };
        return { text: 'Well Below', color: '#f44336' };
    };

    // Get RSI status and color
    const getRSIStatus = (rsi) => {
        if (rsi <= 30) return { text: 'Oversold', color: '#4caf50' }; // Green for oversold (buying opportunity)
        if (rsi <= 40) return { text: 'Approaching Oversold', color: '#8bc34a' };
        if (rsi >= 70) return { text: 'Overbought', color: '#f44336' }; // Red for overbought (selling opportunity)
        if (rsi >= 60) return { text: 'Approaching Overbought', color: '#ff9800' };
        return { text: 'Neutral', color: '#757575' };
    };

    const sma50Status = getPriceToMAStatus(indicators.spy.price, indicators.spy.sma50);
    const sma200Status = getPriceToMAStatus(indicators.spy.price, indicators.spy.sma200);
    const rsiStatus = getRSIStatus(indicators.spy.rsi);

    return (
        <div className="dashboard-card technical-signals">
            <h3>Technical Signals</h3>

            <div className="spy-price-container">
                <div className="spy-price">
                    <span className="price-value">${indicators.spy.price.toFixed(2)}</span>
                    <span className="price-label">S&P 500 (SPY)</span>
                </div>
            </div>

            <div className="moving-averages">
                <h4>Moving Averages</h4>
                <div className="ma-grid">
                    <div className="ma-row">
                        <div className="ma-label">50-Day MA</div>
                        <div className="ma-value">${indicators.spy.sma50.toFixed(2)}</div>
                        <div className="ma-status" style={{ color: sma50Status.color }}>
                            {sma50Status.text}
                        </div>
                    </div>
                    <div className="ma-row">
                        <div className="ma-label">200-Day MA</div>
                        <div className="ma-value">${indicators.spy.sma200.toFixed(2)}</div>
                        <div className="ma-status" style={{ color: sma200Status.color }}>
                            {sma200Status.text}
                        </div>
                    </div>
                </div>
            </div>

            <div className="rsi-container">
                <h4>Relative Strength Index (RSI)</h4>
                <div className="rsi-meter">
                    <div className="rsi-value" style={{ color: rsiStatus.color }}>
                        {indicators.spy.rsi.toFixed(1)}
                    </div>
                    <div className="rsi-status">{rsiStatus.text}</div>
                    <div className="rsi-bar-container">
                        <div className="rsi-zones">
                            <div className="rsi-zone oversold"></div>
                            <div className="rsi-zone neutral"></div>
                            <div className="rsi-zone overbought"></div>
                        </div>
                        <div
                            className="rsi-indicator"
                            style={{ left: `${indicators.spy.rsi}%` }}
                        ></div>
                    </div>
                    <div className="rsi-labels">
                        <span>30</span>
                        <span>50</span>
                        <span>70</span>
                    </div>
                </div>
            </div>

            <div className="key-patterns">
                <h4>Key Technical Patterns</h4>
                <div className="patterns-grid">
                    <div className="pattern-item">
                        <div className="pattern-icon">
                            {indicators.macdDivergence ? '✅' : '❌'}
                        </div>
                        <div className="pattern-label">
                            Positive MACD Divergence
                        </div>
                    </div>
                    <div className="pattern-item">
                        <div className="pattern-icon">
                            {indicators.rsiOversold ? '✅' : '❌'}
                        </div>
                        <div className="pattern-label">
                            RSI Oversold Condition
                        </div>
                    </div>
                    <div className="pattern-item">
                        <div className="pattern-icon">
                            {indicators.bullishReversalPatterns > 0 ? '✅' : '❌'}
                        </div>
                        <div className="pattern-label">
                            Bullish Reversal Patterns
                            {indicators.bullishReversalPatterns > 0 &&
                                <span className="pattern-count"> ({indicators.bullishReversalPatterns})</span>
                            }
                        </div>
                    </div>
                </div>
            </div>

            <div className="bottom-signal" style={{ backgroundColor: signal.color }}>
                <div className="signal-text">{signal.text}</div>
            </div>

            <div className="technical-notes">
                <p><strong>Technical signals at market bottoms:</strong></p>
                <ul>
                    <li>RSI moving from oversold to higher levels</li>
                    <li>Positive divergence between price and momentum indicators</li>
                    <li>Formation of reversal patterns (double bottoms, inverse head & shoulders)</li>
                    <li>Price stabilization near key support levels</li>
                </ul>
            </div>
        </div>
    );
};

export default TechnicalSignals;
