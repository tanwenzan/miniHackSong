import React from 'react';
import './NFTPrototype.css';

const NFTPrototype = () => {
  return (
    <div className="nft-platform">
      {/* 顶部导航栏 */}
      <header className="header">
        <h1>NFT技能交换市场</h1>
        <button className="connect-wallet">连接钱包</button>
      </header>

      {/* 主要内容区 */}
      <main className="main-content">
        {/* 侧边栏 */}
        <aside className="sidebar">
          <nav>
            <ul>
              <li className="active">市场浏览</li>
              <li>我的NFT</li>
              <li>交易记录</li>
              <li>消息中心</li>
            </ul>
          </nav>
        </aside>

        {/* NFT展示区 */}
        <section className="nft-gallery">
          <div className="search-bar">
            <input type="text" placeholder="搜索技能..." />
            <select>
              <option>全部类别</option>
              <option>编程</option>
              <option>设计</option>
              <option>营销</option>
            </select>
          </div>

          <div className="nft-grid">
            {/* NFT卡片示例 */}
            <div className="nft-card">
              <div className="nft-image"></div>
              <div className="nft-info">
                <h3>React高级开发</h3>
                <p>拥有者: 0x123...456</p>
                <div className="price">1.5 ETH</div>
                <button>交换请求</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 底部信息 */}
      <footer className="footer">
        <p>© 2023 NFT技能交换市场</p>
      </footer>
    </div>
  );
};

export default NFTPrototype;