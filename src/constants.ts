import { Campaign, CampaignTemplate, Industry } from './types';

export const INDUSTRIES: Industry[] = [
  'Education',
  'Health',
  'Technology',
  'Real Estate',
  'E-commerce',
  'Food & Beverage',
  'Travel',
  'Finance'
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    name: 'Summer Sale 2026',
    description: 'Annual summer discount campaign for all products.',
    status: 'active',
    startDate: '2026-03-01',
    endDate: '2026-04-30',
    budget: 5000,
    reach: 125000,
    platform: 'Instagram',
    color: '#FF6B6B',
    estimatedEngagement: 18750,
    estimatedCTR: 3.2,
    estimatedConversions: 450,
    copies: ['Get ready for the Summer Sale 2026! Up to 50% off on all items.'],
    videoScripts: ['[Scene: Beach] Spoken: Summer is here and so are the deals!'],
    images: ['https://picsum.photos/seed/summer/800/800']
  },
  {
    id: '2',
    name: 'Winter Collection Launch',
    description: 'Promoting the new winter apparel line.',
    status: 'past',
    startDate: '2025-11-01',
    endDate: '2025-12-31',
    budget: 8000,
    reach: 250000,
    platform: 'Facebook',
    color: '#4D96FF',
    estimatedEngagement: 22500,
    estimatedCTR: 2.8,
    estimatedConversions: 620,
    copies: ['The wait is over. Our Winter Collection is live!'],
    images: ['https://picsum.photos/seed/winter/800/800']
  },
  {
    id: '3',
    name: 'Q2 Product Teaser',
    description: 'Teasing the upcoming product launch for Q2.',
    status: 'future',
    startDate: '2026-05-01',
    endDate: '2026-05-15',
    budget: 3000,
    reach: 0,
    platform: 'Google',
    color: '#6BCB77',
    estimatedEngagement: 4500,
    estimatedCTR: 5.5,
    estimatedConversions: 120,
    videoScripts: ['[Scene: Mystery Box] Spoken: Something big is coming in Q2...']
  },
  {
    id: '4',
    name: 'Influencer Partnership',
    description: 'Collaborating with micro-influencers for brand awareness.',
    status: 'active',
    startDate: '2026-03-15',
    endDate: '2026-04-15',
    budget: 4500,
    reach: 85000,
    platform: 'TikTok',
    color: '#FFD93D',
    estimatedEngagement: 12750,
    estimatedCTR: 4.1,
    estimatedConversions: 310,
    copies: ['Check out what our favorite creators are saying about us!'],
    videoScripts: ['[Scene: Influencer unboxing] Spoken: I can\'t believe how good this is!'],
    images: ['https://picsum.photos/seed/influencer/800/800']
  },
  {
    id: '5',
    name: 'Black Friday 2025',
    description: 'Major discounts for Black Friday weekend.',
    status: 'past',
    startDate: '2025-11-20',
    endDate: '2025-11-30',
    budget: 12000,
    reach: 500000,
    platform: 'Google',
    color: '#6BCB77',
    estimatedEngagement: 36000,
    estimatedCTR: 6.2,
    estimatedConversions: 1850
  },
  {
    id: '6',
    name: 'Back to School 2026',
    description: 'Targeting students and parents for the new school year.',
    status: 'future',
    startDate: '2026-08-01',
    endDate: '2026-09-15',
    budget: 6000,
    reach: 0,
    platform: 'LinkedIn',
    color: '#4D96FF',
    estimatedEngagement: 9000,
    estimatedCTR: 2.1,
    estimatedConversions: 180
  }
];

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: 'launch',
    name: 'Product Launch',
    objective: 'Generate hype and drive initial sales',
    channel: 'Facebook',
    contentType: 'Video Ad & Carousel',
    audience: 'Early Adopters & Tech Enthusiasts',
    tone: 'Bold & Innovative',
    offer: 'Early Bird 30% Off',
    cta: 'Pre-order Now',
    icon: 'Rocket'
  },
  {
    id: 'promo',
    name: 'Flash Promotion',
    objective: 'Quick revenue boost and inventory clearance',
    channel: 'Email',
    contentType: 'Newsletter & Direct Mail',
    audience: 'Existing Customers',
    tone: 'Urgent & Exciting',
    offer: 'Buy 1 Get 1 Free',
    cta: 'Shop the Sale',
    icon: 'Zap'
  },
  {
    id: 'edu',
    name: 'Educational Content',
    objective: 'Build authority and nurture leads',
    channel: 'WhatsApp',
    contentType: 'Infographic & Short Guide',
    audience: 'New Leads & Newsletter Subscribers',
    tone: 'Professional & Authoritative',
    offer: 'Free E-book Download',
    cta: 'Learn More',
    icon: 'BookOpen'
  },
  {
    id: 'event',
    name: 'Webinar/Event',
    objective: 'Lead generation and community building',
    channel: 'LinkedIn',
    contentType: 'Event Post & Direct Message',
    audience: 'B2B Professionals',
    tone: 'Professional & Authoritative',
    offer: 'Free Seat at Live Webinar',
    cta: 'Register Now',
    icon: 'Calendar'
  }
];

export const getEstimatedMetrics = (contentType: string, budget: number) => {
  const type = (contentType || '').toLowerCase();
  let ctrBase = 0.02; 
  let engagementBase = 0.05;
  let conversionBase = 0.01;

  if (type.includes('video') || type.includes('reel') || type.includes('tiktok')) {
    ctrBase = 0.038;
    engagementBase = 0.15;
    conversionBase = 0.018;
  } else if (type.includes('carousel') || type.includes('image')) {
    ctrBase = 0.028;
    engagementBase = 0.09;
    conversionBase = 0.014;
  } else if (type.includes('newsletter') || type.includes('email')) {
    ctrBase = 0.045;
    engagementBase = 0.22;
    conversionBase = 0.035;
  } else if (type.includes('search') || type.includes('google')) {
    ctrBase = 0.055;
    engagementBase = 0.03;
    conversionBase = 0.045;
  }

  const estimatedReach = budget * 20; 
  const engagement = Math.floor(estimatedReach * engagementBase);
  const ctr = parseFloat((ctrBase * 100).toFixed(2));
  const conversions = Math.floor(estimatedReach * ctrBase * conversionBase * 5);

  return {
    engagement,
    ctr,
    conversions
  };
};

export const SEASONAL_SUGGESTIONS: Record<number, { name: string; objective: string; icon: string }[]> = {
  0: [ // January
    { name: 'New Year, New You', objective: 'Focus on fitness and resolutions', icon: 'Zap' },
    { name: 'Winter Clearance', objective: 'Clear out winter inventory', icon: 'DollarSign' }
  ],
  1: [ // February
    { name: 'Valentine\'s Special', objective: 'Promote gifts for couples', icon: 'Target' },
    { name: 'Galentine\'s Day', objective: 'Celebrate friendship and group gifts', icon: 'User' }
  ],
  2: [ // March
    { name: 'Spring Refresh', objective: 'Launch new spring collection', icon: 'Rocket' },
    { name: 'St. Paddy\'s Luck', objective: 'Flash sale with lucky discounts', icon: 'Zap' }
  ],
  3: [ // April
    { name: 'Easter Hunt', objective: 'Interactive discount hunt', icon: 'Target' },
    { name: 'Earth Day Promo', objective: 'Promote eco-friendly products', icon: 'BookOpen' }
  ],
  4: [ // May
    { name: 'Mother\'s Day', objective: 'Gifts for moms and grandmas', icon: 'Target' },
    { name: 'Spring Clearance', objective: 'Final spring discounts', icon: 'DollarSign' }
  ],
  5: [ // June
    { name: 'Father\'s Day Tech', objective: 'Gadgets and tools for dads', icon: 'Zap' },
    { name: 'Summer Kickoff', objective: 'Beach and outdoor essentials', icon: 'Rocket' }
  ],
  6: [ // July
    { name: 'Summer Heatwave', objective: 'Stay cool with seasonal deals', icon: 'Zap' },
    { name: 'Mid-Year Review', objective: 'B2B performance reports', icon: 'BarChart3' }
  ],
  7: [ // August
    { name: 'Back to School', objective: 'Supplies and tech for students', icon: 'BookOpen' },
    { name: 'End of Summer', objective: 'Last chance summer deals', icon: 'DollarSign' }
  ],
  8: [ // September
    { name: 'Fall Fashion', objective: 'Launch autumn apparel', icon: 'Rocket' },
    { name: 'Labor Day Weekend', objective: 'Holiday weekend flash sale', icon: 'Zap' }
  ],
  9: [ // October
    { name: 'Halloween Spooktacular', objective: 'Themed products and costumes', icon: 'Target' },
    { name: 'Autumn Harvest', objective: 'Seasonal food and home decor', icon: 'BookOpen' }
  ],
  10: [ // November
    { name: 'Black Friday Blitz', objective: 'Deepest discounts of the year', icon: 'Zap' },
    { name: 'Cyber Monday Tech', objective: 'Focus on electronics and software', icon: 'Rocket' },
    { name: 'Thanksgiving Gratitude', objective: 'Customer appreciation campaign', icon: 'Target' }
  ],
  11: [ // December
    { name: 'Christmas Magic', objective: 'Holiday gift guides and joy', icon: 'Rocket' },
    { name: 'New Year Countdown', objective: 'Last minute deals for 2027', icon: 'Zap' }
  ]
};
