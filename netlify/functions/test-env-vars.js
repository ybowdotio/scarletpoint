exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      supabase_url: process.env.SUPABASE_URL,
      openai_key_preview: process.env.OPENAI_API_KEY?.slice(0, 5) + '...' // to confirm it's loaded
    })
  };
};
