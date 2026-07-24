const key = 'ab57a0514934218f48198ef3210698db';
const url = 'https://api.bytez.com/models/v2/openai/v1/chat/completions';
async function test() {
  let res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'deepseek-ai/DeepSeek-R1', messages: [{role:'user',content:'Hi'}], max_tokens: 5 })
  });
  console.log('Status Bytez R1:', res.status, await res.text());
}
test();
