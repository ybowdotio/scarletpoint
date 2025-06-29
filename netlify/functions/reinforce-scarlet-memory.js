const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.handler = async (event) => {
  const { content, source, topic } = JSON.parse(event.body);

  try {
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: content
    });

    const embedding = embeddingResponse.data[0].embedding;

    const { error } = await supabase
      .from('scarlet_chunks')
      .insert([{
        content,
        embedding,
        source: source || null,
        topic: topic || null
      }]);

    return {
      statusCode: error ? 500 : 200,
      body: JSON.stringify({ success: !error, error }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
