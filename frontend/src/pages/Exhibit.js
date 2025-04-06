import '../style/style.css';
import React from 'react';
import { Heart, MessageCircle, Send, Bookmark, User } from 'lucide-react';

function Exhibit() {
  const samplePost = {
    username: "alice",
    caption: "love Bubbles!!",
    timestamp: "2025-04-05T21:15:00Z",
    likes: 0,
  };

  return (
    <div className="posts-container" style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '40px',
      width: '100%',
      padding: '20px',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }}>
      {/* First Post */}
      <div className="instagram-post" style={{
        width: '300px',
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div className="flex items-center p-4">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
            <User size={16} />
          </div>
          <span className="font-semibold text-sm">{samplePost.username}</span>
        </div>

        <div style={{
          width: '100%',
          aspectRatio: '1',
          backgroundColor: '#f0f0f0',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            gap: '8px'
          }}>
            <span>○</span>
            <span>D</span>
            <span>✅</span>
          </div>
          <div>Post Image</div>
        </div>

        <div className="p-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button><Heart size={24} /></button>
              <MessageCircle size={24} />
              <Send size={24} />
            </div>
            <Bookmark size={24} />
          </div>
          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>
            {samplePost.likes} likes
          </div>
        </div>

        <div style={{ padding: '0 16px 16px 16px' }}>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontWeight: '600', fontSize: '14px', marginRight: '8px' }}>
              {samplePost.username}
            </span>
            <span style={{ fontSize: '14px' }}>{samplePost.caption}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {new Date(samplePost.timestamp).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>

      {/* Second Post */}
      <div className="instagram-post" style={{
        width: '300px',
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        {/* Same content as first post */}
        <div className="flex items-center p-4">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
            <User size={16} />
          </div>
          <span className="font-semibold text-sm">{samplePost.username}</span>
        </div>

        <div style={{
          width: '100%',
          aspectRatio: '1',
          backgroundColor: '#f0f0f0',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            gap: '8px'
          }}>
            <span>○</span>
            <span>D</span>
            <span>✅</span>
          </div>
          <div>Post Image</div>
        </div>

        <div className="p-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button><Heart size={24} /></button>
              <MessageCircle size={24} />
              <Send size={24} />
            </div>
            <Bookmark size={24} />
          </div>
          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>
            {samplePost.likes} likes
          </div>
        </div>

        <div style={{ padding: '0 16px 16px 16px' }}>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontWeight: '600', fontSize: '14px', marginRight: '8px' }}>
              {samplePost.username}
            </span>
            <span style={{ fontSize: '14px' }}>{samplePost.caption}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {new Date(samplePost.timestamp).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Exhibit;