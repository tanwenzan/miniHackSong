package api

import (
	"github.com/zeroable/miniHackSong/backend/internal/database"
)

// BlockChainHandler 处理交易相关请求
type BlockchainHandler struct {
	Repo *database.Repository
}

// NewTransactionHandler 创建新的交易处理器
func NewBlockchainHandler(repo *database.Repository) *BlockchainHandler {
	return &BlockchainHandler{Repo: repo}
}

// func (h *BlockchainHandler) GetBlockchainStatus(w http.ResponseWriter, r *http.Request) {
// 	// 从数据库中获取最新的区块
// 	latestBlock, err := h.Repo.GetLatestBlock()
// 	if err != nil {
// 		log.Printf("获取最新区块失败: %v", err)
// 		http.Error(w, "获取最新区块失败", http.StatusInternalServerError)
// 		return
// 	}
// 	// 获取区块链的长度
// 	blockchainLength, err := h.Repo.GetBlockchainLength()
// 	if err!= nil {
// 		log.Printf("获取区块链长度失败: %v", err)
// 		http.Error(w, "获取区块链长度失败", http.StatusInternalServerError)
// 		return
// 	}
// 	// 获取区块链的难度
// 	difficulty, err := h.Repo.GetBlockchainDifficulty()
// 	if err!= nil {

// 	}
// }
