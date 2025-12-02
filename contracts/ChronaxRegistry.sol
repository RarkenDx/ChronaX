
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChronaXRegistry
 * @author Thopaz Arief Malino
 * @notice Proof-of-Existence timestamp registry for ChronaX
 */

contract ChronaXRegistry {
    
    struct Record {
        address owner;
        uint256 timestamp;
    }

    // hash → record
    mapping(bytes32 => Record) public records;

    event DocumentRegistered(bytes32 indexed docHash, address indexed owner, uint256 timestamp);

    /**
     * @notice Register a document hash
     * @param docHash SHA-256 hash of the file
     */
    function register(bytes32 docHash) external {
        require(docHash != 0x0, "Invalid hash");
        require(records[docHash].timestamp == 0, "Already registered");

        records[docHash] = Record(msg.sender, block.timestamp);

        emit DocumentRegistered(docHash, msg.sender, block.timestamp);
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
}