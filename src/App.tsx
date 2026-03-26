import { parseISO, isWithinInterval, startOfMonth, endOfMonth, addDays, format } from 'date-fns';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  BarChart3, 
  Calendar as CalendarIcon,
  ChevronRight,
  List,
  Settings,
  Bell,
  User,
  ArrowUpRight,
  Target,
  Zap,
  X,
  Menu,
  DollarSign,
  Clock,
  Rocket,
  BookOpen,
  Calendar,
  Sparkles,
  Loader2,
  RefreshCw,
  Trash2,
  Copy as CopyIcon,
  Video,
  Image as ImageIcon,
  Download
} from 'lucide-react';
import { MOCK_CAMPAIGNS, CAMPAIGN_TEMPLATES, SEASONAL_SUGGESTIONS, INDUSTRIES, getEstimatedMetrics } from './constants';
import { CampaignList } from './components/CampaignList';
import { CalendarView } from './components/CalendarView';
import { Campaign, CampaignStatus, CampaignTemplate, Industry } from './types';
import { generateMarketingCopy, generateVideoScript, generateCampaignImage, generateCampaignImprovements } from './services/copyService';
import * as XLSX from 'xlsx';

export default function App() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [activeTab, setActiveTab] = useState<'all' | CampaignStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar'>('dashboard');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDateForNewCampaign, setSelectedDateForNewCampaign] = useState<string | null>(null);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    objective: '',
    industry: 'Technology' as Industry,
    channel: 'Facebook',
    contentType: '',
    audience: '',
    tone: 'Professional & Authoritative',
    offer: '',
    cta: '',
    startDate: '',
    endDate: '',
    budget: '',
    duration: '',
    copies: [] as string[],
    activeCopyIndex: 0,
    videoScripts: [] as string[],
    activeScriptIndex: 0,
    images: [] as string[],
    activeImageIndex: 0
  });
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingFull, setIsGeneratingFull] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleCreateCampaign = (date?: string, initialData?: { name: string; objective: string }) => {
    const initialDate = date || new Date(2026, 2, 26).toISOString().split('T')[0];
    setSelectedDateForNewCampaign(initialDate);
    setEditingCampaignId(null);
    setFormData(prev => ({ 
      ...prev, 
      startDate: initialDate, 
      name: initialData?.name || '', 
      objective: initialData?.objective || '', 
      industry: 'Technology',
      contentType: '', 
      audience: '', 
      offer: '', 
      cta: '', 
      budget: '', 
      duration: '', 
      copies: [],
      activeCopyIndex: 0,
      videoScripts: [],
      activeScriptIndex: 0,
      images: [],
      activeImageIndex: 0
    }));
    setIsBulkMode(false);
    setIsCreateModalOpen(true);
  };

  const handleQuickAction = (date: Date, action: 'copy' | 'image' | 'video') => {
    const campaignOnDay = campaigns.find(c => {
      const start = parseISO(c.startDate);
      const end = parseISO(c.endDate);
      return isWithinInterval(date, { start, end });
    });

    if (campaignOnDay) {
      setFormData({
        name: campaignOnDay.name,
        objective: campaignOnDay.description,
        channel: campaignOnDay.platform,
        contentType: '',
        audience: '',
        tone: 'Professional & Authoritative',
        offer: '',
        cta: '',
        startDate: campaignOnDay.startDate,
        endDate: campaignOnDay.endDate,
        budget: campaignOnDay.budget.toString(),
        duration: '',
        copies: campaignOnDay.copies || [],
        activeCopyIndex: 0,
        videoScripts: campaignOnDay.videoScripts || [],
        activeScriptIndex: 0,
        images: campaignOnDay.images || [],
        activeImageIndex: 0
      });
      setEditingCampaignId(campaignOnDay.id);
    } else {
      const dateStr = date.toISOString().split('T')[0];
      handleCreateCampaign(dateStr);
    }
    
    setIsCreateModalOpen(true);
  };

  const handleExportToExcel = () => {
    const exportData = campaigns.map(c => ({
      ID: c.id,
      Name: c.name,
      Objective: c.objective,
      Industry: c.industry,
      Platform: c.platform,
      Status: c.status,
      Budget: c.budget,
      "Start Date": c.startDate,
      "End Date": c.endDate,
      "Estimated Engagement": c.estimatedEngagement || 0,
      "Estimated CTR (%)": c.estimatedCTR || 0,
      "Estimated Conversions": c.estimatedConversions || 0,
      "AI Suggestions": c.improvements?.join('; ') || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Campaigns");
    XLSX.writeFile(workbook, `Marketing_Campaigns_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const handleGenerateCopy = async () => {
    if (!formData.objective || !formData.audience) {
      alert("Please fill in the Objective and Target Audience first.");
      return;
    }

    setIsGeneratingCopy(true);
    try {
      const generatedCopy = await generateMarketingCopy({
        objective: formData.objective,
        channel: formData.channel,
        audience: formData.audience,
        tone: formData.tone,
        offer: formData.offer,
        cta: formData.cta,
        industry: formData.industry,
        variationIndex: formData.copies.length
      });
      setFormData(prev => ({ 
        ...prev, 
        copies: [...prev.copies, generatedCopy],
        activeCopyIndex: prev.copies.length
      }));
    } catch (error) {
      console.error("Error generating copy:", error);
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleGenerateVideoScript = async () => {
    if (!formData.objective || !formData.audience) {
      alert("Please fill in the Objective and Target Audience first.");
      return;
    }

    setIsGeneratingScript(true);
    try {
      const generatedScript = await generateVideoScript({
        objective: formData.objective,
        channel: formData.channel,
        audience: formData.audience,
        tone: formData.tone,
        offer: formData.offer,
        cta: formData.cta,
        industry: formData.industry
      });
      setFormData(prev => ({ 
        ...prev, 
        videoScripts: [...prev.videoScripts, generatedScript],
        activeScriptIndex: prev.videoScripts.length
      }));
    } catch (error) {
      console.error("Error generating script:", error);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!formData.objective) {
      alert("Please fill in the Campaign Objective first.");
      return;
    }

    setIsGeneratingImage(true);
    try {
      const prompt = `Industry: ${formData.industry}. Objective: ${formData.objective}. ${formData.copies[formData.activeCopyIndex] || ''}`;
      const imageUrl = await generateCampaignImage({ 
        prompt,
        aspectRatio: formData.channel === 'Instagram' || formData.channel === 'Facebook' ? '1:1' : '16:9'
      });
      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, imageUrl],
        activeImageIndex: prev.images.length
      }));
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateFullCampaign = async () => {
    if (!formData.objective || !formData.audience) {
      alert("Please fill in the Objective and Target Audience first.");
      return;
    }

    setIsGeneratingFull(true);
    try {
      // 1. Generate Copy
      const generatedCopy = await generateMarketingCopy({
        objective: formData.objective,
        channel: formData.channel,
        audience: formData.audience,
        tone: formData.tone,
        offer: formData.offer,
        cta: formData.cta,
        industry: formData.industry,
        variationIndex: formData.copies.length
      });

      // 2. Generate Script
      const generatedScript = await generateVideoScript({
        objective: formData.objective,
        channel: formData.channel,
        audience: formData.audience,
        tone: formData.tone,
        offer: formData.offer,
        cta: formData.cta,
        industry: formData.industry
      });

      // 3. Generate Image (using the new copy for context)
      const imagePrompt = `Industry: ${formData.industry}. Objective: ${formData.objective}. ${generatedCopy}`;
      const imageUrl = await generateCampaignImage({ 
        prompt: imagePrompt,
        aspectRatio: formData.channel === 'Instagram' || formData.channel === 'Facebook' ? '1:1' : '16:9'
      });

      setFormData(prev => ({
        ...prev,
        copies: [...prev.copies, generatedCopy],
        activeCopyIndex: prev.copies.length,
        videoScripts: [...prev.videoScripts, generatedScript],
        activeScriptIndex: prev.videoScripts.length,
        images: [...prev.images, imageUrl],
        activeImageIndex: prev.images.length
      }));

    } catch (error) {
      console.error("Error generating full campaign:", error);
      alert("Something went wrong during full campaign generation.");
    } finally {
      setIsGeneratingFull(false);
    }
  };

  const handleDeleteCopy = (index: number) => {
    setFormData(prev => {
      const newCopies = prev.copies.filter((_, i) => i !== index);
      return {
        ...prev,
        copies: newCopies,
        activeCopyIndex: Math.max(0, Math.min(prev.activeCopyIndex, newCopies.length - 1))
      };
    });
  };

  const handleDeleteVideoScript = (index: number) => {
    setFormData(prev => {
      const newScripts = prev.videoScripts.filter((_, i) => i !== index);
      return {
        ...prev,
        videoScripts: newScripts,
        activeScriptIndex: Math.max(0, Math.min(prev.activeScriptIndex, newScripts.length - 1))
      };
    });
  };

  const handleDeleteImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        activeImageIndex: Math.max(0, Math.min(prev.activeImageIndex, newImages.length - 1))
      };
    });
  };

  const handleSelectTemplate = (template: CampaignTemplate) => {
    setFormData(prev => ({
      ...prev,
      name: `${template.name} - ${new Date().getFullYear()}`,
      objective: template.objective,
      industry: template.industry || prev.industry,
      channel: template.channel,
      contentType: template.contentType,
      audience: template.audience,
      tone: template.tone,
      offer: template.offer,
      cta: template.cta
    }));
  };

  const handleLaunchCampaign = () => {
    if (!formData.name || !formData.startDate) {
      alert("Please fill in the Campaign Name and Start Date.");
      return;
    }

    if (editingCampaignId) {
      setCampaigns(prev => prev.map(c => {
        if (c.id === editingCampaignId) {
          const metrics = getEstimatedMetrics(formData.contentType || formData.channel, parseFloat(formData.budget) || 0);
          return {
            ...c,
            name: formData.name,
            description: formData.objective,
            industry: formData.industry,
            startDate: formData.startDate,
            endDate: formData.endDate || formData.startDate,
            budget: parseFloat(formData.budget) || 0,
            platform: formData.channel as any,
            copies: formData.copies,
            videoScripts: formData.videoScripts,
            images: formData.images,
            estimatedEngagement: metrics.engagement,
            estimatedCTR: metrics.ctr,
            estimatedConversions: metrics.conversions
          };
        }
        return c;
      }));
      setEditingCampaignId(null);
    } else {
      const metrics = getEstimatedMetrics(formData.contentType || formData.channel, parseFloat(formData.budget) || 0);
      const newCampaign: Campaign = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        description: formData.objective,
        industry: formData.industry,
        status: 'future', // Default to future for new campaigns
        startDate: formData.startDate,
        endDate: formData.endDate || formData.startDate,
        budget: parseFloat(formData.budget) || 0,
        reach: 0,
        platform: formData.channel as any,
        color: ['#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D', '#9B59B6'][Math.floor(Math.random() * 5)],
        copies: formData.copies,
        videoScripts: formData.videoScripts,
        images: formData.images,
        estimatedEngagement: metrics.engagement,
        estimatedCTR: metrics.ctr,
        estimatedConversions: metrics.conversions
      };

      setCampaigns(prev => [newCampaign, ...prev]);
    }

    setIsCreateModalOpen(false);
  };

  const handleUpdateCampaign = (campaignId: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, ...updates } : c));
  };

  const handleOptimizeCampaign = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    try {
      const improvements = await generateCampaignImprovements(campaign);
      handleUpdateCampaign(campaignId, { improvements });
    } catch (error) {
      console.error("Failed to optimize campaign:", error);
    }
  };

  const handleGenerateMonthCalendar = (monthDate: Date) => {
    const start = startOfMonth(monthDate);
    const monthIndex = monthDate.getMonth();
    const seasonal = SEASONAL_SUGGESTIONS[monthIndex] || [];
    
    const newCampaigns: Campaign[] = [];
    
    // 1. One educational campaign (Week 1)
    const eduTemplate = CAMPAIGN_TEMPLATES.find(t => t.id === 'edu');
    if (eduTemplate) {
      const startDate = addDays(start, 1);
      const endDate = addDays(startDate, 3);
      const metrics = getEstimatedMetrics(eduTemplate.contentType, 1500);
      newCampaigns.push({
        id: Math.random().toString(36).substr(2, 9),
        name: eduTemplate.name,
        description: eduTemplate.objective,
        status: 'future',
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        budget: 1500,
        reach: 0,
        platform: eduTemplate.channel as any,
        color: '#4D96FF',
        copies: [],
        videoScripts: [],
        images: [],
        estimatedEngagement: metrics.engagement,
        estimatedCTR: metrics.ctr,
        estimatedConversions: metrics.conversions
      });
    }

    // 2. One major seasonal campaign (Week 2)
    if (seasonal.length > 0) {
      const main = seasonal[0];
      const startDate = addDays(start, 8);
      const endDate = addDays(startDate, 6);
      const metrics = getEstimatedMetrics('Social Media Campaign', 5000);
      newCampaigns.push({
        id: Math.random().toString(36).substr(2, 9),
        name: main.name,
        description: main.objective,
        status: 'future',
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        budget: 5000,
        reach: 0,
        platform: 'Instagram',
        color: '#FF6B6B',
        copies: [],
        videoScripts: [],
        images: [],
        estimatedEngagement: metrics.engagement,
        estimatedCTR: metrics.ctr,
        estimatedConversions: metrics.conversions
      });
    }

    // 3. One flash promo (Week 3)
    const promoTemplate = CAMPAIGN_TEMPLATES.find(t => t.id === 'promo');
    if (promoTemplate) {
      const startDate = addDays(start, 18);
      const endDate = addDays(startDate, 2);
      const metrics = getEstimatedMetrics(promoTemplate.contentType, 2500);
      newCampaigns.push({
        id: Math.random().toString(36).substr(2, 9),
        name: promoTemplate.name,
        description: promoTemplate.objective,
        status: 'future',
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        budget: 2500,
        reach: 0,
        platform: promoTemplate.channel as any,
        color: '#FFD93D',
        copies: [],
        videoScripts: [],
        images: [],
        estimatedEngagement: metrics.engagement,
        estimatedCTR: metrics.ctr,
        estimatedConversions: metrics.conversions
      });
    }

    // 4. Another seasonal if available (Week 4)
    if (seasonal.length > 1) {
      const secondary = seasonal[1];
      const startDate = addDays(start, 24);
      const endDate = addDays(startDate, 4);
      const metrics = getEstimatedMetrics('Social Media Campaign', 3000);
      newCampaigns.push({
        id: Math.random().toString(36).substr(2, 9),
        name: secondary.name,
        description: secondary.objective,
        status: 'future',
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        budget: 3000,
        reach: 0,
        platform: 'Facebook',
        color: '#6BCB77',
        copies: [],
        videoScripts: [],
        images: [],
        estimatedEngagement: metrics.engagement,
        estimatedCTR: metrics.ctr,
        estimatedConversions: metrics.conversions
      });
    }

    setCampaigns(prev => [...prev, ...newCampaigns]);
  };

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'Rocket': return <Rocket className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5" />;
      case 'Calendar': return <Calendar className="w-5 h-5" />;
      default: return <Plus className="w-5 h-5" />;
    }
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesTab = activeTab === 'all' || campaign.status === activeTab;
      const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [campaigns, activeTab, searchQuery]);

  const stats = useMemo(() => {
    const totalBudget = campaigns.reduce((acc, c) => acc + c.budget, 0);
    const totalReach = campaigns.reduce((acc, c) => acc + c.reach, 0);
    const activeCount = campaigns.filter(c => c.status === 'active').length;
    return { totalBudget, totalReach, activeCount };
  }, [campaigns]);

  return (
    <div className="min-h-screen mesh-gradient font-sans flex text-slate-800 relative overflow-x-hidden">
      {/* Decorative Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-200/20 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-300/20 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Sidebar Overlay - Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-72 bg-slate-950 text-slate-300 flex flex-col z-40 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-8 flex items-center justify-between border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white block leading-none">Campaign</span>
              <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Enterprise v2.4</span>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 px-4 py-8 flex flex-col gap-1 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Main Menu</p>
          <button 
            onClick={() => {
              setCurrentView('dashboard');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all group ${
              currentView === 'dashboard' ? 'sidebar-item-active' : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${currentView === 'dashboard' ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
            Dashboard
          </button>
          <button 
            onClick={() => {
              setCurrentView('calendar');
              setIsSidebarOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all group ${
              currentView === 'calendar' ? 'sidebar-item-active' : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <CalendarIcon className={`w-5 h-5 ${currentView === 'calendar' ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
            Calendar
          </button>
          <button className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all group text-slate-400 hover:bg-slate-900 hover:text-white">
            <BarChart3 className="w-5 h-5 text-slate-500 group-hover:text-white" />
            Analytics
          </button>
          
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-8 mb-4">System</p>
          <button className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all group text-slate-400 hover:bg-slate-900 hover:text-white">
            <Settings className="w-5 h-5 text-slate-500 group-hover:text-white" />
            Settings
          </button>
        </div>

        <div className="p-6 border-t border-slate-800/50">
          <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-2xl border border-slate-800/50">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate">Enrique Osuna</p>
              <p className="text-[10px] text-slate-500 truncate">Marketing Director</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 flex-1 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500">
              <span>Marketing</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-900">Campaigns</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={handleExportToExcel}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs md:text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm btn-3d btn-3d-white"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="hidden xs:block h-6 w-[1px] bg-slate-200 mx-1 md:mx-2" />
            <button 
              onClick={() => handleCreateCampaign()}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-900 text-white rounded-xl text-xs md:text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/20 btn-3d btn-3d-brand"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Campaign</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
          {/* Welcome Section */}
          <div className="mb-8 md:mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2"
            >
              {currentView === 'dashboard' ? 'Performance Overview' : 'Campaign Timeline'}
            </motion.h1>
            <p className="text-slate-500 text-base md:text-lg">Manage and monitor your enterprise marketing initiatives in real-time.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: 'Total Budget', value: `$${stats.totalBudget.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12.5%' },
              { label: 'Total Reach', value: stats.totalReach.toLocaleString(), icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50', trend: '85% Target' },
              { label: 'Active Projects', value: stats.activeCount, icon: Target, color: 'text-orange-600', bg: 'bg-orange-50', trend: '2 Ending Soon' }
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                    View Report <ArrowUpRight className="w-3 h-3" />
                  </div>
                </div>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${stat.bg} ${stat.color}`}>
                  {stat.trend}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filters & Search - Premium Bar */}
          <div className="bg-white p-3 rounded-[24px] border border-slate-200/60 shadow-sm mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex p-1 bg-slate-100/50 rounded-xl">
              {(['all', 'active', 'past', 'future'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-all ${
                    activeTab === tab 
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 px-2">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
                />
              </div>
              
              <div className="h-8 w-[1px] bg-slate-200 mx-1" />
              
              <div className="flex bg-slate-100/50 p-1 rounded-xl">
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className={`p-2 rounded-lg transition-all ${currentView === 'dashboard' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setCurrentView('calendar')}
                  className={`p-2 rounded-lg transition-all ${currentView === 'calendar' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
              </div>
              
              <button className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-400 hover:text-slate-600 transition-all">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Campaign View Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView + activeTab + searchQuery}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {currentView === 'dashboard' ? (
                <CampaignList 
                  campaigns={filteredCampaigns} 
                  title={activeTab === 'all' ? 'All Initiatives' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Initiatives`} 
                  onOptimize={handleOptimizeCampaign}
                />
              ) : (
                <CalendarView 
                  campaigns={filteredCampaigns} 
                  onCreateCampaign={(date, initialData) => handleCreateCampaign(date, initialData)}
                  onQuickAction={handleQuickAction}
                  onUpdateCampaign={handleUpdateCampaign}
                  onGenerateMonth={handleGenerateMonthCalendar}
                  onOptimize={handleOptimizeCampaign}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Create Campaign Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                    {editingCampaignId ? 'Edit Initiative' : 'New Initiative'}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {editingCampaignId ? 'Update Campaign Strategy' : 'Strategic Campaign Setup'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleGenerateFullCampaign}
                    disabled={isGeneratingFull}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingFull ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Full Campaign
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => setIsCreateModalOpen(false)}
                    className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto scrollbar-hide">
                {/* Templates Section */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quick Templates</label>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {CAMPAIGN_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                        className="flex-shrink-0 group p-4 bg-white border border-slate-200 rounded-3xl hover:border-brand-500 hover:shadow-xl hover:shadow-brand-500/10 transition-all text-left w-48"
                      >
                        <div className="w-10 h-10 bg-slate-50 group-hover:bg-brand-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-all mb-3">
                          {getTemplateIcon(template.icon)}
                        </div>
                        <p className="text-xs font-black text-slate-900 tracking-tight">{template.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 line-clamp-1">{template.objective}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bulk Mode Toggle */}
                <div className="flex items-center justify-between p-6 bg-brand-50 rounded-3xl border border-brand-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 tracking-tight">Bulk Creation Mode</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Replicate across the month</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsBulkMode(!isBulkMode)}
                    className={`w-14 h-8 rounded-full transition-all relative ${isBulkMode ? 'bg-brand-600' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${isBulkMode ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                {isBulkMode && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-6 p-6 bg-slate-50 rounded-3xl border border-slate-100"
                  >
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequency</label>
                        <select className="w-full px-6 py-4 bg-white border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all appearance-none">
                          <option>Daily</option>
                          <option>Weekly (Same Day)</option>
                          <option>Specific Days</option>
                          <option>Every Weekday</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Replicate Until</label>
                        <input 
                          type="date" 
                          defaultValue="2026-04-30"
                          className="w-full px-6 py-4 bg-white border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Days</label>
                      <div className="flex gap-2">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                          <button 
                            key={i}
                            className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-[10px] font-black text-slate-400 hover:border-brand-500 hover:text-brand-600 transition-all active:scale-90"
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Summer Launch 2026"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objective</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Increase Brand Awareness"
                      value={formData.objective}
                      onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Industry</label>
                    <select 
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value as Industry })}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all appearance-none"
                    >
                      {INDUSTRIES.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Channel</label>
                    <select 
                      value={formData.channel}
                      onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all appearance-none"
                    >
                      <option>Facebook</option>
                      <option>Email</option>
                      <option>WhatsApp</option>
                      <option>Instagram</option>
                      <option>Google Ads</option>
                      <option>LinkedIn</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Content Type</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Video Ad, Newsletter, Carousel"
                      value={formData.contentType}
                      onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Tech Professionals 25-40"
                      value={formData.audience}
                      onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand Tone</label>
                    <select 
                      value={formData.tone}
                      onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all appearance-none"
                    >
                      <option>Professional & Authoritative</option>
                      <option>Friendly & Approachable</option>
                      <option>Bold & Innovative</option>
                      <option>Minimalist & Clean</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Core Offer</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 20% Discount on Annual Plan"
                      value={formData.offer}
                      onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Call to Action (CTA)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Start Free Trial"
                      value={formData.cta}
                      onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                    <input 
                      type="date" 
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                    <input 
                      type="date" 
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Budget Allocation</label>
                    <div className="relative">
                      <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="number" 
                        placeholder="0.00"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Duration</label>
                    <div className="relative">
                      <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="e.g. 14 Days"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Metrics Preview */}
                <div className="p-8 bg-slate-900 rounded-[32px] text-white shadow-2xl shadow-slate-900/20">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Performance</p>
                      <p className="text-xs text-slate-500">AI-driven projection based on content type and budget</p>
                    </div>
                    <div className="px-4 py-1.5 bg-brand-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-600/20">
                      AI Prediction
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {(() => {
                      const metrics = getEstimatedMetrics(formData.contentType || formData.channel, parseFloat(formData.budget) || 0);
                      return (
                        <>
                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Engagement</p>
                            <p className="text-3xl font-black tracking-tight">{metrics.engagement.toLocaleString()}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CTR</p>
                            <p className="text-3xl font-black tracking-tight">{metrics.ctr}%</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Conversions</p>
                            <p className="text-3xl font-black tracking-tight">{metrics.conversions.toLocaleString()}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* AI Copy Generator */}
                <div className="space-y-6 p-8 bg-brand-50/50 rounded-[32px] border border-brand-100/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-24 h-24 text-brand-600" />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-600/20">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 tracking-tight">AI A/B Testing Lab</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Optimized for {formData.channel}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleGenerateCopy}
                      disabled={isGeneratingCopy}
                      className="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-600/20 flex items-center gap-2 btn-3d btn-3d-brand"
                    >
                      {isGeneratingCopy ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          {formData.copies.length > 0 ? 'Add Variation' : 'Generate Copy'}
                        </>
                      )}
                    </button>
                  </div>

                  {formData.copies.length > 0 && (
                    <div className="space-y-4 relative z-10">
                      {/* Version Tabs */}
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {formData.copies.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setFormData({ ...formData, activeCopyIndex: index })}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              formData.activeCopyIndex === index 
                                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' 
                                : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-100'
                            }`}
                          >
                            Version {index + 1}
                          </button>
                        ))}
                      </div>

                      <div className="relative group/textarea">
                        <textarea 
                          rows={6}
                          placeholder="Your AI-generated marketing copy will appear here..."
                          value={formData.copies[formData.activeCopyIndex] || ''}
                          onChange={(e) => {
                            const newCopies = [...formData.copies];
                            newCopies[formData.activeCopyIndex] = e.target.value;
                            setFormData({ ...formData, copies: newCopies });
                          }}
                          className="w-full px-8 py-6 bg-white border-none rounded-3xl text-sm font-medium focus:ring-2 focus:ring-brand-500/20 transition-all resize-none shadow-sm"
                        />
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/textarea:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(formData.copies[formData.activeCopyIndex]);
                              // Optional: Add toast notification
                            }}
                            className="p-2 bg-slate-50 hover:bg-brand-50 text-slate-400 hover:text-brand-600 rounded-lg transition-all"
                            title="Copy to clipboard"
                          >
                            <CopyIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCopy(formData.activeCopyIndex)}
                            className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all"
                            title="Delete this version"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-4 bg-white/50 rounded-2xl border border-brand-100/50">
                        <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
                        <p className="text-[9px] font-bold text-brand-700 uppercase tracking-widest">
                          Pro Tip: Generate multiple versions to test different hooks and CTAs.
                        </p>
                      </div>
                    </div>
                  )}

                  {formData.copies.length === 0 && !isGeneratingCopy && (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 bg-brand-100 rounded-3xl flex items-center justify-center text-brand-600">
                        <Zap className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">Ready to create magic?</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Fill the details above and click generate</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Video Script Generator */}
                <div className="space-y-6 p-8 bg-slate-900 rounded-[32px] border border-slate-800 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <Video className="w-24 h-24 text-brand-500" />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-brand-500 shadow-xl shadow-black/20">
                        <Video className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-white tracking-tight">AI Video Script Lab</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Reels & TikTok Optimized</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleGenerateVideoScript}
                      disabled={isGeneratingScript}
                      className="px-6 py-3 bg-white hover:bg-slate-100 disabled:bg-slate-700 text-slate-950 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-white/5 flex items-center gap-2 btn-3d btn-3d-white"
                    >
                      {isGeneratingScript ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Directing...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4" />
                          {formData.videoScripts.length > 0 ? 'Add Script' : 'Generate Script'}
                        </>
                      )}
                    </button>
                  </div>

                  {formData.videoScripts.length > 0 && (
                    <div className="space-y-4 relative z-10">
                      {/* Version Tabs */}
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {formData.videoScripts.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setFormData({ ...formData, activeScriptIndex: index })}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              formData.activeScriptIndex === index 
                                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                            }`}
                          >
                            Script {index + 1}
                          </button>
                        ))}
                      </div>

                      <div className="relative group/textarea">
                        <textarea 
                          rows={8}
                          placeholder="Your AI-generated video script will appear here..."
                          value={formData.videoScripts[formData.activeScriptIndex] || ''}
                          onChange={(e) => {
                            const newScripts = [...formData.videoScripts];
                            newScripts[formData.activeScriptIndex] = e.target.value;
                            setFormData({ ...formData, videoScripts: newScripts });
                          }}
                          className="w-full px-8 py-6 bg-slate-800 border-none rounded-3xl text-sm font-medium text-slate-200 focus:ring-2 focus:ring-brand-500/20 transition-all resize-none shadow-sm scrollbar-hide"
                        />
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/textarea:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(formData.videoScripts[formData.activeScriptIndex]);
                            }}
                            className="p-2 bg-slate-700 hover:bg-brand-500 text-slate-400 hover:text-white rounded-lg transition-all"
                            title="Copy to clipboard"
                          >
                            <CopyIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteVideoScript(formData.activeScriptIndex)}
                            className="p-2 bg-slate-700 hover:bg-red-500 text-slate-400 hover:text-white rounded-lg transition-all"
                            title="Delete this script"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                        <div className="w-8 h-8 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-500">
                          <Clock className="w-4 h-4" />
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                          Visual cues are in <span className="text-brand-500">[brackets]</span>. Use them to guide your filming and editing.
                        </p>
                      </div>
                    </div>
                  )}

                  {formData.videoScripts.length === 0 && !isGeneratingScript && (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-600">
                        <Video className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">Lights, Camera, AI!</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Generate viral scripts for Reels & TikTok</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Visual Studio */}
                <div className="space-y-6 p-8 bg-white rounded-[32px] border border-slate-200 relative overflow-hidden group shadow-sm">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-24 h-24 text-brand-600" />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-brand-600">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 tracking-tight">AI Visual Studio</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Campaign Imagery</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage}
                      className="px-6 py-3 bg-slate-950 hover:bg-brand-600 disabled:bg-slate-300 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 btn-3d btn-3d-brand"
                    >
                      {isGeneratingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Rendering...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          {formData.images.length > 0 ? 'Generate More' : 'Generate Visuals'}
                        </>
                      )}
                    </button>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="space-y-6 relative z-10">
                      {/* Image Preview Area */}
                      <div className="relative aspect-video bg-slate-100 rounded-[32px] overflow-hidden group/image border border-slate-100">
                        <img 
                          src={formData.images[formData.activeImageIndex]} 
                          alt="Generated campaign visual"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = formData.images[formData.activeImageIndex];
                              link.download = `campaign-visual-${formData.activeImageIndex + 1}.png`;
                              link.click();
                            }}
                            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 hover:bg-brand-600 hover:text-white transition-all shadow-xl"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteImage(formData.activeImageIndex)}
                            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-xl"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Thumbnails */}
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {formData.images.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setFormData({ ...formData, activeImageIndex: index })}
                            className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                              formData.activeImageIndex === index 
                                ? 'border-brand-600 scale-105 shadow-lg' 
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </button>
                        ))}
                      </div>

                      <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100">
                        <p className="text-[10px] font-bold text-brand-700 uppercase tracking-widest text-center">
                          Visuals are generated based on your campaign objective and active copy variation.
                        </p>
                      </div>
                    </div>
                  )}

                  {formData.images.length === 0 && !isGeneratingImage && (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                      <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-400 shadow-sm">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">Visualize your campaign</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">AI-powered image generation for your ads</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 md:p-10 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-4">
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-full sm:w-auto px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLaunchCampaign}
                  className="w-full sm:w-auto px-10 py-4 bg-slate-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-600 transition-all shadow-xl shadow-slate-950/10 btn-3d btn-3d-brand"
                >
                  {editingCampaignId ? 'Update Initiative' : 'Launch Initiative'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
