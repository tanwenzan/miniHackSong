import React, { useState, useEffect } from 'react';
import { nftApi } from '../services/api';
import { Link } from 'react-router-dom';

const NFTList = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const data = await nftApi.getNFTs();
        setNfts(data);
      } catch (error) {
        console.error('Failed to fetch NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-secondary mb-6">NFT技能列表</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {nfts.map(nft => (
          <div key={nft.id} className="nft-card transition-all duration-300 hover:transform hover:scale-105">
            <Link to={`/nfts/${nft.id}`} className="block h-full">
              <img 
                src={nft.image} 
                alt={nft.name} 
                className="w-full h-48 object-cover rounded-t" 
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-secondary mb-2">{nft.name}</h3>
                <p className="text-gray-600 text-sm">{nft.description}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NFTList;