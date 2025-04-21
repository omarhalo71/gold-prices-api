// Express server for production deployment with GoldAPI integration
// This file will serve as a proxy for API requests and serve static files

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const GOLDAPI_KEY = 'goldapi-jh29ksm9qudgml-io'; // مفتاح API الخاص بك من GoldAPI

// Enable CORS for all routes
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Cache for API data
let cachedData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Fallback data with prices matching Harem Altın (from screenshot)
const fallbackData = {
  gold: {
    gold24K: { buy: 4133.01, sell: 4145.67, change: 1.13, direction: 'up' },
    gold22K: { buy: 3759.04, sell: 3953.39, change: 6.03, direction: 'up' },
    gold18K: { buy: 3099.76, sell: 3109.25, change: 1.13, direction: 'up' },
    gold14K: { buy: 2409.81, sell: 2417.19, change: 1.13, direction: 'up' },
    goldCoinFull: { buy: 4112.34, sell: 4158.11, change: 1.94, direction: 'up' },
    goldCoinHalf: { buy: 2056.17, sell: 2079.06, change: 1.94, direction: 'up' },
    goldCoinQuarter: { buy: 1028.09, sell: 1039.53, change: 1.94, direction: 'up' }
  },
  currency: {
    USD: { buy: 107.80, sell: 108.00, change: 0.16, direction: 'up' },
    EUR: { buy: 94.85, sell: 95.27, change: 0.47, direction: 'up' },
    TRY: { buy: 3.326, sell: 3.327, change: 0.01, direction: 'up' },
    EURUSD: { buy: 1.09, sell: 1.10, change: 0.2, direction: 'up', price: 1.09 },
    USDTRY: { buy: 32.15, sell: 32.25, change: 0.5, direction: 'up', price: 32.15 }
  },
  metals: {
    silver: { buy: 3326.80, sell: 3327.20, change: 0.01, direction: 'up' },
    platinum: { buy: 980.25, sell: 985.50, change: 0.5, direction: 'up' },
    palladium: { buy: 1020.75, sell: 1025.90, change: -0.3, direction: 'down' }
  }
};

// Historical data for charts
const fallbackHistoricalData = {
  gold: {
    day: {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      prices: Array.from({ length: 24 }, () => 4133 + Math.random() * 10)
    },
    week: {
      labels: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
      prices: Array.from({ length: 7 }, () => 4133 + Math.random() * 20)
    },
    month: {
      labels: Array.from({ length: 30 }, (_, i) => `${i+1}`),
      prices: Array.from({ length: 30 }, () => 4133 + Math.random() * 50)
    },
    year: {
      labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
      prices: Array.from({ length: 12 }, () => 4133 + Math.random() * 100)
    }
  }
};

// Function to get fresh or cached data from GoldAPI
async function getGoldApiData() {
  const now = Date.now();
  
  // If cache is valid, return cached data
  if (cachedData && (now - lastFetchTime < CACHE_DURATION)) {
    return cachedData;
  }
  
  try {
    // Fetch fresh data from GoldAPI for Gold
    const goldResponse = await axios.get('https://www.goldapi.io/api/XAU/USD', {
      headers: {
        'x-access-token': GOLDAPI_KEY
      }
    }) ;
    
    // Fetch fresh data from GoldAPI for Silver
    const silverResponse = await axios.get('https://www.goldapi.io/api/XAG/USD', {
      headers: {
        'x-access-token': GOLDAPI_KEY
      }
    }) ;
    
    const goldData = goldResponse.data;
    const silverData = silverResponse.data;
    
    // إنشاء كائن البيانات بالتنسيق المطلوب للتطبيق
    const formattedData = {
      gold: {
        gold24K: { 
          buy: parseFloat(goldData.price_gram_24k), 
          sell: parseFloat((goldData.price_gram_24k * 1.003).toFixed(2)), 
          change: parseFloat(goldData.ch), 
          direction: goldData.ch >= 0 ? 'up' : 'down' 
        },
        gold22K: { 
          buy: parseFloat(goldData.price_gram_22k), 
          sell: parseFloat((goldData.price_gram_22k * 1.003).toFixed(2)), 
          change: parseFloat(goldData.ch), 
          direction: goldData.ch >= 0 ? 'up' : 'down' 
        },
        gold18K: { 
          buy: parseFloat((goldData.price_gram_24k * (18/24)).toFixed(2)), 
          sell: parseFloat((goldData.price_gram_24k * (18/24) * 1.003).toFixed(2)), 
          change: parseFloat(goldData.ch), 
          direction: goldData.ch >= 0 ? 'up' : 'down' 
        },
        gold14K: { 
          buy: parseFloat((goldData.price_gram_24k * (14/24)).toFixed(2)), 
          sell: parseFloat((goldData.price_gram_24k * (14/24) * 1.003).toFixed(2)), 
          change: parseFloat(goldData.ch), 
          direction: goldData.ch >= 0 ? 'up' : 'down' 
        },
        goldCoinFull: { 
          buy: parseFloat((goldData.price_gram_24k * 7.2).toFixed(2)), // وزن الليرة الذهبية حوالي 7.2 غرام
          sell: parseFloat((goldData.price_gram_24k * 7.2 * 1.01).toFixed(2)), 
          change: parseFloat(goldData.ch), 
          direction: goldData.ch >= 0 ? 'up' : 'down' 
        },
        goldCoinHalf: { 
          buy: parseFloat((goldData.price_gram_24k * 3.6).toFixed(2)), 
          sell: parseFloat((goldData.price_gram_24k * 3.6 * 1.01).toFixed(2)), 
          change: parseFloat(goldData.ch), 
          direction: goldData.ch >= 0 ? 'up' : 'down' 
        },
        goldCoinQuarter: { 
          buy: parseFloat((goldData.price_gram_24k * 1.8).toFixed(2)), 
          sell: parseFloat((goldData.price_gram_24k * 1.8 * 1.01).toFixed(2)), 
          change: parseFloat(goldData.ch), 
          direction: goldData.ch >= 0 ? 'up' : 'down' 
        }
      },
      currency: {
        USD: { buy: 107.80, sell: 108.00, change: 0.16, direction: 'up' },
        EUR: { buy: 94.85, sell: 95.27, change: 0.47, direction: 'up' },
        TRY: { buy: 3.326, sell: 3.327, change: 0.01, direction: 'up' },
        EURUSD: { buy: 1.09, sell: 1.10, change: 0.2, direction: 'up', price: 1.09 },
        USDTRY: { buy: 32.15, sell: 32.25, change: 0.5, direction: 'up', price: 32.15 }
      },
      metals: {
        silver: { 
          buy: parseFloat((silverData.price / 31.1034768).toFixed(2)), // تحويل سعر الأونصة إلى سعر الغرام
          sell: parseFloat(((silverData.price / 31.1034768) * 1.003).toFixed(2)), 
          change: parseFloat(silverData.ch), 
          direction: silverData.ch >= 0 ? 'up' : 'down' 
        },
        platinum: { buy: 980.25, sell: 985.50, change: 0.5, direction: 'up' },
        palladium: { buy: 1020.75, sell: 1025.90, change: -0.3, direction: 'down' }
      }
    };
    
    // Update cache
    cachedData = formattedData;
    lastFetchTime = now;
    
    return formattedData;
  } catch (error) {
    console.error('Error fetching data from GoldAPI:', error);
    
    // If we have cached data, return it even if expired
    if (cachedData) {
      return cachedData;
    }
    
    // Otherwise return fallback data
    return fallbackData;
  }
}

// API endpoint to get all prices
app.get('/api/prices', async (req, res) => {
  try {
    const data = await getGoldApiData();
    res.json(data);
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ error: 'Failed to fetch prices', fallback: true, data: fallbackData });
  }
});

// API endpoint to get historical data for charts
app.get('/api/historical', async (req, res) => {
  try {
    const { type, period } = req.query;
    // In a production environment, we would call the actual API
    // For now, we'll return the fallback data
    const data = fallbackHistoricalData.gold[period || 'day'];
    res.json(data);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Catch-all route to serve index.html for any other routes
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'));
// });


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
