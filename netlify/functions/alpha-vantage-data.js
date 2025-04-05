// // netlify/functions/alpha-vantage-data.js
//
// netlify/functions/test.js
exports.handler = async function() {
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Function is working!" })
    };
};

// const axios = require('axios');
//
// // Alpha Vantage API key (will be set in Netlify environment variables)
// const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
//
// // Utility functions
// const getCachedData = (data) => {
//     // Add a small random variation to cached data to simulate real-time changes
//     const addVariation = (value) => {
//         const variation = value * (Math.random() * 0.03 - 0.015); // ±1.5% variation
//         return value + variation;
//     };
//
//     // Apply variations to numerical values
//     const applyVariations = (obj) => {
//         if (!obj || typeof obj !== 'object') return obj;
//
//         const result = Array.isArray(obj) ? [...obj] : {...obj};
//
//         for (const key in result) {
//             if (typeof result[key] === 'number') {
//                 result[key] = addVariation(result[key]);
//             } else if (typeof result[key] === 'object') {
//                 result[key] = applyVariations(result[key]);
//             }
//         }
//
//         return result;
//     };
//
//     return applyVariations(data);
// };
//
// exports.handler = async function(event, context) {
//     // Add caching headers
//     const headers = {
//         'Content-Type': 'application/json',
//         'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
//     };
//
//     try {
//         // Alpha Vantage has rate limits (5 API calls per minute, 500 per day on free tier)
//         // We'll batch our requests to minimize API calls
//
//         // Get VIX data (ticker: ^VIX)
//         const vixResponse = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=%5EVIX&outputsize=compact&apikey=${ALPHA_VANTAGE_API_KEY}`);
//
//         // Get SPY data for technical indicators
//         const spyResponse = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=${ALPHA_VANTAGE_API_KEY}`);
//
//         // Get SPY technical indicators
//         const spyRsiResponse = await axios.get(`https://www.alphavantage.co/query?function=RSI&symbol=SPY&interval=daily&time_period=14&series_type=close&apikey=${ALPHA_VANTAGE_API_KEY}`);
//
//         // Get SPY SMA indicators
//         const spySma50Response = await axios.get(`https://www.alphavantage.co/query?function=SMA&symbol=SPY&interval=daily&time_period=50&series_type=close&apikey=${ALPHA_VANTAGE_API_KEY}`);
//         const spySma200Response = await axios.get(`https://www.alphavantage.co/query?function=SMA&symbol=SPY&interval=daily&time_period=200&series_type=close&apikey=${ALPHA_VANTAGE_API_KEY}`);
//
//         // Process VIX data
//         const vixData = vixResponse.data['Time Series (Daily)'];
//         const vixDates = Object.keys(vixData).sort().reverse(); // Most recent first
//         const currentVix = parseFloat(vixData[vixDates[0]]['4. close']);
//         const yesterdayVix = parseFloat(vixData[vixDates[1]]['4. close']);
//
//         // Create VIX historical data
//         const vixHistorical = [];
//         let vixSum30 = 0;
//         let vixSum90 = 0;
//
//         for (let i = 0; i < vixDates.length && i < 90; i++) {
//             const closeValue = parseFloat(vixData[vixDates[i]]['4. close']);
//             vixHistorical.push(closeValue);
//
//             if (i < 30) vixSum30 += closeValue;
//             vixSum90 += closeValue;
//         }
//
//         const vixAvg30 = vixSum30 / Math.min(30, vixDates.length);
//         const vixAvg90 = vixSum90 / Math.min(90, vixDates.length);
//
//         // Process SPY data
//         const spyPrice = parseFloat(spyResponse.data['Global Quote']['05. price']);
//
//         // Process SPY RSI
//         const rsiData = spyRsiResponse.data['Technical Analysis: RSI'];
//         const rsiDates = Object.keys(rsiData).sort().reverse();
//         const currentRsi = parseFloat(rsiData[rsiDates[0]].RSI);
//
//         // Process SPY SMAs
//         const sma50Data = spySma50Response.data['Technical Analysis: SMA'];
//         const sma50Dates = Object.keys(sma50Data).sort().reverse();
//         const currentSma50 = parseFloat(sma50Data[sma50Dates[0]].SMA);
//
//         const sma200Data = spySma200Response.data['Technical Analysis: SMA'];
//         const sma200Dates = Object.keys(sma200Data).sort().reverse();
//         const currentSma200 = parseFloat(sma200Data[sma200Dates[0]].SMA);
//
//         // Create our data structure
//         const marketData = {
//             vix: currentVix,
//             historicalVix: {
//                 daily: vixHistorical,
//                 avg30Day: vixAvg30,
//                 avg90Day: vixAvg90,
//                 yesterday: yesterdayVix
//             },
//             sentiment: {
//                 // Alpha Vantage doesn't have direct sentiment data, so we'll simulate these
//                 putCallRatio: 1.2 + (Math.random() * 0.4 - 0.2), // Range around 1.2
//                 bullBearSpread: -15 + (Math.random() * 30 - 15), // Range around -15
//                 fearGreedIndex: 25 + (Math.random() * 20 - 10), // Range around 25
//                 aaii: {
//                     bullish: 30 + (Math.random() * 20 - 10),
//                     bearish: 40 + (Math.random() * 20 - 10),
//                     neutral: 30 + (Math.random() * 10 - 5)
//                 },
//                 institutionalFlows: -5 + (Math.random() * 10 - 5)
//             },
//             technicalIndicators: {
//                 spy: {
//                     price: spyPrice,
//                     sma50: currentSma50,
//                     sma200: currentSma200,
//                     rsi: currentRsi
//                 },
//                 macdDivergence: currentRsi > 30 && currentRsi < 40,
//                 rsiOversold: currentRsi < 30,
//                 bullishReversalPatterns: Math.floor(Math.random() * 3) // 0-2 patterns
//             },
//             valuations: {
//                 // These would ideally come from a fundamental data endpoint
//                 // Using estimated values for demonstration
//                 averagePE: 18 + (Math.random() * 4 - 2),
//                 historicalPE: 20,
//                 averagePB: 3 + (Math.random() * 1 - 0.5),
//                 historicalPB: 3.5,
//                 earningsYield: 0.05 + (Math.random() * 0.01 - 0.005),
//                 historicalEarningsYield: 0.045
//             },
//             marketBreadth: {
//                 // These would come from market internals data
//                 // Using estimated values for demonstration
//                 advanceDeclineRatio: 0.9 + (Math.random() * 0.4 - 0.2),
//                 percentAbove50DMA: 0.45 + (Math.random() * 0.2 - 0.1),
//                 percentAbove200DMA: 0.5 + (Math.random() * 0.2 - 0.1),
//                 newHighsVsNewLows: -10 + (Math.random() * 40 - 20),
//                 mcClellanOscillator: -20 + (Math.random() * 80 - 40)
//             },
//             sectorPerformance: [
//                 {
//                     name: 'Technology',
//                     dailyChange: -1.5 + (Math.random() * 3),
//                     weeklyChange: -3 + (Math.random() * 6),
//                     monthlyChange: -8 + (Math.random() * 16),
//                     yearToDateChange: -15 + (Math.random() * 30),
//                     relativeStrength: 0.9 + (Math.random() * 0.4)
//                 },
//                 {
//                     name: 'Healthcare',
//                     dailyChange: -1 + (Math.random() * 2),
//                     weeklyChange: -2 + (Math.random() * 4),
//                     monthlyChange: -5 + (Math.random() * 10),
//                     yearToDateChange: -10 + (Math.random() * 20),
//                     relativeStrength: 1 + (Math.random() * 0.3)
//                 },
//                 {
//                     name: 'Financials',
//                     dailyChange: -1.8 + (Math.random() * 3.6),
//                     weeklyChange: -4 + (Math.random() * 8),
//                     monthlyChange: -10 + (Math.random() * 20),
//                     yearToDateChange: -18 + (Math.random() * 36),
//                     relativeStrength: 0.8 + (Math.random() * 0.4)
//                 },
//                 {
//                     name: 'Consumer Cyclical',
//                     dailyChange: -1.2 + (Math.random() * 2.4),
//                     weeklyChange: -3.5 + (Math.random() * 7),
//                     monthlyChange: -7 + (Math.random() * 14),
//                     yearToDateChange: -12 + (Math.random() * 24),
//                     relativeStrength: 0.95 + (Math.random() * 0.3)
//                 },
//                 {
//                     name: 'Energy',
//                     dailyChange: -0.8 + (Math.random() * 1.6),
//                     weeklyChange: -2.5 + (Math.random() * 5),
//                     monthlyChange: -6 + (Math.random() * 12),
//                     yearToDateChange: 5 + (Math.random() * 20),
//                     relativeStrength: 1.1 + (Math.random() * 0.4)
//                 }
//             ],
//             watchlistData: [
//                 {
//                     ticker: 'AAPL',
//                     price: 170 + (Math.random() * 20 - 10),
//                     dailyChange: -2 + (Math.random() * 4),
//                     weeklyChange: -5 + (Math.random() * 10),
//                     monthlyChange: -10 + (Math.random() * 20),
//                     yearToDateChange: -15 + (Math.random() * 30),
//                     pe: 25 + (Math.random() * 5 - 2.5),
//                     historicalAvgPE: 28,
//                     volume: 70000000 + (Math.random() * 20000000),
//                     avgVolume: 80000000,
//                     rsi: currentRsi - 5 + (Math.random() * 10)
//                 },
//                 {
//                     ticker: 'MSFT',
//                     price: 340 + (Math.random() * 30 - 15),
//                     dailyChange: -1.5 + (Math.random() * 3),
//                     weeklyChange: -4 + (Math.random() * 8),
//                     monthlyChange: -8 + (Math.random() * 16),
//                     yearToDateChange: -12 + (Math.random() * 24),
//                     pe: 30 + (Math.random() * 6 - 3),
//                     historicalAvgPE: 32,
//                     volume: 60000000 + (Math.random() * 15000000),
//                     avgVolume: 65000000,
//                     rsi: currentRsi - 3 + (Math.random() * 6)
//                 },
//                 {
//                     ticker: 'AMZN',
//                     price: 180 + (Math.random() * 20 - 10),
//                     dailyChange: -2.2 + (Math.random() * 4.4),
//                     weeklyChange: -6 + (Math.random() * 12),
//                     monthlyChange: -12 + (Math.random() * 24),
//                     yearToDateChange: -20 + (Math.random() * 40),
//                     pe: 40 + (Math.random() * 10 - 5),
//                     historicalAvgPE: 45,
//                     volume: 50000000 + (Math.random() * 15000000),
//                     avgVolume: 55000000,
//                     rsi: currentRsi - 4 + (Math.random() * 8)
//                 },
//                 {
//                     ticker: 'GOOGL',
//                     price: 140 + (Math.random() * 15 - 7.5),
//                     dailyChange: -1.8 + (Math.random() * 3.6),
//                     weeklyChange: -5 + (Math.random() * 10),
//                     monthlyChange: -10 + (Math.random() * 20),
//                     yearToDateChange: -18 + (Math.random() * 36),
//                     pe: 22 + (Math.random() * 4 - 2),
//                     historicalAvgPE: 25,
//                     volume: 45000000 + (Math.random() * 10000000),
//                     avgVolume: 48000000,
//                     rsi: currentRsi - 2 + (Math.random() * 4)
//                 },
//                 {
//                     ticker: 'META',
//                     price: 480 + (Math.random() * 40 - 20),
//                     dailyChange: -2.5 + (Math.random() * 5),
//                     weeklyChange: -7 + (Math.random() * 14),
//                     monthlyChange: -12 + (Math.random() * 24),
//                     yearToDateChange: 5 + (Math.random() * 30),
//                     pe: 20 + (Math.random() * 4 - 2),
//                     historicalAvgPE: 22,
//                     volume: 40000000 + (Math.random() * 10000000),
//                     avgVolume: 42000000,
//                     rsi: currentRsi - 1 + (Math.random() * 2)
//                 }
//             ]
//         };
//
//         return {
//             statusCode: 200,
//             headers,
//             body: JSON.stringify(marketData)
//         };
//     } catch (error) {
//         console.error('Alpha Vantage API error:', error);
//
//         // Check for rate limiting
//         if (error.response && error.response.status === 429) {
//             return {
//                 statusCode: 429,
//                 headers,
//                 body: JSON.stringify({
//                     error: 'API rate limit exceeded. Please try again later.',
//                     message: 'The free tier of Alpha Vantage has rate limits of 5 calls per minute and 500 calls per day.'
//                 })
//             };
//         }
//
//         return {
//             statusCode: 500,
//             headers,
//             body: JSON.stringify({
//                 error: 'Failed to fetch market data',
//                 message: error.message
//             })
//         };
//     }
// };
