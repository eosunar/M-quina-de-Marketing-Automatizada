export type CampaignStatus = 'active' | 'past' | 'future';
export type Industry = 'Education' | 'Health' | 'Technology' | 'Real Estate' | 'E-commerce' | 'Food & Beverage' | 'Travel' | 'Finance';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  budget: number;
  reach: number;
  platform: 'Instagram' | 'Facebook' | 'Google' | 'LinkedIn' | 'TikTok';
  color: string;
  industry?: Industry;
  estimatedEngagement?: number;
  estimatedCTR?: number;
  estimatedConversions?: number;
  copies?: string[];
  videoScripts?: string[];
  images?: string[];
  improvements?: string[];
}

export interface CampaignTemplate {
  id: string;
  name: string;
  objective: string;
  channel: string;
  contentType: string;
  audience: string;
  tone: string;
  offer: string;
  cta: string;
  icon: string;
  industry?: Industry;
}
