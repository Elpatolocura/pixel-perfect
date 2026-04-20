import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationManager = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let channel: any;

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`user-notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newNotif = payload.new;
            
            // Show real-time toast
            toast(newNotif.title, {
              description: newNotif.message,
              icon: <Bell className="w-4 h-4 text-primary" />,
              action: newNotif.action_url ? {
                label: 'Ver',
                onClick: () => navigate(newNotif.action_url)
              } : undefined,
              duration: 5000,
            });
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [navigate]);

  return null; // This component only handles logic
};

export default NotificationManager;
