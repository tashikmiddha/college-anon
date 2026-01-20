import OpenAI from 'openai';
import { config } from '../config/env.js';

const openai = config.openaiApiKey ? new OpenAI({ apiKey: config.openaiApiKey }) : null;

export const moderateContent = async (title, content) => {
  if (!openai) {
    console.log('OpenAI API key not configured, skipping moderation');
    return { flagged: false, reason: '' };
  }

  try {
    const response = await openai.moderations.create({
      input: `Title: ${title}\n\nContent: ${content}`
    });

    const moderationResult = response.results[0];
    
    if (moderationResult.flagged) {
      const categories = moderationResult.categories;
      const flaggedCategories = Object.entries(categories)
        .filter(([_, value]) => value)
        .map(([key]) => key);
      
      return {
        flagged: true,
        reason: `Content flagged for: ${flaggedCategories.join(', ')}`
      };
    }

    return { flagged: false, reason: '' };
  } catch (error) {
    console.error('Moderation error:', error);
    return { flagged: false, reason: '' };
  }
};

export const analyzeSentiment = async (content) => {
  if (!openai) {
    return null;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Analyze the sentiment of the following text. Return only one word: positive, negative, or neutral.'
        },
        {
          role: 'user',
          content: content.slice(0, 1000)
        }
      ],
      max_tokens: 10,
      temperature: 0.3
    });

    return response.choices[0].message.content.trim().toLowerCase();
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return null;
  }
};

// export const moderateContent = async (title, content) => {
//   return {
//     flagged: true,
//     reason: "Manual admin review required"
//   };
// };

// export const analyzeSentiment = async (content) => {
//   return null;
// };