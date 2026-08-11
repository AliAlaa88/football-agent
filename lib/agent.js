import { getChatCompletion } from './groq.js';
import { toolsSchema, executeTool } from './tools.js';
import { getChatHistory, insertChatMessage } from './supabase.js';
const SYSTEM_PROMPT = `You are a helpful assistant. You have access to tools. 
Use the 'query_docs' tool to find answers in the internal database. ALWAYS trust the internal database over web search or your own knowledge.
Use the 'search_news' tool to find answers on the web only if the database has no answer.
Use 'search_players', 'get_player_profile', and 'get_player_stats' to retrieve live data and statistics about football players from Transfermarkt. Usually you should search for the player first to get their ID, then query their profile or stats.
CRITICAL: Never output raw function tags like <function=query_docs> in your text. You must use the provided JSON tool calling API.`;
export async function runAgentLoop(chatId, userMessage, baseUrl) {
  const previousMessages = await getChatHistory(chatId, 6);
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...previousMessages.map(msg => ({ role: msg.role, content: msg.content })),
    { role: "user", content: userMessage }
  ];
  await insertChatMessage(chatId, "user", userMessage);
  let iterations = 0;
  const MAX_ITERATIONS = 5;
  const toolsUsed = [];
  while (iterations < MAX_ITERATIONS) {
    console.log(`\n--- Agent Loop Iteration ${iterations + 1} ---`);
    const completion = await getChatCompletion(messages, toolsSchema);
    const responseMessage = completion.choices[0].message;
    
    // Fallback: manually parse hallucinated raw function outputs (e.g. =function=search_players[]{"player_name": "..."}</function>)
    if (responseMessage.content && responseMessage.content.includes('function=')) {
      const match = responseMessage.content.match(/(?:<|=)?function[=(]([a-zA-Z0-9_]+)[)\]>\[]*(.*?)(?:<\/function>|$)/);
      if (match) {
        const functionName = match[1];
        const args = match[2].trim() || "{}";
        responseMessage.tool_calls = [{
          id: "call_" + Math.random().toString(36).substring(7),
          type: "function",
          function: { name: functionName, arguments: args }
        }];
        responseMessage.content = "";
      }
    }
    
    messages.push(responseMessage);
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      console.log(`Agent wants to call ${responseMessage.tool_calls.length} tool(s).`);
      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        toolsUsed.push(functionName);
        const args = toolCall.function.arguments ? JSON.parse(toolCall.function.arguments) : {};
        let toolResult;
        try {
          toolResult = await executeTool(functionName, args, baseUrl);
        } catch (error) {
          toolResult = `Error executing tool: ${error.message}`;
        }
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: functionName,
          content: toolResult
        });
      }
    } else {
      console.log("Agent provided a final response.");
      await insertChatMessage(chatId, "assistant", responseMessage.content);
      return { reply: responseMessage.content, toolsUsed: [...new Set(toolsUsed)] };
    }
    iterations++;
  }
  const trace = messages.filter(m => m.role === 'tool').map(m => `${m.name}: ${typeof m.content === 'string' ? m.content.substring(0, 100) : '...'}...`).join('\n');
  const timeoutMsg = `Agent reached maximum iterations without completing the task.\n\nTrace:\n${trace}`;
  await insertChatMessage(chatId, "assistant", timeoutMsg);
  return { reply: timeoutMsg, toolsUsed: [...new Set(toolsUsed)] };
}