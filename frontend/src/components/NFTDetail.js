import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3Modal } from '@web3modal/react';
import { useAccount } from 'wagmi';
import axios from 'axios';
import { ethers } from 'ethers';

const NFTDetail = () => {
  const { id } = useParams();
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNFT = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/nft/metadata/${id}`);
        setNft(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching NFT:', error);
        setLoading(false);
      }
    };

    fetchNFT();
  }, [id]);

  const handlePurchase = async () => {
    if (!isConnected) {
      await open();
      return;
    }

    // TODO: 实现NFT购买逻辑
    console.log(`Purchasing NFT ${id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">NFT未找到</h2>
          <p className="text-gray-600">无法找到ID为 {id} 的NFT，请检查链接是否正确。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* NFT图片 */}
          <div className="md:w-1/2">
            <img 
              src={nft.image || nft.image_url} 
              alt={nft.name} 
              className="w-full h-auto object-cover max-h-96"
            />
          </div>
          
          {/* NFT详情 */}
          <div className="p-6 md:w-1/2">
            <h2 className="text-3xl font-bold text-secondary mb-4">{nft.name}</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-gray-700 mb-4 leading-relaxed">{nft.description}</p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-medium">价格:</span>
                <span className="text-xl font-bold text-primary">{nft.price} ETH</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">拥有者:</span>
                <span className="text-gray-800 bg-gray-100 px-3 py-1 rounded-full text-sm font-mono">
                  {nft.owner.substring(0, 6)}...{nft.owner.substring(nft.owner.length - 4)}
                </span>
              </div>
            </div>
            
            <button 
              onClick={handlePurchase} 
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-md transition-colors duration-300 flex items-center justify-center"
            >
              {isConnected ? '购买 NFT' : '连接钱包购买'}
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDetail;