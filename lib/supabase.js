import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment.");
}
export const supabase = createClient(supabaseUrl, supabaseKey);
export async function searchDocuments(embedding, matchThreshold = 0.0, matchCount = 10) {
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: matchThreshold,
    match_count: matchCount
  });
  if (error) throw error;
  return data;
}

export async function hybridSearchDocuments(queryText, embedding, matchCount = 15) {
  const { data, error } = await supabase.rpc('hybrid_search', {
    query_text: queryText,
    query_embedding: embedding,
    match_count: matchCount
  });
  if (error) throw error;
  return data;
}

export async function insertDocument(content, embedding, metadata = {}) {
  const { data, error } = await supabase
    .from('documents')
    .insert([
      { content, embedding, metadata }
    ]);
  if (error) {
    console.error("Error inserting document:", error);
    throw error;
  }
  return data;
}
export async function getChatHistory(chatId, limit = 6) {
  const { data, error } = await supabase
    .from('messages')
    .select('role, content')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
  return data.reverse();
}
export async function insertChatMessage(chatId, role, content) {
  const { error } = await supabase
    .from('messages')
    .insert([{ chat_id: chatId, role, content }]);
  if (error) {
    console.error("Error inserting chat message:", error);
  }
}