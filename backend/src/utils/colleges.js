// List of IITs (Indian Institutes of Technology)
export const iits = [
  'IIT Bombay',
  'IIT Delhi',
  'IIT Madras',
  'IIT Kanpur',
  'IIT Kharagpur',
  'IIT Roorkee',
  'IIT Guwahati',
  'IIT Hyderabad',
  'IIT Varanasi (BHU)',
  'IIT Mandi',
  'IIT Patna',
  'IIT Bhubaneswar',
  'IIT Ropar',
  'IIT Indore',
  'IIT Jodhpur',
  'IIT Tirupati',
  'IIT Dhanbad',
  'IIT Bhilai',
  'IIT Goa',
  'IIT Palakkad',
  'IIT Jammu',
  'IIT Dharwad',
  'IIT (ISM) Dhanbad'
];

// List of NITs (National Institutes of Technology)
export const nits = [
  'NIT Trichy',
  'NIT Surathkal',
  'NIT Warangal',
  'NIT Calicut',
  'NIT Kurukshetra',
  'NIT Jaipur',
  'NIT Nagpur',
  'NIT Jamshedpur',
  'NIT Allahabad',
  'NIT Bhopal',
  'NIT Durgapur',
  'NIT Silchar',
  'NIT Hamirpur',
  'NIT Srinagar',
  'NIT Raipur',
  'NIT Uttarakhand',
  'NIT Meghalaya',
  'NIT Agartala',
  'NIT Arunachal Pradesh',
  'NIT Dadra and Nagar Haveli',
  'NIT Delhi',
  'NIT Goa',
  'NIT Haryana',
  'NIT Himachal Pradesh',
  'NIT Karnataka',
  'NIT Kerala',
  'NIT Manipur',
  'NIT Mizoram',
  'NIT Nagaland',
  'NIT Odisha',
  'NIT Puducherry',
  'NIT Punjab',
  'NIT Rajasthan',
  'NIT Sikkim',
  'NIT Tamil Nadu',
  'NIT Telangana',
  'NIT Tripura',
  'NIT Uttar Pradesh',
  'NIT West Bengal'
];

// Combine all colleges and sort alphabetically
export const allColleges = [...iits, ...nits].sort((a, b) => 
  a.localeCompare(b, 'en', { sensitivity: 'base' })
);

// Get college type
export const getCollegeType = (collegeName) => {
  if (iits.includes(collegeName)) return 'IIT';
  if (nits.includes(collegeName)) return 'NIT';
  return 'Other';
};

// Validate college exists
export const isValidCollege = (collegeName) => {
  return allColleges.includes(collegeName);
};

export default allColleges;

