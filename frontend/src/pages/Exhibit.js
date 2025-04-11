import '../style/style.css';
import React, { useState, useEffect } from 'react';
import {Plus, Heart, MessageCircle, Send, Bookmark, User } from 'lucide-react';
import { Image, Modal, Tab, Col, Row, Button, Nav, Form, TabContainer } from 'react-bootstrap'
import backImage from '../assets/background.png';


function Exhibit({ user, post }) {

  const [exhibits, setExhibits] = useState([]);
  const [postID, setpostID] = useState("");
  const [exhibitLoaded, setExhibitLoaded] = useState(false);
  const [comments, setComments] = useState([]);

  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const [showState, setShowState] = useState("close");
  const handleClose = () => setShowState(false);
  function handleClick(key) { setShowState(key); }

  const postComment = async (postId, msg) => {
  const token = localStorage.getItem('authToken');

  try {
    const response = await fetch('/api/exhibit/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ post_id: postId, msg }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to post comment');

    console.log('Comment posted:', result.comment);
    return result.comment; // Return the new comment
  } catch (err) {
    console.error('Error:', err.message);
    return null;
  }
};

  //Uploads files to storage (modify soon to upload files to exhibits not dms)
  const uploadExhibitFile = async (file, msg) => {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();

    formData.append("file", file);
    formData.append("msg", msg);

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

  useEffect(() => {

    const token = localStorage.getItem('authToken');

    // retrieve all exhibits
    async function fetchExhibits () {
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

          setExhibits(result.data);
  
          return result.data;
      } catch (error) {
          console.error("Error fetching exhibits:", error);
          return [];
      }
    };

    // retrieve comments
    async function fetchComments () {
      const token = localStorage.getItem('authToken');

      try {
          const response = await fetch(`/api/exhibit/comments`, { // Fixed URL here
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

          console.log("result of comments", result);
          setComments(result.data);
          return result.data; // Successfully fetched comments
      } catch (error) {
          console.error("Error fetching comments:", error.message);
          return []; // Return an empty array on error
      }
    }

    // Fetch exhibits and comments
    fetchExhibits();
    fetchComments();
    console.log("User", user);

}, []);

  useEffect(() => {

    console.log(exhibits);
    setExhibitLoaded(true);

  }, [exhibits]);

  const [comment, setComment] = useState("");
  
  const samplePost = {
    username: "alice",
    caption: "love Bubbles!!",
    timestamp: "2025-04-05T21:15:00Z",
    likes: 0,
  };
  const [likes, setLikes] = useState(samplePost.likes || 0);
  const [isLiked, setIsLiked] = useState(false);

  const [showComments, setShowComments] = useState(false);


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

  const toggleComments = (postID) => {

    setShowComments(!showComments);
    setpostID(postID);
  };

  const ExhibitList = ({ exhibits }) => {
    return (
      <div 
        style={{ 
          height: '100vh', // Full height
          overflowY: 'auto', 
          padding: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', // center cards horizontally
          gap: '24px' 
        }}
      >
        {Array.isArray(exhibits) && exhibits.map((item, index) => (
          <div 
            key={index} 
            className="instagram-post" 
            style={{
              width: '500px',
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              flexShrink: 0 // important for scrollable children
            }}
          >
            {/* Your post content... */}
            <div className="flex items-center p-4">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                <User size={24} />
              </div>
              <span className="font-semibold text-sm">{item.username}</span>
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
              <img 
                src={item.file_url} 
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
                  <button onClick={() => toggleComments(item.post_id)}>
                    <MessageCircle size={24} />
                  </button>
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
                  {item.username}
                </span>
                <span style={{ fontSize: '14px' }}>{item.msg}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {formatDate(item.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
      
    );
  };

  const CommentList = React.memo(({ postID, comments, setComments }) => {
    const [localComment, setLocalComment] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [error, setError] = useState(null);
  
    const handleAddComment = async (e) => {
      e.preventDefault();
      if (!localComment.trim()) return;
      
      setIsPosting(true);
      try {
        const newComment = await postComment(postID, localComment);
        if (newComment) {
          // Ensure the new comment has all required fields
          const completeComment = {
            ...newComment,
            post_id: postID, // Make sure post_id is included
            username: user?.username || "Anonymous", // Fallback username
            created_at: new Date().toISOString() // Current time if not provided
          };
          
          setComments(prev => [...prev, completeComment]);
          setLocalComment("");
        }
      } catch (error) {
        setError("Failed to post comment");
        setTimeout(() => setError(null), 3000);
      } finally {
        setIsPosting(false);
      }
    };
  
    // Filter comments for the current post and sort by date
    const filteredComments = comments
      .filter(comment => comment.post_id === postID)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
    return (
      showComments && (
        <div className={`comments-container ${showComments ? 'show' : ''}`}
          style={{
            position: 'fixed',
            right: 0,
            overflowY: 'scroll',
            height: '770px',
            width: '300px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px #000000',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #eee',
            fontWeight: '600',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Comments</span>
            <button 
              onClick={() => setShowComments(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
  
          {/* Error Message */}
          {error && (
            <div style={{
              padding: '8px',
              background: '#ffebee',
              color: '#c62828',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
  
          {/* Comments List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {filteredComments.length > 0 ? (
              filteredComments.map((comment) => (
                <div key={comment.comment_id || comment.created_at} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#ddd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '8px',
                    }}>
                      <User size={12} />
                    </div>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>
                      {comment.username}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', marginLeft: '32px' }}>
                    {comment.msg}
                  </p>
                  <div style={{
                    fontSize: '12px',
                    color: '#999',
                    marginLeft: '32px',
                    marginTop: '4px',
                  }}>
                    {formatDate(comment.created_at)}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '16px' }}>
                No comments yet
              </div>
            )}
          </div>
  
          {/* Comment Input Form */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #eee',
          }}>
            <form onSubmit={handleAddComment} style={{ display: 'flex' }}>
              <input
                type="text"
                value={localComment}
                onChange={(e) => setLocalComment(e.target.value)}
                placeholder="Add a comment..."
                style={{
                  flex: 1,
                  border: '1px solid #ddd',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  outline: 'none',
                  fontSize: '14px',
                }}
                disabled={isPosting}
              />
              <button
                type="submit"
                disabled={!localComment.trim() || isPosting}
                style={{
                  marginLeft: '8px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: localComment.trim() ? '#3897f0' : '#ddd',
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {isPosting ? '...' : <Send size={16} />}
              </button>
            </form>
          </div>
        </div>
      )
    );
  });

  const ModalAddExhibit = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
  
    const handleFileChange = (event) => {
      setFile(event.target.files[0]);
    };
  
    const createExhibit = (event) => {
      event.preventDefault();
      if (file && message) {
        uploadExhibitFile(file, message);
      } else {
        alert("Please provide both a message and a file.");
      }

      handleClose();
      window.location.reload();
    };
  
    return (
      <Modal.Body>
        <h5 className="text-center">Create a Channel</h5>
        <form onSubmit={createExhibit}>
          <Col>
            <Row>
              <label>Msg:</label>
            </Row>
            <Row>
              <input
                type="text"
                id="newMsg-exhibit"
                placeholder="put a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Row>
            <Row>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
              />
            </Row>
            <Row>
              <input type="submit" value="Submit" />
            </Row>
          </Col>
        </form>
      </Modal.Body>
    );
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
      { exhibitLoaded ? (
      <ExhibitList exhibits={exhibits}/>):
      (<>
        Loading
      </>)
      }
      

      {/*Comments Container */}

      <CommentList postID={postID} comments={comments} setComments={setComments} />
      
    <button 
  className="create-exhibit-btn"
  onClick={() => {
    handleClick('addExhibit-modal')
    console.log("Create Exhibit clicked!");
  }}
>
  <Plus size={18} /> {/* Add this import at the top: import { Plus } from 'lucide-react'; */}
  Create Exhibit!
</button>

<Modal show={showState === 'addExhibit-modal'} onHide={handleClose} id="addExhibit-modal" className="modal-dialog-centered">
        <Modal.Dialog >
          <Modal.Header><Button className="btn-close" onClick={handleClose}></Button></Modal.Header>
          <ModalAddExhibit />
        </Modal.Dialog>
      </Modal>
    </div>
  );
}

export default Exhibit;