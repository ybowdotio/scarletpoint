const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async (event) => {
  const { id, override, source, topic } = JSON.parse(event.body);

  const { error } = await supabase
    .from('scarlet_logs')
    .update({
      reply: override,
      override: true,
      source: source || null,
      topic: topic || null
    })
    .eq('id', id);

  return {
    statusCode: error ? 500 : 200,
    body: JSON.stringify({ success: !error, error }),
  };
};
