# ShadowPay - AI-Powered Debt Elimination Assistant

## Project Overview and Architecture

ShadowPay is an AI-driven system designed to help users optimize their debt repayment strategies using advanced financial tools and intelligent assistance. The system is architected as a modular platform consisting of three main components:

- **MCP Server**: Implements the core logic and tools using the Model Context Protocol (MCP). It exposes various financial tools such as loading user financial data, optimizing debt repayment plans, explaining strategies, warning about leverage risks, and exporting plans.
- **MCP Client**: Acts as an intelligent intermediary that connects to the MCP Server and OpenAI's language models. It manages chat-based interactions, processes user queries, and orchestrates tool usage to provide personalized financial advice.
- **Web Frontend**: Provides a user-friendly chat interface accessible via a web browser. It supports both text and voice input, communicating with the backend Express server that connects to the MCP Client.

The components communicate using the MCP protocol over standard input/output streams, enabling seamless integration and extensibility.

## System Working

1. The **MCP Server** runs with capabilities enabled for resources, tools, and MCP sampling. It hosts a suite of financial tools that perform tasks such as loading loan data, optimizing repayment strategies (using snowball or avalanche methods), generating explanations, risk warnings, and exporting plans.
2. The **MCP Client** connects to the server and OpenAI's API, managing a chat-based conversation with the user. It sends user queries, invokes appropriate tools on the server, and processes the results to generate helpful responses.
3. The **Web Frontend** offers a chat interface where users can type or speak their queries. These queries are sent to the backend Express server, which forwards them to the MCP Client. Responses are displayed in the chat window, including tool usage information.

## MCP Sampling - Enhancing Agent Performance

ShadowPay leverages an advanced technique called **MCP Sampling** to improve the performance and accuracy of its AI agent. MCP Sampling involves selectively sampling and prioritizing relevant model contexts and tool outputs during the agent's decision-making process. This approach allows the agent to focus on the most pertinent information, reduce noise from irrelevant data, and optimize its responses for better financial guidance.

By integrating MCP Sampling, ShadowPay achieves faster convergence on optimal debt strategies, more accurate risk assessments, and enhanced user experience through context-aware assistance.

## Tools Offered and Their Vast Possibilities

ShadowPay's MCP Server offers a rich set of tools designed to empower users in managing their finances effectively:

- **take-financial-data**: Loads user's loan and income data from local assets, enabling personalized analysis.
- **optimize-debt-plan**: Applies proven debt repayment strategies (snowball or avalanche) to optimize loan payoff schedules, minimizing interest and duration.
- **get-explainer**: Provides clear, Gemini-style explanations for recommended strategies, helping users understand the benefits and trade-offs.
- **warn-leverage-risk**: Monitors the user's EMI to income ratio and issues warnings if leverage risks exceed safe thresholds.
- **export-plan**: Allows exporting optimized repayment plans to CSV or PDF formats for offline review and record-keeping.

These tools collectively enable ShadowPay to deliver comprehensive financial advice, tailored repayment plans, and actionable insights, making debt management accessible and effective for users.

## Getting Started

To run ShadowPay locally:

1. Install dependencies in `mcp-server` and `mcp-client-typescript` using `npm install`.
2. Start the MCP Server.
3. Run the MCP Client, connecting it to the server script.
4. Launch the web frontend server in `mcp-web` and open the chat interface in a browser.
5. Interact with ShadowPay via text or voice input to receive personalized debt elimination assistance.

---

ShadowPay combines cutting-edge AI, MCP protocol, and user-centric design to revolutionize personal finance management through intelligent debt optimization.

**Note:** The web server component is planned to be updated to a MERN (MongoDB, Express, React, Node.js) stack in future releases to enhance scalability, maintainability, and user experience.
