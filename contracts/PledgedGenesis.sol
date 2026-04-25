// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PledgedGenesis {
    uint256 public constant MAX_GENESIS = 333;
    uint256 public totalMembers;
    address public owner;

    struct Member {
        address wallet;
        string handle;
        bytes32 proofHash;
        uint96 score;
        uint64 joinedAt;
        uint16 rank;
    }

    mapping(address => bool) public isMember;
    mapping(address => uint256) public memberRank;
    mapping(uint256 => Member) private membersByRank;

    event GenesisPledged(
        address indexed wallet,
        uint256 indexed rank,
        string handle,
        bytes32 proofHash,
        uint256 score
    );

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error NotOwner();
    error AlreadyPledged();
    error GenesisFull();
    error InvalidWallet();
    error InvalidScore();

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function _checkOwner() internal view {
        if (msg.sender != owner) revert NotOwner();
    }

    constructor(string memory founderHandle, bytes32 founderProofHash, uint96 founderScore) {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
        _pledge(msg.sender, founderHandle, founderProofHash, founderScore);
    }

    function pledge(address wallet, string calldata handle, bytes32 proofHash, uint96 score) external onlyOwner {
        _pledge(wallet, handle, proofHash, score);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidWallet();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function getMember(uint256 rank) external view returns (Member memory) {
        return membersByRank[rank];
    }

    function getMembers(uint256 startRank, uint256 limit) external view returns (Member[] memory page) {
        if (startRank == 0 || startRank > totalMembers || limit == 0) {
            return new Member[](0);
        }

        uint256 endRank = startRank + limit - 1;
        if (endRank > totalMembers) endRank = totalMembers;

        page = new Member[](endRank - startRank + 1);
        for (uint256 rank = startRank; rank <= endRank; rank++) {
            page[rank - startRank] = membersByRank[rank];
        }
    }

    function _pledge(address wallet, string memory handle, bytes32 proofHash, uint96 score) internal {
        if (wallet == address(0)) revert InvalidWallet();
        if (isMember[wallet]) revert AlreadyPledged();
        if (totalMembers >= MAX_GENESIS) revert GenesisFull();
        if (score > 100) revert InvalidScore();

        uint256 rank = totalMembers + 1;
        totalMembers = rank;
        isMember[wallet] = true;
        memberRank[wallet] = rank;

        membersByRank[rank] = Member({
            wallet: wallet,
            handle: handle,
            proofHash: proofHash,
            score: score,
            joinedAt: uint64(block.timestamp),
            // forge-lint: disable-next-line(unsafe-typecast)
            rank: uint16(rank)
        });

        emit GenesisPledged(wallet, rank, handle, proofHash, score);
    }
}
