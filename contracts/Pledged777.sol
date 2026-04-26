// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Pledged777 {
    uint256 public constant MAX_PLEDGES = 777;
    uint256 public totalPledged;
    address public owner;

    struct Pledge {
        address wallet;
        string imageUri;  // base64 data URI, max 1500 chars (~48x48 JPEG)
        string message;   // max 77 chars
        uint64 pledgedAt;
        uint16 rank;
    }

    mapping(address => bool) public hasPledged;
    mapping(uint256 => Pledge) private pledgeByRank;

    event Pledged(address indexed wallet, uint256 indexed rank, string message, uint64 pledgedAt);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error NotOwner();
    error AlreadyPledged();
    error WallFull();
    error InvalidWallet();
    error MessageTooLong();
    error ImageTooLarge();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function pledge(
        address wallet,
        string calldata imageUri,
        string calldata message
    ) external onlyOwner {
        if (wallet == address(0)) revert InvalidWallet();
        if (hasPledged[wallet]) revert AlreadyPledged();
        if (totalPledged >= MAX_PLEDGES) revert WallFull();
        if (bytes(message).length > 77) revert MessageTooLong();
        if (bytes(imageUri).length > 5000) revert ImageTooLarge();

        uint256 rank = totalPledged + 1;
        totalPledged = rank;
        hasPledged[wallet] = true;

        pledgeByRank[rank] = Pledge({
            wallet: wallet,
            imageUri: imageUri,
            message: message,
            pledgedAt: uint64(block.timestamp),
            rank: uint16(rank)
        });

        emit Pledged(wallet, rank, message, uint64(block.timestamp));
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidWallet();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function getPledge(uint256 rank) external view returns (Pledge memory) {
        return pledgeByRank[rank];
    }

    function getPledges(uint256 startRank, uint256 limit) external view returns (Pledge[] memory page) {
        if (startRank == 0 || startRank > totalPledged || limit == 0) return new Pledge[](0);
        uint256 endRank = startRank + limit - 1;
        if (endRank > totalPledged) endRank = totalPledged;
        page = new Pledge[](endRank - startRank + 1);
        for (uint256 i = startRank; i <= endRank; i++) {
            page[i - startRank] = pledgeByRank[i];
        }
    }
}
