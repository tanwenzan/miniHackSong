import axios from 'axios';

// 后端API的基础URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 设置超时时间为5秒
  // 请求重试配置
  retry: 3, // 最大重试次数
  retryDelay: 1000, // 重试间隔时间
});

// 添加请求重试拦截器
apiClient.interceptors.response.use(null, async (error) => {
  const config = error.config;
  
  // 如果配置了重试，且请求失败是由于网络错误或超时导致的
  if (config.retry && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
    config.retryCount = config.retryCount || 0;
    
    // 如果当前重试次数小于最大重试次数
    if (config.retryCount < config.retry) {
      config.retryCount += 1;
      console.log(`请求重试中... 第${config.retryCount}次重试`);
      
      // 延迟重试
      await new Promise(resolve => setTimeout(resolve, config.retryDelay));
      return apiClient(config);
    }
  }
  
  // 处理不同类型的错误
  let errorMessage = '未知错误';
  if (error.code === 'ERR_NETWORK') {
    errorMessage = '网络连接失败，请检查您的网络连接';
  } else if (error.code === 'ECONNABORTED') {
    errorMessage = '请求超时，请稍后重试';
  } else if (error.response) {
    errorMessage = `服务器错误: ${error.response.status}`;
  }
  
  error.message = errorMessage;
  return Promise.reject(error);
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