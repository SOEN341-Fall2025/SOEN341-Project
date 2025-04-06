import '../style/style.css';
import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, User } from 'lucide-react';

function Exhibit() {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([
    { id: 1, username: "user1", text: "This is so cute!", timestamp: "2025-04-05T21:30:00Z" },
    { id: 2, username: "user2", text: "Love this!", timestamp: "2025-04-05T21:45:00Z" }
  ]);

  const samplePost = {
    username: "alice",
    caption: "love Bubbles!!",
    timestamp: "2025-04-05T21:15:00Z",
    likes: 0,
  };
  const [likes, setLikes] = useState(samplePost.likes || 0);
  const [isLiked, setIsLiked] = useState(false);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    const newComment = {
      id: Date.now(),
      username: "You",
      text: comment,
      timestamp: new Date().toISOString()
    };
    
    setComments([...comments, newComment]);
    setComment("");
  };

  const handleLike = () => {
    setLikes(isLiked ? likes - 1 : likes + 1);
    setIsLiked(!isLiked);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      {/* Left Side - Instagram Post */}
      <div className="instagram-post" style={{
        width: '500px',
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
            
          </div>
          <img 
            src={"https://syipugxeidvveqpbpnum.supabase.co/storage/v1/object/public/exhibituploads//1.png"} 
            alt="Post" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={handleLike}>
                <Heart 
                  size={24} 
                  fill={isLiked ? "red" : "white"} 
                  color={isLiked ? "red" : "currentColor"} 
                />
              </button>
              <MessageCircle size={24} />
              <Send size={24} />
            </div>
            <Bookmark size={24} />
          </div>
          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>
            {likes} likes
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
            {formatDate(samplePost.timestamp)}
          </div>
        </div>
      </div>

      {/* Right Side - Comments Container */}
      <div className="comments-container" style={{
        width: '300px',
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #eee',
          fontWeight: '600'
        }}>
          Comments
        </div>
        
        {/* Comments List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px'
        }}>
          {comments.map(comment => (
            <div key={comment.id} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '8px'
                }}>
                  <User size={12} />
                </div>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>
                  {comment.username}
                </span>
              </div>
              <p style={{ fontSize: '14px', marginLeft: '32px' }}>{comment.text}</p>
              <div style={{ 
                fontSize: '12px', 
                color: '#999',
                marginLeft: '32px',
                marginTop: '4px'
              }}>
                {formatDate(comment.timestamp)}
              </div>
            </div>
          ))}
        </div>

        {/* Comment Input */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #eee'
        }}>
          <form onSubmit={handleAddComment} style={{ display: 'flex' }}>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              style={{
                flex: 1,
                border: '1px solid #ddd',
                borderRadius: '20px',
                padding: '8px 16px',
                outline: 'none',
                fontSize: '14px'
              }}
            />
            <button 
              type="submit"
              disabled={!comment.trim()}
              style={{
                marginLeft: '8px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: comment.trim() ? '#3897f0' : '#ddd',
                color: 'white',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Exhibit;