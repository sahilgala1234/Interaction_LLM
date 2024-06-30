// popup.js

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get('interactions', function(result) {
      const interactions = result.interactions || [];
      const interactionsList = document.getElementById('interactionsList');
  
      interactions.forEach(interaction => {
        const listItem = document.createElement('div');
        listItem.textContent = `Timestamp: ${new Date(interaction.timestamp).toLocaleString()}, Target: ${interaction.target.tagName}`;
        interactionsList.appendChild(listItem);
      });
  
      if (interactions.length === 0) {
        interactionsList.textContent = 'No interactions logged yet.';
      }
    });
  });
  