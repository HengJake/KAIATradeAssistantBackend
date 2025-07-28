/*
Imports all the necessary libraries for:
MCP server communication
Blockchain interaction
Connecting MCP to blockchain tools
Specific Kaia blockchain functionality using Kaia Agent Kit
*/
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { http, createWalletClient, getContract, createPublicClient, } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { kairos } from "viem/chains";
import { Kaia } from "@kaiachain/kaia-agent-kit";
import { getOnChainTools } from "@goat-sdk/adapter-model-context-protocol";
import { viem } from "@goat-sdk/wallet-viem";
// 1. Create the wallet client
const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY);
const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: kairos,
});
const publicClient = createPublicClient({
    transport: http(process.env.RPC_PROVIDER_URL),
    chain: kairos,
});
// 2. Get the onchain tools for the wallet
const toolsPromise = getOnChainTools({
    wallet: viem(walletClient),
    plugins: [
        Kaia({ KAIA_KAIASCAN_API_KEY: process.env.KAIASCAN_API_KEY, packages: [] }),
    ],
});
// Contract ABIs and addresses
const yieldAggregatorABI = [
    {
        inputs: [
            {
                internalType: "address",
                name: "initialOwner",
                type: "address",
            },
            {
                internalType: "address",
                name: "_oracle",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "OwnableInvalidOwner",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "OwnableUnauthorizedAccount",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "previousOwner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "OwnershipTransferred",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "oldOracle",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newOracle",
                type: "address",
            },
        ],
        name: "YieldOracleChanged",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "protocol",
                type: "address",
            },
        ],
        name: "YieldRemoved",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                components: [
                    {
                        internalType: "address",
                        name: "protocol",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "apyBasisPoints",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "liquidity",
                        type: "uint256",
                    },
                    {
                        internalType: "uint8",
                        name: "riskLevel",
                        type: "uint8",
                    },
                ],
                indexed: false,
                internalType: "struct YieldAggregator.YieldInfo",
                name: "info",
                type: "tuple",
            },
        ],
        name: "YieldUpdated",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                components: [
                    {
                        internalType: "address",
                        name: "protocol",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "apyBasisPoints",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "liquidity",
                        type: "uint256",
                    },
                    {
                        internalType: "uint8",
                        name: "riskLevel",
                        type: "uint8",
                    },
                ],
                internalType: "struct YieldAggregator.YieldInfo[]",
                name: "newYields",
                type: "tuple[]",
            },
        ],
        name: "fetchYields",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "getAverageAPYAndRisk",
        outputs: [
            {
                internalType: "uint256",
                name: "avgAPY",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "avgRisk",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "getBestYield",
        outputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "protocol",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "apyBasisPoints",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "liquidity",
                        type: "uint256",
                    },
                    {
                        internalType: "uint8",
                        name: "riskLevel",
                        type: "uint8",
                    },
                ],
                internalType: "struct YieldAggregator.YieldInfo",
                name: "",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "getYields",
        outputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "protocol",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "apyBasisPoints",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "liquidity",
                        type: "uint256",
                    },
                    {
                        internalType: "uint8",
                        name: "riskLevel",
                        type: "uint8",
                    },
                ],
                internalType: "struct YieldAggregator.YieldInfo[]",
                name: "",
                type: "tuple[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "getYieldsSortedByAPY",
        outputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "protocol",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "apyBasisPoints",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "liquidity",
                        type: "uint256",
                    },
                    {
                        internalType: "uint8",
                        name: "riskLevel",
                        type: "uint8",
                    },
                ],
                internalType: "struct YieldAggregator.YieldInfo[]",
                name: "",
                type: "tuple[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "oracle",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "address",
                name: "protocol",
                type: "address",
            },
        ],
        name: "removeYield",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_oracle",
                type: "address",
            },
        ],
        name: "setOracle",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                components: [
                    {
                        internalType: "address",
                        name: "protocol",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "apyBasisPoints",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "liquidity",
                        type: "uint256",
                    },
                    {
                        internalType: "uint8",
                        name: "riskLevel",
                        type: "uint8",
                    },
                ],
                internalType: "struct YieldAggregator.YieldInfo",
                name: "info",
                type: "tuple",
            },
        ],
        name: "setYield",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
]; // From artifacts
const tradeAnalyzerABI = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                components: [
                    {
                        internalType: "address",
                        name: "user",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "tokenIn",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "tokenOut",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "amountIn",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "amountOut",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "timestamp",
                        type: "uint256",
                    },
                    {
                        internalType: "bool",
                        name: "isDemo",
                        type: "bool",
                    },
                    {
                        internalType: "int256",
                        name: "profitLoss",
                        type: "int256",
                    },
                ],
                indexed: false,
                internalType: "struct TradeAnalyzer.Trade",
                name: "trade",
                type: "tuple",
            },
        ],
        name: "TradeAdded",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "index",
                type: "uint256",
            },
        ],
        name: "TradeRemoved",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "index",
                type: "uint256",
            },
            {
                components: [
                    {
                        internalType: "address",
                        name: "user",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "tokenIn",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "tokenOut",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "amountIn",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "amountOut",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "timestamp",
                        type: "uint256",
                    },
                    {
                        internalType: "bool",
                        name: "isDemo",
                        type: "bool",
                    },
                    {
                        internalType: "int256",
                        name: "profitLoss",
                        type: "int256",
                    },
                ],
                indexed: false,
                internalType: "struct TradeAnalyzer.Trade",
                name: "trade",
                type: "tuple",
            },
        ],
        name: "TradeUpdated",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "tokenIn",
                type: "address",
            },
            {
                internalType: "address",
                name: "tokenOut",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amountIn",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "amountOut",
                type: "uint256",
            },
            {
                internalType: "bool",
                name: "isDemo",
                type: "bool",
            },
            {
                internalType: "int256",
                name: "profitLoss",
                type: "int256",
            },
        ],
        name: "addTrade",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "analyzeTrades",
        outputs: [
            {
                internalType: "int256",
                name: "totalPL",
                type: "int256",
            },
            {
                internalType: "uint256",
                name: "count",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "getAllTrades",
        outputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "user",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "tokenIn",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "tokenOut",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "amountIn",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "amountOut",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "timestamp",
                        type: "uint256",
                    },
                    {
                        internalType: "bool",
                        name: "isDemo",
                        type: "bool",
                    },
                    {
                        internalType: "int256",
                        name: "profitLoss",
                        type: "int256",
                    },
                ],
                internalType: "struct TradeAnalyzer.Trade[]",
                name: "",
                type: "tuple[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "getAnalytics",
        outputs: [
            {
                internalType: "int256",
                name: "avgPL",
                type: "int256",
            },
            {
                internalType: "uint256",
                name: "winRate",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "lossRate",
                type: "uint256",
            },
            {
                internalType: "int256",
                name: "largestWin",
                type: "int256",
            },
            {
                internalType: "int256",
                name: "largestLoss",
                type: "int256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "getAverageHoldingTime",
        outputs: [
            {
                internalType: "uint256",
                name: "avgTime",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "getBestWorstTrade",
        outputs: [
            {
                internalType: "int256",
                name: "best",
                type: "int256",
            },
            {
                internalType: "int256",
                name: "worst",
                type: "int256",
            },
            {
                internalType: "uint256",
                name: "bestIdx",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "worstIdx",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "getMaxDrawdown",
        outputs: [
            {
                internalType: "int256",
                name: "maxDrawdown",
                type: "int256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "getPercentProfitable",
        outputs: [
            {
                internalType: "uint256",
                name: "percentProfitable",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "getProfitFactor",
        outputs: [
            {
                internalType: "uint256",
                name: "profitFactor",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "getSharpeRatio",
        outputs: [
            {
                internalType: "int256",
                name: "sharpeRatio",
                type: "int256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "getStreaks",
        outputs: [
            {
                internalType: "uint256",
                name: "maxWinStreak",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "maxLossStreak",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "index",
                type: "uint256",
            },
        ],
        name: "getTrade",
        outputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "user",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "tokenIn",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "tokenOut",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "amountIn",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "amountOut",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "timestamp",
                        type: "uint256",
                    },
                    {
                        internalType: "bool",
                        name: "isDemo",
                        type: "bool",
                    },
                    {
                        internalType: "int256",
                        name: "profitLoss",
                        type: "int256",
                    },
                ],
                internalType: "struct TradeAnalyzer.Trade",
                name: "",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "getTradeCount",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "getTradeDistributionByToken",
        outputs: [
            {
                internalType: "address[]",
                name: "tokens",
                type: "address[]",
            },
            {
                internalType: "uint256[]",
                name: "counts",
                type: "uint256[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "getVolatility",
        outputs: [
            {
                internalType: "uint256",
                name: "stddev",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "index",
                type: "uint256",
            },
        ],
        name: "removeTrade",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "suggestStrategy",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "index",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "tokenIn",
                type: "address",
            },
            {
                internalType: "address",
                name: "tokenOut",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amountIn",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "amountOut",
                type: "uint256",
            },
            {
                internalType: "bool",
                name: "isDemo",
                type: "bool",
            },
            {
                internalType: "int256",
                name: "profitLoss",
                type: "int256",
            },
        ],
        name: "updateTrade",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];
const fiatSwapABI = [
    {
        inputs: [
            {
                internalType: "address",
                name: "initialOwner",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "OwnableInvalidOwner",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "OwnableUnauthorizedAccount",
        type: "error",
    },
    {
        inputs: [],
        name: "ReentrancyGuardReentrantCall",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "string",
                name: "fiatCurrency",
                type: "string",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "rate",
                type: "uint256",
            },
        ],
        name: "FiatRateUpdated",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "previousOwner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "OwnershipTransferred",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "swapId",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "SwapCancelled",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "swapId",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "tokenAmount",
                type: "uint256",
            },
        ],
        name: "SwapCompleted",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "swapId",
                type: "bytes32",
            },
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "fiatAmount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "string",
                name: "fiatCurrency",
                type: "string",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "tokenAmount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "isDemo",
                type: "bool",
            },
        ],
        name: "SwapInitiated",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "swapId",
                type: "bytes32",
            },
        ],
        name: "cancelSwap",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "swapId",
                type: "bytes32",
            },
        ],
        name: "completeSwap",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "fiatCurrency",
                type: "string",
            },
            {
                internalType: "uint256",
                name: "fiatAmount",
                type: "uint256",
            },
        ],
        name: "convert",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "",
                type: "string",
            },
        ],
        name: "fiatRates",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "getAllSwaps",
        outputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "user",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "fiatAmount",
                        type: "uint256",
                    },
                    {
                        internalType: "string",
                        name: "fiatCurrency",
                        type: "string",
                    },
                    {
                        internalType: "uint256",
                        name: "tokenAmount",
                        type: "uint256",
                    },
                    {
                        internalType: "address",
                        name: "token",
                        type: "address",
                    },
                    {
                        internalType: "bool",
                        name: "isDemo",
                        type: "bool",
                    },
                    {
                        internalType: "bool",
                        name: "completed",
                        type: "bool",
                    },
                    {
                        internalType: "bool",
                        name: "cancelled",
                        type: "bool",
                    },
                    {
                        internalType: "uint256",
                        name: "timestamp",
                        type: "uint256",
                    },
                ],
                internalType: "struct FiatSwap.Swap[]",
                name: "",
                type: "tuple[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "fiatCurrency",
                type: "string",
            },
        ],
        name: "getFiatRate",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "getUserSwaps",
        outputs: [
            {
                internalType: "bytes32[]",
                name: "",
                type: "bytes32[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "fiatAmount",
                type: "uint256",
            },
            {
                internalType: "string",
                name: "fiatCurrency",
                type: "string",
            },
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "bool",
                name: "isDemo",
                type: "bool",
            },
        ],
        name: "initiateSwap",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "fiatCurrency",
                type: "string",
            },
            {
                internalType: "uint256",
                name: "rate",
                type: "uint256",
            },
        ],
        name: "setFiatRate",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        name: "swaps",
        outputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "fiatAmount",
                type: "uint256",
            },
            {
                internalType: "string",
                name: "fiatCurrency",
                type: "string",
            },
            {
                internalType: "uint256",
                name: "tokenAmount",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
            {
                internalType: "bool",
                name: "isDemo",
                type: "bool",
            },
            {
                internalType: "bool",
                name: "completed",
                type: "bool",
            },
            {
                internalType: "bool",
                name: "cancelled",
                type: "bool",
            },
            {
                internalType: "uint256",
                name: "timestamp",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        name: "userSwaps",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
const demoTradingABI = [
    {
        inputs: [
            {
                internalType: "address",
                name: "initialOwner",
                type: "address",
            },
            {
                internalType: "address",
                name: "_tradeAnalyzer",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "OwnableInvalidOwner",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "OwnableUnauthorizedAccount",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "balance",
                type: "uint256",
            },
        ],
        name: "DemoAccountInitialized",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "DemoDeposit",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "tokenIn",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "tokenOut",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amountIn",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amountOut",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "int256",
                name: "profitLoss",
                type: "int256",
            },
        ],
        name: "DemoTradeSimulated",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "DemoWithdraw",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "previousOwner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "OwnershipTransferred",
        type: "event",
    },
    {
        inputs: [],
        name: "INITIAL_DEMO_BALANCE",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "depositDemoFunds",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "getDemoAccount",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
        ],
        name: "initializeDemoAccount",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_tradeAnalyzer",
                type: "address",
            },
        ],
        name: "setTradeAnalyzer",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "tokenIn",
                type: "address",
            },
            {
                internalType: "address",
                name: "tokenOut",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amountIn",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "amountOut",
                type: "uint256",
            },
            {
                internalType: "int256",
                name: "profitLoss",
                type: "int256",
            },
        ],
        name: "simulateTrade",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "tradeAnalyzer",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        name: "virtualBalances",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "withdrawDemoFunds",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];
// Create contract instances with viem
const yieldAggregator = getContract({
    address: "0x5022a88F43963b48fcb4a2917572089DdBc687b1",
    abi: yieldAggregatorABI,
    client: { public: publicClient, wallet: walletClient },
});
const tradeAnalyzer = getContract({
    address: "0x5022a88F43963b48fcb4a2917572089DdBc687b1",
    abi: tradeAnalyzerABI,
    client: { public: publicClient, wallet: walletClient },
});
const fiatSwap = getContract({
    address: "0x7ff31bc4F0Cd5581779bAC0Aad30e38f1d48B898",
    abi: fiatSwapABI,
    client: { public: publicClient, wallet: walletClient },
});
const demoTrading = getContract({
    address: "0x0F7baEc7AEB98bCE788378d560463B738782DDBA",
    abi: demoTradingABI,
    client: { public: publicClient, wallet: walletClient },
});
// 3. Create and configure the server
const server = new Server({
    name: "kaia-mcp",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Tools
// Custom tool implementations as plain functions
async function getBestYield({ token }) {
    const result = await yieldAggregator.read.getBestYield([token]);
    // Assert the correct type here
    const bestYield = result;
    const protocol = bestYield.protocol;
    const apyBasisPoints = Number(bestYield.apyBasisPoints);
    const riskLevel = Number(bestYield.riskLevel);
    return `Best yield: ${protocol} with ${apyBasisPoints / 100}% APY (Risk: ${riskLevel})`;
}
async function analyzeTrades({ user }) {
    return tradeAnalyzer.read.suggestStrategy([user]);
}
async function initiateFiatSwap({ user, fiatAmount, fiatCurrency, }) {
    await fiatSwap.read.initiateSwap([user, fiatAmount, fiatCurrency, false]);
    const paymentResponse = await fetch("https://api.alchemy.com/v1/swap", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.ALCHEMY_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: fiatCurrency,
            to: "KAIA",
            amount: fiatAmount,
            destination: user,
        }),
    }).then((res) => res.json());
    if (paymentResponse.success) {
        await fiatSwap.read.completeSwap([user]);
    }
    return `Initiated swap: ${fiatAmount} ${fiatCurrency} to KAIA. Payment status: ${paymentResponse.success ? "Completed" : "Failed"}`;
}
async function initializeDemoAccount({ user }) {
    await demoTrading.read.initializeDemoAccount([user]);
    return `Demo account initialized for ${user}`;
}
async function suggestTrade({ user, token }) {
    const marketData = await fetch("https://orakl.network/api/data-feed", {
        headers: { Authorization: `Bearer ${process.env.ORAKL_API_KEY}` },
    }).then((res) => res.json());
    const tradeSuggestion = await tradeAnalyzer.read.suggestStrategy([user]);
    return `Trading suggestion for ${token}: ${tradeSuggestion} (market data integration pending)`;
}
async function handleFiatSwapChat({ message, userAddress, }) {
    if (message.includes("swap to fiat")) {
        const match = message.match(/swap (\d+) (\w+) to (\w+)/);
        if (match) {
            const [, amount, currency, crypto] = match;
            if (crypto === "KAIA") {
                return await initiateFiatSwap({
                    user: userAddress,
                    fiatAmount: amount,
                    fiatCurrency: currency,
                });
            }
        }
        return 'Please specify amount, fiat currency, and crypto token (e.g., "swap 100 USD to KAIA").';
    }
    else if (message.includes("yield")) {
        const token = "0xTokenAddress";
        return getBestYield({ token });
    }
    else if (message.includes("trade analysis")) {
        return analyzeTrades({ user: userAddress });
    }
    return "How can I assist you with yields, trades, or fiat swaps?";
}
/*
This section lists two handlers:
List Tools Handler: Responds with all available blockchain tools when an AI asks what tools are available
Call Tool Handler: Executes a specific blockchain tool when requested, passing the appropriate arguments and handling any errors
*/
server.setRequestHandler(ListToolsRequestSchema, async () => {
    const { listOfTools } = await toolsPromise;
    return {
        tools: [
            ...listOfTools(),
            { name: "getBestYield", description: "Fetch best yield for a token" },
            { name: "analyzeTrades", description: "Analyze trade strategies" },
            { name: "initiateFiatSwap", description: "Swap fiat to KAIA" },
            {
                name: "initializeDemoAccount",
                description: "Initialize a demo account",
            },
            { name: "suggestTrade", description: "Suggest a trade strategy" },
            {
                name: "handleFiatSwapChat",
                description: "Process chat messages for swaps/yields/trades",
            },
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { toolHandler } = await toolsPromise;
    const { name, arguments: argsRaw } = request.params;
    // Default arguments to {} to avoid undefined
    const args = argsRaw ?? {};
    switch (name) {
        case "getBestYield":
            return { result: await getBestYield(args) };
        case "analyzeTrades":
            return { result: await analyzeTrades(args) };
        case "initiateFiatSwap":
            return {
                result: await initiateFiatSwap(args),
            };
        case "initializeDemoAccount":
            return { result: await initializeDemoAccount(args) };
        case "suggestTrade":
            return {
                result: await suggestTrade(args),
            };
        case "handleFiatSwapChat":
            return {
                result: await handleFiatSwapChat(args),
            };
        default:
            return toolHandler(name, args);
    }
});
// 4. Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("KAIA MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
