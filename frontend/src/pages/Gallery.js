

import React, { useState } from 'react';
import { Icon, FindClosestIcon, AppContext, UpdateStyle, GetStyle, ToVW, ToPX } from '../AppContext';
import { Resizable } from 're-resizable';
import { Image, Modal, Tab, Col, Row, Button, Nav, Form, TabContainer } from 'react-bootstrap'
import * as icons from 'lucide-react';
import { LoaderPinwheel, Plus, CircleUser, MessageCircleDashed, Camera, Mic, ArrowLeft, User } from 'lucide-react';
import ChatContainer from './ChatContainer.js';

function Gallery({ item, index, userChannels, gallerySize, user }) {  
  
    const [showState, setShowState] = useState("close"); 
    const [channelNavWidth, setChannelSize] = useState(17);  
    const handleClose = () => setShowState(false);
    function handleClick(key) { setShowState(key); }

    const [newChannelName, setNewChannelName] = useState("");
    const [newGalleryName, setNewGalleryName] = useState(item.GalleryName);

    const [userChannelsList, setUserChannelsList] = useState(userChannels);   

    const GalleryChannelsList = ({ galleryName, channels }) => {
        return (
            <span>
            {channels.map((item, index) => {
                // Check if the galleryName matches the item's galleryName
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
                return null; // Ensure the map function returns something in all cases
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
        return(
            <Modal.Body> 
                <h5 className="text-center">Create a Channel</h5>
                <form onSubmit={handleSubmitChannel}>
                  <Col>
                    <Row><label>Name:</label></Row>
                    <Row><input type='text' id='newName-channel' value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      placeholder='Name of your new Channel' /></Row>
                    <Row><input type='submit' value="Submit" /></Row>
                  </Col>
                </form>
            </Modal.Body>
        );
    };
  
      

  return (
    <Tab.Pane eventKey={item.GalleryName} className="gallery-pane">
          <Tab.Container id="">
            <Col id="sidebar-channels" style={{ width: user.sizeInnerSidebar}} >
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
        <ChatContainer barSizes={(Number(gallerySize) + Number(channelNavWidth))} header={item.channelName} user={user}/>
        <Modal show={showState === 'addChannel-modal'} onHide={handleClose} id="addChannel-modal" className="modal-dialog-centered">
                <Modal.Dialog >
                  <Modal.Header><Button className="btn-close" onClick={handleClose}></Button></Modal.Header>
                  <ModalAddChannel />
                </Modal.Dialog>
              </Modal>
    </Tab.Pane>
    
  );
}

export default Gallery;