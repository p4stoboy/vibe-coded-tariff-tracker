import React, { useState, useEffect } from 'react';
import { fetchMarketData } from '../services/marketDataService';
import BottomSignalMeter from './BottomSignalMeter';
import VixTracker from './VixTracker';
import SentimentIndicator from './SentimentIndicator';
import TechnicalSignals from './TechnicalSignals';
import MarketBreadth from './MarketBreadth';
import ValuationMetrics from './ValuationMetrics';
import SectorHeatmap from './SectorHeatmap';
import WatchlistPerformance from './WatchlistPerformance';

function Dashboard() {
    const [marketData, setMarketData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [bottomSignals, setBottomSignals] = useState({
        technicalSignals: 0,
        valuationMetrics: 0,
        marketBreadth: 0,
        volatility: 0,
        sentiment: 0
    });

    // Settings/configuration state
    const [refreshInterval, setRefreshInterval] = useState(300000); // 5 minutes by default
    const [watchlist, setWatchlist] = useState(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META']);
    const [sectors, setSectors] = useState(['Technology', 'Healthcare', 'Consumer Cyclical', 'Energy', 'Financials']);

    // Fetch market data on component mount and at refreshInterval
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await fetchMarketData(watchlist, sectors);
                setMarketData(data);
                analyzeBottomSignals(data);
                setLastUpdated(new Date());
            } catch (error) {
                console.error('Error fetching market data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, refreshInterval);

        return () => clearInterval(intervalId);
    }, [refreshInterval, watchlist, sectors]);

    // Analyze data for potential bottom signals
    const analyzeBottomSignals = (data) => {
        if (!data) return;

        // This is a simplified scoring system - in a real app, you would implement more sophisticated algorithms
        const signals = {
            technicalSignals: calculateTechnicalScore(data.technicalIndicators),
            valuationMetrics: calculateValuationScore(data.valuations),
            marketBreadth: calculateBreadthScore(data.marketBreadth),
            volatility: calculateVolatilityScore(data.vix, data.historicalVix),
            sentiment: calculateSentimentScore(data.sentiment)
        };

        setBottomSignals(signals);
    };

    // Example scoring functions (simplified)
    const calculateTechnicalScore = (indicators) => {
        // Check for positive divergences, bullish patterns, etc.
        let score = 0;
        if (indicators.macdDivergence) score += 1;
        if (indicators.rsiOversold) score += 1;
        if (indicators.bullishReversalPatterns > 0) score += 1;
        return Math.min(score, 3); // Cap at 3
    };

    const calculateValuationScore = (valuations) => {
        // Check for historically low P/E ratios, etc.
        let score = 0;
        if (valuations.averagePE < valuations.historicalPE * 0.8) score += 1;
        if (valuations.averagePB < valuations.historicalPB * 0.8) score += 1;
        if (valuations.earningsYield > valuations.historicalEarningsYield * 1.2) score += 1;
        return Math.min(score, 3);
    };

    const calculateBreadthScore = (breadth) => {
        // Check for market breadth indicators
        let score = 0;
        if (breadth.advanceDeclineRatio > 1) score += 1;
        if (breadth.percentAbove50DMA > 0.4) score += 1;
        if (breadth.newHighsVsNewLows > 0) score += 1;
        return Math.min(score, 3);
    };

    const calculateVolatilityScore = (vix, historicalVix) => {
        // Check for VIX patterns that might indicate a bottom
        let score = 0;
        if (vix > 30) score += 1;
        if (vix > historicalVix.avg90Day * 1.5) score += 1;
        if (vix < historicalVix.yesterday && vix > 25) score += 1;
        return Math.min(score, 3);
    };

    const calculateSentimentScore = (sentiment) => {
        // Check for extreme bearishness (contrarian indicator)
        let score = 0;
        if (sentiment.putCallRatio > 1.2) score += 1;
        if (sentiment.bullBearSpread < -10) score += 1;
        if (sentiment.fearGreedIndex < 20) score += 1;
        return Math.min(score, 3);
    };

    // Calculate overall bottom signal strength (0-100%)
    const calculateOverallSignal = () => {
        if (!bottomSignals) return 0;

        const maxPossibleScore = 15; // 5 categories, max 3 points each
        const totalScore = Object.values(bottomSignals).reduce((sum, score) => sum + score, 0);
        return Math.round((totalScore / maxPossibleScore) * 100);
    };

    // Manual refresh handler
    const handleRefresh = async () => {
        setLoading(true);
        try {
            const data = await fetchMarketData(watchlist, sectors);
            setMarketData(data);
            analyzeBottomSignals(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching market data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Add stock to watchlist
    const addToWatchlist = (ticker) => {
        if (!watchlist.includes(ticker.toUpperCase())) {
            setWatchlist([...watchlist, ticker.toUpperCase()]);
        }
    };

    // Remove stock from watchlist
    const removeFromWatchlist = (ticker) => {
        setWatchlist(watchlist.filter(stock => stock !== ticker));
    };

    return (
        <div className="app-container">
            <header>
                <h1>Market Bottom Tracker</h1>
                <div className="header-controls">
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="refresh-button"
                    >
                        {loading ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                    <div className="last-updated">
                        {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
                    </div>
                </div>
            </header>

            {loading && !marketData ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading market data...</p>
                </div>
            ) : (
                <>
                    <BottomSignalMeter signalValue={calculateOverallSignal()} />

                    <div className="dashboard-grid">
                        {marketData && (
                            <>
                                <VixTracker
                                    currentVix={marketData.vix}
                                    historicalVix={marketData.historicalVix}
                                    signalStrength={bottomSignals.volatility}
                                />

                                <SentimentIndicator
                                    sentiment={marketData.sentiment}
                                    signalStrength={bottomSignals.sentiment}
                                />

                                <ValuationMetrics
                                    valuations={marketData.valuations}
                                    signalStrength={bottomSignals.valuationMetrics}
                                />

                                <TechnicalSignals
                                    indicators={marketData.technicalIndicators}
                                    signalStrength={bottomSignals.technicalSignals}
                                />

                                <MarketBreadth
                                    breadth={marketData.marketBreadth}
                                    signalStrength={bottomSignals.marketBreadth}
                                />

                                <SectorHeatmap sectors={marketData.sectorPerformance} />

                                <WatchlistPerformance
                                    watchlist={marketData.watchlistData}
                                    onRemove={removeFromWatchlist}
                                />
                            </>
                        )}
                    </div>

                    <div className="watchlist-controls">
                        <h3>Manage Watchlist</h3>
                        <div className="add-stock-container">
                            <input
                                type="text"
                                placeholder="Add stock (e.g., AAPL)"
                                id="newStock"
                            />
                            <button onClick={() => {
                                const input = document.getElementById('newStock');
                                if (input.value) {
                                    addToWatchlist(input.value);
                                    input.value = '';
                                }
                            }}>
                                Add
                            </button>
                        </div>
                    </div>
                </>
            )}

            <footer>
                <p>Data refresh interval:
                    <select
                        value={refreshInterval}
                        onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    >
                        <option value={60000}>1 minute</option>
                        <option value={300000}>5 minutes</option>
                        <option value={900000}>15 minutes</option>
                    </select>
                </p>
                <p className="disclaimer">
                    Disclaimer: This tool provides general market information and is not financial advice.
                    Always conduct your own research before making investment decisions.
                </p>
            </footer>
        </div>
    );
}

export default Dashboard;
