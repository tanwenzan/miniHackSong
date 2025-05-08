package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
)

// Repository 提供数据库操作的接口
type Repository struct {
	DB *sql.DB
}

// SaveNFT 保存NFT元数据
func (r *Repository) SaveNFT(nft *NFT) error {
	// 检查NFT是否已存在
	existingNFT, err := r.GetNFTByTokenID(nft.TokenID)
	if err != nil {
		return err
	}

	if existingNFT == nil {
		// 插入新NFT记录
		query := `INSERT INTO nfts 
			(contract_address, token_id, owner_address, metadata_uri, name, description, image_url, price) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
		_, err = r.DB.Exec(query,
			nft.ContractAddress, nft.TokenID, nft.OwnerAddress,
			nft.MetadataURI, nft.Name, nft.Description, nft.ImageURL)
	} else {
		// 更新现有NFT记录
		query := `UPDATE nfts SET 
			owner_address = ?, metadata_uri = ?, name = ?, description = ?, image_url = ?, price = ? 
			WHERE contract_address = ? AND token_id = ?`
		_, err = r.DB.Exec(query,
			nft.OwnerAddress, nft.MetadataURI, nft.Name, nft.Description, nft.ImageURL,
			nft.ContractAddress, nft.TokenID)
	}
	return err
}

// NewRepository 创建一个新的数据库仓库实例
func NewRepository(db *sql.DB) *Repository {
	return &Repository{DB: db}
}

// User 表示用户模型
type User struct {
	ID            int    `json:"id"`
	WalletAddress string `json:"wallet_address"`
	Username      string `json:"username"`
	Email         string `json:"email"`
}

// Transaction 表示交易记录模型
type Transaction struct {
	ID           int     `json:"id"`
	NFTID        string  `json:"nft_id,omitempty"`
	TxHash       string  `json:"tx_hash"`
	FromAddress  string  `json:"from_address"`
	ToAddress    string  `json:"to_address"`
	Amount       float64 `json:"amount"`
	TokenAddress string  `json:"token_address,omitempty"`
	BlockNumber  int     `json:"block_number,omitempty"`
	Status       string  `json:"status"`
}

// ContractEvent 表示合约事件模型
type ContractEvent struct {
	ID              int    `json:"id"`
	EventName       string `json:"event_name"`
	ContractAddress string `json:"contract_address"`
	TxHash          string `json:"tx_hash"`
	BlockNumber     int    `json:"block_number"`
	EventData       []byte `json:"event_data"`
}

// NFT 表示NFT模型
type NFT struct {
	ID              int     `json:"id"`
	ContractAddress string  `json:"contract_address"`
	TokenID         string  `json:"token_id"`
	OwnerAddress    string  `json:"owner_address"`
	MetadataURI     string  `json:"metadata_uri"`
	Name            string  `json:"name"`
	Description     string  `json:"description"`
	ImageURL        string  `json:"image_url"`
	Price           float64 `json:"price"`
}

// GetUserByWalletAddress 根据钱包地址获取用户
func (r *Repository) GetUserByWalletAddress(walletAddress string) (*User, error) {
	query := "SELECT id, wallet_address, username, email FROM users WHERE wallet_address = ?"
	row := r.DB.QueryRow(query, walletAddress)

	user := &User{}
	err := row.Scan(&user.ID, &user.WalletAddress, &user.Username, &user.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return user, nil
}

// CreateUser 创建新用户
func (r *Repository) CreateUser(user *User) error {
	query := "INSERT INTO users (wallet_address, username, email) VALUES (?, ?, ?)"
	_, err := r.DB.Exec(query, user.WalletAddress, user.Username, user.Email)
	return err
}

// UpdateUser 更新用户信息
func (r *Repository) UpdateUser(user *User) error {
	query := "UPDATE users SET username = ?, email = ? WHERE wallet_address = ?"
	_, err := r.DB.Exec(query, user.Username, user.Email, user.WalletAddress)
	return err
}

// GetTransactionsByAddress 获取与地址相关的交易
func (r *Repository) GetTransactionsByAddress(address string) ([]Transaction, error) {
	query := `SELECT id, tx_hash, from_address, to_address, amount, token_address, block_number, status 
			FROM transactions 
			WHERE from_address = ? OR to_address = ? 
			ORDER BY created_at DESC`

	rows, err := r.DB.Query(query, address, address)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []Transaction
	for rows.Next() {
		var tx Transaction
		var tokenAddr, blockNum sql.NullString
		err := rows.Scan(
			&tx.ID, &tx.TxHash, &tx.FromAddress, &tx.ToAddress,
			&tx.Amount, &tokenAddr, &blockNum, &tx.Status,
		)
		if err != nil {
			return nil, err
		}

		if tokenAddr.Valid {
			tx.TokenAddress = tokenAddr.String
		}
		if blockNum.Valid {
			fmt.Sscanf(blockNum.String, "%d", &tx.BlockNumber)
		}

		transactions = append(transactions, tx)
	}

	return transactions, nil
}

// SaveTransaction 保存交易记录
func (r *Repository) SaveTransaction(tx *Transaction) error {
	query := `INSERT INTO transactions 
			(tx_hash, from_address, to_address, amount, token_address, block_number, status) 
			VALUES (?, ?, ?, ?, ?, ?, ?)`

	_, err := r.DB.Exec(
		query,
		tx.TxHash, tx.FromAddress, tx.ToAddress, tx.Amount,
		tx.TokenAddress, tx.BlockNumber, tx.Status,
	)
	return err
}

// UpdateTransactionStatus 更新交易状态
func (r *Repository) UpdateTransactionStatus(txHash string, status string, blockNumber int) error {
	query := "UPDATE transactions SET status = ?, block_number = ? WHERE tx_hash = ?"
	_, err := r.DB.Exec(query, status, blockNumber, txHash)
	return err
}

// UpdateTransaction 更新交易记录
func (r *Repository) UpdateTransaction(tx *Transaction) error {
	query := `UPDATE transactions SET 
		from_address = ?, to_address = ?, amount = ?, 
		token_address = ?, block_number = ?, status = ? 
		WHERE tx_hash = ?`
	_, err := r.DB.Exec(query,
		tx.FromAddress, tx.ToAddress, tx.Amount,
		tx.TokenAddress, tx.BlockNumber, tx.Status, tx.TxHash)
	return err
}

// SaveContractEvent 保存合约事件
func (r *Repository) SaveContractEvent(event *ContractEvent) error {
	query := `INSERT INTO contract_events 
			(event_name, contract_address, tx_hash, block_number, event_data) 
			VALUES (?, ?, ?, ?, ?)`

	_, err := r.DB.Exec(
		query,
		event.EventName, event.ContractAddress, event.TxHash,
		event.BlockNumber, event.EventData,
	)
	return err
}

// UpdateNFTOwner 更新NFT所有者
func (r *Repository) UpdateNFTOwner(tokenID string, newOwner string) error {
	query := "UPDATE nfts SET owner_address = ? WHERE token_id = ?"
	_, err := r.DB.Exec(query, newOwner, tokenID)
	return err
}

func (r *Repository) GetNFTByID(id int) (*NFT, error) {
	query := "SELECT id, contract_address, token_id, owner_address, metadata_uri, name, description, image_url, price FROM nfts WHERE id =?"
	row := r.DB.QueryRow(query, id)
	nft := &NFT{}
	err := row.Scan(
		&nft.ID, &nft.ContractAddress, &nft.TokenID, &nft.OwnerAddress,
		&nft.MetadataURI, &nft.Name, &nft.Description, &nft.ImageURL,
		&nft.Price,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return nft, nil
}

// GetNFTByTokenID 根据TokenID获取NFT记录
func (r *Repository) GetNFTByTokenID(tokenID string) (*NFT, error) {
	query := "SELECT id, contract_address, token_id, owner_address, metadata_uri, name, description, image_url, price FROM nfts WHERE token_id = ?"
	row := r.DB.QueryRow(query, tokenID)

	nft := &NFT{}
	err := row.Scan(
		&nft.ID, &nft.ContractAddress, &nft.TokenID, &nft.OwnerAddress,
		&nft.MetadataURI, &nft.Name, &nft.Description, &nft.ImageURL,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return nft, nil
}

// GetAllNFTs 获取所有NFT记录
func (r *Repository) GetAllNFTs() ([]NFT, error) {
	query := "SELECT id, contract_address, token_id, owner_address, metadata_uri, name, description, image_url, price FROM nfts ORDER BY id DESC"
	rows, err := r.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var nfts []NFT
	for rows.Next() {
		var nft NFT
		err := rows.Scan(
			&nft.ID, &nft.ContractAddress, &nft.TokenID, &nft.OwnerAddress,
			&nft.MetadataURI, &nft.Name, &nft.Description, &nft.ImageURL,
		)
		if err != nil {
			return nil, err
		}
		nfts = append(nfts, nft)
	}

	return nfts, nil
}

func (r *Repository) CreateNFT(nft *NFT) error {
	query := `INSERT INTO nfts
			(contract_address, token_id, owner_address, metadata_uri, name, description, image_url, price)
			VALUES (?,?,?,?,?,?,?,?)`
	_, err := r.DB.Exec(query,
		nft.ContractAddress, nft.TokenID, nft.OwnerAddress,
		nft.MetadataURI, nft.Name, nft.Description, nft.ImageURL,
		nft.Price,
	)
	return err
}

// GetContractEvents 获取合约事件
func (r *Repository) GetContractEvents(contractAddress string, eventName string) ([]ContractEvent, error) {
	query := `SELECT id, event_name, contract_address, tx_hash, block_number, event_data 
			FROM contract_events 
			WHERE contract_address = ?`

	args := []interface{}{contractAddress}
	if eventName != "" {
		query += " AND event_name = ?"
		args = append(args, eventName)
	}

	query += " ORDER BY block_number DESC"

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []ContractEvent
	for rows.Next() {
		var event ContractEvent
		err := rows.Scan(
			&event.ID, &event.EventName, &event.ContractAddress,
			&event.TxHash, &event.BlockNumber, &event.EventData,
		)
		if err != nil {
			return nil, err
		}

		events = append(events, event)
	}

	return events, nil
}

// InitDB 初始化数据库
// InitializeDB 初始化数据库
func InitializeDB(db *sql.DB) error {
	// 获取当前目录下的schema.sql文件
	schemaPath := filepath.Join("internal", "database", "schema.sql")
	log.Printf("尝试加载数据库模式文件: %s", schemaPath)

	// 读取SQL文件内容
	sqlBytes, err := os.ReadFile(schemaPath)
	if err != nil {
		// 如果找不到文件，尝试相对于工作目录的路径
		alternativePath := filepath.Join("backend", "internal", "database", "schema.sql")
		log.Printf("尝试替代路径: %s", alternativePath)
		sqlBytes, err = os.ReadFile(alternativePath)
		if err != nil {
			return fmt.Errorf("无法读取数据库模式文件: %v", err)
		}
	}

	// 将SQL文件内容转换为字符串
	sqlContent := string(sqlBytes)

	// 按分号分割SQL语句
	sqlStatements := strings.Split(sqlContent, ";")

	// 执行每条SQL语句
	for _, statement := range sqlStatements {
		// 去除空白字符
		statement = strings.TrimSpace(statement)
		if statement == "" {
			continue
		}

		// 执行SQL语句
		_, err := db.Exec(statement)
		if err != nil {
			// 忽略"数据库已存在"的错误
			if strings.Contains(err.Error(), "database exists") {
				log.Printf("数据库已存在，继续执行其他语句")
				continue
			}
			return fmt.Errorf("执行SQL语句失败: %v, 语句: %s", err, statement)
		}
	}

	log.Println("数据库初始化成功")
	return nil
}
