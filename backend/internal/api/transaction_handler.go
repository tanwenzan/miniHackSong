package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/zeroable/miniHackSong/backend/internal/database"
)

// TransactionHandler 处理交易相关请求
type TransactionHandler struct {
	Repo *database.Repository
}

// NewTransactionHandler 创建新的交易处理器
func NewTransactionHandler(repo *database.Repository) *TransactionHandler {
	return &TransactionHandler{Repo: repo}
}

// GetTransactions 获取交易记录
func (h *TransactionHandler) GetTransactions(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	address := vars["address"]

	transactions, err := h.Repo.GetTransactionsByAddress(address)
	if err != nil {
		log.Printf("获取交易记录失败: %v", err)
		http.Error(w, "获取交易记录失败", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transactions)
}

// SaveTransaction 保存交易记录
func (h *TransactionHandler) SaveTransaction(w http.ResponseWriter, r *http.Request) {
	var tx database.Transaction
	err := json.NewDecoder(r.Body).Decode(&tx)
	if err != nil {
		http.Error(w, "无效的请求数据", http.StatusBadRequest)
		return
	}

	if tx.TxHash == "" || tx.FromAddress == "" || tx.ToAddress == "" {
		http.Error(w, "交易哈希和交易双方地址不能为空", http.StatusBadRequest)
		return
	}

	err = h.Repo.SaveTransaction(&tx)
	if err != nil {
		log.Printf("保存交易记录失败: %v", err)
		http.Error(w, "保存交易记录失败", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "交易保存成功"})
}

// ProcessTrade 处理技能NFT交易
func (h *TransactionHandler) ProcessTrade(w http.ResponseWriter, r *http.Request) {
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
		Amount:      parsePrice(tradeRequest.Price),
		TxHash:      tradeRequest.TxHash,
		Status:      "pending",
		NFTID:       tradeRequest.NFTID,
	}

	err = h.Repo.SaveTransaction(&tx)
	if err != nil {
		log.Printf("保存交易记录失败: %v", err)
		http.Error(w, "保存交易记录失败", http.StatusInternalServerError)
		return
	}

	// 更新NFT所有权
	err = h.Repo.UpdateNFTOwner(tradeRequest.NFTID, tradeRequest.ToAddress)
	if err != nil {
		log.Printf("更新NFT所有权失败: %v", err)
		http.Error(w, "更新NFT所有权失败", http.StatusInternalServerError)
		return
	}

	// 更新交易状态为完成
	tx.Status = "completed"
	err = h.Repo.UpdateTransaction(&tx)
	if err != nil {
		log.Printf("更新交易状态失败: %v", err)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "交易处理成功"})
}

func parsePrice(s string) float64 {
	price, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return 0
	}
	return price
}
