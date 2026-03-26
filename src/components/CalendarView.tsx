import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isWithinInterval,
  parseISO
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  X, 
  Plus, 
  Clock, 
  Target, 
  DollarSign,
  FileText,
  Video,
  Image as ImageIcon,
  Sparkles,
  Check,
  Trash2,
  Edit2,
  Rocket,
  Zap,
  User,
  BookOpen,
  BarChart3
} from 'lucide-react';
import { Campaign } from '../types';
import { SEASONAL_SUGGESTIONS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface CalendarViewProps {
  campaigns: Campaign[];
  onCreateCampaign: (date: string, initialData?: { name: string; objective: string }) => void;
  onQuickAction?: (date: Date, action: 'copy' | 'image' | 'video') => void;
  onUpdateCampaign?: (campaignId: string, updates: Partial<Campaign>) => void;
  onGenerateMonth?: (monthDate: Date) => void;
  onOptimize?: (campaignId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ campaigns, onCreateCampaign, onQuickAction, onUpdateCampaign, onGenerateMonth, onOptimize }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 26));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [editingAsset, setEditingAsset] = useState<{
    campaignId: string;
    type: 'copy' | 'script' | 'image';
    index: number;
    value: string;
  } | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleSaveAsset = () => {
    if (!editingAsset || !onUpdateCampaign) return;

    const campaign = campaigns.find(c => c.id === editingAsset.campaignId);
    if (!campaign) return;

    let updates: Partial<Campaign> = {};
    if (editingAsset.type === 'copy') {
      const newCopies = [...(campaign.copies || [])];
      newCopies[editingAsset.index] = editingAsset.value;
      updates = { copies: newCopies };
    } else if (editingAsset.type === 'script') {
      const newScripts = [...(campaign.videoScripts || [])];
      newScripts[editingAsset.index] = editingAsset.value;
      updates = { videoScripts: newScripts };
    } else if (editingAsset.type === 'image') {
      const newImages = [...(campaign.images || [])];
      newImages[editingAsset.index] = editingAsset.value;
      updates = { images: newImages };
    }

    onUpdateCampaign(editingAsset.campaignId, updates);
    setEditingAsset(null);
  };

  const handleDeleteAsset = (campaignId: string, type: 'copy' | 'script' | 'image', index: number) => {
    if (!onUpdateCampaign) return;
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    let updates: Partial<Campaign> = {};
    if (type === 'copy') {
      updates = { copies: campaign.copies?.filter((_, i) => i !== index) };
    } else if (type === 'script') {
      updates = { videoScripts: campaign.videoScripts?.filter((_, i) => i !== index) };
    } else if (type === 'image') {
      updates = { images: campaign.images?.filter((_, i) => i !== index) };
    }

    onUpdateCampaign(campaignId, updates);
  };

  const getCampaignsForDay = (day: Date) => {
    return campaigns.filter(campaign => {
      const start = parseISO(campaign.startDate);
      const end = parseISO(campaign.endDate);
      return isWithinInterval(day, { start, end });
    });
  };

  const getSeasonalIcon = (iconName: string) => {
    switch (iconName) {
      case 'Rocket': return <Rocket className="w-4 h-4" />;
      case 'Zap': return <Zap className="w-4 h-4" />;
      case 'Target': return <Target className="w-4 h-4" />;
      case 'DollarSign': return <DollarSign className="w-4 h-4" />;
      case 'User': return <User className="w-4 h-4" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4" />;
      case 'BarChart3': return <BarChart3 className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const currentMonthSuggestions = SEASONAL_SUGGESTIONS[currentDate.getMonth()] || [];

  const selectedDayCampaigns = selectedDay ? getCampaignsForDay(selectedDay) : [];

  return (
    <div className="relative">
      <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
        {/* Calendar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 md:p-8 border-b border-slate-100 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-2xl text-slate-600">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Enterprise Schedule</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            {onGenerateMonth && (
              <button
                onClick={() => onGenerateMonth(currentDate)}
                className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-brand-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-600 transition-all shadow-xl shadow-brand-500/20 active:scale-95 btn-3d btn-3d-brand"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden xs:inline">Auto-Generate Month</span>
                <span className="xs:hidden">Auto-Gen</span>
              </button>
            )}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={prevMonth}
                className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-500 hover:text-slate-900 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date(2026, 2, 26))}
                className="px-3 md:px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-all"
              >
                Today
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-500 hover:text-slate-900 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[800px] flex flex-col">
            {/* Days of Week */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 flex-1">
          {calendarDays.map((day) => {
            const dayCampaigns = getCampaignsForDay(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date(2026, 2, 26));
            const isSelected = selectedDay && isSameDay(day, selectedDay);

            return (
              <div 
                key={day.toString()} 
                onClick={() => setSelectedDay(day)}
                className={`min-h-[140px] p-3 border-r border-b border-slate-100 flex flex-col gap-2 transition-all cursor-pointer hover:bg-slate-50/50 group relative ${
                  !isCurrentMonth ? 'bg-slate-50/30' : ''
                } ${isSelected ? 'bg-brand-50/50 ring-2 ring-inset ring-brand-500/20' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-black tracking-tighter ${
                    isToday 
                      ? 'bg-brand-600 text-white w-7 h-7 flex items-center justify-center rounded-xl shadow-lg shadow-brand-600/20' 
                      : isCurrentMonth ? 'text-slate-900' : 'text-slate-300'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {dayCampaigns.length > 0 && (
                    <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                      {dayCampaigns.length}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[90px] scrollbar-hide">
                  <AnimatePresence mode="popLayout">
                    {dayCampaigns.slice(0, 3).map((campaign) => (
                      <motion.div
                        key={campaign.id}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider truncate text-white shadow-sm flex items-center gap-1.5"
                        style={{ backgroundColor: campaign.color }}
                        title={campaign.name}
                      >
                        <div className="w-1 h-1 rounded-full bg-white/40" />
                        <span className="flex-1 truncate">{campaign.name}</span>
                        <div className="flex items-center gap-1 ml-auto">
                          {campaign.copies && campaign.copies.length > 0 && (
                            <FileText className="w-2 h-2 opacity-70" />
                          )}
                          {campaign.videoScripts && campaign.videoScripts.length > 0 && (
                            <Video className="w-2 h-2 opacity-70" />
                          )}
                          {campaign.images && campaign.images.length > 0 && (
                            <ImageIcon className="w-2 h-2 opacity-70" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {dayCampaigns.length > 3 && (
                      <div className="text-[9px] font-bold text-slate-400 pl-2">
                        + {dayCampaigns.length - 3} more
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 z-20">
                  <div className="flex gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-xl">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAction?.(day, 'copy');
                      }}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-brand-600 transition-colors"
                      title="Quick Copy"
                    >
                      <FileText className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAction?.(day, 'image');
                      }}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-brand-600 transition-colors"
                      title="Quick Image"
                    >
                      <ImageIcon className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAction?.(day, 'video');
                      }}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-brand-600 transition-colors"
                      title="Quick Video"
                    >
                      <Video className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateCampaign(format(day, 'yyyy-MM-dd'));
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-sm text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-600 hover:border-brand-200 transition-all active:scale-90 btn-3d btn-3d-white"
                  >
                    <Plus className="w-3 h-3" />
                    Create
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>

      {/* Day Details Overlay/Modal */}
      <AnimatePresence>
        {selectedDay && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDay(null)}
              className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-30"
            />
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-40 flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {format(selectedDay, 'EEEE, MMM d')}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Daily Schedule</p>
                </div>
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Campaigns</h4>
                  <button 
                    onClick={() => onCreateCampaign(format(selectedDay, 'yyyy-MM-dd'))}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 btn-3d btn-3d-brand"
                  >
                    <Plus className="w-3 h-3" />
                    Add New
                  </button>
                </div>

                {selectedDayCampaigns.length === 0 ? (
                  <div className="space-y-8">
                    <div className="py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                      <CalendarIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold text-sm">No campaigns scheduled for this day.</p>
                    </div>

                    {/* Seasonal Suggestions */}
                    {currentMonthSuggestions.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-brand-500" />
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommended for {format(currentDate, 'MMMM')}</h5>
                        </div>
                        <div className="grid gap-3">
                          {currentMonthSuggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => onCreateCampaign(format(selectedDay, 'yyyy-MM-dd'), { name: suggestion.name, objective: suggestion.objective })}
                              className="group p-4 bg-white border border-slate-100 rounded-2xl hover:border-brand-500 hover:shadow-xl hover:shadow-brand-500/5 transition-all text-left flex items-center gap-4"
                            >
                              <div className="w-10 h-10 bg-slate-50 group-hover:bg-brand-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-all">
                                {getSeasonalIcon(suggestion.icon)}
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-900 tracking-tight">{suggestion.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{suggestion.objective}</p>
                              </div>
                              <Plus className="w-4 h-4 text-slate-300 group-hover:text-brand-500 ml-auto transition-colors" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDayCampaigns.map((campaign) => (
                      <motion.div
                        key={campaign.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                            style={{ backgroundColor: campaign.color }}
                          >
                            <Target className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{campaign.name}</h5>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{campaign.platform}</p>
                          </div>
                          {onOptimize && (
                            <button 
                              onClick={() => onOptimize(campaign.id)}
                              className="ml-auto p-2 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-600 hover:text-white transition-all"
                              title="Optimize Campaign"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>{format(parseISO(campaign.startDate), 'MMM d')} - {format(parseISO(campaign.endDate), 'MMM d')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <DollarSign className="w-3 h-3" />
                            <span>${campaign.budget.toLocaleString()}</span>
                          </div>
                        </div>

                        {campaign.estimatedEngagement && (
                          <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-100 my-4">
                            <div className="text-center">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Engagement</p>
                              <p className="text-sm font-bold text-slate-900">{campaign.estimatedEngagement.toLocaleString()}</p>
                            </div>
                            <div className="text-center border-x border-slate-100">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">CTR</p>
                              <p className="text-sm font-bold text-slate-900">{campaign.estimatedCTR}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Conversions</p>
                              <p className="text-sm font-bold text-slate-900">{campaign.estimatedConversions.toLocaleString()}</p>
                            </div>
                          </div>
                        )}

                        {campaign.improvements && campaign.improvements.length > 0 && (
                          <div className="mt-4 p-3 bg-brand-50 rounded-2xl border border-brand-100">
                            <p className="text-[9px] font-black text-brand-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3" /> AI Suggestions
                            </p>
                            <ul className="space-y-1.5">
                              {campaign.improvements.map((imp, i) => (
                                <li key={i} className="text-[10px] text-slate-600 flex items-start gap-2 leading-tight">
                                  <div className="w-1 h-1 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                                  {imp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Asset Previews in Side Panel */}
                        {(campaign.images?.length || campaign.copies?.length || campaign.videoScripts?.length) ? (
                          <div className="mt-6 pt-6 border-t border-slate-50 space-y-6">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-3 h-3 text-brand-500" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generated Assets</span>
                            </div>
                            
                            {/* Images Section */}
                            {campaign.images && campaign.images.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Images</p>
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                  {campaign.images.map((img, idx) => (
                                    <div key={idx} className="relative group/img w-24 h-24 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0">
                                      <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center gap-2">
                                        <button 
                                          onClick={() => handleDeleteAsset(campaign.id, 'image', idx)}
                                          className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-red-500 transition-colors"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Copies Section */}
                            {campaign.copies && campaign.copies.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Marketing Copies</p>
                                <div className="space-y-2">
                                  {campaign.copies.map((copy, idx) => (
                                    <div key={idx} className="relative group/copy p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-200 transition-all">
                                      {editingAsset?.campaignId === campaign.id && editingAsset.type === 'copy' && editingAsset.index === idx ? (
                                        <div className="space-y-3">
                                          <textarea 
                                            value={editingAsset.value}
                                            onChange={(e) => setEditingAsset({ ...editingAsset, value: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                            rows={4}
                                          />
                                          <div className="flex justify-end gap-2">
                                            <button 
                                              onClick={() => setEditingAsset(null)}
                                              className="px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-900"
                                            >
                                              Cancel
                                            </button>
                                            <button 
                                              onClick={handleSaveAsset}
                                              className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5"
                                            >
                                              <Check className="w-3 h-3" /> Save
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <p className="text-xs text-slate-600 leading-relaxed pr-8">{copy}</p>
                                          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover/copy:opacity-100 transition-all">
                                            <button 
                                              onClick={() => setEditingAsset({ campaignId: campaign.id, type: 'copy', index: idx, value: copy })}
                                              className="p-1.5 bg-white rounded-lg text-slate-400 hover:text-brand-600 shadow-sm"
                                            >
                                              <Edit2 className="w-3 h-3" />
                                            </button>
                                            <button 
                                              onClick={() => handleDeleteAsset(campaign.id, 'copy', idx)}
                                              className="p-1.5 bg-white rounded-lg text-slate-400 hover:text-red-600 shadow-sm"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Scripts Section */}
                            {campaign.videoScripts && campaign.videoScripts.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Video Scripts</p>
                                <div className="space-y-2">
                                  {campaign.videoScripts.map((script, idx) => (
                                    <div key={idx} className="relative group/script p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:border-brand-500/50 transition-all">
                                      {editingAsset?.campaignId === campaign.id && editingAsset.type === 'script' && editingAsset.index === idx ? (
                                        <div className="space-y-3">
                                          <textarea 
                                            value={editingAsset.value}
                                            onChange={(e) => setEditingAsset({ ...editingAsset, value: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                            rows={4}
                                          />
                                          <div className="flex justify-end gap-2">
                                            <button 
                                              onClick={() => setEditingAsset(null)}
                                              className="px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:text-white"
                                            >
                                              Cancel
                                            </button>
                                            <button 
                                              onClick={handleSaveAsset}
                                              className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5"
                                            >
                                              <Check className="w-3 h-3" /> Save
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <p className="text-xs text-slate-400 leading-relaxed pr-8 line-clamp-3">{script}</p>
                                          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover/script:opacity-100 transition-all">
                                            <button 
                                              onClick={() => setEditingAsset({ campaignId: campaign.id, type: 'script', index: idx, value: script })}
                                              className="p-1.5 bg-slate-800 rounded-lg text-slate-500 hover:text-brand-500 shadow-sm"
                                            >
                                              <Edit2 className="w-3 h-3" />
                                            </button>
                                            <button 
                                              onClick={() => handleDeleteAsset(campaign.id, 'script', idx)}
                                              className="p-1.5 bg-slate-800 rounded-lg text-slate-500 hover:text-red-500 shadow-sm"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4 text-center">Quick Actions</p>
                <div className="grid grid-cols-2 gap-4">
                  <button className="py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">
                    Export Day
                  </button>
                  <button className="py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">
                    Share View
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
