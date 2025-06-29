const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async () => {
  const { data, error } = await supabase
    .from('scarlet_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(50);

  return {
    statusCode: error ? 500 : 200,
    body: JSON.stringify({ data, error }),
  };
};
