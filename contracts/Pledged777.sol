// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Pledged777 {

    // ─── ERC-721 ─────────────────────────────────────────────────────────────

    string public constant name   = "PLEDGED 777";
    string public constant symbol = "P777";

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function supportsInterface(bytes4 id) external pure returns (bool) {
        return id == 0x80ac58cd  // ERC-721
            || id == 0x5b5e139f  // ERC-721 Metadata
            || id == 0x01ffc9a7; // ERC-165
    }

    function balanceOf(address addr) external view returns (uint256) {
        require(addr != address(0), "zero address");
        return _balances[addr];
    }

    function ownerOf(uint256 tokenId) public view returns (address tokenOwner) {
        tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "nonexistent token");
    }

    function approve(address to, uint256 tokenId) external {
        address tokenOwner = ownerOf(tokenId);
        require(msg.sender == tokenOwner || _operatorApprovals[tokenOwner][msg.sender], "not authorized");
        _tokenApprovals[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    function getApproved(uint256 tokenId) external view returns (address) {
        ownerOf(tokenId);
        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) external {
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address addr, address operator) external view returns (bool) {
        return _operatorApprovals[addr][operator];
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        address tokenOwner = ownerOf(tokenId);
        require(from == tokenOwner, "not owner");
        require(to != address(0), "zero address");
        require(
            msg.sender == tokenOwner ||
            _tokenApprovals[tokenId] == msg.sender ||
            _operatorApprovals[tokenOwner][msg.sender],
            "not authorized"
        );
        _tokenApprovals[tokenId] = address(0);
        unchecked { _balances[from]--; _balances[to]++; }
        _owners[tokenId] = to;
        emit Transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public {
        transferFrom(from, to, tokenId);
        if (to.code.length > 0) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 ret) {
                require(ret == 0x150b7a02, "unsafe receiver");
            } catch {
                revert("unsafe receiver");
            }
        }
    }

    function _mint(address to, uint256 tokenId) internal {
        _balances[to]++;
        _owners[tokenId] = to;
        emit Transfer(address(0), to, tokenId);
    }

    // ─── Base64 ───────────────────────────────────────────────────────────────

    bytes private constant _B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function _base64(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        bytes memory result = new bytes(encodedLen);
        bytes memory table = _B64;
        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            for {
                let dataPtr := data
                let endPtr := add(dataPtr, mload(data))
            } lt(dataPtr, endPtr) {} {
                dataPtr := add(dataPtr, 3)
                let input := mload(dataPtr)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr( 6, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(       input,  0x3F))))
                resultPtr := add(resultPtr, 1)
            }
            switch mod(mload(data), 3)
            case 1 {
                mstore8(sub(resultPtr, 1), 0x3d)
                mstore8(sub(resultPtr, 2), 0x3d)
            }
            case 2 {
                mstore8(sub(resultPtr, 1), 0x3d)
            }
            mstore(result, encodedLen)
        }
        return string(result);
    }

    // ─── tokenURI helpers ─────────────────────────────────────────────────────

    function _uint2str(uint256 n) internal pure returns (string memory) {
        if (n == 0) return "0";
        uint256 digits; uint256 tmp = n;
        while (tmp != 0) { digits++; tmp /= 10; }
        bytes memory buf = new bytes(digits);
        while (n != 0) { buf[--digits] = bytes1(uint8(48 + n % 10)); n /= 10; }
        return string(buf);
    }

    function _padRank(uint256 n) internal pure returns (string memory) {
        if (n < 10)  return string(abi.encodePacked("00", _uint2str(n)));
        if (n < 100) return string(abi.encodePacked("0",  _uint2str(n)));
        return _uint2str(n);
    }

    function _jsonEscape(string memory s) internal pure returns (string memory) {
        bytes memory b = bytes(s);
        uint256 extra;
        for (uint256 i; i < b.length; i++) {
            if (b[i] == '"' || b[i] == '\\') extra++;
        }
        if (extra == 0) return s;
        bytes memory out = new bytes(b.length + extra);
        uint256 j;
        for (uint256 i; i < b.length; i++) {
            if (b[i] == '"' || b[i] == '\\') out[j++] = '\\';
            out[j++] = b[i];
        }
        return string(out);
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_owners[tokenId] != address(0), "nonexistent token");
        Pledge memory p = pledgeByRank[tokenId];
        string memory json = string(abi.encodePacked(
            '{"name":"PLEDGED 777 #', _padRank(tokenId),
            '","description":"', _jsonEscape(p.message),
            '","image":"', p.imageUri,
            '","attributes":[{"trait_type":"Rank","value":', _uint2str(tokenId),
            '},{"trait_type":"Chain","value":"Ritual Testnet"}]}'
        ));
        return string(abi.encodePacked("data:application/json;base64,", _base64(bytes(json))));
    }

    // ─── Pledge logic ─────────────────────────────────────────────────────────

    uint256 public constant MAX_PLEDGES = 777;
    uint256 public totalPledged;
    address public contractOwner;

    struct Pledge {
        address wallet;
        string  imageUri;
        string  message;
        uint64  pledgedAt;
        uint16  rank;
    }

    mapping(address  => bool)    public hasPledged;
    mapping(uint256  => Pledge)  private pledgeByRank;

    event Pledged(address indexed wallet, uint256 indexed rank, string message, uint64 pledgedAt);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error NotOwner();
    error AlreadyPledged();
    error WallFull();
    error InvalidWallet();
    error MessageTooLong();
    error ImageTooLarge();

    modifier onlyOwner() {
        if (msg.sender != contractOwner) revert NotOwner();
        _;
    }

    constructor() {
        contractOwner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function pledge(
        address wallet,
        string calldata imageUri,
        string calldata message
    ) external onlyOwner {
        if (wallet == address(0))        revert InvalidWallet();
        if (hasPledged[wallet])          revert AlreadyPledged();
        if (totalPledged >= MAX_PLEDGES) revert WallFull();
        if (bytes(message).length > 77)  revert MessageTooLong();
        if (bytes(imageUri).length > 5000) revert ImageTooLarge();

        uint256 rank = ++totalPledged;
        hasPledged[wallet] = true;
        pledgeByRank[rank] = Pledge({
            wallet:    wallet,
            imageUri:  imageUri,
            message:   message,
            pledgedAt: uint64(block.timestamp),
            rank:      uint16(rank)
        });

        _mint(wallet, rank);
        emit Pledged(wallet, rank, message, uint64(block.timestamp));
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidWallet();
        emit OwnershipTransferred(contractOwner, newOwner);
        contractOwner = newOwner;
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

interface IERC721Receiver {
    function onERC721Received(address, address, uint256, bytes calldata) external returns (bytes4);
}
