# miniHackSong 后端 - Polkadot 集成

## 项目概述

本项目是miniHackSong的后端部分，已从以太坊区块链迁移到Polkadot区块链。主要功能包括NFT管理、用户管理、交易处理等。

## 技术栈

- Go语言
- Polkadot/Substrate
- go-substrate-rpc-client
- RESTful API

## 主要变更

### 从以太坊迁移到Polkadot

1. 替换区块链客户端
   - 移除了以太坊客户端 (go-ethereum)
   - 添加了Polkadot客户端 (go-substrate-rpc-client)

2. 合约交互方式
   - 创建了新的`PolkadotNFT`结构体替代原有的`NFTContract`
   - 实现了与Polkadot链上NFT合约交互的方法

3. 区块链状态查询
   - 更新了区块链状态查询方法，适配Polkadot链
   - 添加了Polkadot特有的账户余额查询功能

4. 交易验证
   - 更新了交易验证逻辑，使用Polkadot的交易验证机制

## 配置说明

在`handlers.go`中的`NewController`函数中配置Polkadot节点连接：

```go
// 连接Polkadot节点
polkadotEndpoint := "wss://rpc.polkadot.io" // 可以替换为其他Polkadot节点
contractID := "YOUR-CONTRACT-ID" // 替换为实际的合约ID
```

## 使用方法

### 安装依赖

```bash
go mod tidy
```

### 运行服务

```bash
go run cmd/main.go
```

## API接口

服务提供以下主要API接口：

- `/users/{address}` - 获取用户信息
- `/transactions/{address}` - 获取交易记录
- `/nfts/{id}` - 获取NFT详情
- `/blockchain/status` - 获取区块链状态
- `/trades` - 处理NFT交易

## 注意事项

1. 需要部署相应的Polkadot智能合约，并在配置中指定合约ID
2. Polkadot的地址格式与以太坊不同，请确保前端适配相应变更
3. 交易验证逻辑需要根据实际的Polkadot合约进行调整