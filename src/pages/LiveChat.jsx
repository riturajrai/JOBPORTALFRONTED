import { MessageCircle } from "lucide-react";

const LiveChat = () => {
  return (
    <div className="fixed bottom-5 right-5 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg cursor-pointer flex items-center gap-2">
      <MessageCircle size={24} />
      <span>Live Chat</span>
    </div>
  );
};

export default LiveChat;
