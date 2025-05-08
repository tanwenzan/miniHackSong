package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/zeroable/miniHackSong/backend/internal/database"
)

// UserHandler 处理用户相关请求
type UserHandler struct {
	Repo *database.Repository
}

// NewUserHandler 创建新的用户处理器
func NewUserHandler(repo *database.Repository) *UserHandler {
	return &UserHandler{Repo: repo}
}

// GetUser 获取用户信息
func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	address := vars["address"]

	user, err := h.Repo.GetUserByWalletAddress(address)
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
func (h *UserHandler) CreateOrUpdateUser(w http.ResponseWriter, r *http.Request) {
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
	existingUser, err := h.Repo.GetUserByWalletAddress(user.WalletAddress)
	if err != nil {
		log.Printf("查询用户失败: %v", err)
		http.Error(w, "服务器内部错误", http.StatusInternalServerError)
		return
	}

	var responseMsg string
	if existingUser == nil {
		// 创建新用户
		err = h.Repo.CreateUser(&user)
		responseMsg = "用户创建成功"
	} else {
		// 更新现有用户
		err = h.Repo.UpdateUser(&user)
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
