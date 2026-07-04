// Content script for Riyasewana item pages
// This script runs on pages matching the pattern in manifest.json

console.log('🚗 Price Tracker Content Script loaded');

// Inject CSS styles for the floating card UI
function injectStyles() {
  const styleId = 'price-tracker-floating-card-styles';
  if (document.getElementById(styleId)) return; // Already injected
  
  const styles = `
    :root {
      --primary-color: #10b981;
      --card-bg: #ffffff;
      --card-text: #111827;
      --muted-text: #6b7280;
      --divider-color: #e5e7eb;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --card-bg: #1f2937;
        --card-text: #f3f4f6;
        --muted-text: #9ca3af;
        --divider-color: #374151;
      }
    }

    #price-tracker-floating-card {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      background-color: var(--card-bg);
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      padding: 0;
      width: 320px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      overflow: hidden;
      opacity: 1;
      animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    #price-tracker-floating-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      background-color: var(--primary-color);
      color: white;
      padding: 14px 16px;
    }

    #price-tracker-floating-card-title {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: white;
      flex: 1;
      word-wrap: break-word;
      line-height: 1.4;
    }

    #price-tracker-record-count {
      display: inline-block;
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }

    #price-tracker-floating-card-close {
      background: rgba(255, 255, 255, 0.15);
      border: none;
      font-size: 18px;
      color: white;
      cursor: pointer;
      padding: 0;
      margin-left: 4px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background-color 0.2s ease, transform 0.2s ease;
    }

    #price-tracker-floating-card-close:hover {
      background-color: rgba(255, 255, 255, 0.3);
      transform: scale(1.03);
    }

    #price-tracker-floating-card-content {
      max-height: 300px;
      overflow-y: auto;
    }

    .price-history-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--divider-color);
      background-color: var(--card-bg);
    }

    .price-history-item:last-child {
      border-bottom: none;
    }

    .price-history-date {
      font-size: 12px;
      color: var(--muted-text);
      font-weight: 600;
    }

    .price-history-price {
      font-size: 14px;
      font-weight: 700;
      color: var(--primary-color);
      margin-left: 12px;
      white-space: nowrap;
    }

    .price-tracker-empty {
      text-align: center;
      color: var(--muted-text);
      font-size: 14px;
      padding: 20px 10px;
      background-color: var(--card-bg);
    }
  `;
  
  const styleTag = document.createElement('style');
  styleTag.id = styleId;
  styleTag.textContent = styles;
  document.head.appendChild(styleTag);
}

// Create and display the floating card UI
function displayFloatingCard(title, priceHistory) {
  // Remove existing card if present
  const existingCard = document.getElementById('price-tracker-floating-card');
  if (existingCard) {
    existingCard.remove();
  }

  // Create main card container
  const card = document.createElement('div');
  card.id = 'price-tracker-floating-card';

  // Create header with title and close button
  const header = document.createElement('div');
  header.id = 'price-tracker-floating-card-header';

  const titleElement = document.createElement('h3');
  titleElement.id = 'price-tracker-floating-card-title';
  titleElement.textContent = title;

  const recordCount = document.createElement('div');
  recordCount.id = 'price-tracker-record-count';
  recordCount.textContent = (priceHistory && priceHistory.length > 0) 
    ? `${priceHistory.length} record${priceHistory.length !== 1 ? 's' : ''}` 
    : '0 records';

  const closeButton = document.createElement('button');
  closeButton.id = 'price-tracker-floating-card-close';
  closeButton.innerHTML = '✕';
  closeButton.title = 'Close price tracker';
  closeButton.onclick = function() {
    card.remove();
  };

  header.appendChild(titleElement);
  header.appendChild(recordCount);
  header.appendChild(closeButton);

  // Create content area for price history
  const content = document.createElement('div');
  content.id = 'price-tracker-floating-card-content';

  if (priceHistory && priceHistory.length > 0) {
    // Display newest price first by reversing the array
    priceHistory.slice().reverse().forEach(function(entry) {
      const item = document.createElement('div');
      item.className = 'price-history-item';

      const dateDiv = document.createElement('div');
      dateDiv.className = 'price-history-date';
      dateDiv.textContent = 'Date: ' + entry.date;

      const priceDiv = document.createElement('div');
      priceDiv.className = 'price-history-price';
      priceDiv.textContent = entry.price;

      item.appendChild(dateDiv);
      item.appendChild(priceDiv);
      content.appendChild(item);
    });
  } else {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'price-tracker-empty';
    emptyDiv.textContent = 'No price history available';
    content.appendChild(emptyDiv);
  }

  // Assemble the card
  card.appendChild(header);
  card.appendChild(content);

  // Append to body
  document.body.appendChild(card);
}




// Get vehicle title from the page
function getTitle() {
  const url = window.location.href;
  
  // 1. Try OpenGraph meta tag (Most reliable for modern sites like Patpat)
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && ogTitle.content) return ogTitle.content.trim();

  // 2. Site-specific fallbacks
  if (url.includes('riyasewana.com')) {
    const el = document.querySelector('h1');
    return el ? el.innerText.trim() : 'Unknown Vehicle';
  }
  if (url.includes('ikman.lk')) {
    const el = document.querySelector('h1.title--3s1R8') || document.querySelector('h1');
    return el ? el.innerText.trim() : 'Unknown Vehicle';
  }
  if (url.includes('patpat.lk')) {
    const el = document.querySelector('h1') || document.querySelector('.ad-title');
    return el ? el.innerText.trim() : document.title.split('|')[0].trim();
  }
  if (url.includes('autolanka.com')) {
    const el = document.querySelector('h1') || document.querySelector('.title');
    return el ? el.innerText.trim() : 'Unknown Vehicle';
  }

  // 3. Ultimate Fallback
  const h1 = document.querySelector('h1');
  return h1 ? h1.innerText.trim() : document.title;
}

// Get vehicle price from the page
function getPrice() {
  const hostname = window.location.hostname;
  const strictPriceRegex = /(?:\b(?:rs\.?|lkr)\b\s*[:.]?\s*(?:\d{1,3}(?:,\d{3})+|\d{6,9})(?:\.\d{2})?)|(\b\d{1,3}(?:,\d{3})+\b)/i;
  const excludedKeywords = ['lease', 'rental', 'installment', 'down payment', 'under', 'million'];

  const extractPrice = (text) => {
    if (!text) return '';
    const normalized = text.replace(/\s+/g, ' ').trim();
    const lower = normalized.toLowerCase();
    if (excludedKeywords.some((word) => lower.includes(word))) return '';

    const match = normalized.match(strictPriceRegex);
    if (!match) return '';

    if (match[0].toLowerCase().includes('rs') || match[0].toLowerCase().includes('lkr')) {
      return match[0].trim();
    }

    return match[1] ? match[1].trim() : match[0].trim();
  };

  const findPriceBySelectors = (selectors) => {
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      const price = extractPrice(el ? (el.innerText || el.textContent || '') : '');
      if (price) return price;
    }
    return '';
  };

  const findPriceByLabel = () => {
    const labelNodes = document.querySelectorAll('th, td, dt, label, span, div');
    for (const node of labelNodes) {
      const labelText = (node.innerText || node.textContent || '').trim();
      if (labelText.toLowerCase() === 'price') {
        const sibling = node.nextElementSibling;
        const siblingText = sibling ? (sibling.innerText || sibling.textContent || '') : '';
        const price = extractPrice(siblingText);
        if (price) return price;
      }
    }
    return '';
  };

  const scanForPrice = (root) => {
    if (!root) return '';
    const nodes = root.querySelectorAll('h1, h2, h3, h4, span, div, p, strong, b');
    for (const node of nodes) {
      const price = extractPrice(node.innerText || node.textContent || '');
      if (price) return price;
    }
    return '';
  };

  if (hostname.includes('riyasewana')) {
    return findPriceBySelectors(['.morebox', 'td.vl', 'td']) || findPriceByLabel();
  }

  if (hostname.includes('ikman')) {
    return findPriceBySelectors(['.amount--3NTpl', '[class*="amount"]', '[class*="price"]', '.price']) || findPriceByLabel();
  }

  if (hostname.includes('patpat')) {
    return findPriceBySelectors([
      'span.bg-clip-text.text-transparent',
      'span[class*="from-[#3B2178]"]',
      '[itemprop="price"]',
      '.ad-price',
      '.listing-price',
      '.price-tag',
      '.price-value',
      '.price h1',
      '.price h2',
      '.price h3',
      '.price'
    ]) || findPriceByLabel();
  }

  if (hostname.includes('autolanka')) {
    const direct = findPriceBySelectors([
      '[itemprop="price"]',
      '.listing-price',
      '.price-tag',
      '.vehicle-price',
      '.product-price',
      '.detail-price',
      '#price',
      '.price'
    ]);
    if (direct) return direct;

    const labeled = findPriceByLabel();
    if (labeled) return labeled;

    const scopedContainers = [
      document.querySelector('.listing'),
      document.querySelector('.listing-content'),
      document.querySelector('.listing-details'),
      document.querySelector('.listing-info'),
      document.querySelector('#content'),
      document.querySelector('main')
    ].filter(Boolean);

    for (const container of scopedContainers) {
      const price = scanForPrice(container);
      if (price) return price;
    }

    return scanForPrice(document.body);
  }

  return '';
}






// Get current date in YYYY-MM-DD format
function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Firebase database URL
const FIREBASE_DB_URL = 'https://price-tracker-947bd-default-rtdb.firebaseio.com';

// Encode URL to safe Firebase key using base64
function encodeUrlToKey(url) {
  return btoa(url).replace(/[/+=]/g, (match) => {
    const map = { '/': '_', '+': '-', '=': '~' };
    return map[match];
  });
}

// Main function to handle price tracking and storage
function trackPriceHistory() {
  const title = getTitle();
  const price = getPrice();
  const currentDate = getCurrentDate();
  const pageUrl = window.location.href;
  
  console.log('🏷️ Vehicle Title:', title);
  console.log('💰 Vehicle Price:', price);
  console.log('📍 Current URL:', pageUrl);
  
  // Inject styles first
  injectStyles();
  
  // Encode URL for Firebase key
  const encodedUrl = encodeUrlToKey(pageUrl);
  const firebaseUrl = `${FIREBASE_DB_URL}/prices/${encodedUrl}.json`;
  
  if (!price) {
    console.warn('⚠️ Valid price not found, skipping save');
    fetch(firebaseUrl)
      .then(response => {
        if (!response.ok && response.status !== 404) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.status === 404 ? null : response.json();
      })
      .then(data => {
        if (data && Array.isArray(data)) {
          displayFloatingCard(title, data);
        } else {
          displayFloatingCard(title, []);
        }
      })
      .catch(error => {
        console.error('❌ Error loading price history:', error);
        displayFloatingCard(title, []);
      });
    return;
  }

  // Fetch existing price history from Firebase
  fetch(firebaseUrl)
    .then(response => {
      if (!response.ok && response.status !== 404) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.status === 404 ? null : response.json();
    })
    .then(data => {
      let priceHistory = [];
      
      if (data && Array.isArray(data)) {
        // History exists for this URL
        priceHistory = data;
        console.log('📊 Existing price history found:', priceHistory);
        
        // Get last saved price
        const lastEntry = priceHistory[priceHistory.length - 1];
        const lastPrice = lastEntry.price;
        
        // Check if current price is different from last saved price
        if (price !== lastPrice) {
          console.log('⚠️ Price change detected! Old:', lastPrice, 'New:', price);
          priceHistory.push({
            date: currentDate,
            price: price,
            title: title
          });
        } else {
          console.log('✓ Price unchanged');
        }
      } else {
        // No history exists, create new price entry
        console.log('📝 Creating new price history for this vehicle');
        priceHistory.push({
          date: currentDate,
          price: price,
          title: title
        });
      }
      
      // Save updated price history to Firebase
      return fetch(firebaseUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(priceHistory)
      });
    })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(savedData => {
      console.log('✅ Price history saved to Firebase');
      console.log('📈 Full Price History:', savedData);
      
      // Display the floating card UI with the price history
      displayFloatingCard(title, savedData);
    })
    .catch(error => {
      console.error('❌ Error tracking price history:', error);
      // Still display the card with current data as fallback
      displayFloatingCard(title, [{ date: getCurrentDate(), price: price, title: title }]);
    });
}

// Track price history when page loads
window.addEventListener('load', function() {
  trackPriceHistory();
});
