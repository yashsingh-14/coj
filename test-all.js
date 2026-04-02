const key = 'sk-2r22wuSAOq940awcXpQHeQmnI1IWaiPLNcyW6PcjCjjdz86V';
const model = 'deepseek-r1-0528';
const urls = [
  'https://api.openai.com/v1/chat/completions',
  'https://openrouter.ai/api/v1/chat/completions',
  'https://api.deepseek.com/chat/completions',
  'https://api.siliconflow.cn/v1/chat/completions',
  'https://api.together.xyz/v1/chat/completions',
  'https://api.groq.com/openai/v1/chat/completions',
];

async function check() {
  for (let url of urls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: model, messages: [{role:'user',content:'hi'}], max_tokens: 5 })
      });
      const data = await res.json();
      if (!data.error || (data.error && data.error.code !== 'invalid_api_key' && data.error.type !== 'invalid_request_error' && res.status !== 401)) {
        console.log('MATCH:', url, res.status);
      } else {
        console.log('FAIL:', url, res.status);
      }
    } catch(e) {
      console.log('FAIL:', url, 'FETCH ERR');
    }
  }
}
check();
