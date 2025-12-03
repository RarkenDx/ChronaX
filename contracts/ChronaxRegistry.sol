// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title ChronaXRegistryV2
 * @author Thopaz Arief Malino (Developed Version)
 * @notice Upgraded Proof-of-Existence timestamp registry for ChronaX with access control, oracle timestamp, and transfer functionality.
 */
contract ChronaXRegistryV2 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    
    struct Record {
        address owner;
        uint256 timestamp;
    }

    // Chainlink oracle for timestamp (e.g., ETH/USD aggregator for accurate time)
    AggregatorV3Interface internal priceFeed;

    // hash → record
    mapping(bytes32 => Record) public records;

    event DocumentRegistered(bytes32 indexed docHash, address indexed owner, uint256 timestamp);
    event OwnershipTransferred(bytes32 indexed docHash, address indexed previousOwner, address indexed newOwner);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the contract (for upgradeable proxy)
     * @param _priceFeed Address of Chainlink price feed for timestamp
     */
    function initialize(address _priceFeed) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    /**
     * @notice Register a document hash (only owner can call)
     * @param docHash SHA-256 hash of the file
     */
    function register(bytes32 docHash) external onlyOwner {
        require(docHash != 0x0, "Invalid hash");
        require(records[docHash].timestamp == 0, "Already registered");

        // Use Chainlink for accurate timestamp
        (, int256 price,, uint256 updatedAt,) = priceFeed.latestRoundData();
        require(updatedAt > 0, "Invalid timestamp from oracle");

        records[docHash] = Record(msg.sender, updatedAt);

        emit DocumentRegistered(docHash, msg.sender, updatedAt);
    }

    /**
     * @notice Batch register multiple hashes (gas optimization)
     * @param docHashes Array of SHA-256 hashes
     */
    function batchRegister(bytes32[] calldata docHashes) external onlyOwner {
        for (uint256 i = 0; i < docHashes.length; i++) {
            bytes32 docHash = docHashes[i];
            require(docHash != 0x0, "Invalid hash");
            require(records[docHash].timestamp == 0, "Already registered");

            (, int256 price,, uint256 updatedAt,) = priceFeed.latestRoundData();
            require(updatedAt > 0, "Invalid timestamp from oracle");

            records[docHash] = Record(msg.sender, updatedAt);
            emit DocumentRegistered(docHash, msg.sender, updatedAt);
        }
    }

    /**
     * @notice Transfer ownership of a registered hash
     * @param docHash Hash to transfer
     * @param newOwner New owner address
     */
    function transferOwnership(bytes32 docHash, address newOwner) external {
        require(records[docHash].owner == msg.sender, "Not the owner");
        require(newOwner != address(0), "Invalid new owner");

        records[docHash].owner = newOwner;
        emit OwnershipTransferred(docHash, msg.sender, newOwner);
    }

    /**
     * @notice Check if a hash already exists
     */
    function isRegistered(bytes32 docHash) external view returns (bool) {
        return records[docHash].timestamp != 0;
    }

    /**
     * @notice Get info (owner + timestamp)
     */
    function getRecord(bytes32 docHash) external view returns (address, uint256) {
        Record memory rec = records[docHash];
        return (rec.owner, rec.timestamp);
    }

    /**
     * @notice Authorize upgrade (only owner)
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
