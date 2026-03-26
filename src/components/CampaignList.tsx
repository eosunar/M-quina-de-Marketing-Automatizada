import { Campaign } from '../types';
import { CampaignCard } from './CampaignCard';
import { AnimatePresence, motion } from 'motion/react';

interface CampaignListProps {
  campaigns: Campaign[];
  title: string;
  onOptimize: (id: string) => void;
}

export const CampaignList = ({ campaigns, title, onOptimize }: CampaignListProps) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          {title}
          <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {campaigns.length}
          </span>
        </h2>
      </div>
      
      {campaigns.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <p className="text-gray-400 font-medium">No campaigns found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} onOptimize={onOptimize} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
