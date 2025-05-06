import React, { useState } from 'react';
import NFTList from '../components/NFTList';

function NFTMarketplace() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary mb-2">NFT技能市场</h1>
        <p className="text-gray-600 mb-6">探索、购买和交易NFT技能凭证</p>
        
        {/* 搜索和筛选 */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="搜索技能名称或描述..." 
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-5 h-5 text-gray-400 absolute right-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex space-x-2">
            <button 
              className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setFilter('all')}
            >
              全部
            </button>
            <button 
              className={`px-4 py-2 rounded ${filter === 'design' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setFilter('design')}
            >
              设计
            </button>
            <button 
              className={`px-4 py-2 rounded ${filter === 'development' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setFilter('development')}
            >
              开发
            </button>
          </div>
        </div>
      </div>
      
      {/* NFT列表 */}
      <NFTList />
    </div>
  );
}

export default NFTMarketplace;