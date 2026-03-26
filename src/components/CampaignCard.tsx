import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Users, DollarSign, ExternalLink, Instagram, Facebook, Globe, Linkedin, Video, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { Campaign } from '../types';
import { format } from 'date-fns';

interface CampaignCardProps {
  campaign: Campaign;
  onOptimize: (id: string) => void;
}

const PlatformIcon = ({ platform }: { platform: Campaign['platform'] }) => {
  switch (platform) {
    case 'Instagram': return <Instagram className="w-4 h-4" />;
    case 'Facebook': return <Facebook className="w-4 h-4" />;
    case 'Google': return <Globe className="w-4 h-4" />;
    case 'LinkedIn': return <Linkedin className="w-4 h-4" />;
    case 'TikTok': return <Video className="w-4 h-4" />;
    default: return <ExternalLink className="w-4 h-4" />;
  }
};

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onOptimize }) => {
  const statusColors = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    past: 'bg-slate-50 text-slate-600 border-slate-100',
    future: 'bg-blue-50 text-blue-700 border-blue-100'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-[32px] p-8 premium-border shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
            style={{ backgroundColor: campaign.color, boxShadow: `0 8px 16px -4px ${campaign.color}40` }}
          >
            <PlatformIcon platform={campaign.platform} />
          </div>
          <div>
            <span className={`text-[10px] uppercase tracking-[0.2em] font-black px-3 py-1 rounded-full border mb-2 inline-block ${statusColors[campaign.status]}`}>
              {campaign.status}
            </span>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-tight">
              {campaign.name}
            </h3>
          </div>
        </div>
      </div>

      <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1">
        {campaign.description}
      </p>

      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Timeline</span>
          </div>
          <span className="font-bold text-slate-700">
            {format(new Date(campaign.startDate), 'MMM d')} — {format(new Date(campaign.endDate), 'MMM d, yyyy')}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <DollarSign className="w-4 h-4" />
            <span className="font-medium">Budget</span>
          </div>
          <span className="font-bold text-slate-900">
            ${campaign.budget.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <Users className="w-4 h-4" />
            <span className="font-medium">Est. Reach</span>
          </div>
          <span className="font-bold text-slate-900">
            {campaign.reach > 0 ? campaign.reach.toLocaleString() : 'Pending Analysis'}
          </span>
        </div>
      </div>

      {campaign.estimatedEngagement && (
        <div className="grid grid-cols-3 gap-4 pt-6 mb-8 border-t border-slate-100">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">Engagement</div>
            <div className="text-sm font-bold text-slate-900">{campaign.estimatedEngagement.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">CTR</div>
            <div className="text-sm font-bold text-slate-900">{campaign.estimatedCTR}%</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">Conversions</div>
            <div className="text-sm font-bold text-slate-900">{campaign.estimatedConversions.toLocaleString()}</div>
          </div>
        </div>
      )}

      {campaign.improvements && campaign.improvements.length > 0 && (
        <div className="mb-8 p-4 bg-brand-50 rounded-2xl border border-brand-100">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-700">AI Suggestions</span>
          </div>
          <ul className="space-y-2">
            {campaign.improvements.map((improvement, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-tight">
                <CheckCircle className="w-3 h-3 text-brand-500 mt-0.5 flex-shrink-0" />
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onOptimize(campaign.id)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 hover:text-white transition-all shadow-sm btn-3d btn-3d-white"
          >
            <Sparkles className="w-3 h-3" />
            Optimize
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 hover:text-brand-600 transition-all group/btn btn-3d btn-3d-slate">
          Details <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};
