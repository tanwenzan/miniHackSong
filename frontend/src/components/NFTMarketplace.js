import React, { useState, useEffect } from 'react';
import { useWeb3Modal } from '@web3modal/react';
import { useAccount } from 'wagmi';
import axios from 'axios';
import { ethers } from 'ethers';
import './NFTMarketplace.css';

const filterNFTs = (search, category) => {
    let filtered = nfts;
    
    if (search) {
      filtered = filtered.filter(nft => 
        nft.name.toLowerCase().includes(search.toLowerCase()) || 
        nft.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category !== 'all') {
      filtered = filtered.filter(nft => nft.category === category);
    }
    
    setFilteredNfts(filtered);
  };

  const NFTMarketplace = () => {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState([]);
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/nft/marketplace');
        setNfts(response.data);
        setFilteredNfts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  const handlePurchase = async (nftId) => {
    if (!isConnected) {
      await open();
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // 获取当前NFT信息
      const nft = nfts.find(item => item.id === nftId);
      if (!nft) {
        console.error('NFT not found');
        return;
      }
      
      // 发送交易
      const tx = await signer.sendTransaction({
        to: nft.owner,
        value: ethers.utils.parseEther(nft.price),
        data: ethers.utils.toUtf8Bytes(`Purchase NFT ${nftId}`)
      });
      
      // 等待交易确认
      await tx.wait();
      console.log('NFT purchased successfully:', tx.hash);
      
      // 更新UI
      setNfts(nfts.filter(item => item.id !== nftId));
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  if (loading) {
    return <div>Loading NFTs...</div>;
  }

  return (
    <div className="nft-marketplace">
      <h2>技能NFT市场</h2>
      <div className="flex items-center space-x-4 mb-6">
        <input
          type="text"
          placeholder="搜索技能"
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          onChange={(e) => {
            setSearchTerm(e.target.value);
            filterNFTs(e.target.value, category);
          }}
        />
        <select
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            filterNFTs(searchTerm, e.target.value);
          }}
        >
          <option value="all">全部</option>
          <option value="development">开发</option>
          <option value="design">设计</option>
          <option value="marketing">营销</option>
        </select>
      </div>
      <div className="nft-list">
        {filteredNfts.map((nft) => (
          <div className="w-72 bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 m-4">
          <img 
            className="w-full h-48 object-cover" 
            src={nft.image_url} 
            alt={nft.name} 
          />
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">{nft.name}</h3>
            <p className="text-gray-600 mb-3">{nft.description}</p>
            <p className="text-gray-700 mb-1">价格: {nft.price} ETH</p>
            <p className="text-gray-500 text-sm mb-4">拥有者: {nft.owner.substring(0, 6)}...{nft.owner.substring(nft.owner.length - 4)}</p>
            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
              onClick={() => handlePurchase(nft.id)}
            >
              购买
            </button>
          </div>
        </div>
        ))}
      </div>
    </div>
  );
};

export default NFTMarketplace;