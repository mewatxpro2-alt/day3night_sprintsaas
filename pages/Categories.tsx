import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ViewState } from '../types';

interface CategoriesProps {
  onNavigate?: (view: ViewState) => void;
}

const CATEGORIES = [
  {
    id: 'saas',
    title: 'SaaS',
    count: 847,
    description: 'Dashboards, landing pages, and admin panels for software products.',
    image: 'https://picsum.photos/800/600?random=1',
  },
  {
    id: 'ecommerce',
    title: 'E-commerce',
    count: 623,
    description: 'Online stores, product showcases, and checkout experiences.',
    image: 'https://picsum.photos/800/600?random=3',
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    count: 412,
    description: 'Personal sites, creative portfolios, and resume pages.',
    image: 'https://picsum.photos/800/600?random=2',
  },
  {
    id: 'fintech',
    title: 'Fintech',
    count: 186,
    description: 'Modern banking interfaces, crypto wallets, and trading dashboards.',
    image: 'https://picsum.photos/800/600?random=4',
  },
  {
    id: 'ai',
    title: 'AI Startup',
    count: 245,
    description: 'Futuristic landing pages for LLMs, agents, and machine learning tools.',
    image: 'https://picsum.photos/800/600?random=5',
  },
  {
    id: 'health',
    title: 'Health',
    count: 142,
    description: 'Medical practice websites, health tracking, and wellness apps.',
    image: 'https://picsum.photos/800/600?random=6',
  }
];

const Categories: React.FC<CategoriesProps> = ({ onNavigate }) => {
  return (
    <div className="pt-32 pb-20 px-6 max-w-[1400px] mx-auto min-h-screen">
      {/* Header */}
      <div className="text-center mb-16 animate-slide-up">
        {/* Exact Pill Design Requested - Using Tertiary Color for variety or Accent */}
        <div className="inline-block px-4 py-1.5 rounded-full border border-tertiary/30 text-tertiary text-sm font-medium bg-tertiary/5 mb-6">
          Categories
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-textMain mb-4">
          Browse by Category
        </h1>
        <p className="text-textMuted max-w-xl mx-auto">
          Find the perfect website design for your industry or use case.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
        {CATEGORIES.map((cat, i) => (
          <div 
            key={cat.id}
            className="group relative rounded-2xl overflow-hidden bg-surface border border-border transition-all duration-300 flex flex-col cursor-pointer hover:border-accent/50 hover:shadow-premium"
            style={{ animationDelay: `${i * 0.1}s` }}
            onClick={() => onNavigate?.(ViewState.EXPLORE)}
          >
            {/* Image Section */}
            <div className="relative aspect-[16/10] overflow-hidden bg-surfaceHighlight">
               <img 
                 src={cat.image} 
                 alt={cat.title} 
                 className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 saturate-0 group-hover:saturate-100"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-90" />
            </div>

            {/* Content Section */}
            <div className="p-8 pt-0 flex flex-col flex-1 relative -mt-8">
               <div className="flex justify-between items-end mb-4">
                  <h2 className="text-2xl font-bold font-display text-textMain group-hover:text-accent transition-colors">
                    {cat.title}
                  </h2>
                  <span className="px-2 py-1 bg-surfaceHighlight rounded text-xs text-textMuted font-mono border border-border group-hover:border-accent/20 group-hover:text-accent transition-colors">
                    {cat.count}
                  </span>
               </div>
               
               <p className="text-textMuted text-sm leading-relaxed mb-8 flex-1">
                 {cat.description}
               </p>

               {/* Browse Link - Reveals on Hover */}
               <div className="flex items-center gap-2 text-accent text-sm font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  Browse {cat.title} <ArrowRight size={16} />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;