import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Document {
  id: string;
  chatbot_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  status: string;
  created_at: string;
}

export function useDocuments(chatbotId: string | undefined) {
  return useQuery<Document[]>({
    queryKey: ["documents", chatbotId],
    queryFn: async () => {
      if (!chatbotId) return [];
      const { data, error } = await supabase
        .from("chatbot_documents")
        .select("*")
        .eq("chatbot_id", chatbotId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!chatbotId,
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, chatbotId }: { documentId: string; chatbotId: string }) => {
      // First delete related chunks
      const { error: chunksError } = await supabase
        .from("chatbot_chunks")
        .delete()
        .eq("document_id", documentId);

      if (chunksError) throw chunksError;

      // Get document file path to delete from storage
      const { data: doc } = await supabase
        .from("chatbot_documents")
        .select("file_path")
        .eq("id", documentId)
        .single();

      // Delete from storage
      if (doc?.file_path) {
        await supabase.storage.from("chatbot-documents").remove([doc.file_path]);
      }

      // Delete document record
      const { error: docError } = await supabase
        .from("chatbot_documents")
        .delete()
        .eq("id", documentId);

      if (docError) throw docError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents", variables.chatbotId] });
    },
  });
}

export function useReprocessDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, chatbotId }: { documentId: string; chatbotId: string }) => {
      // Update status to processing
      await supabase
        .from("chatbot_documents")
        .update({ status: "processing" })
        .eq("id", documentId);

      // Call the parse-document edge function
      const { error } = await supabase.functions.invoke("parse-document", {
        body: { documentId, chatbotId },
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents", variables.chatbotId] });
    },
  });
}
