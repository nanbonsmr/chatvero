 import { useParams } from "react-router-dom";
 import DashboardLayout from "@/components/DashboardLayout";
 import { ChannelsTab } from "@/components/chatbot/ChannelsTab";
 
 export default function ChatbotChannels() {
   const { id } = useParams<{ id: string }>();
 
   if (!id) {
     return (
       <DashboardLayout>
         <div className="p-6">
           <p className="text-muted-foreground">No chatbot selected</p>
         </div>
       </DashboardLayout>
     );
   }
 
   return (
     <DashboardLayout>
       <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
         <ChannelsTab chatbotId={id} />
       </div>
     </DashboardLayout>
   );
 }