package api

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/zeroable/miniHackSong/backend/internal/database"
)

// Controller 处理API请求的控制器
type Controller struct {
	Repo               *database.Repository
	userHandler        *UserHandler
	transactionHandler *TransactionHandler
	nftHandler         *NFTHandler
	eventHandler       *EventHandler
	blockChainHandler  *BlockchainHandler
}

// NewController 创建一个新的API控制器
func NewController(repo *database.Repository) *Controller {
	// 初始化模块化处理器
	userHandler := NewUserHandler(repo)
	transactionHandler := NewTransactionHandler(repo)
	nftHandler := NewNFTHandler(repo)
	evntHandler := NewEventHandler(repo)
	blockchainHandler := NewBlockchainHandler(repo)
	return &Controller{
		Repo:               repo,
		userHandler:        userHandler,
		transactionHandler: transactionHandler,
		nftHandler:         nftHandler,
		eventHandler:       evntHandler,
		blockChainHandler:  blockchainHandler,
	}
}

// RegisterRoutes 注册API路由
func (c *Controller) RegisterRoutes(router *mux.Router) {
	// 用户相关API
	router.HandleFunc("/users/{address}", c.userHandler.GetUser).Methods("GET")
	router.HandleFunc("/users", c.userHandler.CreateOrUpdateUser).Methods("POST")

	// 交易相关API
	router.HandleFunc("/transactions/{address}", c.transactionHandler.GetTransactions).Methods("GET")
	router.HandleFunc("/transactions", c.transactionHandler.SaveTransaction).Methods("POST")
	router.HandleFunc("/trades", c.transactionHandler.ProcessTrade).Methods("POST")

	// 合约事件相关API
	router.HandleFunc("/events/{contract}", c.eventHandler.GetContractEvents).Methods("GET")
	router.HandleFunc("/events", c.eventHandler.SaveContractEvent).Methods("POST")

	// 区块链状态API
	// router.HandleFunc("/blockchain/status", c.blockChainHandler.GetBlockchainStatus).Methods("GET")

	// NFT相关API
	router.HandleFunc("/nfts", c.nftHandler.GetNFTs).Methods("GET")
	router.HandleFunc("/nfts/{id}", c.nftHandler.GetNFTDetail).Methods("GET")
	router.HandleFunc("/nfts", c.nftHandler.SaveNFTMetadata).Methods("POST")

	// 数据API
	router.HandleFunc("/api/data", c.GetData).Methods("GET")
}

// GetData 获取数据
func (c *Controller) GetData(w http.ResponseWriter, r *http.Request) {
	// 模拟数据
	data := map[string]interface{}{
		"status": "success",
		"data": []map[string]interface{}{
			{
				"id":    1,
				"name":  "示例数据1",
				"value": 100,
			},
			{
				"id":    2,
				"name":  "示例数据2",
				"value": 200,
			},
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(data)
}
