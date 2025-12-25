import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { ArrowUp, DollarSign, Eye, MousePointerClick, Download, Heart, Package, MessageSquare, Settings } from 'lucide-react';
import Button from '../components/Button';
import { MOCK_LISTINGS } from '../constants';

const data = [
  { name: 'Mon', views: 4000, sales: 2400 },
  { name: 'Tue', views: 3000, sales: 1398 },
  { name: 'Wed', views: 2000, sales: 9800 },
  { name: 'Thu', views: 2780, sales: 3908 },
  { name: 'Fri', views: 1890, sales: 4800 },
  { name: 'Sat', views: 2390, sales: 3800 },
  { name: 'Sun', views: 3490, sales: 4300 },
];

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'saved' | 'purchased'>('overview');

  return (
    <div className="pt-24 px-6 max-w-7xl mx-auto pb-20 animate-fade-in min-h-screen">
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Dashboard</h1>
          <p className="text-textMuted">Welcome back, Founder.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" icon={<Settings size={16} />}>Settings</Button>
          <Button>Submit New Kit</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-accent text-white' : 'border-transparent text-textMuted hover:text-white'}`}
        >
          Seller Overview
        </button>
        <button 
          onClick={() => setActiveTab('purchased')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'purchased' ? 'border-accent text-white' : 'border-transparent text-textMuted hover:text-white'}`}
        >
          Purchased Kits
        </button>
        <button 
          onClick={() => setActiveTab('saved')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'saved' ? 'border-accent text-white' : 'border-transparent text-textMuted hover:text-white'}`}
        >
          Saved / Liked
        </button>
      </div>

      {/* OVERVIEW TAB (Seller Stats) */}
      {activeTab === 'overview' && (
        <div className="animate-slide-up">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Total Revenue', value: '$12,450', icon: DollarSign, trend: '+12.5%' },
              { label: 'Total Views', value: '45.2k', icon: Eye, trend: '+8.1%' },
              { label: 'Click Rate', value: '3.2%', icon: MousePointerClick, trend: '+1.2%' },
              { label: 'Active Listings', value: '8', icon: Package, trend: '0%' }
            ].map((metric, i) => (
              <div key={i} className="p-6 rounded-xl bg-surface border border-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-textMuted text-sm">{metric.label}</span>
                  <div className="p-2 rounded-lg bg-surfaceHighlight text-accent">
                    <metric.icon size={16} />
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-2xl font-bold text-white">{metric.value}</span>
                  <span className="text-xs text-green-400 font-mono mb-1.5">{metric.trend}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 p-6 rounded-xl bg-surface border border-border">
              <h3 className="text-lg font-medium text-white mb-6">Revenue & Traffic</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D1F25E" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D1F25E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" tick={{fill: '#666'}} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" tick={{fill: '#666'}} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1A1A1F', borderColor: '#333', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#D1F25E" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-surface border border-border">
              <h3 className="text-lg font-medium text-white mb-6">Recent Messages</h3>
              <div className="space-y-4">
                 {[1, 2, 3].map(i => (
                    <div key={i} className="p-3 bg-surfaceHighlight rounded-lg flex items-start gap-3">
                       <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                          <MessageSquare size={14} />
                       </div>
                       <div>
                          <p className="text-sm text-white font-medium mb-1">Inquiry about SaaS Kit</p>
                          <p className="text-xs text-textMuted line-clamp-2">"Hi, does this include the Stripe webhook handler?"</p>
                       </div>
                    </div>
                 ))}
              </div>
              <Button variant="outline" className="w-full mt-6 text-xs">View All Messages</Button>
            </div>
          </div>
        </div>
      )}

      {/* PURCHASED TAB */}
      {activeTab === 'purchased' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
           {/* Placeholder for purchased items */}
           <div className="p-6 rounded-xl bg-surface border border-border flex flex-col items-center justify-center text-center py-20 col-span-full">
              <Package size={48} className="text-textMuted mb-4 opacity-50" />
              <h3 className="text-white font-bold text-lg mb-2">No purchased kits yet</h3>
              <p className="text-textMuted mb-6 max-w-sm">Start your next project by acquiring a launch-ready foundation.</p>
              <Button onClick={() => window.location.hash = '#explore'}>Browse Catalog</Button>
           </div>
        </div>
      )}

      {/* SAVED TAB */}
      {activeTab === 'saved' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
             {MOCK_LISTINGS.slice(0, 3).map(listing => (
                <div key={listing.id} className="bg-surface border border-border rounded-xl overflow-hidden group">
                   <div className="relative aspect-video">
                      <img src={listing.image} className="w-full h-full object-cover opacity-80" alt="" />
                      <div className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-accent cursor-pointer">
                         <Heart size={16} fill="currentColor" />
                      </div>
                   </div>
                   <div className="p-4">
                      <h4 className="text-white font-bold truncate">{listing.title}</h4>
                      <div className="flex justify-between items-center mt-4">
                         <span className="text-textMuted text-sm">{listing.category}</span>
                         <Button size="sm" variant="outline">View Kit</Button>
                      </div>
                   </div>
                </div>
             ))}
         </div>
      )}

    </div>
  );
};

export default Dashboard;
