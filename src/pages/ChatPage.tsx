import { mockChatRooms } from '@/data/mockData';
import { MessageCircle } from 'lucide-react';

const ChatPage = () => {
  return (
    <div className="pb-24 px-5 pt-safe">
      <div className="pt-6 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Chats</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Tus conversaciones de eventos</p>
      </div>

      <div className="space-y-3">
        {mockChatRooms.map((room) => (
          <button
            key={room.id}
            className="w-full flex items-center gap-3.5 bg-card rounded-2xl p-4 border border-border text-left transition-shadow hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-foreground text-sm truncate">{room.name}</p>
                <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{room.lastMessageTime}</span>
              </div>
              <div className="flex justify-between items-center mt-0.5">
                <p className="text-xs text-muted-foreground truncate">{room.lastMessage}</p>
                {room.unread > 0 && (
                  <span className="bg-foreground text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ml-2 flex-shrink-0">
                    {room.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatPage;
