import React, { useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import './Trade.css';

const Trade = ({ nft }) => {
  const { account, library } = useWeb3React();
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleBuy = async () => {
    if (!price || isNaN(price)) {
      setMessage('请输入有效价格');
      return;
    }
    
    setIsLoading(true);
    try {
      // 这里需要调用智能合约的购买方法
      const tx = await library.getSigner().sendTransaction({
        to: nft.owner,
        value: ethers.utils.parseEther(price)
      });
      
      await tx.wait();
      setMessage('购买成功！');
    } catch (err) {
      console.error('交易失败:', err);
      setMessage('交易失败: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="trade-container">
      <h3>交易NFT: {nft.name}</h3>
      <div className="trade-form">
        <label>
          价格(ETH):
          <input 
            type="number" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            min="0"
            step="0.01"
          />
        </label>
        <button 
          onClick={handleBuy} 
          disabled={isLoading || !account}
        >
          {isLoading ? '处理中...' : '购买'}
        </button>
      </div>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Trade;