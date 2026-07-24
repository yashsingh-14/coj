const OpenAI = require('openai');

// Get the key from the environment
const apiKey = process.env.OPENAI_API_KEY;

// Check if it's OpenRouter (starts with sk-or-) otherwise default OpenAI
const isOR = apiKey && apiKey.startsWith('sk-or-');

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: isOR ? 'https://openrouter.ai/api/v1' : undefined, // OpenRouter fallback
});

async function run() {
  try {
    console.log("Pinging the API...");
    // Choose the model: if OpenRouter, maybe gemini-2.0-flash-exp:free 
    // if native OpenAI, gpt-4o-mini
    const modelTarget = isOR ? 'google/gemini-2.0-flash-exp:free' : 'gpt-4o-mini';

    const completion = await openai.chat.completions.create({
      model: modelTarget,
      messages: [{ role: 'user', content: 'Say hi in two words.' }],
      max_tokens: 10,
    });

    console.log('\n✅ Success! Response:');
    console.log(completion.choices[0].message.content);
  } catch (error) {
    console.log('\n❌ Error occurred:');
    if (error.status) {
       console.error('Status Code:', error.status); // 401 matlab invalid key
       console.error('Error Details:', error.error);
    } else {
       console.error('Error Message:', error.message);
    }
  }
}

// Ensure key exists
if (!apiKey) {
    console.error("❌ ERROR: OPENAI_API_KEY not found in environment variables.");
} else {
    run();
}
