// components/SectorHeatmap.jsx

import React, { useState } from 'react';

const SectorHeatmap = ({ sectors }) => {
    const [timeframe, setTimeframe] = useState('dailyChange');

    const timeframeLabels = {
        dailyChange: 'Daily Change',
        weeklyChange: 'Weekly Change',
        monthlyChange: 'Monthly Change',
        yearToDateChange: 'Year-to-Date'
    };

    // Sort sectors from best to worst performing
    const sortedSectors = [...sectors].sort((a, b) => b[timeframe] - a[timeframe]);

    // Function to get color based on percentage change
    const getColorForChange = (change) => {
        if (change > 5) return '#1b5e20'; // Dark green
        if (change > 2) return '#4caf50'; // Green
        if (change > 0) return '#8bc34a'; // Light green
        if (change > -2) return '#ffcdd2'; // Light red
        if (change > -5) return '#e57373'; // Red
        return '#b71c1c'; // Dark red
    };

    // Function to get CSS gradient for cell background
    const getCellBackground = (change) => {
        const color = getColorForChange(change);
        const intensity = Math.min(Math.abs(change) * 10, 100); // Scale intensity but cap at 100%

        return change >= 0
            ? `linear-gradient(90deg, ${color} ${intensity}%, transparent ${intensity}%)`
            : `linear-gradient(90deg, transparent ${100-intensity}%, ${color} ${100-intensity}%)`;
    };

    return (
        <div className="dashboard-card sector-heatmap">
            <div className="card-header">
                <h3>Sector Performance</h3>
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

            <div className="heatmap-container">
                <table className="heatmap-table">
                    <thead>
                    <tr>
                        <th>Sector</th>
                        <th>Performance</th>
                        <th>Relative Strength</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedSectors.map((sector, index) => (
                        <tr key={sector.name}>
                            <td className="sector-name">{sector.name}</td>
                            <td
                                className="sector-change"
                                style={{
                                    background: getCellBackground(sector[timeframe]),
                                    color: Math.abs(sector[timeframe]) > 3 ? 'white' : 'black'
                                }}
                            >
                                {sector[timeframe] > 0 ? '+' : ''}{sector[timeframe].toFixed(2)}%
                            </td>
                            <td className="relative-strength">
                                {sector.relativeStrength > 1
                                    ? <span className="strength-above">Strong ({sector.relativeStrength.toFixed(2)})</span>
                                    : <span className="strength-below">Weak ({sector.relativeStrength.toFixed(2)})</span>
                                }
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="sector-notes">
                <h4>Market Bottom Sector Analysis</h4>
                <div className="sector-insights">
                    <p>At market bottoms:</p>
                    <ul>
                        <li>Defensive sectors (Utilities, Consumer Staples, Healthcare) often outperform initially</li>
                        <li>Cyclical sectors (Technology, Consumer Discretionary) typically lead the recovery</li>
                        <li>Participation broadening across sectors often signals sustainable bottoms</li>
                        <li>Relative strength increases in beaten-down sectors can indicate a trend change</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SectorHeatmap;
