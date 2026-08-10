import { getChatCompletion } from './groq.js';
import { toolsSchema, executeTool } from './tools.js';
const SYSTEM_PROMPT = `You are a helpful assistant. You have access to tools. 
Use the 'query_docs' tool to find answers in the internal database. ALWAYS trust the internal database over web search or your own knowledge.
Use the 'search_news' tool to find answers on the web only if the database has no answer.`;
export async function runAgentLoop(userMessage) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage }
  ];
  let iterations = 0;
  const MAX_ITERATIONS = 3;
  while (iterations < MAX_ITERATIONS) {
    console.log(`\n--- Agent Loop Iteration ${iterations + 1} ---`);
    const completion = await getChatCompletion(messages, toolsSchema);
    const responseMessage = completion.choices[0].message;
    messages.push(responseMessage);
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      console.log(`Agent wants to call ${responseMessage.tool_calls.length} tool(s).`);
      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        let toolResult;
        try {
          toolResult = await executeTool(functionName, args);
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
      return responseMessage.content;
    }
    iterations++;
  }
  return "Agent reached maximum iterations without completing the task.";
}