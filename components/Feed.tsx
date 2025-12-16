import React, { useState } from 'react';
import { INITIAL_FEED } from '../constants';
import { Heart, MessageCircle, Share2, Leaf } from 'lucide-react';

const Feed: React.FC = () => {
  const [feed] = useState(INITIAL_FEED);

  return (
    <div className="space-y-4 pb-24">
      <div className="flex justify-between items-center px-2">
        <h3 className="font-bold text-lg text-gray-800">Community Feed</h3>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Live Updates</span>
      </div>

      {feed.map((item) => (
        <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center text-emerald-700 font-bold">
              {item.user.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-sm text-gray-800">{item.user}</p>
              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
                <span className="text-emerald-500 font-medium">{item.action.replace('_', ' ')}</span>
              </p>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3 leading-relaxed">{item.description}</p>
          
          {item.imageUrl && (
            <div className="mb-3 rounded-xl overflow-hidden">
              <img src={item.imageUrl} alt="Feed content" className="w-full h-48 object-cover" />
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <button className="flex items-center gap-1 text-gray-400 text-xs font-medium hover:text-rose-500 transition-colors">
              <Heart size={16} /> {item.likes}
            </button>
            <button className="flex items-center gap-1 text-gray-400 text-xs font-medium hover:text-blue-500 transition-colors">
              <MessageCircle size={16} /> Comment
            </button>
            <button className="flex items-center gap-1 text-gray-400 text-xs font-medium">
              <Share2 size={16} /> Share
            </button>
          </div>
        </div>
      ))}

      {/* Sustainability Tip Card */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <Leaf className="absolute -bottom-4 -right-4 text-white/20 w-32 h-32" />
        <h4 className="font-bold mb-1 relative z-10">Did you know?</h4>
        <p className="text-sm text-blue-100 relative z-10">Recycling one aluminum can saves enough energy to run a TV for 3 hours!</p>
      </div>
    </div>
  );
};

export default Feed;