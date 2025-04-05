// components/WatchlistPerformance.jsx

import React, { useState } from 'react';

const WatchlistPerformance = ({ watchlist, onRemove }) => {
    const [sortConfig, setSortConfig] = useState({
        key: 'ticker',
        direction: 'ascending'
    });
    const [timeframe, setTimeframe] = useState('dailyChange');

    const timeframeLabels = {
        dailyChange: 'Daily',
        weeklyChange: 'Weekly',
        monthlyChange: 'Monthly',
        yearToDateChange: 'YTD'
    };

    // Sort watchlist based on current sort config
    const sortedWatchlist = [...watchlist].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    // Function to request a sort
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Function to get the sort direction indicator
    const getSortDirectionIndicator = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
        }
        return '';
    };

    // Function to get color based on percentage change
    const getColorForChange = (change) => {
        if (change > 0) return '#4caf50'; // Green for positive
        if (change < 0) return '#f44336'; // Red for negative
        return '#757575'; // Gray for no change
    };

    // Function to get color for RSI
    const getColorForRSI = (rsi) => {
        if (rsi <= 30) return '#4caf50'; // Green for oversold (buying opportunity)
        if (rsi >= 70) return '#f44336'; // Red for overbought (selling opportunity)
        return '#757575'; // Gray for neutral
    };

    // Function to determine PE ratio status
    const getPEStatus = (currentPE, avgPE) => {
        const ratio = currentPE / avgPE;

        if (ratio < 0.8) return { text: 'Undervalued', color: '#4caf50' };
        if (ratio < 0.95) return { text: 'Slightly Undervalued', color: '#8bc34a' };
        if (ratio < 1.05) return { text: 'Fair Valued', color: '#ffeb3b' };
        if (ratio < 1.2) return { text: 'Slightly Overvalued', color: '#ff9800' };
        return { text: 'Overvalued', color: '#f44336' };
    };

    return (
        <div className="dashboard-card watchlist-performance">
            <div className="card-header">
                <h3>Watchlist Performance</h3>
                <div className="timeframe-selector">
                    <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="timeframe-select"
                    >
                        {Object.entries(timeframeLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="watchlist-table-container">
                <table className="watchlist-table">
                    <thead>
                    <tr>
                        <th onClick={() => requestSort('ticker')}>
                            Ticker{getSortDirectionIndicator('ticker')}
                        </th>
                        <th onClick={() => requestSort('price')}>
                            Price{getSortDirectionIndicator('price')}
                        </th>
                        <th onClick={() => requestSort(timeframe)}>
                            {timeframeLabels[timeframe]} Change{getSortDirectionIndicator(timeframe)}
                        </th>
                        <th onClick={() => requestSort('volume')}>
                            Volume{getSortDirectionIndicator('volume')}
                        </th>
                        <th onClick={() => requestSort('rsi')}>
                            RSI{getSortDirectionIndicator('rsi')}
                        </th>
                        <th onClick={() => requestSort('pe')}>
                            P/E{getSortDirectionIndicator('pe')}
                        </th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedWatchlist.map((stock) => {
                        const peStatus = getPEStatus(stock.pe, stock.historicalAvgPE);
                        const volumeRatio = stock.volume / stock.avgVolume;

                        return (
                            <tr key={stock.ticker}>
                                <td className="stock-ticker">{stock.ticker}</td>
                                <td className="stock-price">${stock.price.toFixed(2)}</td>
                                <td
                                    className="stock-change"
                                    style={{ color: getColorForChange(stock[timeframe]) }}
                                >
                                    {stock[timeframe] > 0 ? '+' : ''}{stock[timeframe].toFixed(2)}%
                                </td>
                                <td
                                    className="stock-volume"
                                    style={{ color: volumeRatio > 1.5 ? '#ff9800' : '#757575' }}
                                >
                                    {(stock.volume / 1000000).toFixed(1)}M
                                    {volumeRatio > 1.5 && <span className="volume-spike"> (High)</span>}
                                </td>
                                <td
                                    className="stock-rsi"
                                    style={{ color: getColorForRSI(stock.rsi) }}
                                >
                                    {stock.rsi.toFixed(1)}
                                    {stock.rsi <= 30 && <span className="rsi-signal"> (Buy)</span>}
                                </td>
                                <td
                                    className="stock-pe"
                                    style={{ color: peStatus.color }}
                                >
                                    {stock.pe.toFixed(1)}
                                    <span className="pe-status"> ({peStatus.text})</span>
                                </td>
                                <td className="stock-actions">
                                    <button
                                        className="remove-button"
                                        onClick={() => onRemove(stock.ticker)}
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            <div className="watchlist-summary">
                <h4>Bottom Signals in Watchlist</h4>
                <div className="summary-metrics">
                    <div className="summary-metric">
                        <div className="metric-label">Oversold Stocks (RSI &lt; 30)</div>
                        <div className="metric-value">
                            {watchlist.filter(stock => stock.rsi < 30).length} / {watchlist.length}
                        </div>
                    </div>
                    <div className="summary-metric">
                        <div className="metric-label">Undervalued (P/E &lt; Historical)</div>
                        <div className="metric-value">
                            {watchlist.filter(stock => stock.pe < stock.historicalAvgPE * 0.9).length} / {watchlist.length}
                        </div>
                    </div>
                    <div className="summary-metric">
                        <div className="metric-label">High Volume Activity</div>
                        <div className="metric-value">
                            {watchlist.filter(stock => stock.volume > stock.avgVolume * 1.5).length} / {watchlist.length}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatchlistPerformance;
