# NFT技能交换市场

这是一个基于区块链技术的NFT驱动技能交换平台，具有以下创新亮点：

## 项目亮点

### 区块链赋能技能交换
- 首创将NFT技术应用于技能交换领域，实现技能凭证的数字化和唯一性
- 通过智能合约自动执行交易，消除传统技能交换中的信任问题

### NFT作为技能凭证
- 每个技能NFT包含完整的元数据和评价体系
- 不可篡改的区块链记录确保技能真实性和所有权证明
- 稀缺性设计提升高价值技能的交换价值

### 去中心化优势
- 无中间商抽成，交易成本大幅降低
- 用户完全掌控自己的数据和资产
- 透明公开的交易历史记录

平台包含以下三个主要部分：

- `backend/`: 后端服务，使用Go语言开发，提供NFT元数据管理API
- `frontend/`: 前端应用，展示和交易技能NFT
- `contracts/`: 智能合约，实现ERC-721标准的技能NFT

## 前端功能模块

### 用户认证
- 钱包连接（MetaMask等）
- 用户注册/登录
- 个人资料管理

### NFT展示
- 技能NFT列表展示（分类/搜索/筛选）
- NFT详情页（元数据、拥有者、技能描述）
- 热门/最新NFT推荐

### 交易功能
- NFT购买/出售
- 技能交换请求
- 交易历史记录
- 价格走势图表

### 个人中心
- 我的NFT收藏
- 交易记录
- 技能交换请求管理
- 钱包余额管理

### 社区互动
- 技能评价系统
- 用户间消息系统
- 技能需求发布

### 管理员功能
- 用户管理
- NFT审核
- 交易监控

## 项目结构

```
miniHackSong/
├── backend/         # Go后端服务
│   ├── cmd/         # 应用入口
│   ├── internal/    # 内部包
│   ├── pkg/         # 可导出的包
│   └── go.mod       # Go模块定义
├── frontend/        # 前端应用
│   ├── public/      # 静态资源
│   ├── src/         # 源代码
│   └── package.json # 依赖管理
└── contracts/       # 智能合约
    ├── contracts/   # 合约源码
    ├── scripts/     # 部署脚本
    ├── test/        # 测试文件
    └── hardhat.config.js # Hardhat配置
```

## 安装与运行

### 后端

```bash
cd backend
go mod download
go run cmd/main.go
```

### 前端

```bash
cd frontend
npm install
npm start
```

### 智能合约

```bash
cd contracts
npm install
npx hardhat compile
```