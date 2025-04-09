import '../style/style.css';
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, User } from 'lucide-react';
import backImage from '../assets/background.png';


function Exhibit({ user, post }) {

  const [exhibits, setExhibits] = useState([]);
  const [postID, setpostID] = useState("");

  //fetch commments based on the post_id given (use for every exhibits, put it in a list)
  const fetchComments = async (post_id) => {
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(`/api/exhibit/comments?post_id=${encodeURIComponent(post_id)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            credentials: "include"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.msg || "Failed to fetch comments");
        }
        console.log("result of comments",result);
        return result.data; // Successfully fetched comments
    } catch (error) {
        console.error("Error fetching comments:", error.message);
        return []; // Return an empty array on error
    }
  };

  //Uploads files to storage (modify soon to upload files to exhibits not dms)
  const uploadExhibitFile = async (file, post_id) => {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();

    formData.append("file", file);
    formData.append("post_id", post_id);

    try {
        const response = await fetch("/exhibits/upload-file", {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`, // Important: DO NOT set Content-Type here, browser will handle it
            },
            body: formData,
        });

        const result = await response.json();
        console.log("Upload: ", result);

        if (!response.ok) {
            throw new Error(result.msg || "File upload failed");
        }

        console.log("File uploaded:", result.fileUrl);
        return result.fileUrl;
    } catch (error) {
        console.error("Upload error:", error.message);
        return null;
    }
  };

  // To handle the uploading (delete if not needed)
  const handleFileChange = async (e) => {
    console.log("File input triggered");
    const file = e.target.files[0];
  
    if (file) {
      console.log("File selected:", file);
      await uploadExhibitFile(file, 1);
    }
  };

  useEffect(() =>{

    const token = localStorage.getItem('authToken');

    //retrieve all exhibits
    async function fetchExhibits (){
      try {
          const response = await fetch("/api/exhibits", {
              method: "GET",
              headers: {
                  "Content-Type": "application/json",
                   'Authorization': `Bearer ${token}`
              },
              credentials: "include", // Include cookies if authentication is required
          });
  
          const result = await response.json();
  
          if (!response.ok) {
              throw new Error(result.msg || "Failed to fetch exhibits");
          }

          setExhibits(result);
  
          return result.data;
      } catch (error) {
          console.error("Error fetching exhibits:", error);
          return [];
      }
  }

  fetchExhibits();
  fetchComments(1);



  },[]);

  useEffect(() => {

    console.log(exhibits)

  }, [exhibits]);

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

  const [showComments, setShowComments] = useState(false);

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

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <div className="posts-container" style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '0px',
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
            <User size={24} /><span className="font-semibold text-sm">{samplePost.username}</span>
          </div>
          
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

       {
      <div>
        <span>Upload:</span>
        <form>
          <input type='file' id='user' capture="user" accept='image/*' onChange={handleFileChange} />
        </form>
      </div> }

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
              <button onClick={toggleComments}> <MessageCircle size={24} /></button>
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

      {/*Comments Container */}
      {showComments && (
      <div className={`comments-container ${showComments ? 'show' : ''}`} style={{
        overflowY: 'scroll',
        height: '770px',
        width: '300px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px #000000',
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
    )}
    <button 
  className="create-exhibit-btn"
  onClick={() => {
    // Add your create exhibit logic here
    console.log("Create Exhibit clicked!");
  }}
>
  <Plus size={18} /> {/* Add this import at the top: import { Plus } from 'lucide-react'; */}
  Create Exhibit!
</button>
    </div>
  );
}

export default Exhibit;