import React, { useState, useEffect } from 'react';
import { Icon, FindClosestIcon } from '../AppContext';
import ChatContainer from './ChatContainer.js';
import { ContextMenu } from './CssComponents.js';
import {  Modal, Tab, Col, Row, Button, Nav } from 'react-bootstrap';
import { Plus } from 'lucide-react';

function Gallery({ gallery, index, galleryName, galleryChannels, gallerySize, userMetadata }) {  
  
    const [showState, setShowState] = useState("close"); 
    const [thisChannels, setTheseChannels] = useState(galleryChannels);  
    const [newChannelName, setNewChannelName] = useState("");
    const [newTitle, setNewTitle] = useState("");    
    const [galleryNavWidth, setGalleryNavWidth] = useState(3.5);  
    const [dmNavWidth, setDmNavWidth] = useState(17);
    const [channelMessages, setChannelMessage] = useState([]);
    const [clickedName, setClickedName] = useState("");
    const handleClose = () => setShowState(false);
    function handleClick(key) { setShowState(key); }    
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
      console.log("Gallery Name", galleryName);
      createChannel(newTitle, galleryName);
      handleChannels(newTitle, galleryName);  
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
    const GalleryChannelList = ({ channels }) => {
      const [clicked, setClicked] = useState(false);
      const [points, setPoints] = useState({x: 0,y: 0});
      useEffect(() => {
        const handleClick = () => setClicked(false);
        window.addEventListener("click", handleClick);
        return () => {
          window.removeEventListener("click", handleClick);
        };
      }, []);
      if(channels.length > 0){
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
                  <li onClick={() => handleChannelDelete(clickedName)}>Delete</li>
                </ul>
              </ContextMenu>
            )}
            </div>
        );
      }
    };
    
    const handleChannelDelete = ({channelName}) => {
      try {
        const deleteResponse = fetch('/gal/deleteChannel', {
          
        });
      } catch {
      
      }
    };
    
    const handleChannelRename = async (event) => {
      event.preventDefault();        
      if (!newTitle.trim()) {
        alert("Channel name cannot be empty!");
        return;
      }
      console.log("Gallery Name", galleryName);
        
      await renameChannel();
      //handleChannels(newTitle, galleryName); 
      handleClose();  //Close the modal *after* form is submitted.
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
                    user={userMetadata}
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
  
  
  const renameChannel = async () => {
  
    const token = localStorage.getItem('authToken');  // Adjust according to where you store your token
    const galleryId = gallery.GalleryID;
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
    
    const galleryId = gallery.GalleryID;//await getGalleryID(galleryName);
    console.log("Creating Channel in GalleryId ", gallery.GalleryID);

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
  return (
    <Tab.Pane eventKey={galleryName} className="gallery-pane">
          <Tab.Container id="">
            <Col id="sidebar-channels" style={{ width: userMetadata.sizeChannelSidebar}} >
              <Nav
                id="dm-list"
                variant="pills"
                defaultActiveKey="Me"
                className="flex-column d-flex align-items-start"
              >
                <Row id="sidebar-dm-options">
                  <Col>Channels</Col>
                </Row>
                <Nav.Link className="seperator" disabled>
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