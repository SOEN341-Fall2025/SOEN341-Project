
import React, { useState, useEffect } from 'react';
import { User, ArrowLeft, Camera, Mic, Plus } from 'lucide-react';  // Assuming you're using lucide-react
import { Row, Col, Nav } from 'react-bootstrap';
import { HexToRGBA } from '../AppContext';

function ChatContainer({ barSizes, user, header, messages= [], type }) {
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
        {messages.map((item, index) => (
          <div key={index} className={`message ${item.PopperUsername === popperUser ? "user" : "recipient"} flex items-center my-2`}>
            <div className={`text ${item.PopperUsername === popperUser ? "bg-[#5592ed]" : "bg-[#7ed957]"} p-2 rounded-lg ${item.PopperUsername === popperUser ? "ml-2" : "mr-2"} max-w-[60%]`}>
              {item.Message}
            </div>
            <User className="icon" />
          </div>
        ))}
      </span>
    );
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
            <MessageList messages={channelMessages} />
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
      )}
    </>
  );
}

export default ChatContainer;