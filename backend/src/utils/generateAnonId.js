import { v4 as uuidv4 } from 'uuid';

export const generateUniqueAnonId = () => {
  const uuid = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  return `Anon_${uuid}`;
};

export const generateDisplayName = () => {
  const adjectives = [
    'Mysterious', 'Secret', 'Hidden', 'Quiet', 'Shadow', 'Ghost', 
    'Anonymous', 'Silent', 'Invisible', 'Cosmic', 'Cosy', 'Dreamy'
  ];
  
  const nouns = [
    'Scholar', 'Student', 'Writer', 'Thinker', 'Observer', 'Voice',
    'Mind', 'Soul', 'Spirit', 'Traveler', 'Wanderer', 'Seeker'
  ];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adj} ${noun}`;
};

export const sanitizeContent = (content) => {
  return content
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

