import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment.");
}
export const supabase = createClient(supabaseUrl, supabaseKey);
export async function searchDocuments(queryEmbedding, matchThreshold = 0.78, matchCount = 5) {
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });
  if (error) {
    console.error("Error querying vector database:", error);
    throw error;
  }
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