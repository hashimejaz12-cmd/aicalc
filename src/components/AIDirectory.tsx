'use client';

import { useState, useMemo } from 'react';
import { Search, ExternalLink } from 'lucide-react';

interface AITool {
  name: string;
  description: string;
  url: string;
  category: string;
  pricing: string;
  source: string;
}

export default function AIDirectory({ tools }: { tools: AITool[] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [pricing, setPricing] = useState('All');

  const categories = ['All', ...Array.from(new Set(tools.map(t => t.category)))].sort();
  const pricingOptions = ['All', 'Free', 'Paid', 'Unknown'];

  const filtered = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = 
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || tool.category === category;
      const matchesPricing = pricing === 'All' || tool.pricing === pricing;
      
      return matchesSearch && matchesCategory && matchesPricing;
    });
  }, [tools, search, category, pricing]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AI Tools Directory
        </h1>
        <p className="text-xl text-gray-400">
          Discover {tools.length.toLocaleString()}+ AI tools to supercharge your workflow
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Pricing Filter */}
        <select
          value={pricing}
          onChange={(e) => setPricing(e.target.value)}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {pricingOptions.map(price => (
            <option key={price} value={price}>{price}</option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-sm text-gray-400">
        Showing {filtered.length.toLocaleString()} of {tools.length.toLocaleString()} tools
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tool, idx) => (
          <a
            key={idx}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group border border-gray-800 rounded-xl p-6 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20 transition-all bg-gray-900/50 backdrop-blur"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-lg text-white group-hover:text-blue-400 transition-colors">
                {tool.name}
              </h3>
              <ExternalLink className="h-5 w-5 text-gray-500 group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2" />
            </div>
            
            <p className="text-sm text-gray-400 mb-4 line-clamp-3 leading-relaxed">
              {tool.description}
            </p>
            
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                {tool.category}
              </span>
              {tool.pricing !== 'Unknown' && (
                <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                  {tool.pricing}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">No tools found matching your filters.</p>
          <button
            onClick={() => {
              setSearch('');
              setCategory('All');
              setPricing('All');
            }}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
