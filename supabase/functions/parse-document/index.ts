import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Chunk size for splitting content (roughly 1000 chars per chunk)
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 100;

// Split text into overlapping chunks for better context retrieval
function chunkText(text: string, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  const chunks: string[] = [];
  const cleanText = text.replace(/\s+/g, " ").trim();
  
  if (cleanText.length <= chunkSize) {
    return [cleanText];
  }

  let start = 0;
  while (start < cleanText.length) {
    let end = start + chunkSize;
    
    // Try to break at sentence or word boundary
    if (end < cleanText.length) {
      const lastPeriod = cleanText.lastIndexOf(".", end);
      const lastSpace = cleanText.lastIndexOf(" ", end);
      
      if (lastPeriod > start + chunkSize / 2) {
        end = lastPeriod + 1;
      } else if (lastSpace > start + chunkSize / 2) {
        end = lastSpace;
      }
    }
    
    chunks.push(cleanText.slice(start, end).trim());
    start = end - overlap;
    
    if (start >= cleanText.length) break;
  }
  
  return chunks.filter(chunk => chunk.length > 20);
}

// Extract text from plain text files
function parseTextFile(content: string): string {
  return content;
}

// Extract text from DOCX files (Office Open XML)
async function parseDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(arrayBuffer);
    
    // DOCX files contain document.xml with the main content
    const documentXml = await zipContent.file("word/document.xml")?.async("text");
    
    if (!documentXml) {
      console.log("No document.xml found in DOCX");
      return "";
    }
    
    // Extract text from XML - simple regex approach
    // Remove XML tags and decode entities
    const text = documentXml
      .replace(/<w:p[^>]*>/g, "\n") // Paragraph breaks
      .replace(/<w:br[^>]*>/g, "\n") // Line breaks
      .replace(/<w:tab[^>]*>/g, "\t") // Tabs
      .replace(/<[^>]+>/g, "") // Remove all other tags
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/\n\s*\n/g, "\n\n") // Clean up multiple newlines
      .trim();
    
    return text;
  } catch (err) {
    const error = err as Error;
    console.error("Error parsing DOCX:", error);
    throw new Error(`Failed to parse DOCX: ${error.message}`);
  }
}

// Extract text from PPTX files
async function parsePptx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(arrayBuffer);
    
    const slides: string[] = [];
    
    // Get all slide XML files
    const slideFiles = Object.keys(zipContent.files)
      .filter(name => name.match(/ppt\/slides\/slide\d+\.xml/))
      .sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)/)?.[1] || "0");
        const numB = parseInt(b.match(/slide(\d+)/)?.[1] || "0");
        return numA - numB;
      });
    
    for (const slideFile of slideFiles) {
      const slideXml = await zipContent.file(slideFile)?.async("text");
      if (slideXml) {
        // Extract text from slide XML
        const slideText = slideXml
          .replace(/<a:p[^>]*>/g, "\n")
          .replace(/<a:br[^>]*>/g, "\n")
          .replace(/<[^>]+>/g, "")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .trim();
        
        if (slideText) {
          slides.push(slideText);
        }
      }
    }
    
    return slides.join("\n\n---\n\n");
  } catch (err) {
    const error = err as Error;
    console.error("Error parsing PPTX:", error);
    throw new Error(`Failed to parse PPTX: ${error.message}`);
  }
}

// Extract text from XLSX files
async function parseXlsx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(arrayBuffer);
    
    // Get shared strings (text values are stored here)
    const sharedStringsXml = await zipContent.file("xl/sharedStrings.xml")?.async("text");
    const sharedStrings: string[] = [];
    
    if (sharedStringsXml) {
      const matches = sharedStringsXml.matchAll(/<t[^>]*>([^<]*)<\/t>/g);
      for (const match of matches) {
        sharedStrings.push(match[1]);
      }
    }
    
    // Get sheet data
    const sheets: string[] = [];
    const sheetFiles = Object.keys(zipContent.files)
      .filter(name => name.match(/xl\/worksheets\/sheet\d+\.xml/));
    
    for (const sheetFile of sheetFiles) {
      const sheetXml = await zipContent.file(sheetFile)?.async("text");
      if (sheetXml) {
        // Simple extraction of values
        const values: string[] = [];
        const cellMatches = sheetXml.matchAll(/<v>(\d+)<\/v>/g);
        for (const match of cellMatches) {
          const index = parseInt(match[1]);
          if (sharedStrings[index]) {
            values.push(sharedStrings[index]);
          }
        }
        if (values.length > 0) {
          sheets.push(values.join(" | "));
        }
      }
    }
    
    return sheets.join("\n\n");
  } catch (err) {
    const error = err as Error;
    console.error("Error parsing XLSX:", error);
    throw new Error(`Failed to parse XLSX: ${error.message}`);
  }
}

// Simple PDF text extraction (basic approach - works for text-based PDFs)
async function parsePdf(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const decoder = new TextDecoder("utf-8", { fatal: false });
    const pdfContent = decoder.decode(arrayBuffer);
    
    // Extract text streams from PDF
    const textParts: string[] = [];
    
    // Match text in parentheses (common PDF text encoding)
    const textMatches = pdfContent.matchAll(/\(([^)]+)\)/g);
    for (const match of textMatches) {
      const text = match[1]
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "")
        .replace(/\\t/g, "\t")
        .replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")")
        .replace(/\\\\/g, "\\");
      
      if (text.length > 1 && !/^[\x00-\x1F]+$/.test(text)) {
        textParts.push(text);
      }
    }
    
    // Also try to find BT...ET text blocks with Tj/TJ operators
    const btMatches = pdfContent.matchAll(/BT\s*([\s\S]*?)\s*ET/g);
    for (const match of btMatches) {
      const blockContent = match[1];
      const tjMatches = blockContent.matchAll(/\(([^)]*)\)\s*Tj/g);
      for (const tjMatch of tjMatches) {
        textParts.push(tjMatch[1]);
      }
    }
    
    const extractedText = textParts
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    
    if (extractedText.length < 50) {
      console.log("PDF might be image-based or encrypted - limited text extracted");
    }
    
    return extractedText;
  } catch (err) {
    const error = err as Error;
    console.error("Error parsing PDF:", error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client for storage access
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { documentId, chatbotId } = await req.json();
    
    if (!documentId || !chatbotId) {
      return new Response(
        JSON.stringify({ error: "documentId and chatbotId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Parsing document: ${documentId} for chatbot: ${chatbotId}`);

    // Get document info
    const { data: document, error: docError } = await supabase
      .from("chatbot_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docError || !document) {
      console.error("Document not found:", docError);
      return new Response(
        JSON.stringify({ error: "Document not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update status to processing
    await supabase
      .from("chatbot_documents")
      .update({ status: "processing" })
      .eq("id", documentId);

    console.log(`Downloading file: ${document.file_path}`);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("chatbot-documents")
      .download(document.file_path);

    if (downloadError || !fileData) {
      console.error("Failed to download file:", downloadError);
      await supabase
        .from("chatbot_documents")
        .update({ status: "error" })
        .eq("id", documentId);
      
      return new Response(
        JSON.stringify({ error: "Failed to download file" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`File downloaded, type: ${document.file_type}, size: ${fileData.size}`);

    // Parse based on file type
    let extractedText = "";
    const fileType = document.file_type.toLowerCase();
    const arrayBuffer = await fileData.arrayBuffer();

    try {
      if (fileType === "application/pdf") {
        extractedText = await parsePdf(arrayBuffer);
      } else if (
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileType === "application/msword"
      ) {
        extractedText = await parseDocx(arrayBuffer);
      } else if (
        fileType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
        fileType === "application/vnd.ms-powerpoint"
      ) {
        extractedText = await parsePptx(arrayBuffer);
      } else if (
        fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        fileType === "application/vnd.ms-excel"
      ) {
        extractedText = await parseXlsx(arrayBuffer);
      } else if (fileType === "text/plain") {
        const decoder = new TextDecoder("utf-8");
        extractedText = parseTextFile(decoder.decode(arrayBuffer));
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      console.log(`Extracted ${extractedText.length} characters from document`);

      if (extractedText.length < 10) {
        console.warn("Very little text extracted - file may be image-based or empty");
      }

      // Split into chunks
      const chunks = chunkText(extractedText);
      console.log(`Created ${chunks.length} chunks`);

      // Delete any existing chunks for this document
      await supabase
        .from("chatbot_chunks")
        .delete()
        .eq("document_id", documentId);

      // Insert chunks
      const insertedChunkIds: string[] = [];
      if (chunks.length > 0) {
        const chunkRecords = chunks.map((content, index) => ({
          chatbot_id: chatbotId,
          document_id: documentId,
          source_type: "document",
          content,
          chunk_index: index,
          metadata: {
            file_name: document.file_name,
            file_type: document.file_type,
            total_chunks: chunks.length,
          },
        }));

        const { data: insertedChunks, error: insertError } = await supabase
          .from("chatbot_chunks")
          .insert(chunkRecords)
          .select("id");

        if (insertError) {
          console.error("Failed to insert chunks:", insertError);
          throw new Error(`Failed to save chunks: ${insertError.message}`);
        }

        if (insertedChunks) {
          insertedChunkIds.push(...insertedChunks.map(c => c.id));
        }
      }

      // Generate embeddings for all chunks
      if (insertedChunkIds.length > 0) {
        console.log(`Generating embeddings for ${insertedChunkIds.length} chunks...`);
        
        try {
          // Call the generate-embedding function in batches
          const batchSize = 10;
          for (let i = 0; i < chunks.length; i += batchSize) {
            const batchChunks = chunks.slice(i, i + batchSize);
            const batchIds = insertedChunkIds.slice(i, i + batchSize);
            
            const { error: embeddingError } = await supabase.functions.invoke("generate-embedding", {
              body: { texts: batchChunks, chunkIds: batchIds },
            });
            
            if (embeddingError) {
              console.error(`Embedding error for batch ${i}:`, embeddingError);
            }
          }
          console.log("Embeddings generated successfully");
        } catch (embErr) {
          console.error("Failed to generate embeddings:", embErr);
          // Don't fail the whole operation - chunks are still useful for keyword search
        }
      }

      // Update document status to completed
      await supabase
        .from("chatbot_documents")
        .update({ status: "completed" })
        .eq("id", documentId);

      console.log(`Document ${documentId} parsed successfully`);

      return new Response(
        JSON.stringify({
          success: true,
          documentId,
          chunksCreated: chunks.length,
          totalCharacters: extractedText.length,
          embeddingsGenerated: insertedChunkIds.length,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (parseErr) {
      const parseError = parseErr as Error;
      console.error("Parse error:", parseError);
      
      await supabase
        .from("chatbot_documents")
        .update({ status: "error" })
        .eq("id", documentId);

      return new Response(
        JSON.stringify({ error: `Failed to parse document: ${parseError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    const error = err as Error;
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});