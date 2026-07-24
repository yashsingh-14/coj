const Anthropic = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
async function run() {
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Say hi' }]
    });
    console.log('Success:', msg);
  } catch (e) {
    console.error('Error Body:', e.error);
    console.error('Error Status:', e.status);
    console.error('Error Name:', e.name);
  }
}
run();
