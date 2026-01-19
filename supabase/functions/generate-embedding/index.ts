import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple text embedding using character-level hashing
// This creates a 384-dimensional vector that captures text semantics
function generateSimpleEmbedding(text: string): number[] {
  const normalizedText = text.toLowerCase().trim();
  const embedding = new Array(384).fill(0);
  
  // Character n-gram approach for semantic capture
  const ngrams: string[] = [];
  
  // Unigrams (characters)
  for (let i = 0; i < normalizedText.length; i++) {
    ngrams.push(normalizedText[i]);
  }
  
  // Bigrams (2-char sequences)
  for (let i = 0; i < normalizedText.length - 1; i++) {
    ngrams.push(normalizedText.slice(i, i + 2));
  }
  
  // Trigrams (3-char sequences)
  for (let i = 0; i < normalizedText.length - 2; i++) {
    ngrams.push(normalizedText.slice(i, i + 3));
  }
  
  // Word-level features
  const words = normalizedText.split(/\s+/).filter(w => w.length > 0);
  for (const word of words) {
    ngrams.push(`w_${word}`);
    // Word prefixes
    if (word.length > 3) {
      ngrams.push(`p_${word.slice(0, 3)}`);
    }
    // Word suffixes
    if (word.length > 3) {
      ngrams.push(`s_${word.slice(-3)}`);
    }
  }
  
  // Hash each n-gram to multiple positions
  for (const ngram of ngrams) {
    let hash1 = 0;
    let hash2 = 0;
    for (let i = 0; i < ngram.length; i++) {
      hash1 = (hash1 * 31 + ngram.charCodeAt(i)) >>> 0;
      hash2 = (hash2 * 37 + ngram.charCodeAt(i)) >>> 0;
    }
    
    const pos1 = hash1 % 384;
    const pos2 = hash2 % 384;
    const pos3 = (hash1 + hash2) % 384;
    
    embedding[pos1] += 1;
    embedding[pos2] += 0.5;
    embedding[pos3] += 0.25;
  }
  
  // Normalize to unit vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] = embedding[i] / magnitude;
    }
  }
  
  return embedding;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, texts, chunkId, chunkIds } = await req.json();
    
    // Handle single text
    if (text) {
      const embedding = generateSimpleEmbedding(text);
      
      // If chunkId provided, update the database
      if (chunkId) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const { error } = await supabase
          .from("chatbot_chunks")
          .update({ embedding: `[${embedding.join(",")}]` })
          .eq("id", chunkId);
        
        if (error) {
          console.error("Error updating chunk embedding:", error);
          throw error;
        }
      }
      
      return new Response(
        JSON.stringify({ embedding }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Handle batch texts
    if (texts && Array.isArray(texts)) {
      const embeddings = texts.map((t: string) => generateSimpleEmbedding(t));
      
      // If chunkIds provided, update the database in batch
      if (chunkIds && Array.isArray(chunkIds) && chunkIds.length === texts.length) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        for (let i = 0; i < chunkIds.length; i++) {
          const { error } = await supabase
            .from("chatbot_chunks")
            .update({ embedding: `[${embeddings[i].join(",")}]` })
            .eq("id", chunkIds[i]);
          
          if (error) {
            console.error(`Error updating chunk ${chunkIds[i]}:`, error);
          }
        }
      }
      
      return new Response(
        JSON.stringify({ embeddings }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Missing text or texts parameter" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Embedding error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
