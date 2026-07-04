// Firebase database URL
const FIREBASE_DB_URL = 'https://price-tracker-947bd-default-rtdb.firebaseio.com';

// Encode URL to safe Firebase key using base64
function encodeUrlToKey(url) {
  return btoa(url).replace(/[/+=]/g, (match) => {
    const map = { '/': '_', '+': '-', '=': '~' };
    return map[match];
  });
}

// Get current active Chrome tab URL and display price history
document.addEventListener('DOMContentLoaded', function() {
  // Get the URL of the current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs.length === 0) {
      displayMessage('Unable to get current tab');
      return;
    }
    
    const currentUrl = tabs[0].url;
    console.log('📍 Current Tab URL:', currentUrl);
    
    // Check if URL matches supported sites
    if (!currentUrl.includes('riyasewana') && !currentUrl.includes('ikman') && !currentUrl.includes('patpat') && !currentUrl.includes('autolanka')) {
      displayMessage('📌 Open a Riyasewana, Ikman, Patpat, or Autolanka vehicle listing to see price history');
      return;
    }
    
    // Fetch price history from Firebase
    const encodedUrl = encodeUrlToKey(currentUrl);
    const firebaseUrl = `${FIREBASE_DB_URL}/prices/${encodedUrl}.json`;
    
    fetch(firebaseUrl)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (data && Array.isArray(data)) {
          console.log('📊 Price history fetched from Firebase:', data);
          displayPriceHistory(data);
        } else {
          console.log('No price history for this vehicle yet');
          displayMessage('No price history for this vehicle yet');
        }
      })
      .catch(error => {
        console.error('❌ Error fetching price history:', error);
        displayMessage('Error loading price history. Please try again.');
      });
  });
});

// Display price history in a nice list format
function displayPriceHistory(priceHistory) {
  const historyContainer = document.getElementById('priceHistory');
  historyContainer.innerHTML = '';
  
  // Add title
  const title = document.createElement('div');
  title.className = 'history-title';
  title.textContent = '📈 Price History';
  historyContainer.appendChild(title);
  
  // Add vehicle title if available
  if (priceHistory[0] && priceHistory[0].title) {
    const vehicleTitle = document.createElement('div');
    vehicleTitle.className = 'vehicle-title';
    vehicleTitle.textContent = priceHistory[0].title;
    historyContainer.appendChild(vehicleTitle);
  }
  
  // Create list of all price entries (reverse to show newest first)
  const list = document.createElement('ul');
  list.className = 'price-list';
  
  priceHistory.slice().reverse().forEach(function(entry) {
    const listItem = document.createElement('li');
    listItem.className = 'price-entry';
    
    const dateSpan = document.createElement('span');
    dateSpan.className = 'date';
    dateSpan.textContent = entry.date;
    
    const priceSpan = document.createElement('span');
    priceSpan.className = 'price';
    priceSpan.textContent = entry.price;
    
    listItem.appendChild(dateSpan);
    listItem.appendChild(priceSpan);
    list.appendChild(listItem);
  });
  
  historyContainer.appendChild(list);
  
  // Add summary info
  const summary = document.createElement('div');
  summary.className = 'history-summary';
  summary.innerHTML = `<strong>Total Records:</strong> ${priceHistory.length}`;
  historyContainer.appendChild(summary);
}

// Display a message when no history or error occurs
function displayMessage(message) {
  const historyContainer = document.getElementById('priceHistory');
  historyContainer.innerHTML = '';
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  messageDiv.textContent = message;
  historyContainer.appendChild(messageDiv);
}
