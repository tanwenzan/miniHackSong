package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/mux"
)

type NFTMetadata struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Price       string `json:"price"`
	Owner       string `json:"owner"`
	ImageURL    string `json:"image_url"`
}

func SetupNFTRoutes(r *gin.Engine) {
	nftGroup := r.Group("/api/nft")
	{
		nftGroup.GET("/metadata/:id", getNFTMetadata)
		nftGroup.POST("/metadata", createNFTMetadata)
		nftGroup.GET("/marketplace", listNFTsForMarketplace)
	}
}

func SetupMuxNFTRoutes(r *mux.Router) {
	nftRouter := r.PathPrefix("/api/nft").Subrouter()
	nftRouter.HandleFunc("/metadata/{id}", getNFTMetadataForMux).Methods("GET")
	nftRouter.HandleFunc("/metadata", createNFTMetadataForMux).Methods("POST")
	nftRouter.HandleFunc("/marketplace", listNFTsForMarketplaceForMux).Methods("GET")
}

func getNFTMetadata(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid NFT ID"})
		return
	}

	// TODO: 从数据库获取NFT元数据
	metadata := NFTMetadata{
		ID:          uint(id),
		Name:        "Sample Skill",
		Description: "This is a sample skill NFT",
		Price:       "0.1",
		Owner:       "0x123...",
		ImageURL:    "https://example.com/skill.png",
	}

	c.JSON(http.StatusOK, metadata)
}

func createNFTMetadata(c *gin.Context) {
	var metadata NFTMetadata
	if err := c.ShouldBindJSON(&metadata); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: 保存到数据库
	c.JSON(http.StatusCreated, metadata)
}

func getNFTMetadataForMux(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"error":"Invalid NFT ID"}`))
		return
	}

	metadata := NFTMetadata{
		ID:          uint(id),
		Name:        "Sample Skill",
		Description: "This is a sample skill NFT",
		Price:       "0.1",
		Owner:       "0x123...",
		ImageURL:    "https://example.com/skill.png",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metadata)
}

func createNFTMetadataForMux(w http.ResponseWriter, r *http.Request) {
	var metadata NFTMetadata
	if err := json.NewDecoder(r.Body).Decode(&metadata); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"error":"` + err.Error() + `"}`))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(metadata)
}

func listNFTsForMarketplaceForMux(w http.ResponseWriter, r *http.Request) {
	nfts := []NFTMetadata{
		{
			ID:          1,
			Name:        "Web Development",
			Description: "Expert in React and Node.js",
			Price:       "0.5",
			Owner:       "0x456...",
			ImageURL:    "https://example.com/webdev.png",
		},
		{
			ID:          2,
			Name:        "Graphic Design",
			Description: "Professional logo and branding",
			Price:       "0.3",
			Owner:       "0x789...",
			ImageURL:    "https://example.com/design.png",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(nfts)
}

func listNFTsForMarketplace(c *gin.Context) {
	_ = c.Query("search")
	_ = c.Query("category")

	// TODO: 根据搜索词和分类从数据库获取市场列表
	nfts := []NFTMetadata{
		{
			ID:          1,
			Name:        "Web Development",
			Description: "Expert in React and Node.js",
			Price:       "0.5",
			Owner:       "0x456...",
			ImageURL:    "https://example.com/webdev.png",
		},
		{
			ID:          2,
			Name:        "Graphic Design",
			Description: "Professional logo and branding",
			Price:       "0.3",
			Owner:       "0x789...",
			ImageURL:    "https://example.com/design.png",
		},
	}

	c.JSON(http.StatusOK, nfts)
}
