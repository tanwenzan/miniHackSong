package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/zeroable/miniHackSong/backend/internal/database"
)

// EventHandler 处理交易相关请求
type EventHandler struct {
	Repo *database.Repository
}

// NewTransactionHandler 创建新的交易处理器
func NewEventHandler(repo *database.Repository) *EventHandler {
	return &EventHandler{Repo: repo}
}

// GetContractEvents 获取合约事件
func (h *EventHandler) GetContractEvents(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	contractAddress := vars["contract"]
	eventName := r.URL.Query().Get("event")

	events, err := h.Repo.GetContractEvents(contractAddress, eventName)
	if err != nil {
		log.Printf("获取合约事件失败: %v", err)
		http.Error(w, "获取合约事件失败", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

// SaveContractEvent 保存合约事件
func (h *EventHandler) SaveContractEvent(w http.ResponseWriter, r *http.Request) {
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

	err = h.Repo.SaveContractEvent(&event)
	if err != nil {
		log.Printf("保存合约事件失败: %v", err)
		http.Error(w, "保存合约事件失败", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "合约事件保存成功"})
}
