// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract BaseMint is ERC721A, Ownable {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = 100_000;
    uint256 public constant MINT_POINTS = 10;
    uint256 public constant REFERRER_POINTS = 20;
    uint256 public constant REFEREE_POINTS = 10;

    string private _baseTokenURI;

    mapping(address wallet => uint256 count) public walletMintCount;
    mapping(address wallet => uint256 points) public rewardPoints;
    mapping(address wallet => uint256 day) public lastMintDay;
    mapping(address wallet => uint256 streak) public mintStreak;
    mapping(address wallet => address referrer) public referralOf;

    event DailyMint(
        address indexed minter,
        uint256 indexed tokenId,
        uint256 pointsAwarded,
        uint256 streak,
        address indexed referrer
    );

    constructor(string memory initialBaseURI) ERC721A("BaseMint Daily", "BMINT") Ownable(msg.sender) {
        _baseTokenURI = initialBaseURI;
    }

    function mint() external returns (uint256 tokenId) {
        return _dailyMint(msg.sender, address(0));
    }

    function dailyMint(address referrer) external returns (uint256 tokenId) {
        return _dailyMint(msg.sender, referrer);
    }

    function ownerMint(address to, uint256 quantity) external onlyOwner {
        require(to != address(0), "BaseMint: zero address");
        require(totalSupply() + quantity <= MAX_SUPPLY, "BaseMint: sold out");
        _mint(to, quantity);
        walletMintCount[to] += quantity;
    }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "BaseMint: nonexistent token");
        return string.concat(_baseTokenURI, tokenId.toString(), ".json");
    }

    function _dailyMint(address minter, address referrer) private returns (uint256 tokenId) {
        require(totalSupply() < MAX_SUPPLY, "BaseMint: sold out");
        uint256 todayIndex = block.timestamp / 1 days;
        require(lastMintDay[minter] < todayIndex, "BaseMint: already minted today");

        address storedReferrer = referralOf[minter];
        bool canStoreReferral = storedReferrer == address(0)
            && referrer != address(0)
            && referrer != minter;

        if (canStoreReferral) {
            referralOf[minter] = referrer;
            rewardPoints[referrer] += REFERRER_POINTS;
            storedReferrer = referrer;
        }

        if (lastMintDay[minter] + 1 == todayIndex) {
            mintStreak[minter] += 1;
        } else {
            mintStreak[minter] = 1;
        }

        lastMintDay[minter] = todayIndex;
        walletMintCount[minter] += 1;
        rewardPoints[minter] += MINT_POINTS;

        if (canStoreReferral) {
            rewardPoints[minter] += REFEREE_POINTS;
        }

        tokenId = _nextTokenId();
        _mint(minter, 1);

        emit DailyMint(minter, tokenId, canStoreReferral ? MINT_POINTS + REFEREE_POINTS : MINT_POINTS, mintStreak[minter], storedReferrer);
    }
}
