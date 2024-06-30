// background.js

// Listener for messages from content script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log(`User ${message.type} on element with id "${message.targetId}" at (${message.x}, ${message.y}) at ${message.timestamp}`);
  storeInteractionData(message);  
});
let interactionData = [];

function storeInteractionData(data) {
interactionData.push(data);
}


// Function to fetch interaction data
function fetchInteractionData() {
  return interactionData; // Assuming interactionData is a global array holding logged data
}
// Function to load GPT-3.5 model and check if it's working
async function loadGPTModelAndCheck() {
  const apiKey = 'sk-proj-XJt0ImyJexXJXseSnd8vT3BlbkFJubQIX4KzdiaeozKPDC3I'; // Replace with your OpenAI API key
  const apiUrl = 'https://api.openai.com/v1/engines';

  try {
      const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
          }
      });

      if (!response.ok) {
          throw new Error('Failed to load GPT-3.5 model');
      }

      const data = await response.json();
      console.log(data)

      // Check if the specific model (e.g., text-davinci-003) is available
      const modelAvailable = data.data.some(model => model.id === 'gpt-3.5-turbo');
      if (modelAvailable) {
          console.log('GPT-3.5 model  is available and working.');
      } else {
          console.log('GPT-3.5 model is not available.');
      }
  } catch (error) {
      console.error('Error loading GPT-3.5 model:', error.message);
  }
}




async function generateNarrativeWithGPT(narrative) {
  const apiUrl = 'https://api.openai.com/v1/completions';

  const apiKey = "sk-proj-XJt0ImyJexXJXseSnd8vT3BlbkFJubQIX4KzdiaeozKPDC3I";
  const maxRetries = 5; // Maximum number of retries
  let retryCount = 0; // Initial retry count
  let delay = 1000; // Initial delay of 1 second
  
  // Prepare prompt for GPT-3.5
  const prompt = `Based on the user interactions, summarize their needs and interests. Here is the narrative ${narrative}`;
  while (retryCount < maxRetries) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                prompt: prompt,
                max_tokens: 150
            })
        });

        if (!response.ok) {
            if (response.status === 429) {
                // Rate limit exceeded, retry after delay
                console.warn(`Rate limit exceeded. Retrying in ${delay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                retryCount++;
                delay *= 2; // Exponential backoff
                continue;
            } else {
                throw new Error(`Failed to generate narrative with GPT-3.5: ${response.statusText}`);
            }
        }

        const { choices } = await response.json();
        const narrative = choices[0].text.trim();
        console.log("Generated Narrative:", narrative);
        return narrative;
    } catch (error) {
        console.error('Error generating narrative with GPT-3.5:', error.message);
        return "Failed to generate narrative.";
    }
}

console.error('Max retries exceeded. Failed to generate narrative with GPT-3.5.');
return "Failed to generate narrative after multiple attempts.";
}

// Example function to generate narrative using fetched interaction data
function generateNarrative(interactionData) {
   // Object to store detailed event information
let detailedEvents = {};

// Iterate through interactionData to store details
interactionData.forEach(data => {
  // Ensure data has necessary properties
  if (!data.type || !data.timestamp) {
    return; // Skip invalid data
  }

  // Initialize event type if not already present
  if (!detailedEvents[data.type]) {
    detailedEvents[data.type] = [];
  }

  // Store detailed event information
  detailedEvents[data.type].push({
    targetId: data.targetId || 'unknown',
    position: { x: data.x, y: data.y },
    timestamp: data.timestamp
  });
});

// Generate narrative based on detailed event information
let narrative = "Visitor's attention is focused on: ";

Object.keys(detailedEvents).forEach(type => {
  const events = detailedEvents[type];

  // Add event type to the narrative
  narrative += `${type}s`;

  // Add details for each event type
  events.forEach((event, index) => {
    narrative += ` (${event.targetId} at (${event.position.x}, ${event.position.y})`;

    // Optionally, include timestamp
    // narrative += `, ${event.timestamp}`;

    if (index < events.length - 1) {
      narrative += ', ';
    }
  });

  narrative += '; ';
});

return narrative;

}

// Periodically update narrative every 5 seconds
setInterval(async() => {
  // Fetch interaction data from logs or storage
  const interactionData = fetchInteractionData();

  // Generate narrative based on interaction data
  const narrative = generateNarrative(interactionData);
  loadGPTModelAndCheck();
  const llmresult= await generateNarrativeWithGPT(narrative);
  
  // Display or log the narrative
  console.log("Visitor's Narrative (N):", narrative);
}, 5000);
