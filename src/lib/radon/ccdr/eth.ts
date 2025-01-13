const helpers = require("../../helpers")

import { 
    JsonRPC, 
    BlockNumber, 
    Bytes, 
    Bytes32, 
    HexString,
    HexStringOfLength,
} from ".";

export type EthAddress = HexStringOfLength<40>;
export type EthBlockHead = BlockNumber | EthBlockTag;
export type EthBlockTag = "latest" | "earliest" | "pending" | "finalized" 

function _isBlockHead(block: EthBlockHead): boolean {
    return (
        block === "latest" || block === "earliest" || block === "finalized" || block === "pending"
            || typeof block === 'number'
            || helpers.isHexStringOfLength(block, 32)
            || helpers.wildcards.isWildcard(block)
    );
}

/**
 * Retrieve the number of most recent block.
 */ 
export const blockNumber = () => new JsonRPC("eth_blockNumber");

/**
 * Invoke message call immediately without creating a transaction 
 * on the remote block chain. Often used for executing read-only smart contract 
 * functions, for example the balanceOf for an ERC-20 contract.
 * @param tx The transaction call object.
 */
export const call = (tx: {
    from?: EthAddress,
    to: EthAddress,
    gas?: number | HexString,
    gasPrice?: number | HexString,
    value?: number | HexString,
    data?: HexString
}) => {
    if (tx?.from && !helpers.isHexStringOfLength(tx?.from, 20) && !helpers.wildcards.isWildcard(tx?.from)) {
        throw new EvalError("CCDR: EthCall: invalid 'from' address");
    }
    if (tx?.gas && !Number.isInteger(tx.gas) && !helpers.isHexStringOfLength(tx.gas, 32) && !helpers.wildcards.isWildcard(tx.gas)) {
        throw new EvalError("CCDR: EthCall: invalid 'gas' value")
    }
    if (tx?.gasPrice && !Number.isInteger(tx.gasPrice) && !helpers.isHexStringOfLength(tx.gasPrice, 32) && !helpers.wildcards.isWildcard(tx.gasPrice)) {
        throw new EvalError("CCDR: EthCall: invalid 'gasPrice' value")
    }
    if (tx?.value && !Number.isInteger(tx.value) && !helpers.isHexStringOfLength(tx.value, 32) && !helpers.wildcards.isWildcard(tx.value)) {
        throw new EvalError("CCDR: EthCall: invalid transaction 'value'")
    }
    if (tx?.data && !helpers.isHexString(tx.data) && !helpers.wildcards.isWildcard(tx.data)) {
        throw new EvalError("CCDR: EthCall: invalid transaction 'data'")
    }
    return new JsonRPC("eth_call", [ tx ]);
};

/**
 * Generates and returns an estimate of how much gas is necessary 
 * to allow the transaction to complete. The transaction will not be 
 * added to the blockchain. Note that the estimate may be significantly 
 * more than the amount of gas actually used by the transaction, for a 
 * variety of reasons including EVM mechanics and node performance.
 * @param tx The transaction call object.
 */
export const estimateGas = (tx: {
    from?: EthAddress,
    to: EthAddress,
    gas?: number | HexString,
    gasPrice?: number | HexString,
    value?: number | HexString,
    data?: HexString
}) => {
    if (tx?.from && !helpers.isHexStringOfLength(tx?.from, 20) && !helpers.wildcards.isWildcard(tx?.from)) {
        throw new EvalError("CCDR: EthEstimateGas: invalid 'from' address");
    }
    if (tx?.gas && !Number.isInteger(tx.gas) && !helpers.isHexStringOfLength(tx.gas, 32) && !helpers.wildcards.isWildcard(tx.gas)) {
        throw new EvalError("CCDR: EthEstimateGas: invalid 'gas' value")
    }
    if (tx?.gasPrice && !Number.isInteger(tx.gasPrice) && !helpers.isHexStringOfLength(tx.gasPrice, 32) && !helpers.wildcards.isWildcard(tx.gasPrice)) {
        throw new EvalError("CCDR: EthEstimateGas: invalid 'gasPrice' value")
    }
    if (tx?.value && !Number.isInteger(tx.value) && !helpers.isHexStringOfLength(tx.value, 32) && !helpers.wildcards.isWildcard(tx.value)) {
        throw new EvalError("CCDR: EthEstimateGas: invalid transaction 'value'")
    }
    if (tx?.data && !helpers.isHexString(tx.data) && !helpers.wildcards.isWildcard(tx.data)) {
        throw new EvalError("CCDR: EthEstimateGas: invalid transaction 'data'")
    }
    return new JsonRPC("eth_estimateGas", [ tx ]);
};

/**
 * Retrieve the balance of the account of given address.
 * @param address Web3 address on remote EVM chain.
 */
export const getBalance = (address: EthAddress, block?: EthBlockHead) => {
    if (!helpers.isHexStringOfLength(address, 20) && !helpers.wildcards.isWildcard(address)) {
        throw new EvalError("CCDR: EthGetBalance: invalid Web3 address format");
    } else {
        return new JsonRPC("eth_getBalance", [ address, block ]);
    }
};

/**
 * Retrieve code at a given address.
 * @param address EthAddress from where to get the code.
 */
export const getCode = (address: EthAddress) => {
    if (!helpers.isHexStringOfLength(address, 20) && !helpers.wildcards.isWildcard(address)) {
        throw new EvalError("CCDR: EthGetCode: invalid Web3 address format");
    } else {
        return new JsonRPC("eth_getCode", [ address ]);
    }
};

/**
 * Retrieve an array of all logs matching a given filter object.
 * @param filter The filter options.
 */
export const getLogs = (filter: {
    fromBlock?: EthBlockHead,
    toBlock?: EthBlockHead,
    address?: EthAddress | EthAddress[],
    topics?: Bytes32[],
    blockHash?: Bytes32,
}) => {
    if (filter?.blockHash && (filter?.fromBlock || filter?.toBlock)) {
        throw new EvalError("CCDR: EthGetLogs: uncompliant use of 'blockHash'")
    }
    if (filter?.fromBlock) {
        if (!_isBlockHead(filter?.fromBlock)) {
            throw new EvalError("CCDR: EthGetLogs: invalid 'fromBlock' value");
        } else if (typeof filter?.fromBlock === 'number') {
            filter.fromBlock = `0x${(filter?.fromBlock as number).toString(16)}` as EthBlockHead
        }
    }
    if (filter?.toBlock) {
        if (!_isBlockHead(filter?.toBlock)) {
            throw new EvalError("CCDR: EthGetLogs: invalid 'toBlock' value");
        } else if (typeof filter?.toBlock === 'number') {
            filter.toBlock = `0x${(filter?.toBlock as number).toString(16)}` as EthBlockHead
        }
    }
    if (filter?.blockHash && !helpers.isHexStringOfLength(filter.blockHash, 32) && !helpers.wildcards.isWildcard(filter.blockHash)) {
        throw new EvalError("CCDR: EthGetLogs: invalid 'blockHash' value");
    }
    if (filter?.topics) {
        filter.topics.map((value: Bytes32, index: number) => {
            if (!helpers.isHexStringOfLength(value, 32) && !helpers.wildcards.isWildcard(value)) {
                throw new EvalError(`CCDR: EthGetLogs: topic #${index}: invalid hash`)
            }
        })
    }
    return new JsonRPC("eth_getLogs", [ filter ]);
};

/**
 * Retrieve an estimate of the current price per gas in wei. 
 */ 
export const gasPrice = () => new JsonRPC("eth_gasPrice");

/**
 * Retrieve the value from a storage position at a given address.
 * @param address EthAddress of the storage.
 * @param offset Offset within storage address.
 */
export const getStorageAt = (address: EthAddress, offset: Bytes32) => {
    if (!helpers.isHexStringOfLength(address, 20) && !helpers.wildcards.isWildcard(address)) {
        throw new EvalError("CCDR: EthGetStorageAt: invalid Web3 address format");
    } 
    if (!helpers.isHexStringOfLength(offset, 32) && !helpers.wildcards.isWildcard(offset)) {
        throw new EvalError("CCDR: EthGetStorageAt: invalid storage offset value");
    }
    return new JsonRPC("eth_getStorageAt", [ address, offset ]);
};

/**
 * Retrieve the information about a remote transaction given a block hash and a transaction index.
 * @param txHash Hash of the remote transaction.
 */
export const getTransactionByBlockHashAndIndex = (blockHash: Bytes32, txIndex: number | Bytes32) => {
    if (!helpers.isHexStringOfLength(blockHash, 32) && !helpers.wildcards.isWildcard(blockHash)) {
        throw new EvalError("CCDR: EthGetTransactionByBlockHashAndIndex: invalid block hash value");
    }
    if (!Number.isInteger(txIndex) && !helpers.isHexStringOfLength(txIndex, 32) && !helpers.wildcards.isWildcard(txIndex)) {
        throw new EvalError("CCDR: EthGetTransactionByBlockHashAndIndex: invalid transaction index value")
    }
    return new JsonRPC("eth_getTransactionByBlockHashAndIndex", [ blockHash, txIndex ]);
};

/**
 * Retrieve the information about a remote transaction given a block number and a transaction index.
 * @param txHash Hash of the remote transaction.
 */
export const getTransactionByBlockNumberAndIndex = (
    blockNumber: EthBlockHead,
    txIndex: number | Bytes32
) => {
    if (!_isBlockHead(blockNumber)) {
        throw new EvalError("CCDR: EthGetTransactionByBlockNumberAndIndex: invalid block number value");
    } else {
        if (typeof blockNumber === 'number') {
            blockNumber = `0x${(blockNumber as number).toString(16)}` as EthBlockHead
        }
    }
    if (!Number.isInteger(txIndex) && !helpers.isHexStringOfLength(txIndex, 32) && !helpers.wildcards.isWildcard(txIndex)) {
        throw new EvalError("CCDR: EthGetTransactionByBlockNumberAndIndex: invalid transaction index value")
    }
    return new JsonRPC("eth_getTransactionByBlockHashAndIndex", [ blockNumber, txIndex ]);
};

/**
 * Retrieve the information about a remote transaction given its transaction hash.
 * @param txHash Hash of the remote transaction.
 */
export const getTransactionByHash = (txHash: Bytes32) => {
    if (!helpers.isHexStringOfLength(txHash, 32) && !helpers.wildcards.isWildcard(txHash)) {
        throw new EvalError("CCDR: EthGetTransactionByHash: invalid transaction hash value");
    } else {
        return new JsonRPC("eth_getTransactionByHash", [ txHash ]);
    }
};

/**
 * Retrieve the number of transactions sent from an address.
 * @param address EthAddress from where to get transaction count.
 */
export const getTransactionCount = (address: EthAddress) => {
    if (!helpers.isHexStringOfLength(address, 20) && !helpers.wildcards.isWildcard(address)) {
        throw new EvalError("CCDR: EthGetTransactionCount: invalid Web3 address format");
    } else {
        return new JsonRPC("eth_getTransactionCount", [ address ]);
    }
};

/**
 * Retrieve the receipt of a remote transaction given its transaction hash.
 * @param txHash Hash of the remote transaction.
 */
export const getTransactionReceipt = (txHash: Bytes32) => {
    if (!helpers.isHexStringOfLength(txHash, 32) && !helpers.wildcards.isWildcard(txHash)) {
        throw new EvalError("CCDR: EthGetTransactionReceipt: invalid transaction hash value");
    } else {
        return new JsonRPC("eth_getTransactionReceipt", [ txHash ]);
    }
};

/**
 * Invoke remote call transaction, or remote contract creation. 
 * @param data The signed transaction data.
 */
export const sendRawTransaction = (data: Bytes) => {
    if (!helpers.isHexString(data) && !helpers.wildcards.isWildcard(data)) {
        throw new EvalError("CCDR: EthSendRawTransaction: invalid signed transaction data");
    } else {
        return new JsonRPC("eth_sendRawTransaction", [ data ]);
    }
};
