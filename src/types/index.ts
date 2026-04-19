export type EventCategory = 'música' | 'arte' | 'gastronomía' | 'deportes' | 'tech' | 'cultura' | 'fiesta' | 'bienestar';

export interface EventData {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  time: string;
  event_date?: string;
  event_time?: string;
  location: string;
  price: number;
  currency: string;
  image: string;
  image_url?: string;
  emoji: string;
  organizer: {
    id: string;
    name: string;
    avatar: string;
  };
  attendees: number;
  attendees_count?: number;
  maxAttendees: number;
  isFavorite: boolean;
  tags: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'organizer' | 'user' | 'premium';
  preferences: EventCategory[];
  ticketCount: number;
  eventsCreated: number;
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  purchaseDate: string;
  quantity: number;
  status: 'active' | 'used' | 'cancelled';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  eventId?: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  participants: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'event' | 'ticket' | 'chat' | 'system';
  read: boolean;
  timestamp: string;
}
