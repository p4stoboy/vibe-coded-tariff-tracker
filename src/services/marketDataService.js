// marketDataService.js
// Frontend service that calls Netlify serverless function

export const fetchMarketData = async (watchlist, sectors) => {
    try {
        // Call the Netlify serverless function that handles the Alpha Vantage API
        const response = await fetch('/.netlify/functions/alpha-vantage-data');

        if (!response.ok) {
            throw new Error(`Failed to fetch market data: ${response.status}`);
        }

        // Parse the response from our serverless function
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching market data:', error);

        // If in development, return mock data to continue working
        if (process.env.NODE_ENV === 'development') {
            console.log('Using mock data in development');
            return generateMockData(watchlist, sectors);
        }

        throw error;
    }
};

// Helper to generate random data within a range (for development/fallback)
const randomInRange = (min, max) => Math.random() * (max - min) + min;

// Generate mock data for development
const generateMockData = (watchlist, sectors) => {
    // Create VIX data
    const vix = randomInRange(20, 35);
    const historicalVix = {
        daily: Array(90).fill().map(() => randomInRange(15, 40)),
        avg30Day: randomInRange(20, 30),
        avg90Day: randomInRange(18, 25),
        yesterday: vix * (1 + randomInRange(-0.1, 0.1))
    };

    // Create sentiment data
    const sentiment = {
        putCallRatio: randomInRange(0.8, 1.4),
        bullBearSpread: randomInRange(-20, 20),
        fearGreedIndex: randomInRange(10, 70),
        aaii: {
            bullish: randomInRange(20, 50),
            bearish: randomInRange(20, 50),
            neutral: randomInRange(10, 30)
        },
        institutionalFlows: randomInRange(-10, 10)
    };

    // Create technical indicators
    const technicalIndicators = {
        spy: {
            price: randomInRange(400, 500),
            sma50: randomInRange(420, 480),
            sma200: randomInRange(410, 470),
            rsi: randomInRange(30, 70)
        },
        macdDivergence: Math.random() > 0.7,
        rsiOversold: Math.random() > 0.6,
        bullishReversalPatterns: Math.floor(randomInRange(0, 4))
    };

    // Create valuation metrics
    const valuations = {
        averagePE: randomInRange(15, 25),
        historicalPE: randomInRange(18, 22),
        averagePB: randomInRange(2, 5),
        historicalPB: randomInRange(3, 4),
        earningsYield: randomInRange(0.03, 0.06),
        historicalEarningsYield: randomInRange(0.04, 0.05)
    };

    // Create market breadth
    const marketBreadth = {
        advanceDeclineRatio: randomInRange(0.5, 1.5),
        percentAbove50DMA: randomInRange(0.3, 0.7),
        percentAbove200DMA: randomInRange(0.4, 0.6),
        newHighsVsNewLows: randomInRange(-50, 50),
        mcClellanOscillator: randomInRange(-100, 100)
    };

    // Create sector performance
    const sectorPerformance = sectors.map(sector => ({
        name: sector,
        dailyChange: randomInRange(-3, 3),
        weeklyChange: randomInRange(-8, 8),
        monthlyChange: randomInRange(-15, 15),
        yearToDateChange: randomInRange(-20, 20),
        relativeStrength: randomInRange(0.7, 1.3)
    }));

    // Create watchlist data
    const watchlistData = watchlist.map(ticker => ({
        ticker,
        price: randomInRange(50, 500),
        dailyChange: randomInRange(-5, 5),
        weeklyChange: randomInRange(-10, 10),
        monthlyChange: randomInRange(-20, 20),
        yearToDateChange: randomInRange(-30, 30),
        pe: randomInRange(10, 30),
        historicalAvgPE: randomInRange(15, 25),
        volume: Math.floor(randomInRange(1000000, 10000000)),
        avgVolume: Math.floor(randomInRange(2000000, 8000000)),
        rsi: randomInRange(30, 70)
    }));

    return {
        vix,
        historicalVix,
        sentiment,
        technicalIndicators,
        valuations,
        marketBreadth,
        sectorPerformance,
        watchlistData
    };
};
