// Updated app.js with GoldAPI integration
// This version will work with the deployed website

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
  
  // Global variables
  let chartInstance = null;
  let updateInterval = 60000; // Update every minute
  let currentChartType = 'gold';
  let currentChartPeriod = 'day';
  let useProxyServer = true; // Set to true to use proxy server
  let useFallbackData = false; // تعديل: تغيير من true إلى false لاستخدام البيانات الحقيقية
  let useWebScraping = false; // تعديل: إبقاء false لأننا نستخدم API بدلاً من استخراج البيانات
  
  // Initialize the application
  document.addEventListener('DOMContentLoaded', function() {
      // Create logo if it doesn't exist
      createLogoIfNeeded();
      
      // Display fallback data immediately
      displayFallbackData();
      
      // Initialize the application
      initApp();
      
      // Set up event listeners
      setupEventListeners();
  });
  
  // Display fallback data immediately without waiting for API
  function displayFallbackData() {
      // Update UI with fallback data
      updateGoldTable(fallbackData.gold);
      updateCurrencyTable(fallbackData.currency);
      updateMetalsTable(fallbackData.metals);
      updateLastUpdateTime();
      
      // Initialize chart with fallback data
      setTimeout(() => {
          initChart(currentChartType, currentChartPeriod);
      }, 100);
  }
  
  // Create logo if it doesn't exist
  function createLogoIfNeeded() {
      const logoImg = document.getElementById('logo');
      if (logoImg && !logoImg.complete) {
          // Create a canvas to generate a logo
          const canvas = document.createElement('canvas');
          canvas.width = 100;
          canvas.height = 100;
          const ctx = canvas.getContext('2d');
          
          // Draw a gold coin with purple accent
          ctx.beginPath();
          ctx.arc(50, 50, 40, 0, 2 * Math.PI);
          ctx.fillStyle = '#d4af37'; // Gold color
          ctx.fill();
          ctx.lineWidth = 5;
          ctx.strokeStyle = '#8a2be2'; // Purple color
          ctx.stroke();
          
          // Add text
          ctx.font = 'bold 40px Tajawal';
          ctx.fillStyle = '#8a2be2';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('G', 50, 50);
          
          // Set the logo source
          logoImg.src = canvas.toDataURL('image/png');
      }
  }
  
  // Initialize the application
  function initApp() {
      // Try to fetch data from API in the background
      fetchAllPrices();
      
      // Set up automatic refresh
      setInterval(fetchAllPrices, updateInterval);
      
      // Update converters with fallback data
      updateConverters(fallbackData);
  }
  
  // Set up event listeners
  function setupEventListeners() {
      // Tab change event
      document.querySelectorAll('#priceTabs button').forEach(button => {
          button.addEventListener('click', handleTabChange);
      });
      
      // Chart period change event
      document.querySelectorAll('[data-period]').forEach(button => {
          button.addEventListener('click', handleChartPeriodChange);
      });
      
      // Set up converters
      setupConverters();
  }
  
  // Fetch all price data
  async function fetchAllPrices() {
      try {
          let priceData;
          
          if (useWebScraping) {
              try {
                  // Try to fetch from web scraping API
                  const response = await fetch('/api/scrape-prices');
                  if (!response.ok) {
                      throw new Error('Failed to fetch from web scraping API');
                  }
                  priceData = await response.json();
              } catch (error) {
                  console.error('Error fetching from web scraping API, using fallback data:', error);
                  priceData = fallbackData;
              }
          } else if (useFallbackData) {
              // Use fallback data immediately
              priceData = fallbackData;
          } else {
              try {
                  // Try to fetch from API
                  if (useProxyServer) {
                      // Use proxy server
                      const response = await fetch('/api/prices');
                      if (!response.ok) {
                          throw new Error('Failed to fetch from proxy server');
                      }
                      priceData = await response.json();
                  } else {
                      // Direct API call (likely to fail due to CORS)
                      // This is kept for reference but should not be used in production
                      throw new Error('Direct API calls are disabled');
                  }
              } catch (error) {
                  console.error('Error fetching from API, using fallback data:', error);
                  priceData = fallbackData;
              }
          }
          
          // Update UI with new data
          updateGoldTable(priceData.gold);
          updateCurrencyTable(priceData.currency);
          updateMetalsTable(priceData.metals);
          updateConverters(priceData);
          updateChart(currentChartType, currentChartPeriod);
          updateLastUpdateTime();
      } catch (error) {
          console.error('Error fetching prices:', error);
          // Show error message to user
          showErrorMessage('حدث خطأ أثناء تحديث البيانات. يرجى المحاولة مرة أخرى لاحقاً.');
      }
  }
  
  // باقي الكود يبقى كما هو بدون تغيير
  // ...
  
  // Fetch data from Yahoo Finance (direct method - likely to fail due to CORS)
  async function fetchFromYahooFinance() {
      // This is kept for reference but should not be used in production
      // Implementation omitted as it will be replaced by proxy server
      throw new Error('Direct API calls are disabled');
  }
  
  // Show loading indicators
  function showLoadingIndicators() {
      const loadingHTML = `
          <tr>
              <td colspan="4" class="text-center">
                  <div class="loading-spinner"></div> جاري التحميل...
              </td>
          </tr>
      `;
      
      // Only show loading if tables are empty
      if (document.getElementById('gold-table-body').children.length <= 1) {
          document.getElementById('gold-table-body').innerHTML = loadingHTML;
      }
      if (document.getElementById('currency-table-body').children.length <= 1) {
          document.getElementById('currency-table-body').innerHTML = loadingHTML;
      }
      if (document.getElementById('metals-table-body').children.length <= 1) {
          document.getElementById('metals-table-body').innerHTML = loadingHTML;
      }
  }
  
  // Show error message
  function showErrorMessage(message) {
      // Create alert element
      const alertDiv = document.createElement('div');
      alertDiv.className = 'alert alert-danger alert-dismissible fade show';
      alertDiv.role = 'alert';
      alertDiv.innerHTML = `
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      
      // Add to page
      const container = document.querySelector('.container');
      container.insertBefore(alertDiv, container.firstChild);
      
      // Auto dismiss after 5 seconds
      setTimeout(() => {
          alertDiv.classList.remove('show');
          setTimeout(() => alertDiv.remove(), 500);
      }, 5000);
  }
  
  // Update gold table
  function updateGoldTable(goldData) {
      const tableBody = document.getElementById('gold-table-body');
      if (!tableBody) return;
      
      let html = '';
      
      // Add gold karats
      html += createTableRow('<img src="assets/gold24.png" class="gold-icon" alt="ذهب 24">ذهب 24 قيراط', goldData.gold24K);
      html += createTableRow('<img src="assets/gold22.png" class="gold-icon" alt="ذهب 22">ذهب 22 قيراط', goldData.gold22K);
      html += createTableRow('<img src="assets/gold18.png" class="gold-icon" alt="ذهب 18">ذهب 18 قيراط', goldData.gold18K);
      html += createTableRow('<img src="assets/gold14.png" class="gold-icon" alt="ذهب 14">ذهب 14 قيراط', goldData.gold14K);
      
      // Add gold coins
      html += createTableRow('<img src="assets/coin_full.png" class="gold-icon" alt="ليرة كاملة">ليرة ذهب كاملة', goldData.goldCoinFull);
      html += createTableRow('<img src="assets/coin_half.png" class="gold-icon" alt="نصف ليرة">نصف ليرة ذهب', goldData.goldCoinHalf);
      html += createTableRow('<img src="assets/coin_quarter.png" class="gold-icon" alt="ربع ليرة">ربع ليرة ذهب', goldData.goldCoinQuarter);
      
      tableBody.innerHTML = html;
      
      // Create gold icons if they don't exist
      createGoldIconsIfNeeded();
  }
  
  // Create gold icons if they don't exist
  function createGoldIconsIfNeeded() {
      const iconTypes = [
          { name: 'gold24', color: '#FFD700' },
          { name: 'gold22', color: '#EFC050' },
          { name: 'gold18', color: '#DAA520' },
          { name: 'gold14', color: '#CD853F' },
          { name: 'coin_full', color: '#FFD700', isCoin: true },
          { name: 'coin_half', color: '#FFD700', isCoin: true, scale: 0.8 },
          { name: 'coin_quarter', color: '#FFD700', isCoin: true, scale: 0.6 }
      ];
      
      iconTypes.forEach(icon => {
          const iconPath = `assets/${icon.name}.png`;
          
          // Check if file exists by trying to load it
          const img = new Image();
          img.onerror = function() {
              // Create the icon
              const canvas = document.createElement('canvas');
              canvas.width = 60;
              canvas.height = 60;
              const ctx = canvas.getContext('2d');
              
              if (icon.isCoin) {
                  // Draw a coin
                  const scale = icon.scale || 1;
                  const centerX = 30;
                  const centerY = 30;
                  const radius = 25 * scale;
                  
                  // Outer circle
                  ctx.beginPath();
                  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                  ctx.fillStyle = icon.color;
                  ctx.fill();
                  ctx.lineWidth = 2;
                  ctx.strokeStyle = '#B8860B';
                  ctx.stroke();
                  
                  // Inner details
                  ctx.beginPath();
                  ctx.arc(centerX, centerY, radius * 0.8, 0, 2 * Math.PI);
                  ctx.lineWidth = 1;
                  ctx.strokeStyle = '#B8860B';
                  ctx.stroke();
                  
                  // Shine effect
                  ctx.beginPath();
                  ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.2, 0, 2 * Math.PI);
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                  ctx.fill();
              } else {
                  // Draw a gold bar
                  ctx.fillStyle = icon.color;
                  ctx.fillRect(5, 15, 50, 30);
                  ctx.lineWidth = 2;
                  ctx.strokeStyle = '#B8860B';
                  ctx.strokeRect(5, 15, 50, 30);
                  
                  // Add karat text
                  const karat = icon.name.replace('gold', '');
                  ctx.font = 'bold 14px Arial';
                  ctx.fillStyle = '#B8860B';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillText(`${karat}K`, 30, 30);
                  
                  // Shine effect
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                  ctx.fillRect(10, 20, 40, 5);
              }
              
              // Save the icon
              const dataUrl = canvas.toDataURL('image/png');
              
              // Update all matching images in the document
              document.querySelectorAll(`img[src="${iconPath}"]`).forEach(img => {
                  img.src = dataUrl;
              });
          };
          img.src = iconPath;
      });
  }
  
  // Update currency table
  function updateCurrencyTable(currencyData) {
      const tableBody = document.getElementById('currency-table-body');
      if (!tableBody) return;
      
      let html = '';
      
      html += createTableRow('<img src="assets/usd.png" class="currency-icon" alt="دولار">دولار أمريكي (USD)', currencyData.USD);
      html += createTableRow('<img src="assets/eur.png" class="currency-icon" alt="يورو">يورو (EUR)', currencyData.EUR);
      html += createTableRow('<img src="assets/try.png" class="currency-icon" alt="ليرة تركية">ليرة تركية (TRY)', currencyData.TRY);
      html += createTableRow('<img src="assets/eur_usd.png" class="currency-icon" alt="يورو/دولار">يورو/دولار (EUR/USD)', currencyData.EURUSD);
      
      tableBody.innerHTML = html;
      
      // Create currency icons if they don't exist
      createCurrencyIconsIfNeeded();
  }
  
  // Create currency icons if they don't exist
  function createCurrencyIconsIfNeeded() {
      const iconTypes = [
          { name: 'usd', symbol: '$', color: '#85bb65' },
          { name: 'eur', symbol: '€', color: '#0052b4' },
          { name: 'try', symbol: '₺', color: '#e30a17' },
          { name: 'eur_usd', symbol: '€/$', color: '#7cb5ec' }
      ];
      
      iconTypes.forEach(icon => {
          const iconPath = `assets/${icon.name}.png`;
          
          // Check if file exists by trying to load it
          const img = new Image();
          img.onerror = function() {
              // Create the icon
              const canvas = document.createElement('canvas');
              canvas.width = 60;
              canvas.height = 60;
              const ctx = canvas.getContext('2d');
              
              // Draw a circle background
              ctx.beginPath();
              ctx.arc(30, 30, 25, 0, 2 * Math.PI);
              ctx.fillStyle = icon.color;
              ctx.fill();
              
              // Add currency symbol
              ctx.font = 'bold 24px Arial';
              ctx.fillStyle = 'white';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(icon.symbol, 30, 30);
              
              // Save the icon
              const dataUrl = canvas.toDataURL('image/png');
              
              // Update all matching images in the document
              document.querySelectorAll(`img[src="${iconPath}"]`).forEach(img => {
                  img.src = dataUrl;
              });
          };
          img.src = iconPath;
      });
  }
  
  // Update metals table
  function updateMetalsTable(metalsData) {
      const tableBody = document.getElementById('metals-table-body');
      if (!tableBody) return;
      
      let html = '';
      
      html += createTableRow('<img src="assets/silver.png" class="metal-icon" alt="فضة">فضة (Silver)', metalsData.silver);
      html += createTableRow('<img src="assets/platinum.png" class="metal-icon" alt="بلاتين">بلاتين (Platinum)', metalsData.platinum);
      html += createTableRow('<img src="assets/palladium.png" class="metal-icon" alt="بلاديوم">بلاديوم (Palladium)', metalsData.palladium);
      
      tableBody.innerHTML = html;
      
      // Create metal icons if they don't exist
      createMetalIconsIfNeeded();
  }
  
  // Create metal icons if they don't exist
  function createMetalIconsIfNeeded() {
      const iconTypes = [
          { name: 'silver', color: '#C0C0C0' },
          { name: 'platinum', color: '#E5E4E2' },
          { name: 'palladium', color: '#CFC9C9' }
      ];
      
      iconTypes.forEach(icon => {
          const iconPath = `assets/${icon.name}.png`;
          
          // Check if file exists by trying to load it
          const img = new Image();
          img.onerror = function() {
              // Create the icon
              const canvas = document.createElement('canvas');
              canvas.width = 60;
              canvas.height = 60;
              const ctx = canvas.getContext('2d');
              
              // Draw a metal bar
              ctx.fillStyle = icon.color;
              ctx.fillRect(5, 15, 50, 30);
              ctx.lineWidth = 2;
              ctx.strokeStyle = '#555';
              ctx.strokeRect(5, 15, 50, 30);
              
              // Add metal symbol
              const symbol = icon.name.charAt(0).toUpperCase();
              ctx.font = 'bold 24px Arial';
              ctx.fillStyle = '#555';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(symbol, 30, 30);
              
              // Shine effect
              ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
              ctx.fillRect(10, 20, 40, 5);
              
              // Save the icon
              const dataUrl = canvas.toDataURL('image/png');
              
              // Update all matching images in the document
              document.querySelectorAll(`img[src="${iconPath}"]`).forEach(img => {
                  img.src = dataUrl;
              });
          };
          img.src = iconPath;
      });
  }
  
  // Create table row
  function createTableRow(title, data) {
      if (!data) return '';
      
      const buyPrice = data.buy.toFixed(2);
      const sellPrice = data.sell.toFixed(2);
      const change = data.change.toFixed(2);
      const direction = data.direction || 'up';
      
      const directionIcon = direction === 'up' 
          ? '<i class="fas fa-arrow-up text-success"></i>' 
          : '<i class="fas fa-arrow-down text-danger"></i>';
      
      const directionClass = direction === 'up' ? 'text-success' : 'text-danger';
      
      return `
          <tr>
              <td>${title}</td>
              <td>${buyPrice}</td>
              <td>${sellPrice}</td>
              <td class="${directionClass}">${directionIcon} ${change}%</td>
          </tr>
      `;
  }
  
  // Update last update time
  function updateLastUpdateTime() {
      const now = new Date();
      const timeString = now.toLocaleTimeString('ar-SA');
      const lastUpdateElement = document.getElementById('last-update');
      if (lastUpdateElement) {
          lastUpdateElement.innerHTML = `آخر تحديث: <span>${timeString}</span>`;
      }
  }
  
  // Handle tab change
  function handleTabChange(event) {
      const tabId = event.target.id;
      
      // Update chart type based on active tab
      if (tabId === 'gold-tab') {
          currentChartType = 'gold';
      } else if (tabId === 'currency-tab') {
          currentChartType = 'currency';
      } else if (tabId === 'metals-tab') {
          currentChartType = 'metals';
      }
      
      // Update chart
      updateChart(currentChartType, currentChartPeriod);
  }
  
  // Handle chart period change
  function handleChartPeriodChange(event) {
      const periodButtons = document.querySelectorAll('[data-period]');
      
      // Remove active class from all buttons
      periodButtons.forEach(button => {
          button.classList.remove('active');
      });
      
      // Add active class to clicked button
      event.target.classList.add('active');
      
      // Update chart period
      currentChartPeriod = event.target.dataset.period;
      
      // Update chart
      updateChart(currentChartType, currentChartPeriod);
  }
  
  // Initialize chart
  function initChart(type, period) {
      const ctx = document.getElementById('priceChart').getContext('2d');
      
      // Get chart data
      const chartData = getChartData(type, period);
      
      // Create chart
      chartInstance = new Chart(ctx, {
          type: 'line',
          data: {
              labels: chartData.labels,
              datasets: [{
                  label: getChartLabel(type),
                  data: chartData.prices,
                  backgroundColor: 'rgba(122, 68, 149, 0.2)',
                  borderColor: '#7a4495',
                  borderWidth: 2,
                  pointBackgroundColor: '#7a4495',
                  pointBorderColor: '#fff',
                  pointRadius: 4,
                  tension: 0.3
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                  legend: {
                      display: true,
                      position: 'top',
                      labels: {
                          font: {
                              family: 'Tajawal',
                              size: 14
                          }
                      }
                  },
                  tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleFont: {
                          family: 'Tajawal',
                          size: 14
                      },
                      bodyFont: {
                          family: 'Tajawal',
                          size: 13
                      },
                      callbacks: {
                          label: function(context) {
                              return `${getChartLabel(type)}: ${context.raw.toFixed(2)}`;
                          }
                      }
                  }
              },
              scales: {
                  x: {
                      grid: {
                          display: false
                      },
                      ticks: {
                          font: {
                              family: 'Tajawal',
                              size: 12
                          }
                      }
                  },
                  y: {
                      grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                      },
                      ticks: {
                          font: {
                              family: 'Tajawal',
                              size: 12
                          }
                      }
                  }
              }
          }
      });
  }
  
  // Update chart
  function updateChart(type, period) {
      // If chart doesn't exist, initialize it
      if (!chartInstance) {
          initChart(type, period);
          return;
      }
      
      // Get chart data
      const chartData = getChartData(type, period);
      
      // Update chart data
      chartInstance.data.labels = chartData.labels;
      chartInstance.data.datasets[0].data = chartData.prices;
      chartInstance.data.datasets[0].label = getChartLabel(type);
      
      // Update chart
      chartInstance.update();
  }
  
  // Get chart data
  function getChartData(type, period) {
      // For now, we'll use fallback data
      // In a production environment, we would fetch this data from the API
      return fallbackHistoricalData.gold[period];
  }
  
  // Get chart label
  function getChartLabel(type) {
      switch (type) {
          case 'gold':
              return 'سعر الذهب عيار 24';
          case 'currency':
              return 'سعر الدولار الأمريكي';
          case 'metals':
              return 'سعر الفضة';
          default:
              return 'السعر';
      }
  }
  
  // Set up converters
  function setupConverters() {
      // Currency converter
      const currencyAmount = document.getElementById('currency-converter-amount');
      const currencyFrom = document.getElementById('currency-converter-from');
      const currencyTo = document.getElementById('currency-converter-to');
      const currencyResult = document.getElementById('currency-converter-result');
      
      // Gold converter
      const goldAmount = document.getElementById('gold-converter-amount');
      const goldFrom = document.getElementById('gold-converter-from');
      const goldTo = document.getElementById('gold-converter-to');
      const goldResult = document.getElementById('gold-converter-result');
      
      // Add event listeners
      [currencyAmount, currencyFrom, currencyTo].forEach(element => {
          if (element) {
              element.addEventListener('input', updateCurrencyConverter);
          }
      });
      
      [goldAmount, goldFrom, goldTo].forEach(element => {
          if (element) {
              element.addEventListener('input', updateGoldConverter);
          }
      });
      
      // Initial update
      updateCurrencyConverter();
      updateGoldConverter();
  }
  
  // Update converters with new data
  function updateConverters(data) {
      // We'll use this data for conversion rates
      // For now, we'll just update the converters
      updateCurrencyConverter();
      updateGoldConverter();
  }
  
  // Update currency converter
  function updateCurrencyConverter() {
      const amount = parseFloat(document.getElementById('currency-converter-amount').value) || 0;
      const fromCurrency = document.getElementById('currency-converter-from').value;
      const toCurrency = document.getElementById('currency-converter-to').value;
      const resultElement = document.getElementById('currency-converter-result');
      
      // Get conversion rates
      const rates = {
          USD: 1,
          EUR: 0.91,
          TRY: 32.15
      };
      
      // Convert to USD first
      const usdAmount = amount / rates[fromCurrency];
      
      // Then convert to target currency
      const result = usdAmount * rates[toCurrency];
      
      // Update result
      resultElement.textContent = result.toFixed(2);
  }
  
  // Update gold converter
  function updateGoldConverter() {
      const amount = parseFloat(document.getElementById('gold-converter-amount').value) || 0;
      const fromKarat = document.getElementById('gold-converter-from').value;
      const toKarat = document.getElementById('gold-converter-to').value;
      const resultElement = document.getElementById('gold-converter-result');
      
      // Get karat values
      const karatValues = {
          '24K': 24,
          '22K': 22,
          '18K': 18,
          '14K': 14
      };
      
      // Convert to pure gold first
      const pureGold = amount * (karatValues[fromKarat] / 24);
      
      // Then convert to target karat
      const result = pureGold * (24 / karatValues[toKarat]);
      
      // Update result
      resultElement.textContent = `${result.toFixed(2)} غرام`;
  }
  