import React, { useState, useEffect } from 'react';
import { Icon, FindClosestIcon, AppContext, UpdateStyle, GetStyle, ToVW, ToPX } from '../AppContext';
import { Resizable } from 're-resizable';
import { Image, Modal, Tab, Col, Row, Button, Nav, Form, TabContainer } from 'react-bootstrap'
import * as icons from 'lucide-react';
import { LoaderPinwheel, Plus, CircleUser, MessageCircleDashed, Camera, Mic, ArrowLeft, User } from 'lucide-react';
import ChatContainer from './ChatContainer.js';

function Gallery({ item, index, userChannels, gallerySize, user, galleryChannels, name }) {  
    const [showState, setShowState] = useState("close"); 
    const [channelNavWidth, setChannelSize] = useState(17);  
    const [thisChannels, setTheseChannels] = useState(galleryChannels);  
    const [newChannelName, setNewChannelName] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const handleClose = () => setShowState(false);
    function handleClick(key) { setShowState(key); }




    const [galleryNavWidth, setGalleryNavWidth] = useState(3.5);  
    const [dmNavWidth, setDmNavWidth] = useState(17);
    const [channelMessages, setChannelMessage] = useState([]);
    
    const GalleryChannelList = ({ galleryName, channels = [] }) => {
      return (
        <span>
          {channels.length > 0 &&
            channels.map((item, index) => {
              if (galleryName === item.GalleryName) {
                return (
                  <Nav.Link key={index} eventKey={item.ChannelName}>
                    <span className="channel-icon">
                      <Icon name={item.icon || FindClosestIcon(item.ChannelName)} size={24} />
                    </span>
                    {item.ChannelName}
                  </Nav.Link>
                );
              }
              return null;
            })}
        </span>
      );
    };
    const ChannelsList = () => {
      thisChannels.map((item, index) => {
          return (
              <Nav.Link key={index} eventKey={item.ChannelName}>
              <span className="channel-icon">
              <Icon name={item.icon || FindClosestIcon(item.ChannelName)} size={24} />
              </span>
              {item.ChannelName}
              </Nav.Link>
          );
          return null; // Ensure the map function returns something in all cases
      });
    };

    const handleChannels = (newname, galleryname) => {
      setTheseChannels(prevChannels => {
        const updatedChannels = [...prevChannels, { GalleryName: galleryname, ChannelName: newname }];
        console.log("Updated Channels in Gallery.js:", updatedChannels);
        return updatedChannels;
      });
    };
    const handleSubmitChannel = (event) => {
      event.preventDefault();
      if (!newTitle.trim()) {
        alert("Channel name cannot be empty!");
        return;
      }
      console.log("Gallery Name", name);
      handleChannels(newTitle, name); 
      createChannel(newTitle, name); 
      handleClose();  //Close the modal *after* form is submitted.
    };
    const ModalAddChannel = () => {
        return(
          <Modal.Body> 
              <h5 className="text-center">Create a Channel</h5>
              <form onSubmit={handleSubmitChannel}>
                <Col>
                  <Row><label>Name:</label></Row>
                  <Row>
                    <input type='textarea' id='newName-channel' value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder='Name of your new Channel' 
                    autoFocus
                    />
                    </Row>
                  <Row><input type='submit' value="Submit" /></Row>
                </Col>
              </form>
          </Modal.Body>
        );
    };
    const ChannelPagesList = ({ channels, channelName }) => {
      return (
        <>
          {channels.map((item, index) => {
            // Check if the channel name matches the item’s ChannelName
            if (channelName === item.ChannelName) {
              return (
                <ChatContainer
                  key={index} // Add a key to help React identify each item in the list
                  eventKey={item.ChannelName}
                  barSizes={galleryNavWidth + dmNavWidth}
                  user={user}
                  header={item.ChannelName}
                  messages={channelMessages}
                  type={"Channel"}
                />
              );
            }
            return null; // If the condition is not met, return null to render nothing
          })}
        </>
      );
    };
    const getGalleryID = async (galleryName) => {
      try {
        const response = await fetch(`/api/gal/getID/${galleryName}`);
        const data = await response.json();
        if (response.ok) {
          console.log("GalleryID for", galleryName, "is:", data.data.GalleryID);
          return data.data.GalleryID;
        } else {
          throw new Error("GalleryID not found.");
        }
      } catch (error) {
        console.error("Error fetching GalleryID:", error);
        return null;  // Return null if error occurs
      }};

      const createChannel = async (channelName, galleryName) => {
        // Get the auth token, for example from localStorage or a cookie
        const token = localStorage.getItem('authToken');  // Adjust according to where you store your token
    
        const galleryId = await getGalleryID(galleryName);
        console.log("GalleryId ", galleryId);
    
        try {
          const response = await fetch('/gal/createChannel', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` // Pass token as Bearer in the Authorization header
            },
            body: JSON.stringify({ channelName, galleryId }), 
          });
    
          const result = await response.json();
    
          if (!response.ok) {
            console.error('Error:', result);
            alert('Failed to create channel: ' + result.msg || 'Unknown error');
            return;
          }
    
          console.log('Channel created:', result);
          alert('Channel created successfully!');
    
    
        } catch (error) {
          console.error('An error occurred:', error);
          alert('An error occurred while creating the gallery.');
        }
      };

      const getCurrentUserId = async () => {
        try {
          const token = localStorage.getItem('authToken');
          if (!token) throw new Error('No authentication token found');
      
          const response = await fetch('/api/get/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
      
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
      
          const data = await response.json();
          return data.user[0].user_id; // Adjust based on your actual response structure
        } catch (error) {
          console.error('Error getting current user ID:', error);
          return null;
        }
      };
      const [username, setUsername] = useState('');
     
      const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!username.trim()) {
          alert('Please enter a username');
          return;
        }
      
        try {
          const galleryId = await getGalleryID(item.GalleryName);
          if (!galleryId) throw new Error("Couldn't get gallery ID");
      
          const adminUserId = await getCurrentUserId();

          const token = localStorage.getItem('authToken');
          if (!token) throw new Error("Not authenticated");

          console.log("Sending:", { galleryId, username, adminUserId });

          // 3. Make the request (NO adminUserId in body!)
          const response = await fetch(`/api/gallery/${galleryId}/members/admin`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username,adminUserId }), // Only send username
          });
      
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Failed to promote user');
          }
      
          const responseData = await response.json();
          alert(responseData.msg || 'User promoted successfully');
          setUsername('');
          handleClose();
          
        } catch (error) {
          console.error('Error:', error);
          alert(`Error: ${error.message}`);
        }
      };
    return (
      <Tab.Pane eventKey={item.GalleryName} className="gallery-pane">
        <Tab.Container>
          <Col id="sidebar-channels" style={{ width: user.sizeInnerSidebar }}>
            <Nav 
              id="dm-list"
              variant="pills"
              defaultActiveKey="Me"
              className="flex-column d-flex align-items-start"
            >
              <Row id="sidebar-dm-options">
                <Col>Channels
                  <Nav.Link onClick={() => handleClick('addAdmin-modal')} className="add-admin">
                    <icons.Settings />
                  </Nav.Link>
                </Col>
              </Row>
              <Nav.Link className="seperator" disabled>
                <hr />
                <hr />
              </Nav.Link>
              <GalleryChannelList channels={thisChannels}/>
                <Nav.Link
                  onClick={() => handleClick("addChannel-modal")}
                  className="add-channel"
                >
                <span className="channel-icon">
                  <Plus />
                </span>{" "}
                Add a Channel
              </Nav.Link>
            </Nav>
          </Col>
        </Tab.Container>
        <ChatContainer barSizes={(Number(gallerySize) + Number(channelNavWidth))} header={item.channelName} user={user} />
        <Modal show={showState === 'addAdmin-modal'} onHide={handleClose} id="addAdmin-modal" className="modal-dialog-centered">
          <Modal.Dialog>
            <Modal.Header><Button className="btn-close" onClick={handleClose}></Button></Modal.Header>
          </Modal.Dialog>
          <Modal.Body>
            <h5 className="text-center">Add an admin</h5>
            <form onSubmit={handleSubmit}>
              <Col>
                <Row><label>Username:</label></Row>
                <Row>
                  <input
                    type='text'
                    id='username'
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                  />
                </Row>
                <Row>
                  <Button type="submit">Add admin</Button>
                </Row>
              </Col>
            </form>
          </Modal.Body>
        </Modal>
        <Modal show={showState === 'addChannel-modal'} onHide={handleClose} id="addChannel-modal" className="modal-dialog-centered">
          <Modal.Dialog>
            <Modal.Header><Button className="btn-close" onClick={handleClose}></Button></Modal.Header>
            <ModalAddChannel />
          </Modal.Dialog>
        </Modal>
      </Tab.Pane>
    );
}
export default Gallery;