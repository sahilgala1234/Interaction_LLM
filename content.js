// content.js

// Function to send message to background script
function sendMessageToBackground(message) {
    try {
      chrome.runtime.sendMessage(message, function(response) {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError.message);
          // Optionally handle or log the error here
        }
      });
    } catch (error) {
      console.error('Error sending message:', error.message);
      // Optionally handle or log the error here
    }
  }

  function getTargetName(target) {
    return target.ariaLabel || target.innerText || target.tagName;
  }  
  
  // Event listeners to capture user interactions
  document.addEventListener('click', function(event) {
    sendMessageToBackground({
      type: 'click',
      targetId: getTargetName(event.target),
      x: event.clientX,
      y: event.clientY,
      timestamp: new Date().toLocaleString()
    });
  });
  
  document.addEventListener('keydown', function(event) {
    sendMessageToBackground({
      type: 'type',
      targetId: getTargetName(event.target),
      x: -1,
      y: -1,
      timestamp: new Date().toLocaleString()
    });
  });
  
  document.addEventListener('mouseover', function(event) {
    sendMessageToBackground({
      type: 'hover',
      targetId:getTargetName(event.target) ,
      x: event.clientX,
      y: event.clientY,
      timestamp: new Date().toLocaleString()
    });
  });
  
  document.addEventListener('touchstart', function(event) {
    const touch = event.touches[0];
    sendMessageToBackground({
      type: 'swipe',
      targetId: getTargetName(event.target) ,
      x: touch.clientX,
      y: touch.clientY,
      timestamp: new Date().toLocaleString()
    });
  });
  
  document.addEventListener('touchmove', function(event) {
    const touch = event.touches[0];
    sendMessageToBackground({
      type: 'swipe',
      targetId: getTargetName(event.target),
      x: touch.clientX,
      y: touch.clientY,
      timestamp: new Date().toLocaleString()
    });
  });
  
  document.addEventListener('scroll', function(event) {
    sendMessageToBackground({
      type: getTargetName(event.target),
      targetId: 'document',
      x: window.scrollX,
      y: window.scrollY,
      timestamp: new Date().toLocaleString()
    });
  });
  
