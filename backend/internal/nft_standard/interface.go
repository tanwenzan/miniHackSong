package nft_standard

import "math/big"

// Standard 定义NFT标准接口
// 支持ERC721、ERC1155和Polkadot NFT标准
// 未来可扩展支持更多标准

type Standard interface {
	// OwnerOf 获取NFT的所有者地址
	OwnerOf(tokenId *big.Int) (string, error)

	// TokenURI 获取NFT的元数据URI
	TokenURI(tokenId *big.Int) (string, error)

	// BalanceOf 获取账户的NFT余额
	BalanceOf(owner string) (*big.Int, error)

	// Transfer 转移NFT所有权
	Transfer(from, to string, tokenId *big.Int) error

	// Approve 授权第三方操作NFT
	Approve(operator string, tokenId *big.Int) error

	// GetApproved 获取被授权操作者
	GetApproved(tokenId *big.Int) (string, error)

	// IsApprovedForAll 检查操作者是否被完全授权
	IsApprovedForAll(owner, operator string) (bool, error)

	// SafeTransferFrom 安全转移NFT
	SafeTransferFrom(from, to string, tokenId *big.Int, data []byte) error

	// SupportsInterface 检查是否支持特定接口
	SupportsInterface(interfaceId [4]byte) (bool, error)
}
