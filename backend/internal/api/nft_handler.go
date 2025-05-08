package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/zeroable/miniHackSong/backend/internal/database"
)

type NFTMetadata struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Price       string `json:"price"`
	Owner       string `json:"owner"`
	ImageURL    string `json:"image_url"`
}

// NFTHandler 处理用户相关请求
type NFTHandler struct {
	Repo *database.Repository
}

// NewNFTHandler 创建新的交易处理器
func NewNFTHandler(repo *database.Repository) *NFTHandler {
	return &NFTHandler{Repo: repo}
}

func (h *NFTHandler) GetNFTs(w http.ResponseWriter, r *http.Request) {
	nfts, err := h.Repo.GetAllNFTs()
	if err != nil {
		http.Error(w, "获取NFTs失败", http.StatusInternalServerError)
		return
	}
	var nftMetadataList []NFTMetadata
	for _, nft := range nfts {
		nftMetadata := NFTMetadata{
			ID:          nft.ID,
			Name:        nft.Name,
			Description: nft.Description,
			Price:       ToPriceString(nft.Price),
			Owner:       nft.OwnerAddress,
			ImageURL:    nft.ImageURL,
		}
		nftMetadataList = append(nftMetadataList, nftMetadata)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(nftMetadataList)
}

func (h *NFTHandler) GetNFTDetail(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	nftID := vars["nftID"]
	nft, err := h.Repo.GetNFTByID(strToInt(nftID))
	if err != nil {
		http.Error(w, "获取NFT详情失败", http.StatusInternalServerError)
		return
	}
	if nft == nil {
		http.Error(w, "NFT不存在", http.StatusNotFound)
		return
	}
	nftMetadata := NFTMetadata{
		ID:          nft.ID,
		Name:        nft.Name,
		Description: nft.Description,
		Price:       ToPriceString(nft.Price),
		Owner:       nft.OwnerAddress,
		ImageURL:    nft.ImageURL,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(nftMetadata)
}

func (h *NFTHandler) SaveNFTMetadata(w http.ResponseWriter, r *http.Request) {
	var nftMetadata NFTMetadata
	err := json.NewDecoder(r.Body).Decode(&nftMetadata)
	if err != nil {
		http.Error(w, "无效的请求数据", http.StatusBadRequest)
		return
	}
	nft := &database.NFT{
		Name:         nftMetadata.Name,
		Description:  nftMetadata.Description,
		Price:        parsePrice(nftMetadata.Price),
		OwnerAddress: nftMetadata.Owner,
		ImageURL:     nftMetadata.ImageURL,
	}
	err = h.Repo.CreateNFT(nft)
	if err != nil {
		http.Error(w, "保存NFT失败", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "NFT保存成功"})
}

func strToInt(s string) int {
	num, err := strconv.Atoi(s)
	if err != nil {
		return 0
	}
	return num
}

func ToPriceString(f float64) string {
	return strconv.FormatFloat(f, 'f', -1, 64)
}
