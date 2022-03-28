// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable {

    //baseURI of token is `baseURL + tokenId`
    string _baseTokenURI;

    //max cryptodevs NFT
    uint256 public maxTokenIds = 20;

    //total num of tokenIds minted
    uint256 public tokenIds;

    //instance of whitelist contract
    IWhitelist whitelist;

    // price for 1 CrytoDev NFT
    uint public _price = 0.01 ether;

    // presale started value: bool
    bool public presaleStarted;

    //presale Ended on what time: uint
    uint256 public presaleEnded;

    // _paused is used to pause the contract in case of an emergency
    bool public _paused;

    //modifier
    //_; => run rest of the code after require
    modifier onlyWhenNotPaused {
        require(!_paused, "Contract currently paused");
        _;
    }

    constructor(string memory baseURI, address whitelistContract) ERC721("Crypto Devs", "CD") {
        _baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContract);
    }

    //change baseURI by overriding th original baseURI func in ERC721 Cintract
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    //function to start pre-sale
    // would be called from frontend
    function startPresale () public onlyOwner {
        presaleStarted = true;
        // presale would end after current time + 5 minutes
        // we would use block timestamps
        presaleEnded = block.timestamp + 5 minutes;
    }

    //function for presale mint
    // presale time period is still going on
    //address of msg.sender should be whitelisted
    function presaleMint() public payable onlyWhenNotPaused {
        require(presaleStarted && block.timestamp < presaleEnded, "Presale is not running!");
        require(whitelist.whitelistedAddresses(msg.sender), "You are not whitelisted");
        require(tokenIds < maxTokenIds, "Exceede maximum crytodevs supply");
        require(msg.value >= _price, "Ether sent is not correct");
        tokenIds +=1;
        _safeMint(msg.sender, tokenIds);
    }

    //function to mint tokens
    function mint() public payable onlyWhenNotPaused {
        require(presaleStarted && block.timestamp >=  presaleEnded, "Presale has not ended yet");
        require(tokenIds < maxTokenIds, "Exceede maximum crytodevs supply");
        require(msg.value >= _price, "Ether sent is not correct");
        tokenIds +=1;
        _safeMint(msg.sender, tokenIds);
    }

    //to pause your contract
    //incase it has some problems
    function setPaused(bool val) public onlyOwner {
        _paused = val;
    }

    //function to withdraw ether in the contract
    //only owner is suppose to get those ethers, haha..
    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{ value: amount }("");
        require(sent, "Failed to send Ether");
    }

    //functions for contract to recieve ether
    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}
}