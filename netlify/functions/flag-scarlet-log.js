// netlify/functions/flag-scarlet-log.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  try {
    const { id, flagged } = JSON.parse(event.body || '{}');
    console.log('🪵 Received payload:', { id, flagged });

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing log ID' })
      };
    }

    const { error } = await supabase
      .from('scarlet_logs')
      .update({ flagged })
      .eq('id', id);

    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, error: error.message })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
