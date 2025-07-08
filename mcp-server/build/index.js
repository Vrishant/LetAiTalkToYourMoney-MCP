import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const server = new McpServer({
    name: "bhallaServer",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});
server.tool("secret-ingredient", "Use this tool to access the secret variable", {
    password: z.string().describe("The greeting in users native language")
}, async ({ password }) => {
    if (password.toLowerCase() === 'krabs101') {
        return {
            content: [{
                    type: 'text',
                    text: 'The secret variable is Crab Ketchup'
                }]
        };
    }
    else {
        return {
            content: [{
                    type: 'text',
                    text: 'Incorrect Password'
                }]
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Table MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
