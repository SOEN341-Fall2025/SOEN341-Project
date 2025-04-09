
import React, { useState } from 'react';
import { Icon, FindClosestIcon, AppContext, UpdateStyle, HexToRGBA } from '../AppContext';
import { Resizable } from 're-resizable';
import { Image, Modal, Tab, Col, Row, Button, Nav, Form, TabContainer } from 'react-bootstrap'
import * as icons from 'lucide-react';
import { LoaderPinwheel, Plus, CircleUser, MessageCircleDashed, Camera, Mic, ArrowLeft, User } from 'lucide-react';

function ChatContainer({ barSizes, user, header, messages= [], type, galleryName, channelName }) {
  console.log("AuthUser please",user.username);
  const [popperUser, setPopperUser] = useState("");  // For storing the other user's name
  const [bubblerUser, setBubblerUser] = useState(header); // Assuming header is the current user's name
  const [newMessage, setNewMessage] = useState(""); // Input for new messages
  const [directMessages, setDirectMessages] = useState(messages);  // Messages list

   
  
   const handleMessages = (newMessage) => {
    setDirectMessages([...directMessages, { senderID: 'Jane Doe', receiverID: 'John Doe', message: newMessage }]);
  };

  const handleSubmitMessages = (event) => {
    event.preventDefault(); // Prevents page reload on submit
    handleMessages(newMessage);
    setNewMessage("");
  };

  const MessageList = ({ messages }) => {
    
    return (
      <span>
        {messages.map((item, index) => {
          const isUserMessage = item.PopperUsername === popperUser;
          return(
          <div key={index} className={`message ${isUserMessage ? "user" : "recipient"} flex items-center my-2`}>
            <User className="icon" />
            {item.BubblerUsername}
            <div className={`text ${isUserMessage ? "bg-[#5592ed]" : "bg-[#7ed957]"} p-2 rounded-lg ${isUserMessage ? "ml-2" : "mr-2"} max-w-[60%]`}>
              {item.Message}
            </div>
            
          </div>
  )})}
      </span>
    )
  };

  const saveMessage = async (username, newMessage) => {
    // Retrieve the auth token from localStorage
    const token = localStorage.getItem('authToken');
    
    try {
        // Send POST request to the backend to save the message
        const response = await fetch('/api/dm/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Pass token as Bearer in the Authorization header
            },
            body: JSON.stringify({
                username, // The recipient's username
                message: newMessage, // The message to be sent
            }),
        });

        // Parse the response as JSON
        const result = await response.json();
  
        // Handle the case where the response status is not OK (non-2xx status codes)
        if (!response.ok) {
            console.error('Error:', result);
            alert('Failed to save message: ' + (result.msg || 'Unknown error'));
            return;
        }
  
        // If successful, log the result and alert the user
        console.log('Message saved:', result);
        alert('Message saved successfully!');
  
    } catch (error) {
        // Handle any unexpected errors
        console.error('An error occurred:', error);
        alert('An error occurred while saving the message.');
    }
};

  const bars = Math.abs(barSizes);  // Absolute value of bar sizes
  const bg = HexToRGBA(user.clrAccent, 0.7);  // Background color with transparency

  //Channel Messaging

  const [channelMessages, setChannelMessages] = useState(messages);
  const [currentUsername, setCurrentUsername] = useState(user.username);

  const handleChannelMessages = (newMessage) => {
    setChannelMessages([
      ...channelMessages,
      { message: newMessage, username: currentUsername }
    ]);
    saveChannelMessage(channelName, newMessage);
  };

  const handleSubmitChannelMessages = (event) => {
    event.preventDefault();  // Prevent page reload on submit
    handleChannelMessages(newMessage);  // Add the new message
    setNewMessage("");  // Clear input field
  };

  // Message List Component
  const ChannelMessageList = ({ messages }) => {

    return (
      <span>
        {messages.map((item, index) => {
          const isUserMessage = item.username !== user.username;
          console.log(`Message from: ${item.username}, Current User: ${user.username}, Is User Message: ${isUserMessage}`);
  
          return (
            <div key={index} className={`message ${isUserMessage ? "user" : "recipient"} flex items-center my-2`}>
              <User className="icon" />
              {item.username}
              <div className={`text ${isUserMessage ? "bg-[#5592ed]" : "bg-[#7ed957]"} p-2 rounded-lg ${isUserMessage ? "ml-2" : "mr-2"} max-w-[60%]`}>
                {item.message}
              </div>
              

            </div>
          );
        })}
      </span>
    );
  };


  const saveChannelMessage = async (channelName, newMessage) => {
    const token = localStorage.getItem('authToken');
  
    // Check if the token is available
    if (!token) {
      console.error('No authentication token found.');
      return;
    }
  
    try {
      // Make a POST request to the backend API
      const response = await fetch('/gal/channel/sendMsg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Send the auth token in the Authorization header
        },
        body: JSON.stringify({ message: newMessage, channelName: channelName }),
      });
  
      // Check if the response was successful
      if (!response.ok) {
        // Try to read the error response and log it
        const errorData = await response.json();
        console.error('Error from server:', errorData.msg || 'Failed to save message');
        throw new Error(errorData.msg || 'Failed to save message');
      }
  
      // Parse the response data
      const data = await response.json();
      console.log('Message saved:', data);
  
      // Handle success (e.g., update UI, state, etc.)
      return data; // You might want to return the message data here for further use
  
    } catch (error) {
      console.error('Error saving message:', error.message);
      // Optionally return or display an error message
      return { error: error.message }; // You can return an error object or perform other UI updates
    }
  };



  return (
    <>
      {type === "DM" ? (
        <div className="mainview no-parent-padding">
          <div id="top-box" style={{ backgroundColor: bg, left: `calc(${user.sizeInnerSidebar} + 5vw)` }}>
            <Nav.Link>
              <span></span> {header}
            </Nav.Link>
          </div>
          
          <div
            className="chat-container rounded-lg p-4 shadow-lg text-center"
            style={{
              position: 'absolute',
              right: '2vw',
              backgroundColor: bg,
              height: '80vh',
              bottom: '8vh',
              maxWidth: '85%',
              left: `calc(${user.sizeInnerSidebar} + 1vw)`
            }}
          >
            {/* Go Back Button */}
            <div className="back-button flex items-center cursor-pointer mb-2">
              <ArrowLeft className="w-10 h-10 mr-2" />
              <span className="text-gray-700">Go Back</span>
            </div>
  
            {/* Chat Box */}
            <div className="chat-box border rounded-lg p-4 bg-gray-100">
              <div className="chat-header text-center font-bold text-lg p-2 bg-gradient-to-r from-[#cdffd8] to-[#94b9ff] text-black rounded-md">
                *Chat Name*
              </div>
  
              <div className="message user flex items-center my-2">
                <User className="icon" />
                <div className="text bg-[#5592ed] text-white p-2 rounded-lg ml-2 max-w-[60%]">
                  Hello! How are you?
                </div>
              </div>
  
              <div className="message recipient flex items-center justify-end my-2">
                <div className="text bg-[#7ed957] text-black p-2 rounded-lg mr-2 max-w-[60%]">
                  I'm good, thanks!
                </div>
                <User className="icon" />
              </div>
  
              <MessageList messages={directMessages} />
            </div>
  
            <Row id="chat-box" className="d-flex align-items-center">
              {/* Icons */}
              <Col className="d-flex gap-2">
                <div id="plus">
                  <icons.Plus />
                </div>
                <div id="camera">
                  <Camera />
                </div>
                <div id="mic">
                  <Mic />
                </div>
              </Col>
  
              {/* Input Box and Send Button */}
              <Col id="chat-input">
                <form onSubmit={handleSubmitMessages}>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-grow-1 p-2 rounded border"
                    />
                    <button type="submit" className="p-2 bg-[#4facfe] text-gray rounded-md">
                      Send
                    </button>
                  </div>
                </form>
              </Col>
            </Row>
          </div>
        </div>
      ) : (
        <div className="mainview no-parent-padding">
          <div id="top-box" style={{ backgroundColor: bg, left: `calc(${user.sizeInnerSidebar} + 5vw)` }}>
            <Nav.Link>
              <span></span> {header}
            </Nav.Link>
          </div>
  
          <div
            className="chat-container rounded-lg p-4 shadow-lg text-center"
            style={{
              position: 'absolute',
              right: '2vw',
              backgroundColor: bg,
              height: '80vh',
              bottom: '8vh',
              maxWidth: '85%',
              left: `calc(${user.sizeInnerSidebar} + 1vw)`
            }}
          >
            <div className="chat-box border rounded-lg p-4 bg-gray-100">
              <div className="chat-header text-center font-bold text-lg p-2 bg-gradient-to-r from-[#cdffd8] to-[#94b9ff] text-black rounded-md">
                {header}
              </div>
  
              <ChannelMessageList messages={channelMessages} />
            </div>
  
            <Row id="chat-box" className="d-flex align-items-center">
              <Col className="d-flex gap-2">
                <div id="plus">
                  <Plus />
                </div>
                <div id="camera">
                  <Camera />
                </div>
                <div id="mic">
                  <Mic />
                </div>
              </Col>
  
              <Col id="chat-input">
                <form onSubmit={handleSubmitChannelMessages}>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-grow-1 p-2 rounded border"
                    />
                    <button type="submit" className="p-2 bg-[#4facfe] text-gray rounded-md">
                      Send
                    </button>
                  </div>
                </form>
              </Col>
            </Row>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatContainer;
