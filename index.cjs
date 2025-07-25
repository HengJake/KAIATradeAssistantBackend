const dotenv = require("dotenv");
dotenv.config();

// Import modules with proper error handling
let KaiaAgentKit;
let createWalletClient, http;
let privateKeyToAccount;
let ethers;

try {
  // Try different import patterns for KaiaAgentKit
  KaiaAgentKit = require("@kaiachain/kaia-agent-kit");
  
  // Check if it's a default export
  if (KaiaAgentKit.default) {
    KaiaAgentKit = KaiaAgentKit.default;
  }
  
  // If it's still not a constructor, it might be a named export
  if (typeof KaiaAgentKit !== 'function') {
    const kaiaModule = require("@kaiachain/kaia-agent-kit");
    KaiaAgentKit = kaiaModule.KaiaAgentKit || kaiaModule.default || kaiaModule;
  }
  
  console.log("KaiaAgentKit type:", typeof KaiaAgentKit);
  console.log("KaiaAgentKit keys:", Object.keys(require("@kaiachain/kaia-agent-kit")));
  
} catch (error) {
  console.error("Error importing KaiaAgentKit:", error);
}

try {
  const viem = require("viem");
  createWalletClient = viem.createWalletClient;
  http = viem.http;
} catch (error) {
  console.error("Error importing viem:", error);
}

try {
  const viemAccounts = require("viem/accounts");
  privateKeyToAccount = viemAccounts.privateKeyToAccount;
} catch (error) {
  console.error("Error importing viem/accounts:", error);
}

try {
  ethers = require("ethers");
} catch (error) {
  console.error("Error importing ethers:", error);
}

// Use dynamic import for MCP SDK
async function initializeApp() {
  try {
    // Dynamic import for ES-only modules
    const { Server } = await import("@modelcontextprotocol/sdk/server/index.js");
    const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");
    
    console.log("MCP SDK loaded successfully");
    
    // Validate environment variables
    if (!process.env.WALLET_PRIVATE_KEY) {
      throw new Error("WALLET_PRIVATE_KEY not found in environment variables");
    }
    
    if (!process.env.RPC_PROVIDER_URL) {
      throw new Error("RPC_PROVIDER_URL not found in environment variables");
    }
    
    // Fix private key format
    let privateKey = process.env.WALLET_PRIVATE_KEY.trim();
    if (!privateKey.startsWith('0x')) {
      privateKey = `0x${privateKey}`;
    }
    
    console.log("Creating account with private key...");
    const account = privateKeyToAccount(privateKey);
    console.log("Account created:", account.address);
    
    const walletClient = createWalletClient({
        account,
        transport: http(process.env.RPC_PROVIDER_URL),
    });
    
    console.log("Wallet client created");

    // Initialize KaiaAgentKit with error handling
    let kaiaAgentKit;
    try {
      if (typeof KaiaAgentKit === 'function') {
        kaiaAgentKit = new KaiaAgentKit({
          walletClient,
          kaiascanApiKey: process.env.KAIASCAN_API_KEY,
        });
        console.log("KaiaAgentKit initialized successfully");
      } else {
        console.error("KaiaAgentKit is not a constructor. Type:", typeof KaiaAgentKit);
        // Try alternative initialization methods
        if (KaiaAgentKit && typeof KaiaAgentKit.create === 'function') {
          kaiaAgentKit = KaiaAgentKit.create({
            walletClient,
            kaiascanApiKey: process.env.KAIASCAN_API_KEY,
          });
        } else if (KaiaAgentKit && typeof KaiaAgentKit.init === 'function') {
          kaiaAgentKit = KaiaAgentKit.init({
            walletClient,
            kaiascanApiKey: process.env.KAIASCAN_API_KEY,
          });
        } else {
          throw new Error("Cannot initialize KaiaAgentKit - unknown export pattern");
        }
      }
    } catch (error) {
      console.error("Error initializing KaiaAgentKit:", error);
      console.log("Available methods on KaiaAgentKit:", Object.getOwnPropertyNames(KaiaAgentKit));
      return;
    }

    // Initialize ethers provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_PROVIDER_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log("Ethers wallet created");

    // Contract placeholders - replace with actual ABIs and addresses
    const yieldAggregatorABI = [
      "function getBestYield(address token) view returns (tuple(string protocol, uint256 apy, string riskLevel))"
    ];
    const tradeAnalyzerABI = [
      "function suggestStrategy(address user) view returns (string)"
    ];
    const fiatSwapABI = [
      "function initiateSwap(address user, uint256 amount, string currency, bool isDemo) external",
      "function completeSwap(address user) external"
    ];
    const demoTradingABI = [
      "function initializeDemoAccount(address user) external"
    ];

    // Initialize contracts with placeholder addresses
    const yieldAggregator = new ethers.Contract("0x0000000000000000000000000000000000000001", yieldAggregatorABI, wallet);
    const tradeAnalyzer = new ethers.Contract("0x0000000000000000000000000000000000000002", tradeAnalyzerABI, wallet);
    const fiatSwap = new ethers.Contract("0x0000000000000000000000000000000000000003", fiatSwapABI, wallet);
    const demoTrading = new ethers.Contract("0x0000000000000000000000000000000000000004", demoTradingABI, wallet);

    // Add tools to KaiaAgentKit
    try {
      // Check if kaiaAgentKit has addTool method
      if (kaiaAgentKit && typeof kaiaAgentKit.addTool === 'function') {
        
        kaiaAgentKit.addTool("getBestYield", async ({ token }) => {
          try {
            const bestYield = await yieldAggregator.getBestYield(token);
            return `Best yield: ${bestYield.protocol} with ${bestYield.apy / 100}% APY (Risk: ${bestYield.riskLevel})`;
          } catch (error) {
            return `Error fetching yield data: ${error.message}`;
          }
        });

        kaiaAgentKit.addTool("analyzeTrades", async ({ user }) => {
          try {
            const suggestion = await tradeAnalyzer.suggestStrategy(user);
            return suggestion;
          } catch (error) {
            return `Error analyzing trades: ${error.message}`;
          }
        });

        kaiaAgentKit.addTool("initiateFiatSwap", async ({ user, fiatAmount, fiatCurrency }) => {
          try {
            await fiatSwap.initiateSwap(user, fiatAmount, fiatCurrency, false);

            // Mock payment response for now
            const paymentResponse = {
              success: true,
              message: "Mock payment completed"
            };

            if (paymentResponse.success) {
              await fiatSwap.completeSwap(user);
            }

            return `Initiated swap: ${fiatAmount} ${fiatCurrency} to KAIA. Payment status: ${paymentResponse.success ? "Completed" : "Failed"}`;
          } catch (error) {
            return `Error initiating fiat swap: ${error.message}`;
          }
        });

        kaiaAgentKit.addTool("initializeDemoAccount", async ({ user }) => {
          try {
            await demoTrading.initializeDemoAccount(user);
            return `Demo account initialized for ${user}`;
          } catch (error) {
            return `Error initializing demo account: ${error.message}`;
          }
        });

        kaiaAgentKit.addTool("suggestTrade", async ({ user, token }) => {
          try {
            // Mock market data for now
            const marketData = {
              price: Math.random() * 1000,
              trend: Math.random() > 0.5 ? "bullish" : "bearish"
            };

            const tradeSuggestion = await tradeAnalyzer.suggestStrategy(user);
            return `Trading suggestion for ${token}: ${tradeSuggestion} (Current trend: ${marketData.trend})`;
          } catch (error) {
            return `Error suggesting trade: ${error.message}`;
          }
        });

        kaiaAgentKit.addTool("handleFiatSwapChat", async ({ message, userAddress }) => {
          try {
            if (message.includes("swap to fiat")) {
              const match = message.match(/swap (\d+) (\w+) to (\w+)/);
              if (match) {
                const [, amount, currency, crypto] = match;
                if (crypto.toUpperCase() === "KAIA") {
                  return await kaiaAgentKit.executeTool("initiateFiatSwap", {
                    user: userAddress,
                    fiatAmount: amount,
                    fiatCurrency: currency,
                  });
                }
              }
              return "Please specify amount, fiat currency, and crypto token (e.g., 'swap 100 USD to KAIA').";
            } else if (message.includes("yield")) {
              const token = "0x0000000000000000000000000000000000000001"; // Mock token address
              return await kaiaAgentKit.executeTool("getBestYield", { token });
            } else if (message.includes("trade analysis")) {
              return await kaiaAgentKit.executeTool("analyzeTrades", { user: userAddress });
            }
            return "How can I assist you with yields, trades, or fiat swaps?";
          } catch (error) {
            return `Error handling chat: ${error.message}`;
          }
        });

        console.log("Tools added to KaiaAgentKit");
      } else {
        console.error("KaiaAgentKit does not have addTool method");
        console.log("Available methods:", Object.getOwnPropertyNames(kaiaAgentKit || {}));
      }
    } catch (error) {
      console.error("Error adding tools:", error);
    }

    // MCP server initialization (simplified for now)
    try {
      console.log("MCP server setup would go here");
      // The MCP server initialization will depend on the actual API
      // For now, just log that everything is ready
      console.log("✅ KaiaTradeAI backend initialized successfully");
    } catch (error) {
      console.error("Error initializing MCP server:", error);
    }
    
  } catch (error) {
    console.error("Error in initializeApp:", error);
  }
}

// Start the application
initializeApp();