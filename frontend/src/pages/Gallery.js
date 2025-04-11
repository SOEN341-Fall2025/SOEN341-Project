

import React, { useState, useEffect } from 'react';
import { Icon, FindClosestIcon, AppContext, UpdateStyle, GetStyle, ToVW, ToPX } from '../AppContext';
import { Resizable } from 're-resizable';
import { Image, Modal, Tab, Col, Row, Button, Nav, Form, TabContainer } from 'react-bootstrap'
import * as icons from 'lucide-react';
import { LoaderPinwheel, Plus, CircleUser, MessageCircleDashed, Camera, Mic, ArrowLeft, User } from 'lucide-react';
import ChatContainer from './ChatContainer.js';
import { ContextMenu } from './CssComponents.js';

function Gallery({ galleryItem, index, userChannels, gallerySize, user, galleryChannels, name }) {  
    const [showState, setShowState] = useState("close"); 
    const [channelNavWidth, setChannelSize] = useState(17);  
    const [thisChannels, setTheseChannels] = useState(galleryChannels);  
    const [newChannelName, setNewChannelName] = useState("");
    const [newTitle, setNewTitle] = useState("");
    
    const [clickedName, setClickedName] = useState("");
    const handleClose = () => setShowState(false);
    function handleClick(key) { setShowState(key); }



    const [galleryNavWidth, setGalleryNavWidth] = useState(3.5);  
    const [dmNavWidth, setDmNavWidth] = useState(17);
    const [channelMessages, setChannelMessage] = useState([]);

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
    
    const handleChannelRename = async (event) => {
      event.preventDefault();        
      if (!newTitle.trim()) {
        alert("Channel name cannot be empty!");
        return;
      }
      console.log("Gallery Name", galleryItem.GalleryName);
        
      await renameChannel();
      //handleChannels(newTitle, galleryName); 
      handleClose();  //Close the modal *after* form is submitted.
    };
    const GalleryChannelList = ({ channels }) => {
      const [clicked, setClicked] = useState(false);
      const [points, setPoints] = useState({x: 0,y: 0});
      console.log(thisChannels);
      useEffect(() => {
        const handleClick = () => setClicked(false);
        window.addEventListener("click", handleClick);
        return () => {
          window.removeEventListener("click", handleClick);
        };
      }, []);
      if(channels){
       return (
          <div>
              {channels.map((item, index) => (
                <Nav.Link 
                eventKey={item.ChannelName} 
                key={index} 
                onClick={() => setNewChannelName(item.ChannelName)} 
                onContextMenu={(e) => {
                    e.preventDefault();
                    setClicked(true);
                    setClickedName(item.ChannelName);
                    setPoints({x: (50 * e.pageX /100), y: e.pageY});
                  }}>
                <span className="channel-icon">
                    <Icon name={item.icon || FindClosestIcon(item.ChannelName)} size={24} />
                </span>
                {item.ChannelName}
                </Nav.Link>
            ))}
            {clicked && (
              <ContextMenu $top={points.y} $left={points.x}>
                <ul>
                  <h5 style={{textAlign: "center"}}>{clickedName}</h5>
                  <li onClick={() => handleClick("renameChannel-modal")}>Rename</li>
                </ul>
              </ContextMenu>
            )}
            </div>
        );
      }
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
    /*
    const GalleryChannelList = ({ channels }) => {
      if(channels.length > 0){
        return (
          channels.map((item, index) => (
              <Nav.Link eventKey={item.ChannelName} key={index} onClick={() => {setNewChannelName(item.ChannelName)
                fetchChannelMessages(item.ChannelName);
              }}>
                <span className="channel-icon">
                  <Icon name={item.icon || FindClosestIcon(item.ChannelName)} size={24} />
                </span>
                {item.ChannelName}
              </Nav.Link>
            ))
        );
      }
    };
    */
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
                    galleryName={name}
                    channelName={item.ChannelName}
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
    const renameChannel = async () => {
  
      const token = localStorage.getItem('authToken');  // Adjust according to where you store your token
      const galleryId = await getGalleryID(galleryItem.GalleryName);
        try {
          const renameResponse = await fetch('/gal/renameChannel', {
            method: 'PUT', // or 'PUT', depending on your API
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` // Pass token as Bearer in the Authorization header
            },
            body: JSON.stringify({ clickedName, galleryId, newTitle }),
          });
          
          const result = await renameResponse.json();
  
          if (!renameResponse.ok) {
            console.error('Error:', result);
            alert('Failed to create channel: ' + result.msg || 'Unknown error');
            return;
          }
        
          console.log('Channel renamed:', result);
          alert('Channel renamed successfully!');
    
        } catch (error) {
          console.error('An error occurred:', error);
          alert('An error occurred while renaming the channel.', error);
        }
    };
    const createChannel = async (channelName, galleryName) => {
      // Get the auth token, for example from localStorage or a cookie
      const token = localStorage.getItem('authToken');  // Adjust according to where you store your token
      
      const galleryId = await getGalleryID(galleryName);
      console.log("Creating Channel in GalleryId ", galleryId);
  
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
        alert('An error occurred while creating the channel.');
      }
    };
    const fetchChannelMessages = async (channelName) =>{

        const token = localStorage.getItem('authToken');
    
        try {
        
            // Fetch the messages for the channel
            const response = await fetch(`/gal/msgChannel/${channelName}`, {
              method: 'GET',  // Use GET if you're not sending a body in the request. Otherwise, use POST.
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,  // Assuming authToken is the user's JWT token
              }
            });
        
            if (!response.ok) {
              throw new Error('Failed to fetch messages');
            }
        
            // Parse the response JSON
            const data = await response.json();
            console.log(data);
        
            // Handle the updated data (i.e., render the messages)
            if (data.updatedData) {
              // Do something with the updatedData, e.g., set state in React
              console.log(data.updatedData);
            }
    
            const messagesAndUsernames = data.updatedData.map(item => ({
                message: item.Msg,
                username: item.Username,
              }));
            console.log(messagesAndUsernames);
            setChannelMessage(messagesAndUsernames);
        
          } catch (error) {
            console.error('Error fetching channel messages:', error.message);
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
     
      const handleSubmitAdmin = async (e) => {
        e.preventDefault();
        
        if (!username.trim()) {
          alert('Please enter a username');
          return;
        }
      
        try {
          const galleryId = await getGalleryID(galleryItem.GalleryName);
          if (!galleryId) throw new Error("Couldn't get gallery ID");
      
          const adminUserId = await getCurrentUserId();

          const token = localStorage.getItem('authToken');
          if (!token) throw new Error("Not authenticated");

          console.log("Sending:", { galleryId, username, adminUserId });

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

      const handleSubmitOwner = async (e) => {
        e.preventDefault();
        
        if (!username.trim()) {
          alert('Please enter a username');
          return;
        }
      
        try {
          const galleryId = await getGalleryID(galleryItem.GalleryName);
          if (!galleryId) throw new Error("Couldn't get gallery ID");
      
          const OwnerUserId = await getCurrentUserId();

          const token = localStorage.getItem('authToken');
          if (!token) throw new Error("Not authenticated");

          console.log("Sending:", { galleryId, username, OwnerUserId });

          const response = await fetch(`/api/gallery/${galleryId}/members/owner`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ username, OwnerUserId }), // Only send username
          });
      
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Failed to demote user');
          }
      
          const responseData = await response.json();
          alert(responseData.msg || 'User demoted successfully');
          setUsername('');
          handleClose();
          
        } catch (error) {
          console.error('Error:', error);
          alert(`Error: ${error.message}`);
        }
      };
      
    const ModalRenameChannel = () => {
      return(
        <Modal.Body> 
            <h5 className="text-center">Rename {clickedName} Channel</h5>
            <form onSubmit={handleChannelRename}>
              <Col>
                <Row><label>Name:</label></Row>
                <Row>
                  <input type='textarea' value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder='New name of your Channel' 
                  autoFocus
                  />
                  </Row>
                <Row><input type='submit' value="Submit" /></Row>
              </Col>
            </form>
        </Modal.Body>
      );
  };
    return (
      <Tab.Pane eventKey={galleryItem.GalleryName} className="gallery-pane" >
            <Tab.Container id="">
              <Col id="sidebar-channels" style={{ width: user.sizeInnerSidebar}} >
                <Nav
                  id="dm-list"
                  variant="pills"
                  defaultActiveKey="Me"
                  className="flex-column d-flex align-items-start"
                >

              <Col  id="sidebar-dm-options" style={{ width: user.sizeInnerSidebar }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
                <Nav.Link onClick={() => handleClick('addAdmin-modal')} className="add-admin" style={{ display: 'flex', alignItems: 'center', marginRight: '2px' }}>
                <Plus />
                </Nav.Link>
                <div style={{ fontWeight: 'bold' }}>Channels</div>
                <Nav.Link onClick={() => handleClick('addOwner-modal')} className="add-owner" style={{ display: 'flex', alignItems: 'center', marginLeft: '2px' }}>
                <icons.Minus />
                </Nav.Link>
              </div>
              </Col>

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
        <ChannelPagesList channels={thisChannels} channelName={newChannelName}/>
        <Modal show={showState === 'addChannel-modal'} onHide={handleClose} id="addChannel-modal" className="modal-dialog-centered">
          <Modal.Dialog><Modal.Header><Button className="btn-close" onClick={handleClose}></Button></Modal.Header><ModalAddChannel /></Modal.Dialog>
        </Modal>
        <Modal show={showState === 'renameChannel-modal'} onHide={handleClose} id="addChannel-modal" className="modal-dialog-centered">
          <Modal.Dialog><Modal.Header><Button className="btn-close" onClick={handleClose}></Button></Modal.Header><ModalRenameChannel /></Modal.Dialog>
        </Modal>
      </Tab.Pane>
    );
}

export default Gallery;