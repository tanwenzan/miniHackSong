import Web3 from 'web3';
import { contractEventApi, transactionApi } from './api';

// 默认的以太坊网络配置
const DEFAULT_NETWORK = {
  chainId: '0x1', // 以太坊主网
  rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY', // 需要替换为实际的Infura Key
  name: 'Ethereum Mainnet'
};

// 测试网络配置
const TEST_NETWORKS = {
  rinkeby: {
    chainId: '0x4',
    rpcUrl: 'https://rinkeby.infura.io/v3/YOUR_INFURA_KEY',
    name: 'Rinkeby 测试网'
  },
  goerli: {
    chainId: '0x5',
    rpcUrl: 'https://goerli.infura.io/v3/YOUR_INFURA_KEY',
    name: 'Goerli 测试网'
  }
};

class BlockchainService {
  constructor() {
    this.web3 = null;
    this.accounts = [];
    this.networkId = null;
    this.connected = false;
    this.contracts = {}; // 存储已加载的合约实例
  }

  /**
   * 初始化Web3连接
   * @returns {Promise<boolean>} 连接是否成功
   */
  async init() {
    // 检查是否有现代dapp浏览器
    if (window.ethereum) {
      try {
        // 请求用户授权
        this.web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // 获取连接的账户
        this.accounts = await this.web3.eth.getAccounts();
        
        // 获取当前网络ID
        this.networkId = await this.web3.eth.net.getId();
        
        this.connected = true;
        
        // 监听账户变化
        window.ethereum.on('accountsChanged', (accounts) => {
          this.accounts = accounts;
          // 触发账户变化事件
          window.dispatchEvent(new CustomEvent('accountsChanged', { detail: accounts }));
        });
        
        // 监听网络变化
        window.ethereum.on('chainChanged', (chainId) => {
          // 页面刷新是处理网络变化的推荐方式
          window.location.reload();
        });
        
        return true;
      } catch (error) {
        console.error('用户拒绝了连接请求', error);
        return false;
      }
    } 
    // 检查是否有旧版Web3
    else if (window.web3) {
      this.web3 = new Web3(window.web3.currentProvider);
      this.accounts = await this.web3.eth.getAccounts();
      this.networkId = await this.web3.eth.net.getId();
      this.connected = true;
      return true;
    } 
    // 如果没有注入的web3实例，回退到使用本地节点
    else {
      console.log('未检测到以太坊浏览器插件。考虑使用MetaMask!');
      const provider = new Web3.providers.HttpProvider(DEFAULT_NETWORK.rpcUrl);
      this.web3 = new Web3(provider);
      return false;
    }
  }

  /**
   * 获取当前连接的账户地址
   * @returns {string|null} 当前账户地址
   */
  getCurrentAccount() {
    return this.accounts.length > 0 ? this.accounts[0] : null;
  }

  /**
   * 加载合约
   * @param {string} contractName 合约名称
   * @param {object} contractJson 合约ABI和地址信息
   * @returns {object|null} 合约实例
   */
  loadContract(contractName, contractJson) {
    try {
      if (!this.web3) {
        throw new Error('Web3未初始化');
      }

      const networkId = this.networkId.toString();
      
      // 检查合约是否已部署到当前网络
      if (contractJson.networks && contractJson.networks[networkId]) {
        const address = contractJson.networks[networkId].address;
        const contract = new this.web3.eth.Contract(contractJson.abi, address);
        this.contracts[contractName] = contract;
        return contract;
      } else {
        console.error(`合约${contractName}未部署到当前网络(ID: ${networkId})`);
        return null;
      }
    } catch (error) {
      console.error(`加载合约${contractName}失败:`, error);
      return null;
    }
  }

  /**
   * 获取已加载的合约实例
   * @param {string} contractName 合约名称
   * @returns {object|null} 合约实例
   */
  getContract(contractName) {
    return this.contracts[contractName] || null;
  }

  /**
   * 发送交易
   * @param {object} options 交易选项
   * @returns {Promise<object>} 交易结果
   */
  async sendTransaction(options) {
    try {
      if (!this.web3) {
        throw new Error('Web3未初始化');
      }

      const from = options.from || this.getCurrentAccount();
      if (!from) {
        throw new Error('未找到发送账户');
      }

      // 发送交易
      const txHash = await this.web3.eth.sendTransaction({
        from,
        to: options.to,
        value: options.value || '0',
        gas: options.gas || 21000,
        gasPrice: options.gasPrice || await this.web3.eth.getGasPrice(),
        data: options.data || ''
      });

      // 将交易记录保存到后端
      try {
        await transactionApi.saveTransaction({
          tx_hash: txHash,
          from_address: from,
          to_address: options.to,
          amount: this.web3.utils.fromWei(options.value || '0', 'ether'),
          token_address: options.tokenAddress || null,
          status: 'pending'
        });
      } catch (error) {
        console.error('保存交易记录到后端失败:', error);
      }

      return txHash;
    } catch (error) {
      console.error('发送交易失败:', error);
      throw error;
    }
  }

  /**
   * 调用合约方法
   * @param {string} contractName 合约名称
   * @param {string} method 方法名称
   * @param {Array} args 方法参数
   * @param {object} options 交易选项
   * @returns {Promise<any>} 调用结果
   */
  async callContractMethod(contractName, method, args = [], options = {}) {
    try {
      const contract = this.getContract(contractName);
      if (!contract) {
        throw new Error(`合约${contractName}未加载`);
      }

      const from = options.from || this.getCurrentAccount();
      if (!from) {
        throw new Error('未找到发送账户');
      }

      // 检查方法是否存在
      if (!contract.methods[method]) {
        throw new Error(`合约${contractName}没有方法${method}`);
      }

      // 调用合约方法
      const contractMethod = contract.methods[method](...args);
      
      // 如果是只读方法
      if (options.call) {
        return await contractMethod.call({ from });
      } 
      // 如果是写入方法
      else {
        const gas = options.gas || await contractMethod.estimateGas({ from });
        const gasPrice = options.gasPrice || await this.web3.eth.getGasPrice();
        
        const receipt = await contractMethod.send({
          from,
          gas,
          gasPrice,
          value: options.value || '0'
        });

        // 保存合约事件到后端
        try {
          for (const event of receipt.events) {
            await contractEventApi.saveEvent({
              event_name: event.event,
              contract_address: contract.options.address,
              tx_hash: receipt.transactionHash,
              block_number: receipt.blockNumber,
              event_data: JSON.stringify(event.returnValues)
            });
          }
        } catch (error) {
          console.error('保存合约事件到后端失败:', error);
        }

        return receipt;
      }
    } catch (error) {
      console.error(`调用合约${contractName}的${method}方法失败:`, error);
      throw error;
    }
  }

  /**
   * 获取当前网络信息
   * @returns {Promise<object>} 网络信息
   */
  async getNetworkInfo() {
    if (!this.web3) {
      throw new Error('Web3未初始化');
    }

    const networkId = await this.web3.eth.net.getId();
    const chainId = await this.web3.eth.getChainId();
    const gasPrice = await this.web3.eth.getGasPrice();
    const blockNumber = await this.web3.eth.getBlockNumber();

    return {
      networkId,
      chainId,
      gasPrice: this.web3.utils.fromWei(gasPrice, 'gwei') + ' Gwei',
      blockNumber,
      connected: this.connected
    };
  }

  /**
   * 切换网络
   * @param {string} networkName 网络名称
   * @returns {Promise<boolean>} 是否成功
   */
  async switchNetwork(networkName) {
    if (!window.ethereum) {
      throw new Error('未检测到以太坊浏览器插件');
    }

    const network = TEST_NETWORKS[networkName] || DEFAULT_NETWORK;

    try {
      // 尝试切换到指定网络
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
      return true;
    } catch (error) {
      // 如果网络不存在，尝试添加网络
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: network.chainId,
                chainName: network.name,
                rpcUrls: [network.rpcUrl],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('添加网络失败:', addError);
          return false;
        }
      } else {
        console.error('切换网络失败:', error);
        return false;
      }
    }
  }
}

// 创建单例实例
const blockchainService = new BlockchainService();

export default blockchainService;