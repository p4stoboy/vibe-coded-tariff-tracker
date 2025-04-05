// components/SentimentIndicator.jsx

import React from 'react';

const SentimentIndicator = ({ sentiment, signalStrength }) => {
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

    // Helper to get color based on value thresholds
    const getColorForFearGreed = (value) => {
        if (value <= 25) return '#e53935'; // Extreme Fear - Red
        if (value <= 40) return '#ff9800'; // Fear - Orange
        if (value <= 60) return '#ffeb3b'; // Neutral - Yellow
        if (value <= 75) return '#43a047'; // Greed - Green
        return '#1e88e5'; // Extreme Greed - Blue
    };

    const fearGreedLabel = () => {
        const value = sentiment.fearGreedIndex;
        if (value <= 25) return 'Extreme Fear';
        if (value <= 40) return 'Fear';
        if (value <= 60) return 'Neutral';
        if (value <= 75) return 'Greed';
        return 'Extreme Greed';
    };

    // Render a gauge component for the Fear/Greed index
    const renderFearGreedGauge = () => {
        const value = sentiment.fearGreedIndex;
        const rotation = (value / 100) * 180; // Convert 0-100 scale to 0-180 degrees

        return (
            <div className="fear-greed-gauge">
                <div className="gauge-background">
                    <div className="gauge-segment extreme-fear"></div>
                    <div className="gauge-segment fear"></div>
                    <div className="gauge-segment neutral"></div>
                    <div className="gauge-segment greed"></div>
                    <div className="gauge-segment extreme-greed"></div>
                    <div
                        className="gauge-needle"
                        style={{ transform: `rotate(${rotation - 90}deg)` }}
                    ></div>
                </div>
                <div className="gauge-value" style={{ color: getColorForFearGreed(value) }}>
                    {value.toFixed(0)}
                    <span className="gauge-label">{fearGreedLabel()}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard-card sentiment-indicator">
            <h3>Market Sentiment Indicators</h3>

            <div className="sentiment-main-indicators">
                {renderFearGreedGauge()}

                <div className="put-call-container">
                    <div className="indicator-label">Put/Call Ratio</div>
                    <div className="indicator-value">
                        {sentiment.putCallRatio.toFixed(2)}
                        <span className={sentiment.putCallRatio > 1.1 ? 'bullish-signal' : 'no-signal'}>
              {sentiment.putCallRatio > 1.1 ? ' 📈 Bullish Signal' : ''}
            </span>
                    </div>
                    <div className="indicator-info">
                        Values &gt; 1.1 often indicate excessive pessimism (contrarian bullish)
                    </div>
                </div>
            </div>

            <div className="aaii-sentiment">
                <h4>AAII Investor Sentiment</h4>
                <div className="aaii-bars">
                    <div className="aaii-bar">
                        <div className="bar-label">Bullish</div>
                        <div className="bar-container">
                            <div
                                className="bar-fill bullish"
                                style={{ width: `${sentiment.aaii.bullish}%` }}
                            ></div>
                        </div>
                        <div className="bar-value">{sentiment.aaii.bullish.toFixed(1)}%</div>
                    </div>
                    <div className="aaii-bar">
                        <div className="bar-label">Bearish</div>
                        <div className="bar-container">
                            <div
                                className="bar-fill bearish"
                                style={{ width: `${sentiment.aaii.bearish}%` }}
                            ></div>
                        </div>
                        <div className="bar-value">{sentiment.aaii.bearish.toFixed(1)}%</div>
                    </div>
                    <div className="aaii-bar">
                        <div className="bar-label">Neutral</div>
                        <div className="bar-container">
                            <div
                                className="bar-fill neutral"
                                style={{ width: `${sentiment.aaii.neutral}%` }}
                            ></div>
                        </div>
                        <div className="bar-value">{sentiment.aaii.neutral.toFixed(1)}%</div>
                    </div>
                </div>
                <div className="bull-bear-spread">
                    <div className="spread-label">Bull-Bear Spread</div>
                    <div className={`spread-value ${sentiment.bullBearSpread < -10 ? 'contrarian-bullish' : ''}`}>
                        {sentiment.bullBearSpread.toFixed(1)}%
                        {sentiment.bullBearSpread < -10 ? ' (Contrarian Bullish)' : ''}
                    </div>
                </div>
            </div>

            <div className="institutional-flows">
                <h4>Institutional Money Flows</h4>
                <div className="flow-meter">
                    <div className="flow-label">Fund Flows</div>
                    <div className="flow-container">
                        <div
                            className={`flow-indicator ${sentiment.institutionalFlows < 0 ? 'negative' : 'positive'}`}
                            style={{
                                width: `${Math.min(Math.abs(sentiment.institutionalFlows) * 5, 100)}%`,
                                marginLeft: sentiment.institutionalFlows < 0 ? 'auto' : '0'
                            }}
                        ></div>
                    </div>
                    <div className="flow-labels">
                        <span>Outflows</span>
                        <span>Inflows</span>
                    </div>
                    <div className="flow-value">
                        {sentiment.institutionalFlows > 0 ? '+' : ''}{sentiment.institutionalFlows.toFixed(1)} bn USD
                    </div>
                </div>
            </div>

            <div className="bottom-signal" style={{ backgroundColor: signal.color }}>
                <div className="signal-text">{signal.text}</div>
            </div>

            <div className="sentiment-notes">
                <p><strong>Contrarian signals for market bottoms:</strong></p>
                <ul>
                    <li>Fear & Greed Index below 20 (Extreme Fear)</li>
                    <li>Put/Call ratio above 1.2</li>
                    <li>Bull-Bear spread below -15%</li>
                    <li>High outflows from equity funds</li>
                </ul>
            </div>
        </div>
    );
};

export default SentimentIndicator;
