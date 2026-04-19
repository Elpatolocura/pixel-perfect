import { mockChatRooms, mockPersonalChats } from '@/data/mockData';
import { MessageCircle, Users, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ChatPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('eventos');
  
  const ChatList = ({ rooms, type }: { rooms: any[], type: 'event' | 'person' }) => (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => navigate(`/chat/${room.id}`)}
          className="w-full flex items-center gap-3.5 bg-card rounded-2xl p-4 border border-border text-left transition-all hover:shadow-lg active:scale-[0.98]"
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
            type === 'event' 
              ? 'bg-primary/5 border-primary/10 text-primary' 
              : 'bg-secondary border-border text-muted-foreground'
          }`}>
            {type === 'event' ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-foreground text-sm truncate">{room.name}</p>
              <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">{room.lastMessageTime}</span>
            </div>
            <div className="flex justify-between items-center mt-0.5">
              <p className="text-xs text-muted-foreground truncate">{room.lastMessage}</p>
              {room.unread > 0 && (
                <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ml-2 flex-shrink-0">
                  {room.unread}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="pb-24 px-5 pt-safe min-h-screen bg-background">
      <div className="pt-6 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Mensajería</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Gestiona todas tus conversaciones</p>
      </div>

      <Tabs defaultValue="eventos" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50 p-1 rounded-2xl h-12">
          <TabsTrigger value="eventos" className="rounded-xl font-bold text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Eventos
          </TabsTrigger>
          <TabsTrigger value="personas" className="rounded-xl font-bold text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Personas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eventos">
          <ChatList rooms={mockChatRooms} type="event" />
        </TabsContent>
        
        <TabsContent value="personas">
          <ChatList rooms={mockPersonalChats} type="person" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatPage;
