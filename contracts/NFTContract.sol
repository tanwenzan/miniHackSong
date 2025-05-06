// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTContract is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // NFT元数据结构
    struct NFTMetadata {
        string name;
        string description;
        string image;
        string externalUrl;
    }
    
    // 存储NFT元数据
    mapping(uint256 => NFTMetadata) private _tokenMetadata;
    
    constructor() ERC721("HackSongNFT", "HSNFT") {}
    
    // 创建NFT
    function mintNFT(address recipient, string memory name, string memory description, string memory image, string memory externalUrl) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(recipient, newTokenId);
        
        _tokenMetadata[newTokenId] = NFTMetadata(name, description, image, externalUrl);
        return newTokenId;
    }
    
    // 获取NFT元数据
    function getNFTMetadata(uint256 tokenId) public view returns (string memory name, string memory description, string memory image, string memory externalUrl) {
        require(_exists(tokenId), "NFT does not exist");
        NFTMetadata memory metadata = _tokenMetadata[tokenId];
        return (metadata.name, metadata.description, metadata.image, metadata.externalUrl);
    }
    
    // 获取NFT所有者
    function getNFTOwner(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "NFT does not exist");
        return ownerOf(tokenId);
    }
}