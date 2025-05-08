import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
// 不再需要导入App.css，因为我们使用Tailwind CSS

// 导入服务
import { getBackendData } from './services/api';
import blockchainService from './services/blockchain';

// 导入页面组件
import HomePage from './pages/Home';
import NFTMarketplace from './pages/NFTMarketplace';
import MyNFTs from './pages/MyNFTs';
import Profile from './pages/Profile';
import NFTPrototype from './pages/NFTPrototype';
import VisualConceptPage from './pages/VisualConceptPage';

function App() {
  const [backendData, setBackendData] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // 从后端获取数据并初始化区块链服务
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getBackendData();
        setBackendData(data);
        setError('');
        
        // 初始化区块链服务
        await blockchainService.init();
      } catch (err) {
        console.error('获取后端数据或初始化区块链服务失败:', err);
        setError('无法连接到后端服务或初始化区块链');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // 确保用户断开连接后不会自动重连
    // 清除任何可能存在的钱包连接状态
    setWalletConnected(false);
    setAccount('');
  }, []);

  // 连接到MetaMask钱包
  const connectWallet = async () => {
    try {
      setLoading(true);
      
      // 使用blockchain服务连接钱包，确保每次都会唤起钱包选择界面
      // 现在blockchain服务会直接抛出具体错误，不再返回布尔值
      await blockchainService.connectWallet();
      
      // 如果连接成功，获取当前账户地址
      const address = blockchainService.getCurrentAccount();
      setAccount(address);
      setWalletConnected(true);
      setError('');
    } catch (err) {
      console.error('连接钱包失败:', err);
      // 显示具体的错误信息，而不是通用错误
      setError(err.message || '连接钱包时出错');
      setWalletConnected(false);
      setAccount('');
    } finally {
      setLoading(false);
    }
  };

  // 断开钱包连接
  const disconnectWallet = () => {
    setWalletConnected(false);
    setAccount('');
    
    // 确保断开连接后清除任何可能导致自动重连的状态
    // 这里不存储任何钱包连接信息，确保用户需要手动重新连接
    console.log('钱包已断开连接，需要手动重新连接');
  };

  // 导航链接组件
  const NavLink = ({ to, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    
    return (
      <Link 
        to={to} 
        className={`px-4 py-2 text-lg font-medium transition-colors ${isActive 
          ? 'text-white border-b-2 border-white' 
          : 'text-white/80 hover:text-white border-b-2 border-transparent hover:border-white/50'}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* 导航栏 */}
        <header className="bg-gradient-to-r from-primary to-secondary shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              {/* Logo */}
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-2 text-white font-bold text-xl">
                  <span className="text-2xl md:text-3xl font-bold text-white">HackSong</span>
                  <span className="ml-2 text-xs md:text-sm bg-white/20 px-2 py-1 rounded text-white">技能NFT</span>
                </Link>
              </div>
              
              {/* 桌面导航 */}
              <nav className="hidden md:flex items-center space-x-6">
                <NavLink to="/">首页</NavLink>
                <NavLink to="/marketplace">技能市场</NavLink>
                <NavLink to="/my-nfts">我的技能</NavLink>
                <NavLink to="/profile">个人中心</NavLink>
              </nav>
              
              {/* 钱包连接 */}
              <div className="flex items-center space-x-4">
                {error && <span className="text-red-200 text-sm">{error}</span>}
                
                {!walletConnected ? (
                  <button 
                    onClick={connectWallet} 
                    disabled={loading}
                    className="btn-primary flex items-center shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        连接中
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        连接钱包
                      </>
                    )}
                  </button>
                ) : (
                  <div className="relative group">
                    <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="text-sm font-medium">{`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* 钱包下拉菜单 */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-top-right">
                      <div className="py-1">
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            个人资料
                          </span>
                        </Link>
                        <Link to="/my-nfts" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            我的技能
                          </span>
                        </Link>
                        <button 
                          onClick={disconnectWallet}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            断开连接
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 移动端菜单按钮 */}
                <button 
                  className="md:hidden text-white focus:outline-none" 
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    {showMobileMenu ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* 移动端菜单 */}
          {showMobileMenu && (
            <div className="md:hidden bg-indigo-700 pb-3 px-4">
              <Link to="/" className="block py-2 text-white hover:bg-indigo-800 px-3 rounded" onClick={() => setShowMobileMenu(false)}>首页</Link>
              <Link to="/marketplace" className="block py-2 text-white hover:bg-indigo-800 px-3 rounded" onClick={() => setShowMobileMenu(false)}>技能市场</Link>
              <Link to="/my-nfts" className="block py-2 text-white hover:bg-indigo-800 px-3 rounded" onClick={() => setShowMobileMenu(false)}>我的技能</Link>
              <Link to="/profile" className="block py-2 text-white hover:bg-indigo-800 px-3 rounded" onClick={() => setShowMobileMenu(false)}>个人中心</Link>
            </div>
          )}
        </header>

        {/* 主内容区 */}
        <main className="flex-grow">
          {/* 错误提示 */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 mx-4 mt-4 rounded shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}
          
          {/* 路由内容 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/marketplace" element={<NFTMarketplace />} />
              <Route path="/my-nfts" element={<MyNFTs />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/prototype" element={<NFTPrototype />} />
              <Route path="/visual-concept" element={<VisualConceptPage />} />
            </Routes>
          </div>
        </main>

        {/* 页脚 */}
        <footer className="bg-white border-t border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-500 text-sm">&copy; 2023 Mini Hack Song - 技能NFT交易平台</p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;