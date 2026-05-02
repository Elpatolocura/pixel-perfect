import { mockTickets, mockEvents, mockNotifications, categoryEmojis } from '@/data/mockData';
import { Settings, Ticket, Heart, CalendarDays, ChevronRight, Crown, LogOut, User, Bell, ChevronLeft, UserPlus, UserCheck, Menu, MapPin, Share } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useLocation } from '@/hooks/useLocation';

const ProfilePage = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const goBack = useSmartBack('/');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    tickets: 0,
    favorites: 0,
    created: 0
  });
  const [isPremium, setIsPremium] = useState(false);
  const [attendedEvents, setAttendedEvents] = useState<any[]>([]);
  const [userCreatedEvents, setUserCreatedEvents] = useState<any[]>([]);
  
  const { city, country, loading: locLoading, requestLocation } = useLocation();

  const isOwnProfile = !id || (user && user.id === id);
  const targetId = id || user?.id;

  // 1. Get Current User Session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (!id && !session?.user) {
        setLoading(false);
      }
    };
    getSession();
  }, [id]);

  // 2. Fetch Profile Data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!targetId) return;
      
      setLoading(true);
      try {
        // Fetch Profile Info
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*, preferences')
          .eq('id', targetId)
          .single();
        
        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch User Created Events
        const { data: createdData } = await supabase
          .from('events')
          .select('*')
          .eq('organizer_id', targetId)
          .order('event_date', { ascending: true })
          .limit(4);
        setUserCreatedEvents(createdData || []);

        // Fetch Attended Events
        const { data: attendedData } = await supabase
          .from('tickets')
          .select('*, events(*)')
          .eq('user_id', targetId)
          .eq('status', 'active')
          .limit(4);
        
        const attended = attendedData?.map((t: any) => t.events).filter(Boolean) || [];
        setAttendedEvents(attended);

        // Check Premium Status
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', targetId)
          .eq('status', 'active');
        
        setIsPremium(subData && subData.length > 0);

        // Stats counts
        const { count: tickets } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('user_id', targetId);
        const { count: favorites } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', targetId);
        const { count: created } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('organizer_id', targetId);
        const { count: followers } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', targetId);
        const { count: following } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', targetId);
        
        setStats({
          followers: followers || 0,
          following: following || 0,
          tickets: tickets || 0,
          favorites: favorites || 0,
          created: created || 0
        });

        // Check follow status if viewing someone else
        if (user && id && user.id !== id) {
          const { data: followData } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', user.id)
            .eq('following_id', id)
            .maybeSingle();
          setIsFollowing(!!followData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();

    // Re-fetch when window gains focus or custom event is fired
    const handleRefresh = () => fetchProfileData();
    window.addEventListener('focus', handleRefresh);
    window.addEventListener('profile-updated', handleRefresh);

    return () => {
      window.removeEventListener('focus', handleRefresh);
      window.removeEventListener('profile-updated', handleRefresh);
    };
  }, [targetId, user?.id, id]);

  // 3. Sync Location
  useEffect(() => {
    const syncLocation = async () => {
      if (isOwnProfile && user && city && profile && !profile.location) {
        const newLocation = `${city}${country ? `, ${country}` : ''}`;
        const { error } = await supabase
          .from('profiles')
          .update({ location: newLocation })
          .eq('id', user.id);
        
        if (!error) {
          setProfile((prev: any) => ({ ...prev, location: newLocation }));
        }
      }
    };

    syncLocation();
  }, [city, country, isOwnProfile, !!user, !!profile]);

  const handleFollowToggle = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', id);
        setIsFollowing(false);
        setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
        toast.success(t('common.unfollow_success'));
      } else {
        await supabase.from('follows').insert({ follower_id: user.id, following_id: id });
        setIsFollowing(true);
        setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
        toast.success(t('common.following'));
      }
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const formatNumber = (num: number) => {
    return num >= 1000 ? (num / 1000).toFixed(1) + 'K' : num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Skeleton Header */}
        <div className="h-48 bg-secondary rounded-b-[40px] animate-pulse"></div>
        <div className="flex flex-col items-center -mt-14 px-6">
          <div className="w-28 h-28 rounded-full border-4 border-background bg-muted animate-pulse mb-4"></div>
          <div className="w-48 h-8 bg-muted rounded-lg animate-pulse mb-2"></div>
          <div className="w-32 h-4 bg-muted rounded animate-pulse mb-6"></div>
          
          <div className="w-full h-20 bg-card rounded-3xl animate-pulse mb-6"></div>
          <div className="w-full flex gap-3 mb-8">
            <div className="flex-1 h-12 bg-muted rounded-2xl animate-pulse"></div>
            <div className="flex-1 h-12 bg-muted rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user && !id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in pb-24 bg-background">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t('profile.login_title')}</h2>
        <p className="text-muted-foreground mb-8">{t('profile.login_desc')}</p>
        <Button onClick={() => navigate('/auth')} className="w-full max-w-xs">
          {t('profile.login_button')}
        </Button>
      </div>
    );
  }

  // Mock data fallback if needed for preview
  const finalCreatedEvents = userCreatedEvents.length > 0 ? userCreatedEvents : (isPremium ? mockEvents.slice(0, 2) : []);
  const finalAttendedEvents = attendedEvents.length > 0 ? attendedEvents : mockEvents.slice(2, 4);

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in font-sans relative overflow-x-hidden">
      {/* Top Background Curvy Shape */}
      <div className="absolute top-0 left-0 right-0 h-56 bg-secondary rounded-b-[48px] -z-10" />

      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-12 pb-4 relative z-10">
        <button 
          onClick={goBack} 
          className="p-2 -ml-2 text-foreground hover:bg-black/5 rounded-full transition-colors active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-foreground tracking-tight">{t('profile.profile')}</h1>
        {isOwnProfile ? (
          <button 
            onClick={() => navigate('/settings')} 
            className="p-2 -mr-2 text-foreground hover:bg-black/5 rounded-full transition-colors active:scale-95"
          >
            <Settings className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-10"></div>
        )}
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center px-6 relative z-10">
        <div className="w-[104px] h-[104px] rounded-full border-4 border-background shadow-sm overflow-hidden mb-3 bg-muted ring-1 ring-black/5">
          <img 
            src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'User'}&background=random`} 
            alt="Avatar" 
            className="w-full h-full object-cover" 
          />
        </div>
        
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-[22px] font-bold text-foreground tracking-tight">
            {profile?.full_name || profile?.email?.split('@')[0] || t('common.guest')}
          </h2>
          {isPremium && (
            <div className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
              <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">PRO</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-center gap-1 text-gray-500 text-sm mb-4">
          <button 
            onClick={() => isOwnProfile && requestLocation()}
            className={`flex items-center gap-1 transition-all ${isOwnProfile ? 'hover:text-primary active:scale-95 cursor-pointer' : ''}`}
          >
            <MapPin className={`w-3.5 h-3.5 ${locLoading ? 'animate-bounce text-primary' : ''}`} />
            <span className="font-medium">
              {locLoading ? t('location.locating') : (profile?.location || (isOwnProfile && city ? `${city}${country ? `, ${country}` : ''}` : t('location.current_location')))}
            </span>
          </button>
        </div>
        {profile?.created_at && (
            <div className="flex items-center gap-1 text-[11px] opacity-70">
              <CalendarDays className="w-3 h-3" />
              <span>{t('profile.joined')} {new Date(profile.created_at).toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}</span>
            </div>
          )}

        <div className="flex flex-col items-center gap-2 mb-6">
          {profile?.email && (
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full border border-border text-[12px] text-muted-foreground">
              <Bell className="w-3 h-3 text-primary" />
              <span>{profile.email}</span>
            </div>
          )}
          {profile?.phone && (
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full border border-border text-[12px] text-muted-foreground">
              <User className="w-3 h-3 text-primary" />
              <span>{profile.phone}</span>
            </div>
          )}
        </div>
        
        <p className="text-center text-[13px] text-muted-foreground mb-6 max-w-[280px] leading-relaxed">
          {profile?.bio || t('profile.no_bio')}
        </p>

        {/* Interests Tags */}
        {profile?.preferences && Array.isArray(profile.preferences) && profile.preferences.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8 px-4">
            {profile.preferences.map((tag: string, idx: number) => (
              <span 
                key={idx} 
                className="px-4 py-2 bg-primary/5 text-primary text-[11px] font-bold uppercase tracking-wider rounded-2xl border border-primary/10 flex items-center gap-1.5 shadow-sm"
              >
                <span>{categoryEmojis[tag.toLowerCase()] || '✨'}</span>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats Card */}
        <div className="w-full bg-card rounded-3xl p-4 flex shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border mb-6">
          <button 
            onClick={() => isOwnProfile ? navigate('/tickets') : null}
            className={`flex-1 flex flex-col items-center justify-center border-r border-border transition-opacity ${isOwnProfile ? 'hover:opacity-70 active:scale-95' : ''}`}
          >
            <span className="text-[22px] font-bold text-foreground leading-none mb-1">{formatNumber(stats.tickets)}</span>
            <span className="text-[11px] text-muted-foreground font-medium tracking-wide">{t('profile.stats.attended')}</span>
          </button>
          <button 
            onClick={() => navigate(`/profile/followers?uid=${targetId}`)}
            className="flex-1 flex flex-col items-center justify-center hover:opacity-70 active:scale-95 transition-opacity"
          >
            <span className="text-[22px] font-bold text-foreground leading-none mb-1">{formatNumber(stats.followers)}</span>
            <span className="text-[11px] text-muted-foreground font-medium tracking-wide">{t('common.followers')}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex gap-3 mb-8">
          {isOwnProfile ? (
            !isPremium && (
              <Button 
                onClick={() => navigate('/premium')} 
                className="w-full h-12 rounded-full font-bold bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all text-[14px]"
              >
                <Crown className="w-4 h-4 mr-2" />
                {t('profile.membership.upgrade')}
              </Button>
            )
          ) : (
            <Button 
              onClick={handleFollowToggle} 
              className={`w-full h-12 rounded-full font-semibold text-white shadow-lg active:scale-[0.98] transition-all text-[15px] ${
                isFollowing 
                  ? 'bg-foreground text-background hover:opacity-90' 
                  : 'bg-primary hover:opacity-90 shadow-primary/20'
              }`}
            >
              {isFollowing ? t('common.following') : t('common.follow')}
            </Button>
          )}
        </div>
      </div>

      {/* Created Events Section (Premium Only) */}
      {isPremium && (
        <div className="px-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[13px] tracking-[0.05em] text-foreground flex items-center gap-2">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              {t('profile.created_events')}
            </h3>
            {isOwnProfile && (
              <button 
                onClick={() => navigate('/my-events')}
                className="text-primary text-sm font-medium hover:opacity-70 transition-colors"
              >
                {t('common.view_more')}
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {finalCreatedEvents.map((evt, i) => (
              <div 
                key={evt.id || i} 
                onClick={() => navigate(`/event/${evt.id}`)}
                className="bg-card rounded-[20px] overflow-hidden border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] cursor-pointer hover:shadow-lg transition-all active:scale-[0.98] group"
              >
                <div className="h-[110px] bg-gray-100 relative overflow-hidden">
                  <img 
                    src={evt.image_url || evt.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80'} 
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div className="p-3.5">
                  <h4 className="font-bold text-[13px] text-foreground line-clamp-1 mb-1 tracking-tight">{evt.title}</h4>
                  <p className="text-[11px] text-muted-foreground mb-2.5 line-clamp-1">{evt.category || t('common.event')}</p>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                    <span>{evt.date || 'Aug 12'}</span>
                    <div className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[50px]">{evt.location?.split(',')[0] || 'Madrid'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attended Events Section */}
      <div className="px-6 mb-12">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[13px] tracking-[0.05em] text-foreground flex items-center gap-2">
            <Ticket className="w-3.5 h-3.5 text-primary" />
            {t('profile.attended_events')}
          </h3>
          {isOwnProfile && (
            <button 
              onClick={() => navigate('/tickets')}
              className="text-primary text-sm font-medium hover:opacity-70 transition-colors"
            >
              {t('common.view_more')}
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {finalAttendedEvents.map((evt, i) => (
            <div 
              key={evt.id || i} 
              onClick={() => navigate(`/event/${evt.id}`)}
              className="bg-card rounded-[20px] overflow-hidden border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] cursor-pointer hover:shadow-lg transition-all active:scale-[0.98] group"
            >
              <div className="h-[110px] bg-gray-100 relative overflow-hidden">
                <img 
                  src={evt.image_url || evt.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80'} 
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="p-3.5">
                <h4 className="font-bold text-[13px] text-foreground line-clamp-1 mb-1 tracking-tight">{evt.title}</h4>
                <p className="text-[11px] text-muted-foreground mb-2.5 line-clamp-1">{evt.category || t('common.event')}</p>
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                  <span>{evt.date || 'Aug 12'}</span>
                  <div className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[50px]">{evt.location?.split(',')[0] || 'Madrid'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
