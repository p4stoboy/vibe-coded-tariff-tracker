import React from 'react';

const BottomSignalMeter = ({ signalValue }) => {
    // Helper function to determine color based on signal strength
    const getBackgroundColor = (value) => {
        if (value < 25) return '#f44336'; // Red
        if (value < 50) return '#ff9800'; // Orange
        if (value < 75) return '#2196f3'; // Blue
        return '#4caf50'; // Green
    };

    // Helper function to get signal text description
    const getSignalText = (value) => {
        if (value < 25) return 'Weak or No Bottom Signal';
        if (value < 50) return 'Possible Early Bottom Signal';
        if (value < 75) return 'Moderate Bottom Signal';
        return 'Strong Bottom Signal';
    };

    return (
        <div className="bottom-signal-meter">
            <h2>Market Bottom Signal Strength</h2>
            <div className="meter-container">
                <div
                    className="meter-fill"
                    style={{
                        width: `${signalValue}%`,
                        backgroundColor: getBackgroundColor(signalValue)
                    }}
                ></div>
            </div>
            <div className="meter-value">{signalValue}%</div>
            <div className="signal-text" style={{ color: getBackgroundColor(signalValue) }}>
                {getSignalText(signalValue)}
            </div>
            <div className="signal-legend">
                <span>Weak Signal</span>
                <span>Strong Signal</span>
            </div>

            <div className="signal-details">
                {signalValue >= 75 ? (
                    <div className="signal-description">
                        <p><strong>Strong Bottom Signal:</strong> Multiple indicators suggest a potential market bottom forming. Consider gradually deploying capital while monitoring for confirmation.</p>
                    </div>
                ) : signalValue >= 50 ? (
                    <div className="signal-description">
                        <p><strong>Moderate Bottom Signal:</strong> Some positive indicators are emerging, but confirmation is still needed. Consider preparing watchlists and potentially small initial positions.</p>
                    </div>
                ) : signalValue >= 25 ? (
                    <div className="signal-description">
                        <p><strong>Early Bottom Signal:</strong> A few early indicators present, but caution is warranted. Continue monitoring for strengthening signals.</p>
                    </div>
                ) : (
                    <div className="signal-description">
                        <p><strong>Weak/No Bottom Signal:</strong> Insufficient evidence of a market bottom at this time. Maintain defensive positioning and patience.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BottomSignalMeter;
