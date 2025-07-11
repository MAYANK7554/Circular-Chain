// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProductPassport is ERC721, Ownable {
    // A structure to hold information about each product
    struct ProductInfo {
        string productID;
        string status; // e.g., "Like New", "Needs Refurbishment"
        uint256 returnTimestamp;
    }

    // A mapping from the token ID (the unique passport number) to its product info
    mapping(uint256 => ProductInfo) public productData;

    // A counter to ensure every token ID is unique
    uint256 private _nextTokenId;

    // This runs once when the contract is deployed
    // We name our NFT collection "CircularChainPassport" with the symbol "CCP"
    constructor() ERC721("CircularChainPassport", "CCP") Ownable(msg.sender) {}

    // Function to create a new passport (NFT) for a returned item
    // 'onlyOwner' means only the person who deployed the contract (Walmart) can call this
    function mintPassport(string memory _productID) public onlyOwner {
        uint256 newItemId = _nextTokenId;
        _nextTokenId++;

        // Creates the actual NFT and assigns it to the contract owner
        _safeMint(owner(), newItemId);

        // Store the product's data
        productData[newItemId] = ProductInfo({
            productID: _productID,
            status: "Returned - Pending Inspection",
            returnTimestamp: block.timestamp
        });
    }

    // Function to update the status of a product after inspection
    function updateStatus(uint256 _tokenId, string memory _newStatus) public onlyOwner {
        // Update the status in our data mapping
        productData[_tokenId].status = _newStatus;
    }
}