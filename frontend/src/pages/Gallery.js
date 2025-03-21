import React, { useState, useEffect } from 'react';
import { Icon, FindClosestIcon } from '../AppContext';
import { Tab, Col, Row, Button, Nav, Modal } from 'react-bootstrap';
import { LoaderPinwheel, Plus, CircleUser, MessageCircleDashed, Camera, Mic, ArrowLeft, User } from 'lucide-react';
import ChatContainer from './ChatContainer.js';
import getCookie from './Settings.js'
import * as icons from 'lucide-react';

function Gallery({ item, index, userChannels, gallerySize, user, currentGalleryId }) {  
    const [showState, setShowState] = useState("close"); 
    const [channelNavWidth, setChannelSize] = useState(17);  
    const [userChannelsList, setUserChannelsList] = useState(userChannels || []);   
    const [newChannelName, setNewChannelName] = useState("");
    const [newGalleryName, setNewGalleryName] = useState(item.GalleryName);

    const handleClose = () => setShowState(false);
    function handleClick(key) { setShowState(key); }

    const GalleryChannelsList = ({ galleryName, channels = [] }) => {
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

    const handleChannels = (newGalleryName, newChannelName, newIcon) => {
        setUserChannelsList([...userChannelsList, { GalleryName: newGalleryName, ChannelName: newChannelName, icon: newIcon }]);
    };

    const handleSubmitChannel = (event) => {
        event.preventDefault();
        handleChannels(newGalleryName, newChannelName, '');
    };

    const ModalAddChannel = () => {
        return (
            <Modal.Body> 
                <h5 className="text-center">Create a Channel</h5>
                <form onSubmit={handleSubmitChannel}>
                    <Col>
                        <Row><label>Name:</label></Row>
                        <Row>
                            <input 
                                type='text' 
                                id='newName-channel' 
                                value={newChannelName}
                                onChange={(e) => setNewChannelName(e.target.value)}
                                placeholder='Name of your new Channel' 
                            />
                        </Row>
                        <Row><input type='submit' value="Submit" /></Row>
                    </Col>
                </form>
            </Modal.Body>
        );
    };
    const [galleryId, setGalleryId] = useState(currentGalleryId); 

    useEffect(() => {
      setGalleryId(currentGalleryId); // Update whenever gallery changes
    }, [currentGalleryId]);

    const [username, setUsername] = useState('');

    const getCurrentUserId = () => {
        return localStorage.getItem("user_id"); 
      };

    const [adminUserId, setAdminUserId] = useState(getCurrentUserId()); // Set dynamically
    
    const GrantAdminRole = async () => {
      try {
        const token = getCookie("authToken");
        const response = await fetch(`/api/gallery/${galleryId}/members/admin`, {
          method: "PUT",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ username, adminUserId:getCurrentUserId() }), // Include adminUserId
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Failed to update user role');
        }
    
        const data = await response.json();
        console.log(data.msg);
      } catch (error) {
        console.log(error.message || 'An error occurred');
      }
    };
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      await GrantAdminRole();
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
              <Nav.Link>
                <icons.Gamepad2Icon /> Game Room
              </Nav.Link>
              <GalleryChannelsList
                galleryName={item.GalleryName}
                channels={userChannelsList}
              />
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