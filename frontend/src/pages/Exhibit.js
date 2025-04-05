import '../style/style.css';
import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, User } from 'lucide-react';
import backImage from '../assets/background.png';


function Exhibit({ user, post }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [likes, setLikes] = useState(post.likes || 0);
  const [isLiked, setIsLiked] = useState(false);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setComments([...comments, {
      id: Date.now(),
      username: user.username,
      text: comment,
      timestamp: new Date().toISOString()
    }]);
    setComment("");
  };

  const handleLike = () => {
    setLikes(isLiked ? likes - 1 : likes + 1);
    setIsLiked(!isLiked);
  };

  // Format date as "Month Day, Year at Time"
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  return (
    <div className="instagram-post bg-white border border-gray-200 rounded-sm max-w-md mx-auto mb-8">
      {/* Post Header */}
      <div className="flex items-center p-4">
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
          <User size={16} />
        </div>
        <span className="font-semibold text-sm">{post.username}</span>
      </div>

      {/* Post Image */}
      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
        <img 
          src={"backImage"} 
          alt="Post" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex justify-between mb-2">
          <div className="flex space-x-4">
            <button onClick={handleLike}>
              <Heart 
                size={24} 
                fill={isLiked ? "red" : "none"} 
                color={isLiked ? "red" : "currentColor"} 
              />
            </button>
            <MessageCircle size={24} />
            <Send size={24} />
          </div>
          <Bookmark size={24} />
        </div>
        <div className="font-semibold text-sm mb-1">{likes} likes</div>
      </div>

      {/* Caption & Comments */}
      <div className="px-4 pb-2">
        {/* Caption */}
        <div className="mb-1">
          <span className="font-semibold text-sm mr-2">{post.username}</span>
          <span className="text-sm">{post.caption}</span>
        </div>
        <div className="text-xs text-gray-500 mb-3">
          {formatDate(post.timestamp)}
        </div>

        {/* Comments */}
        {comments.map(comment => (
          <div key={comment.id} className="mb-1">
            <span className="font-semibold text-sm mr-2">{comment.username}</span>
            <span className="text-sm">{comment.text}</span>
          </div>
        ))}
      </div>

      {/* Comment Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleAddComment} className="flex items-center">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-grow outline-none text-sm"
          />
          <button 
            type="submit" 
            className={`font-semibold text-sm ml-2 ${
              comment.trim() ? "text-blue-500" : "text-blue-300"
            }`}
            disabled={!comment.trim()}
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}

export default Exhibit;