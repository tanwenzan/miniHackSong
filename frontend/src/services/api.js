import axios from 'axios';

// 后端API的基础URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 从后端获取数据
 * @returns {Promise<Object>} 后端返回的数据
 */
export const getBackendData = async () => {
  try {
    const response = await apiClient.get('/data');
    return response.data;
  } catch (error) {
    console.error('API调用失败:', error);
    throw error;
  }
};

/**
 * 向后端发送数据
 * @param {Object} data 要发送的数据
 * @returns {Promise<Object>} 后端返回的响应
 */
export const sendDataToBackend = async (data) => {
  try {
    const response = await apiClient.post('/data', data);
    return response.data;
  } catch (error) {
    console.error('发送数据失败:', error);
    throw error;
  }
};

/**
 * 用户相关API
 */
export const userApi = {
  // 获取用户信息
  getUser: async (walletAddress) => {
    try {
      const response = await apiClient.get(`/users/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  },

  // 创建或更新用户
  saveUser: async (userData) => {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('保存用户信息失败:', error);
      throw error;
    }
  }
};

/**
 * 交易相关API
 */
export const transactionApi = {
  // 获取交易记录
  getTransactions: async (walletAddress) => {
    try {
      const response = await apiClient.get(`/transactions/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('获取交易记录失败:', error);
      throw error;
    }
  },

  // 保存交易记录
  saveTransaction: async (transactionData) => {
    try {
      const response = await apiClient.post('/transactions', transactionData);
      return response.data;
    } catch (error) {
      console.error('保存交易记录失败:', error);
      throw error;
    }
  }
};

/**
 * 合约事件相关API
 */
export const contractEventApi = {
  // 获取合约事件
  getEvents: async (contractAddress, eventName = '') => {
    try {
      const url = eventName 
        ? `/events/${contractAddress}?event=${eventName}`
        : `/events/${contractAddress}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('获取合约事件失败:', error);
      throw error;
    }
  },

  // 保存合约事件
  saveEvent: async (eventData) => {
    try {
      const response = await apiClient.post('/events', eventData);
      return response.data;
    } catch (error) {
      console.error('保存合约事件失败:', error);
      throw error;
    }
  }
};

/**
 * 区块链状态API
 */
export const blockchainApi = {
  // 获取区块链状态
  getStatus: async () => {
    try {
      const response = await apiClient.get('/blockchain/status');
      return response.data;
    } catch (error) {
      console.error('获取区块链状态失败:', error);
      throw error;
    }
  }
};

// 导出所有API
/**
 * NFT相关API
 */
export const nftApi = {
  // 获取NFT列表
  getNFTs: async () => {
    try {
      const response = await apiClient.get('/nfts');
      return response.data;
    } catch (error) {
      console.error('获取NFT列表失败:', error);
      throw error;
    }
  },

  // 获取NFT详情
  getNFTDetail: async (id) => {
    try {
      const response = await apiClient.get(`/nfts/${id}`);
      return response.data;
    } catch (error) {
      console.error('获取NFT详情失败:', error);
      throw error;
    }
  },

  // 保存NFT元数据
  saveNFT: async (nftData) => {
    try {
      const response = await apiClient.post('/nfts', nftData);
      return response.data;
    } catch (error) {
      console.error('保存NFT元数据失败:', error);
      throw error;
    }
  }
};

export default {
  getBackendData,
  sendDataToBackend,
  user: userApi,
  transaction: transactionApi,
  contractEvent: contractEventApi,
  blockchain: blockchainApi,
  nft: nftApi
};