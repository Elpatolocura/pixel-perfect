import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, UserPlus, UserCheck, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  role: string;
}

const FollowsPage = () => {
  const { type } = useParams<{ type: 'followers' | 'following' }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get('uid');
  
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  const [targetProfile, setTargetProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user ?? null);
      
      const targetUid = uid || session?.user?.id;
      
      if (targetUid) {
        if (targetUid !== session?.user?.id) {
          fetchTargetProfile(targetUid);
        }
        await fetchFollowingIds(session?.user?.id);
        await fetchData(targetUid);
      } else {
        navigate('/auth');
      }
    };
    init();
  }, [type, uid]);

  const fetchTargetProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();
    if (data) setTargetProfile(data);
  };

  const fetchFollowingIds = async (userId: string | undefined) => {
    if (!userId) return;
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);
    
    if (data) {
      setFollowingIds(new Set(data.map(f => f.following_id)));
    }
  };

  const fetchData = async (userId: string) => {
    setLoading(true);
    try {
      let query;
      if (type === 'followers') {
        // People following ME
        query = supabase
          .from('follows')
          .select('follower_id, profiles!follows_follower_id_fkey(*)')
          .eq('following_id', userId);
      } else {
        // People I am following
        query = supabase
          .from('follows')
          .select('following_id, profiles!follows_following_id_fkey(*)')
          .eq('follower_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedUsers = data.map((item: any) => 
        type === 'followers' ? item.profiles : item.profiles
      ).filter(Boolean);

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching follows:', error);
      toast.error('Error al cargar la lista');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (targetUserId: string) => {
    if (!currentUser) return;

    const isFollowing = followingIds.has(targetUserId);

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', targetUserId);

        if (error) throw error;
        
        setFollowingIds(prev => {
          const next = new Set(prev);
          next.delete(targetUserId);
          return next;
        });
        toast.success('Dejaste de seguir');
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: targetUserId
          });

        if (error) throw error;

        setFollowingIds(prev => new Set(prev).add(targetUserId));
        toast.success('Siguiendo');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Error al procesar la solicitud');
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-secondary rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold capitalize leading-none">
            {type === 'followers' ? 'Seguidores' : 'Siguiendo'}
          </h1>
          {targetProfile && (
            <p className="text-xs text-muted-foreground mt-1">
              de {targetProfile.full_name}
            </p>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar personas..." 
            className="pl-10 h-11 bg-secondary/50 border-none rounded-2xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="px-4">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-secondary" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-secondary rounded" />
                  <div className="h-3 w-24 bg-secondary rounded" />
                </div>
                <div className="w-20 h-8 bg-secondary rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="space-y-2">
            {filteredUsers.map((profile) => (
              <div 
                key={profile.id}
                className="flex items-center gap-3 p-2 hover:bg-secondary/30 rounded-2xl transition-colors group"
              >
                <div 
                  onClick={() => navigate(`/profile/u/${profile.id}`)}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 overflow-hidden flex items-center justify-center cursor-pointer"
                >
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name || ''} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-primary/40" />
                  )}
                </div>
                
                <div 
                  onClick={() => navigate(`/profile/u/${profile.id}`)}
                  className="flex-1 cursor-pointer"
                >
                  <h3 className="font-semibold text-sm">
                    {profile.full_name || profile.email?.split('@')[0]}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {profile.email}
                  </p>
                </div>

                {currentUser && currentUser.id !== profile.id && (
                  <Button
                    size="sm"
                    variant={followingIds.has(profile.id) ? "secondary" : "default"}
                    className={`h-9 px-4 rounded-xl font-bold text-xs transition-all ${
                      followingIds.has(profile.id) 
                        ? 'bg-secondary text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20' 
                        : 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    }`}
                    onClick={() => handleFollowToggle(profile.id)}
                  >
                    {followingIds.has(profile.id) ? (
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5" /> Siguiendo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <UserPlus className="w-3.5 h-3.5" /> Seguir
                      </span>
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-lg">No hay resultados</h3>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              {searchQuery ? 'Prueba con otra búsqueda' : `Aún no tienes ${type === 'followers' ? 'seguidores' : 'personas a las que sigas'}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowsPage;
