
import React, { useState, useEffect } from 'react';
import { User, ArrowLeft, Camera, Mic, Plus } from 'lucide-react';  // Assuming you're using lucide-react
import { Row, Col, Nav } from 'react-bootstrap';
import { HexToRGBA } from '../AppContext';
import { Trash2 } from 'lucide-react';

function ChatContainer({ barSizes, user, header, messages= [], type, galleryName, channelName }) {
  console.log("AuthUser please",user.username);
  const [popperUser, setPopperUser] = useState("");  // For storing the other user's name
  const [bubblerUser, setBubblerUser] = useState(header); // Assuming header is the current user's name
  const [newMessage, setNewMessage] = useState(""); // Input for new messages
  const [directMessages, setDirectMessages] = useState(messages);  // Messages list

  // Update popper user based on the header and messages
  useEffect(() => {
    if (messages.length > 0) {
      const popperUsername = messages[0].PopperUsername;
      const bubblerUsername = messages[0].BubblerUsername;

      if (bubblerUsername === bubblerUser) {
        setPopperUser(popperUsername);
      } else {
        setPopperUser(bubblerUsername);
      }
    }
  }, [bubblerUser, messages]);  // Only run this effect when messages or header change

  // Handle adding a new message
  const handleMessages = (newMessage) => {
    setDirectMessages([
      ...directMessages,
      { PopperUsername: bubblerUser, BubblerUsername: popperUser, Message: newMessage }
    ]);

    saveMessage(bubblerUser,newMessage);
  };

  const handleSubmitMessages = (event) => {
    event.preventDefault();  // Prevent page reload on submit
    handleMessages(newMessage);  // Add the new message
    setNewMessage("");  // Clear input field
  };

  // Message List Component
  const MessageList = ({ messages }) => {
    return (
      <span>
        {messages.map((item, index) => {
          const isUserMessage = item.PopperUsername !== popperUser;
  
          return (
            <div
              key={index}
              className={`message ${!isUserMessage ? "user" : "recipient"} flex items-center my-2`}
            >
              <User className="icon mr-1" />
              <span className="mr-2">{item.BubblerUsername}</span>
              <div
                className={`text ${
                  isUserMessage ? "bg-[#5592ed]" : "bg-[#7ed957]"
                } p-2 rounded-lg ${isUserMessage ? "ml-2" : "mr-2"} max-w-[60%]`}
              >
                {item.Message}
              </div>
              <Trash2
                className="ml-2 cursor-pointer hover:text-red-500 transition"
                size={18}
                onClick={() => deleteDirectMessage(item.DmId, index)}
              />
            </div>
          );
        })}
      </span>
    );
  };

  //Delete DMs
  const deleteDirectMessage = async (DmId, index) => {
    setDirectMessages((prevMessages) => prevMessages.filter((_, i) => i !== index));
  
    const token = localStorage.getItem("authToken");
    const userId = user.id;
  
    try {
      const response = await fetch(`/api/messages/${DmId}?userId=${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
  
      if (!response.ok) {
        console.warn("Backend deletion failed:", result.msg);
      }
    } catch (error) {
      console.error("Error deleting direct message:", error);
    }
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
  
          return (
            <div key={index} className={`message ${isUserMessage ? "user" : "recipient"} flex items-center my-2`}>
              <User className="icon" />
              {item.username}
              <div className={`text ${isUserMessage ? "bg-[#5592ed]" : "bg-[#7ed957]"} p-2 rounded-lg ${isUserMessage ? "ml-2" : "mr-2"} max-w-[60%]`}>
                {item.message}
              </div>
              <Trash2
                className="ml-2 cursor-pointer hover:text-red-500 transition"
                size={18}
                onClick={() => deleteChannelMessage(item.Msg_id, index)}
              />
            </div>
          );
        })}
      </span>
    );
  };
  
  const deleteChannelMessage = async (msgId, index) => {
    setChannelMessages((prevMessages) => prevMessages.filter((_, i) => i !== index));
  
    const token = localStorage.getItem("authToken");
    const userId = user.id;
  
    try {
      const response = await fetch(`/api/messages/${msgId}?userId=${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        console.warn("Backend deletion failed:", result.msg);
      }
    } catch (error) {
      console.error("Error deleting channel message:", error);
    }
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
      {type === 'DM' ? (
    <div className="mainview no-parent-padding">
      <div id="top-box" style={{ backgroundColor: bg, left: `calc(${user.sizeInnerSidebar} + 5vw)` }}>
        <Nav.Link>
          <span></span> {header}
        </Nav.Link>
      </div>

      <div className="chat-container rounded-lg p-4 shadow-lg text-center" style={{
        position: 'absolute', right: '2vw', backgroundColor: bg, height: '80vh', bottom: '8vh',
        maxWidth: '85%', left: `calc(${user.sizeInnerSidebar} + 1vw)`
      }}>
        {/* Chat Box */}
        <div className="chat-box border rounded-lg p-4 bg-gray-100">
          <div className="chat-header text-center font-bold text-lg p-2 bg-gradient-to-r from-[#cdffd8] to-[#94b9ff] text-black rounded-md">
            {header}
          </div>

          {/* Display Messages */}
          <MessageList messages={directMessages} />
        </div>

        {/* Input Section */}
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

          {/* Input Box and Send Button */}
          <Col id="chat-input" className="">
            <form onSubmit={handleSubmitMessages}>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow-1 p-2 rounded border"
                />
                <button type="submit" className="p-2 bg-[#4facfe] text-gray rounded-md">Send</button>
              </div>
            </form>
          </Col>
        </Row>
      </div>
    </div>
      ):(
        <div className="mainview no-parent-padding">
        <div id="top-box" style={{ backgroundColor: bg, left: `calc(${user.sizeInnerSidebar} + 5vw)` }}>
          <Nav.Link>
            <span></span> {header}
          </Nav.Link>
        </div>
  
        <div className="chat-container rounded-lg p-4 shadow-lg text-center" style={{
          position: 'absolute', right: '2vw', backgroundColor: bg, height: '80vh', bottom: '8vh',
          maxWidth: '85%', left: `calc(${user.sizeInnerSidebar} + 1vw)`
        }}>
          {/* Chat Box */}
          <div className="chat-box border rounded-lg p-4 bg-gray-100">
            <div className="chat-header text-center font-bold text-lg p-2 bg-gradient-to-r from-[#cdffd8] to-[#94b9ff] text-black rounded-md">
              {header}
            </div>
  
            {/* Display Messages */}
            <ChannelMessageList messages={channelMessages} />
          </div>
  
          {/* Input Section */}
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
  
            {/* Input Box and Send Button */}
            <Col id="chat-input" className="">
              <form onSubmit={handleSubmitChannelMessages}>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow-1 p-2 rounded border"
                  />
                  <button type="submit" className="p-2 bg-[#4facfe] text-gray rounded-md">Send</button>
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