import '../style/style.css';
import React, { useState, useEffect } from 'react';
import {Plus, Heart, MessageCircle, Send, Bookmark, User } from 'lucide-react';
import { Image, Modal, Tab, Col, Row, Button, Nav, Form, TabContainer } from 'react-bootstrap'
import backImage from '../assets/background.png';


function Exhibit({ user, post }) {

  const [exhibits, setExhibits] = useState([]);
  const [DmID, setDmID] = useState("");

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
  const uploadDmFile = async (file, DmID) => {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();

    formData.append("file", file);
    formData.append("DmID", DmID);

    try {
        const response = await fetch("/dm/upload-file", {
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
  /*const handleFileChange = async (e) => {
    console.log("File input triggered");
    const file = e.target.files[0];
  
    if (file) {
      console.log("File selected:", file);
      await uploadDmFile(file, 35);
    }
  };*/

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
    

    postComment(postID,comment);
    

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

  const toggleComments = (postID) => {

    setShowComments(true);
    setpostID(postID);
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
          src={"https://syipugxeidvveqpbpnum.supabase.co/storage/v1/object/public/exhibituploads//1.png"} 
          alt="Post" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* To test the upload file function
      <div>
        <span>Upload:</span>
        <form>
          <input type='file' id='user' capture="user" accept='image/*' onChange={handleFileChange} />
        </form>
      </div> */}

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