import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import { z } from 'zod';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const server = new McpServer({
  name: "bhallaServer",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
    sampling: true
  },
});

//Sample Server Tool
// server.tool(
//   "secret-ingredient",
//   "Use this tool to access the secret variable",
//   {
//     password: z.string().describe("The greeting in users native language")
//   },
//   async({ password }) => {
//     const toolInfo = `[Tool: secret-ingredient ${JSON.stringify({ password })}]`;

//     if(password.toLowerCase() === 'krabs101'){
//       return{
//         content: [
//           { type: 'text', text: toolInfo },
//           { type: 'text', text: 'The secret variable is Crab Ketchup' }
//         ]
//       }
//     }else{
//       return{
//         content: [
//           { type: 'text', text: toolInfo },
//           { type: 'text', text: 'Incorrect Password' }
//         ]
//       };
//     }
//   }
// );

server.tool(
  "take-financial-data",
  "Load user's loan and income data from the local assets folder.",
  {},
  async () => {
    try {
      const filePath = path.resolve(__dirname, "../assets/user123_loans.json");
      const fileContent = await fs.readFile(filePath, "utf-8");
      const jsonData = JSON.stringify(fileContent);

      return {
        content: [
          { type: "text", text: `[Tool: take-financial-data]` },
          { type: "text", text: jsonData },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          { type: "text", text: `❌ Failed to load financial data.` },
          { type: "text", text: `Details: ${err.message || err}` },
        ],
      };
    }
  }
);

server.tool(
  "optimize-debt-plan",
  "Optimize debt using snowball or avalanche method.",
  {
    strategy: z.enum(["snowball", "avalanche"]),
    data: z.array(
      z.object({
        loanId: z.string(),
        principal: z.number(),
        interestRate: z.number(),
        emi: z.number()
      })
    )
  },
  async ({ strategy, data }) => {
    const loans = [...data];
    loans.sort((a, b) =>
      strategy === "avalanche" ? b.interestRate - a.interestRate : a.principal - b.principal
    );

    let months = 0, totalInterest = 0;
    while (loans.length > 0 && months < 360) {
      months++;
      const loan = loans[0];
      const interest = (loan.interestRate / 12 / 100) * loan.principal;
      loan.principal -= (loan.emi - interest);
      totalInterest += interest;
      if (loan.principal <= 0) loans.shift();
    }

    return {
      content: [{type: "text", text: `Paid off in ${months} months. Interest paid: ₹${totalInterest.toFixed(2)}`}],
    };
  }
);


server.tool(
  "get-explainer",
  "Returns a Gemini-style explanation for the recommended strategy.",
  {
    strategy: z.enum(["snowball", "avalanche"]),
    interestSaved: z.number().describe("Amount of interest saved by using this strategy"),
  },
  async ({ strategy, interestSaved }) => {
    const message =
      strategy === "avalanche"
        ? `By paying high-interest loans first, you save ₹${interestSaved} in total.`
        : `Snowball gives faster wins. It saves ₹${interestSaved} but boosts morale early.`;

    return {
      content: [
        { type: "text", text: `[Tool: get-explainer for ${strategy}]` },
        { type: "text", text: message },
      ],
    };
  }
);

server.tool(
  "warn-leverage-risk",
  "Warn the user if their EMI exceeds a healthy % of their income.",
  {
    monthlyIncome: z.number(),
    totalEMI: z.number(),
  },
  async ({ monthlyIncome, totalEMI }) => {
    const ratio = (totalEMI / monthlyIncome) * 100;
    let status = "✅ You're within safe limits.";
    if (ratio > 50) status = "⚠️ Critical: Your EMI exceeds 50% of your income.";
    else if (ratio > 35) status = "⚠️ Caution: EMI is over 35%, consider revising.";

    return {
      content: [
        { type: "text", text: `[Tool: warn-leverage-risk]` },
        { type: "text", text: `EMI to Income Ratio: ${ratio.toFixed(2)}%` },
        { type: "text", text: status },
      ],
    };
  }
);

server.tool(
  "export-plan",
  "Export the user's plan to a file format (CSV/PDF).",
  {
    format: z.enum(["csv", "pdf"]),
    planData: z.any().describe("Optimized EMI plan data"),
    filename: z.string().describe("Output filename like 'myplan.csv'"),
  },
  async ({ format, planData, filename }) => {
    const fs = await import("fs/promises");
    const path = `./exports/${filename}`;

    try {
      const content = format === "csv"
        ? planData.map((e: any) => `${e.month},${e.emi}`).join("\n")
        : JSON.stringify(planData, null, 2); // PDF: You'd integrate a lib like `pdfkit` later

      await fs.writeFile(path, content, "utf-8");

      return {
        content: [
          { type: "text", text: `[Tool: export-plan to ${filename}]` },
          { type: "text", text: `Plan saved successfully to ${path}` },
        ],
      };
    } catch (err) {
      return {
        content: [
          { type: "text", text: `Failed to export plan.` },
          { type: "text", text: `Error: ${err}` },
        ],
      };
    }
  }
);


async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Table MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
