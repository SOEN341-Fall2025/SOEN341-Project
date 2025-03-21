import React, { useState, useEffect } from 'react';
import { Icon, FindClosestIcon, AppContext, UpdateStyle, GetStyle, ToVW, ToPX } from '../AppContext';
import { Resizable } from 're-resizable';
import { Image, Modal, Tab, Col, Row, Button, Nav, Form, TabContainer } from 'react-bootstrap'
import * as icons from 'lucide-react';
import { LoaderPinwheel, Plus, CircleUser, MessageCircleDashed, Camera, Mic, ArrowLeft, User } from 'lucide-react';
import ChatContainer from './ChatContainer.js';
function Gallery({ item, index, galleryChannels, gallerySize, user }) {  
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

  const handleChannels = (newname, galleryid) => {
    setTheseChannels(Object.values([...galleryChannels, { GalleryID: galleryid, ChannelName: newname }]));
    console.log(galleryChannels);
  };
    const handleSubmitChannel = (event) => {
      event.preventDefault();
      if (!newTitle.trim()) {
        alert("Channel name cannot be empty!");
        return;
      }
      handleChannels(newTitle, ''); 
      console.log(thisChannels[0].galleryID);
      createChannel(newTitle, thisChannels[0].galleryID); 
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

    const GalleryChannelList = ({ channels }) => {
      if(channels.length > 0){
        return (
          channels.map((item, index) => (
              <Nav.Link eventKey={item.ChannelName} key={index} onClick={() => setNewChannelName(item.ChannelName)}>
                <span className="channel-icon">
                  <Icon name={item.icon || FindClosestIcon(item.ChannelName)} size={24} />
                </span>
                {item.ChannelName}
              </Nav.Link>
            ))
        );
      }
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

  const createChannel = async (channelName, galleryID) => {
    // Get the auth token, for example from localStorage or a cookie
    const token = localStorage.getItem('authToken');  // Adjust according to where you store your token
    console.log("galery uid ehere", galleryID);
    try {
      const response = await fetch('/gal/createChannel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Pass token as Bearer in the Authorization header
        },
        body: JSON.stringify({ channelName, galleryID }), 
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

  const retrieveChannelMessages = async (channelName) => {

    const token = localStorage.getItem('authToken');  // Adjust according to where you store your token
  
    try {
      // Send POST request to backend to create gallery
      const response = await fetch('/gal/msgChannel', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Pass token as Bearer in the Authorization header
        },
        body: JSON.stringify({ channelName })
      });

      const result = await response.json();
      console.log(result);

    } catch (error) {
      console.error('An error occurred:', error);
      alert('An error occurred while fetching channel messages.');
    }

  };

  return (
    <Tab.Pane eventKey={item.GalleryName} className="gallery-pane" >
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
    </Tab.Pane>
  );
}
export default Gallery;