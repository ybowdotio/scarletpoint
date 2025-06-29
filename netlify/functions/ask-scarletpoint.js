// Netlify Function: ask-scarletpoint.js (with vector search integration)
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const client = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    // Search the vector DB (Supabase) for relevant chunks
    const { data: matches, error } = await client.rpc('match_scarletpoint_chunks', {
      query_embedding: await getEmbedding(prompt),
      match_threshold: 0.78,
      match_count: 5
    });

    if (error) throw error;

    const contextText = matches.map(x => x.content).join('\n---\n');

    const systemPrompt = `You are the Scarlet Point chatbot. Your answers should prioritize the following context, drawn directly from the writings and theology of Scarlet Point. You may also incorporate mainstream theological, historical, or scientific knowledge to support your response — but always interpret it through the lens of Scarlet Point's worldview.

Context:
${contextText}`;

    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await completion.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ reply: data.choices?.[0]?.message?.content || 'No response.' })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Unknown error.' })
    };
  }
};

async function getEmbedding(text) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiKey}`
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float'
    })
  });
  const result = await response.json();
  return result.data[0].embedding;
}
