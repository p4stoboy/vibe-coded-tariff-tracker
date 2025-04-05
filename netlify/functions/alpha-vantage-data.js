// netlify/functions/alpha-vantage-data.js
const axios = require('axios');

exports.handler = async function(event, context) {
    const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
    };

    try {
        const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

        if (!API_KEY) {
            throw new Error('ALPHA_VANTAGE_API_KEY environment variable is not set');
        }

        // Use the correct symbol for VIX
        // The VIX symbol should be "VIX" instead of "%5EVIX"
        const vixResponse = await axios.get(
            `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=VIX&apikey=${API_KEY}`
        );

        console.log('VIX API response keys:', JSON.stringify(Object.keys(vixResponse.data)));

        // Check for API response information message (often contains error info)
        if (vixResponse.data.Information || vixResponse.data.Note) {
            console.error('API Information/Note:',
                vixResponse.data.Information || vixResponse.data.Note);
            throw new Error(vixResponse.data.Information || vixResponse.data.Note);
        }

        // Get VIX data
        const timeSeries = vixResponse.data['Time Series (Daily)'];
        if (!timeSeries) {
            console.error('No time series data found in response');
            throw new Error('Invalid API response structure');
        }

        const vixDates = Object.keys(timeSeries).sort().reverse(); // Most recent first
        const currentVix = parseFloat(timeSeries[vixDates[0]]['4. close']);
        const yesterdayVix = parseFloat(timeSeries[vixDates[1]]['4. close']);

        // Create VIX historical data
        const vixHistorical = [];
        let vixSum30 = 0;
        let vixSum90 = 0;

        for (let i = 0; i < vixDates.length && i < 90; i++) {
            const closeValue = parseFloat(timeSeries[vixDates[i]]['4. close']);
            vixHistorical.push(closeValue);

            if (i < 30) vixSum30 += closeValue;
            vixSum90 += closeValue;
        }

        const vixAvg30 = vixSum30 / Math.min(30, vixDates.length);
        const vixAvg90 = vixSum90 / Math.min(90, vixDates.length);

        // Get SPY data for technical indicators
        const spyResponse = await axios.get(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=${API_KEY}`
        );

        // Process SPY data
        const spyPrice = parseFloat(spyResponse.data['Global Quote']['05. price'] || 0);

        // Construct the market data object
        const marketData = {
            vix: currentVix,
            historicalVix: {
                daily: vixHistorical,
                avg30Day: vixAvg30,
                avg90Day: vixAvg90,
                yesterday: yesterdayVix
            },
            // We'll estimate the rest of the metrics based on VIX and SPY data
            sentiment: {
                // High VIX typically correlates with fear
                putCallRatio: 1 + (currentVix / 40), // Estimate put/call based on VIX
                bullBearSpread: -currentVix + 10, // Negative when VIX is high
                fearGreedIndex: Math.max(5, 50 - (currentVix)), // Lower when VIX is high
                aaii: {
                    bullish: Math.max(20, 50 - (currentVix / 2)),
                    bearish: Math.min(60, 30 + (currentVix / 2)),
                    neutral: 30
                },
                institutionalFlows: -5 - (currentVix / 5)
            },
            technicalIndicators: {
                spy: {
                    price: spyPrice,
                    sma50: spyPrice * 0.98, // Estimate
                    sma200: spyPrice * 0.95, // Estimate
                    rsi: Math.max(30, 60 - (currentVix / 2)) // Estimate RSI inversely related to VIX
                },
                macdDivergence: currentVix > 25 && yesterdayVix > currentVix,
                rsiOversold: currentVix > 30,
                bullishReversalPatterns: currentVix > 25 && yesterdayVix > currentVix ? 1 : 0
            },
            valuations: {
                // These are rough estimates based on typical market conditions
                averagePE: 15 + (30 - Math.min(30, currentVix)) / 2,
                historicalPE: 18,
                averagePB: 2.5,
                historicalPB: 3,
                earningsYield: 0.05 + (Math.min(30, currentVix) / 1000),
                historicalEarningsYield: 0.045
            },
            marketBreadth: {
                // These are estimates - high VIX typically means poor breadth
                advanceDeclineRatio: 1 - (Math.min(30, currentVix) / 60),
                percentAbove50DMA: 0.5 - (Math.min(30, currentVix) / 100),
                percentAbove200DMA: 0.5 - (Math.min(30, currentVix) / 150),
                newHighsVsNewLows: -Math.min(30, currentVix) + 15,
                mcClellanOscillator: -Math.min(30, currentVix) + 15
            },
            sectorPerformance: generateSectorData(currentVix),
            watchlistData: generateWatchlistData(spyPrice, currentVix)
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(marketData)
        };

    } catch (error) {
        console.error('Alpha Vantage API error:', error);

        // Return error information
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to fetch market data',
                message: error.message
            })
        };
    }
};

// Helper functions to generate data based on real VIX and SPY values
function generateSectorData(vixValue) {
    const sectors = [
        'Technology', 'Healthcare', 'Financials',
        'Consumer Cyclical', 'Energy'
    ];

    return sectors.map(sector => {
        // Higher VIX typically means worse sector performance
        const baseChange = -(vixValue / 20);
        const variation = (Math.random() - 0.5) * 3;

        return {
            name: sector,
            dailyChange: baseChange + variation,
            weeklyChange: (baseChange + variation) * 3,
            monthlyChange: (baseChange + variation) * 8,
            yearToDateChange: (sector === 'Energy' ? 1 : -1) * (10 + Math.random() * 15),
            relativeStrength: 1 - (baseChange / 20) + (Math.random() - 0.5) * 0.3
        };
    });
}

function generateWatchlistData(spyPrice, vixValue) {
    const stocks = [
        { ticker: 'AAPL', basePrice: 170, betaMultiplier: 1.2 },
        { ticker: 'MSFT', basePrice: 340, betaMultiplier: 1.1 },
        { ticker: 'GOOGL', basePrice: 140, betaMultiplier: 1.3 },
        { ticker: 'AMZN', basePrice: 180, betaMultiplier: 1.4 },
        { ticker: 'META', basePrice: 480, betaMultiplier: 1.5 }
    ];

    // Base percentage change - higher VIX typically means larger negative change
    const basePercentChange = -(vixValue / 30);

    return stocks.map(stock => {
        const stockChange = basePercentChange * stock.betaMultiplier + (Math.random() - 0.5) * 3;
        const stockPrice = stock.basePrice * (1 + stockChange / 100);

        return {
            ticker: stock.ticker,
            price: stockPrice,
            dailyChange: stockChange,
            weeklyChange: stockChange * 2.5 + (Math.random() - 0.5) * 5,
            monthlyChange: stockChange * 5 + (Math.random() - 0.5) * 10,
            yearToDateChange: -15 + Math.random() * 30,
            pe: 20 + Math.random() * 10,
            historicalAvgPE: 25,
            volume: 40000000 + Math.random() * 40000000,
            avgVolume: 50000000,
            rsi: Math.max(30, 50 - vixValue / 3 + Math.random() * 10)
        };
    });
}
