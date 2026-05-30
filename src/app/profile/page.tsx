'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  Clock, 
  ShieldCheck, 
  CreditCard, 
  ChevronRight, 
  Camera, 
  X,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { getUserProfile, saveUserProfile, getWatchHistory } from '@/utils/storage';
import { useAccess } from '@/hooks/useAccess';
import ContentRow from '@/components/ContentRow';

const AVATARS = [
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Base1',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Base2',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Base3',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Base4',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Base5',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Base6',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Base7',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Base8',
];

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { hasAccess, timeFormatted } = useAccess(false, address);
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      const userProfile = getUserProfile(address);
      setProfile(userProfile);
      setTempUsername(userProfile.username);
      
      const userHistory = getWatchHistory(address);
      setHistory(userHistory);
    }
  }, [isConnected, address]);

  const handleSaveProfile = () => {
    if (!address) return;
    const updatedProfile = { ...profile, username: tempUsername };
    saveUserProfile(address, updatedProfile);
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  const handleSelectAvatar = (url: string) => {
    if (!address) return;
    const updatedProfile = { ...profile, avatar: url };
    saveUserProfile(address, updatedProfile);
    setProfile(updatedProfile);
    setShowAvatarPicker(false);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-base-black">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
          <div className="w-20 h-20 bg-base-blue/10 rounded-full flex items-center justify-center mb-6">
            <User size={40} className="text-base-blue" />
          </div>
          <h1 className="text-3xl font-black mb-4">Profile Unavailable</h1>
          <p className="text-gray-400 max-w-md mb-8">
            Please connect your wallet to view and manage your profile, streaming history, and unlimited access status.
          </p>
          <button 
            onClick={() => router.push('/unlock')}
            className="px-8 py-3 bg-base-blue hover:bg-base-blue-hover text-white font-bold rounded-xl transition-all"
          >
            Go to Unlock Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-black text-white pb-20">
      <Header />
      
      <div className="max-w-6xl mx-auto px-6 pt-32">
        {/* Profile Header */}
        <div className="relative p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-zinc-900 to-black border border-white/5 overflow-hidden mb-12 shadow-2xl">
          {/* Decorative background orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-base-blue/10 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-[100px] -ml-32 -mb-32" />

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-10">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-base-blue/20 bg-zinc-800 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={48} className="text-gray-600" />
                  </div>
                )}
              </div>
              <button 
                onClick={() => setShowAvatarPicker(true)}
                className="absolute bottom-2 right-2 p-3 bg-base-blue hover:bg-base-blue-hover text-white rounded-2xl shadow-xl transition-all scale-0 group-hover:scale-100 duration-300"
              >
                <Camera size={18} />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left pt-2">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                {isEditing ? (
                  <div className="flex items-center gap-3">
                    <input 
                      type="text" 
                      value={tempUsername}
                      onChange={(e) => setTempUsername(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-base-blue transition-all"
                      autoFocus
                    />
                    <button 
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-base-blue rounded-xl text-sm font-bold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <h1 className="text-4xl font-black tracking-tight">{profile?.username || 'Base User'}</h1>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-gray-500 hover:text-white transition-colors"
                    >
                      <Settings size={18} />
                    </button>
                  </div>
                )}
                
                {hasAccess ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider mx-auto md:mx-0">
                    <ShieldCheck size={12} />
                    Unlimited Access Active
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-xs font-bold uppercase tracking-wider mx-auto md:mx-0">
                    <AlertCircle size={12} />
                    Limited Mode
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-gray-400 font-medium">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-base-blue" />
                  <span>{balance?.formatted?.slice(0, 6)} {balance?.symbol}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-purple-400" />
                  <span>Joined {new Date(profile?.joinedAt).toLocaleDateString()}</span>
                </div>
                <div className="truncate max-w-[200px] bg-white/5 px-3 py-1 rounded-lg border border-white/5 text-gray-500">
                  {address}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Access Card */}
          <div className="md:col-span-1 p-8 rounded-[2rem] bg-zinc-900/50 border border-white/5">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
               Account Status
            </h3>
            
            <div className="space-y-6">
               <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-gray-400 text-sm mb-1">Time Remaining</p>
                  <p className="text-3xl font-black text-base-blue">{timeFormatted}</p>
               </div>
               
               <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                     <span className="text-gray-500">Service Level</span>
                     <span className="text-white font-bold">{hasAccess ? 'Premium' : 'Guest'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                     <span className="text-gray-500">Network</span>
                     <span className="text-white font-bold">Base Mainnet</span>
                  </div>
               </div>

               <button 
                  onClick={() => router.push('/unlock')}
                  className="w-full py-4 mt-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-3 transition-all font-bold text-sm"
               >
                  Extend Access <ChevronRight size={16} />
               </button>
            </div>
          </div>

          {/* Activity Placeholder / Stats */}
          <div className="md:col-span-2 p-8 rounded-[2rem] bg-zinc-900/50 border border-white/5 flex flex-col">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
               Streaming Activity
            </h3>
            
            <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-50">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Clock size={30} className="text-gray-600" />
               </div>
               <p className="text-gray-400 font-medium text-center max-w-xs">
                  Detailed analytics for your watch sessions will appear here as you stream more content.
               </p>
            </div>
          </div>
        </div>

        {/* Watch History */}
        <div className="mt-16">
          <ContentRow 
            title="Your Watch History"
            items={history}
            loading={false}
          />
        </div>
      </div>

      {/* Avatar Picker Modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-full max-w-xl">
               <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-black">Choose Avatar</h2>
                  <button 
                    onClick={() => setShowAvatarPicker(false)}
                    className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X size={24} />
                  </button>
               </div>
               
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {AVATARS.map((url, i) => (
                    <motion.button
                      key={url}
                      onClick={() => handleSelectAvatar(url)}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="aspect-square rounded-3xl overflow-hidden border-2 border-transparent hover:border-base-blue bg-zinc-900 transition-all p-2"
                    >
                       <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover rounded-2xl" />
                    </motion.button>
                  ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
