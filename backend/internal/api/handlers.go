package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/zeroable/miniHackSong/backend/internal/database"
)

// Controller 处理API请求的控制器
type Controller struct {
	Repo *database.Repository
}

// NewController 创建一个新的API控制器
func NewController(repo *database.Repository) *Controller {
	return &Controller{Repo: repo}
}

// RegisterRoutes 注册API路由
func (c *Controller) RegisterRoutes(router *mux.Router) {
	// 用户相关API
	router.HandleFunc("/users/{address}", c.GetUser).Methods("GET")
	router.HandleFunc("/users", c.CreateOrUpdateUser).Methods("POST")

	// 交易相关API
	router.HandleFunc("/transactions/{address}", c.GetTransactions).Methods("GET")
	router.HandleFunc("/transactions", c.SaveTransaction).Methods("POST")
	router.HandleFunc("/trades", c.ProcessTrade).Methods("POST")

	// 合约事件相关API
	router.HandleFunc("/events/{contract}", c.GetContractEvents).Methods("GET")
	router.HandleFunc("/events", c.SaveContractEvent).Methods("POST")

	// 区块链状态API
	router.HandleFunc("/blockchain/status", c.GetBlockchainStatus).Methods("GET")

	// NFT相关API
	router.HandleFunc("/nfts", c.GetNFTs).Methods("GET")
	router.HandleFunc("/nfts/{id}", c.GetNFTDetail).Methods("GET")
	router.HandleFunc("/nfts", c.SaveNFTMetadata).Methods("POST")
}

// GetUser 获取用户信息
func (c *Controller) GetUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	address := vars["address"]

	user, err := c.Repo.GetUserByWalletAddress(address)
	if err != nil {
		log.Printf("获取用户信息失败: %v", err)
		http.Error(w, "获取用户信息失败", http.StatusInternalServerError)
		return
	}

	if user == nil {
		http.Error(w, "用户不存在", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// CreateOrUpdateUser 创建或更新用户
func (c *Controller) CreateOrUpdateUser(w http.ResponseWriter, r *http.Request) {
	var user database.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "无效的请求数据", http.StatusBadRequest)
		return
	}

	if user.WalletAddress == "" {
		http.Error(w, "钱包地址不能为空", http.StatusBadRequest)
		return
	}

	// 检查用户是否存在
	existingUser, err := c.Repo.GetUserByWalletAddress(user.WalletAddress)
	if err != nil {
		log.Printf("查询用户失败: %v", err)
		http.Error(w, "服务器内部错误", http.StatusInternalServerError)
		return
	}

	var responseMsg string
	if existingUser == nil {
		// 创建新用户
		err = c.Repo.CreateUser(&user)
		responseMsg = "用户创建成功"
	} else {
		// 更新现有用户
		err = c.Repo.UpdateUser(&user)
		responseMsg = "用户更新成功"
	}

	if err != nil {
		log.Printf("保存用户失败: %v", err)
		http.Error(w, "保存用户失败", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": responseMsg})
}

// GetTransactions 获取交易记录
func (c *Controller) GetTransactions(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	address := vars["address"]

	transactions, err := c.Repo.GetTransactionsByAddress(address)
	if err != nil {
		log.Printf("获取交易记录失败: %v", err)
		http.Error(w, "获取交易记录失败", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transactions)
}

// ProcessTrade 处理技能NFT交易
func (c *Controller) ProcessTrade(w http.ResponseWriter, r *http.Request) {
	var tradeRequest struct {
		NFTID       string `json:"nftId"`
		FromAddress string `json:"fromAddress"`
		ToAddress   string `json:"toAddress"`
		Price       string `json:"price"`
		TxHash      string `json:"txHash"`
	}

	err := json.NewDecoder(r.Body).Decode(&tradeRequest)
	if err != nil {
		http.Error(w, "无效的请求数据", http.StatusBadRequest)
		return
	}

	if tradeRequest.NFTID == "" || tradeRequest.FromAddress == "" ||
		tradeRequest.ToAddress == "" || tradeRequest.Price == "" || tradeRequest.TxHash == "" {
		http.Error(w, "NFT ID、交易双方地址、价格和交易哈希不能为空", http.StatusBadRequest)
		return
	}

	// 保存交易记录
	tx := database.Transaction{
		FromAddress: tradeRequest.FromAddress,
		ToAddress:   tradeRequest.ToAddress,
		Amount:      parsePrice(tradeRequest.Price), // 将字符串价格转换为float64类型
		TxHash:      tradeRequest.TxHash,
		Status:      "pending",
		NFTID:       tradeRequest.NFTID,
	}

	err = c.Repo.SaveTransaction(&tx)
	if err != nil {
		log.Printf("保存交易记录失败: %v", err)
		http.Error(w, "保存交易记录失败", http.StatusInternalServerError)
		return
	}

	// 更新NFT所有权
	err = c.Repo.UpdateNFTOwner(tradeRequest.NFTID, tradeRequest.ToAddress)
	if err != nil {
		log.Printf("更新NFT所有权失败: %v", err)
		http.Error(w, "更新NFT所有权失败", http.StatusInternalServerError)
		return
	}

	// 更新交易状态为完成
	tx.Status = "completed"
	err = c.Repo.UpdateTransaction(&tx)
	if err != nil {
		log.Printf("更新交易状态失败: %v", err)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "交易处理成功"})
}

func parsePrice(s string) float64 {
	// 导入 strconv 包
	price, err := strconv.ParseFloat(s, 64)
	if err != nil {
		// 如果转换失败则返回0
		return 0
	}
	return price
}

// SaveTransaction 保存交易记录
func (c *Controller) SaveTransaction(w http.ResponseWriter, r *http.Request) {
	var tx database.Transaction
	err := json.NewDecoder(r.Body).Decode(&tx)
	if err != nil {
		http.Error(w, "无效的请求数据", http.StatusBadRequest)
		return
	}

	if tx.TxHash == "" || tx.FromAddress == "" || tx.ToAddress == "" {
		http.Error(w, "交易哈希、发送地址和接收地址不能为空", http.StatusBadRequest)
		return
	}

	err = c.Repo.SaveTransaction(&tx)
	if err != nil {
		log.Printf("保存交易记录失败: %v", err)
		http.Error(w, "保存交易记录失败", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "交易记录保存成功"})
}

// GetContractEvents 获取合约事件
func (c *Controller) GetContractEvents(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	contractAddress := vars["contract"]
	eventName := r.URL.Query().Get("event")

	events, err := c.Repo.GetContractEvents(contractAddress, eventName)
	if err != nil {
		log.Printf("获取合约事件失败: %v", err)
		http.Error(w, "获取合约事件失败", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

// SaveContractEvent 保存合约事件
func (c *Controller) SaveContractEvent(w http.ResponseWriter, r *http.Request) {
	var event database.ContractEvent
	err := json.NewDecoder(r.Body).Decode(&event)
	if err != nil {
		http.Error(w, "无效的请求数据", http.StatusBadRequest)
		return
	}

	if event.EventName == "" || event.ContractAddress == "" || event.TxHash == "" {
		http.Error(w, "事件名称、合约地址和交易哈希不能为空", http.StatusBadRequest)
		return
	}

	err = c.Repo.SaveContractEvent(&event)
	if err != nil {
		log.Printf("保存合约事件失败: %v", err)
		http.Error(w, "保存合约事件失败", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "合约事件保存成功"})
}

// GetBlockchainStatus 获取区块链状态
func (c *Controller) GetBlockchainStatus(w http.ResponseWriter, r *http.Request) {
	// 这里可以实现与区块链节点交互的逻辑
	// 简化示例，返回模拟数据
	status := map[string]interface{}{
		"network":      "测试网络",
		"latest_block": 12345678,
		"gas_price":    "20 Gwei",
		"connected":    true,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(status)
}

// GetNFTs 获取NFT列表
func (c *Controller) GetNFTs(w http.ResponseWriter, r *http.Request) {
	nfts, err := c.Repo.GetAllNFTs()
	if err != nil {
		log.Printf("获取NFT列表失败: %v", err)
		http.Error(w, "获取NFT列表失败", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(nfts)
}

// GetNFTDetail 获取NFT详情
func (c *Controller) GetNFTDetail(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	nft, err := c.Repo.GetNFTByTokenID(id)
	if err != nil {
		log.Printf("获取NFT详情失败: %v", err)
		http.Error(w, "获取NFT详情失败", http.StatusInternalServerError)
		return
	}

	if nft == nil {
		http.Error(w, "NFT不存在", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(nft)
}

// SaveNFTMetadata 保存NFT元数据
func (c *Controller) SaveNFTMetadata(w http.ResponseWriter, r *http.Request) {
	var nft database.NFT
	err := json.NewDecoder(r.Body).Decode(&nft)
	if err != nil {
		http.Error(w, "无效的请求数据", http.StatusBadRequest)
		return
	}

	if nft.ContractAddress == "" || nft.TokenID == "" {
		http.Error(w, "合约地址和Token ID不能为空", http.StatusBadRequest)
		return
	}

	err = c.Repo.SaveNFT(&nft)
	if err != nil {
		log.Printf("保存NFT元数据失败: %v", err)
		http.Error(w, "保存NFT元数据失败", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "NFT元数据保存成功"})
}
