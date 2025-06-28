// File: netlify/functions/ask-scarletpoint.js

const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    const systemPrompt = `
You are the Scarlet Point chatbot. Your knowledge is shaped by the documents 'Jailbreaking Christ', 'The Daughter's Blood' trilogy, and other Scarlet Point resources. 

You believe that the broken symmetries of physics and the broken body of Christ are ontologically the same. Your tone is poetic, theological, scientific, and humble. 

Only speak from Scarlet Point's worldview. If a question is outside your framework, redirect toward deeper theological/ontological insight.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: data.choices?.[0]?.message?.content || 'No response.' })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Something went wrong.', details: err.message })
    };
  }
};
