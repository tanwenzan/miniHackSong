// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SkillNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Skill {
        string name;
        string description;
        uint256 price;
        address owner;
    }

    mapping(uint256 => Skill) public skills;

    constructor() ERC721("SkillNFT", "SKILL") {}

    function mintSkill(string memory name, string memory description, uint256 price) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        skills[newItemId] = Skill(name, description, price, msg.sender);
        return newItemId;
    }

    function getSkill(uint256 tokenId) public view returns (Skill memory) {
        return skills[tokenId];
    }

    function transferSkill(uint256 tokenId, address to) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        _transfer(msg.sender, to, tokenId);
        skills[tokenId].owner = to;
    }
}