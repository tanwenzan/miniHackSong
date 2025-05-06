/**
 * 区块链工具函数
 */

/**
 * 格式化以太坊地址，显示前6位和后4位
 * @param {string} address 以太坊地址
 * @returns {string} 格式化后的地址
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * 验证以太坊地址是否有效
 * @param {string} address 以太坊地址
 * @returns {boolean} 是否有效
 */
export const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * 格式化以太币金额，从Wei转换为ETH并保留指定小数位
 * @param {string|number} amount Wei金额
 * @param {number} decimals 小数位数
 * @returns {string} 格式化后的ETH金额
 */
export const formatEther = (amount, decimals = 4) => {
  if (!amount) return '0';
  // 假设已经引入了web3
  const web3 = window.web3;
  if (web3 && web3.utils) {
    const etherValue = web3.utils.fromWei(amount.toString(), 'ether');
    return parseFloat(etherValue).toFixed(decimals);
  }
  // 如果没有web3，使用简单的转换（1 ETH = 10^18 Wei）
  return (parseFloat(amount) / 1e18).toFixed(decimals);
};

/**
 * 获取交易的区块链浏览器链接
 * @param {string} txHash 交易哈希
 * @param {number} networkId 网络ID
 * @returns {string} 区块链浏览器链接
 */
export const getTransactionExplorerLink = (txHash, networkId) => {
  if (!txHash) return '';
  
  // 根据网络ID选择合适的区块链浏览器
  let baseUrl = 'https://etherscan.io/tx/';
  
  switch (networkId) {
    case 1: // 以太坊主网
      baseUrl = 'https://etherscan.io/tx/';
      break;
    case 3: // Ropsten测试网
      baseUrl = 'https://ropsten.etherscan.io/tx/';
      break;
    case 4: // Rinkeby测试网
      baseUrl = 'https://rinkeby.etherscan.io/tx/';
      break;
    case 5: // Goerli测试网
      baseUrl = 'https://goerli.etherscan.io/tx/';
      break;
    case 42: // Kovan测试网
      baseUrl = 'https://kovan.etherscan.io/tx/';
      break;
    default:
      baseUrl = 'https://etherscan.io/tx/';
  }
  
  return `${baseUrl}${txHash}`;
};

/**
 * 获取地址的区块链浏览器链接
 * @param {string} address 以太坊地址
 * @param {number} networkId 网络ID
 * @returns {string} 区块链浏览器链接
 */
export const getAddressExplorerLink = (address, networkId) => {
  if (!address) return '';
  
  // 根据网络ID选择合适的区块链浏览器
  let baseUrl = 'https://etherscan.io/address/';
  
  switch (networkId) {
    case 1: // 以太坊主网
      baseUrl = 'https://etherscan.io/address/';
      break;
    case 3: // Ropsten测试网
      baseUrl = 'https://ropsten.etherscan.io/address/';
      break;
    case 4: // Rinkeby测试网
      baseUrl = 'https://rinkeby.etherscan.io/address/';
      break;
    case 5: // Goerli测试网
      baseUrl = 'https://goerli.etherscan.io/address/';
      break;
    case 42: // Kovan测试网
      baseUrl = 'https://kovan.etherscan.io/address/';
      break;
    default:
      baseUrl = 'https://etherscan.io/address/';
  }
  
  return `${baseUrl}${address}`;
};

/**
 * 计算交易的确认数
 * @param {number} txBlockNumber 交易所在区块号
 * @param {number} currentBlockNumber 当前区块号
 * @returns {number} 确认数
 */
export const getConfirmationCount = (txBlockNumber, currentBlockNumber) => {
  if (!txBlockNumber || !currentBlockNumber) return 0;
  return Math.max(0, currentBlockNumber - txBlockNumber);
};

/**
 * 根据确认数返回交易状态描述
 * @param {number} confirmations 确认数
 * @returns {string} 状态描述
 */
export const getTransactionStatusText = (confirmations) => {
  if (confirmations === 0) return '等待确认';
  if (confirmations < 6) return `${confirmations} 个确认`;
  return '已确认';
};