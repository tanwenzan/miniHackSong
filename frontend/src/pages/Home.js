import React from 'react';
import { getBackendData } from '../services/api';

function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">欢迎来到NFT技能交换市场</h1>
        <p className="text-xl text-gray-600 mb-8">基于区块链技术的NFT驱动技能交换平台</p>
        <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
          <button className="btn-primary text-lg py-3 px-8">探索技能</button>
          <button className="btn-secondary text-lg py-3 px-8">创建技能NFT</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="card p-6 flex flex-col items-center text-center">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">区块链赋能技能交换</h2>
          <p className="text-gray-600">通过智能合约自动执行交易，消除传统技能交换中的信任问题</p>
        </div>
        
        <div className="card p-6 flex flex-col items-center text-center">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">NFT作为技能凭证</h2>
          <p className="text-gray-600">每个技能NFT包含完整的元数据和评价体系，确保技能真实性和所有权证明</p>
        </div>
        
        <div className="card p-6 flex flex-col items-center text-center">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">去中心化优势</h2>
          <p className="text-gray-600">无中间商抽成，交易成本大幅降低，用户完全掌控自己的数据和资产</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;