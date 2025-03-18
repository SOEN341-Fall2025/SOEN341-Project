
import '../style/app.css';
import '../style/settings.css';
import '../style/style.css';
import React, { useState, useEffect, useCallback } from 'react';
import { Icon, FindClosestIcon, AppContext, UpdateStyle, GetStyle, ToPX } from '../AppContext';
import Settings from './Settings.js';
import Gallery from './Gallery.js';
import ChatContainer from './ChatContainer.js';

import $ from 'jquery';
import { Resizable } from 're-resizable';
import { Image, Modal, Tab, Col, Row, Button, Nav, Form, TabContainer } from 'react-bootstrap'
import * as icons from 'lucide-react';
import { LoaderPinwheel, Plus, CircleUser, MessageCircleDashed, Camera, Mic, ArrowLeft, User } from 'lucide-react';


function Main({ userData, galleries}) {    
  
  
  // VARIABLES AND DATA  
  const [showState, setShowState] = useState("close");
  const [newName, setNewName] = useState("");
  const [newChannelName, setNewChannelName] = useState("");
  const [newGalleryName, setNewGalleryName] = useState("");
  const [galleryNavWidth, setGalleryNavWidth] = useState(3.5);  
  const [dmNavWidth, setDmNavWidth] = useState(17);  
  const [userGalleries, setUserGalleries] = useState(Object.values(galleries));   
  const [newMessage, setNewMessage] = useState("");
  const [directMessages, setDirectMessages] = useState([
    { senderID: 'Alice', receiverID: "John Doe", message: "I hope you have a good day" }
  ]);  
  const [userChannels, setUserChannels] = useState([]); 
  const [galleryChannels, setGalleryChannels] = useState([]); 
  
  const logout = () => {    
    localStorage.removeItem('auth-token');
  }
  const [userVar, setUserVar] = useState({
    sizeGallerySidebar: "3.5vw",
    sizeInnerSidebar: "17vw",
    clrAccent: '#d2a292',
    clrChat: '#f0ffff',
    clrNavbar: '#f0ffff',
    clrNavbarGradient: '#d2a292',
    userGalleries: JSON.stringify(galleries),
    username: userData.username,
    profilepic: userData.profile_picture_url,
    aboutme: userData.aboutme,
    userID: userData.user_id,
    settings: userData.settings
  });
  
  useEffect(() => {
    console.log(JSON.stringify(userData.settings));
    function setStyles() {
      const newUserVar = { ...userVar };
      newUserVar.clrAccent = userData.settings.clrAccent || userVar.clrNavbar;
      newUserVar.clrChat = userData.settings.clrChat || userVar.clrNavbar;
      newUserVar.clrNavbar = userData.settings.clrNavbar || userVar.clrNavbar;
      newUserVar.clrNavbarGradient = userData.settings.clrNavbarGradient || userVar.clrNavbarGradient;
      
      setUserVar(newUserVar);
  
      UpdateStyle('--color-accent', newUserVar.clrAccent);
      UpdateStyle('--color-bar', newUserVar.clrNavbar);
      UpdateStyle('--color-bar-gradient', newUserVar.clrNavbarGradient);
      //console.log(newUserVar.clrNavbarGradient);
      
    }
  
    setStyles();
  }, [userVar.settings]);
  
  
      
  /*SECTION - FUNCTIONS */
   const handleClose = () => setShowState(false);
   function handleClick(key) { setShowState(key); }
  
  
  const handleGalleries = (newname, newicon) => {
    setUserGalleries(Object.values([...userGalleries, { GalleryName: newname, icon: newicon }]));
    console.log(userGalleries)
  };
  
  const handleSubmitGallery = (event) => {
    event.preventDefault();
    //console.log("submission gallery");
    if (!newName.trim()) {
      alert("Gallery name cannot be empty!");
      return;
    }
    createGallery(newName); //calls function to create gallery in the database
    handleGalleries(newName, '');  // Proceed with gallery creation
    handleClose();  //Close the modal *after* form is submitted.
  };
  const handleMessages = (newMessage) => {
    setDirectMessages([...directMessages, { senderID: 'Jane Doe', receiverID: 'John Doe', message: newMessage }]);
  };

  const handleSubmitMessages = (event) => {
    event.preventDefault();  // Prevents page reload on submit
    handleMessages(newMessage); 
    setNewMessage("");
  };
  
  /*SECTION - ELEMENTS */

  const ProfilePic = () => {
    let picUrl = userVar.profilepic;
    let name = userVar.username;
    if (picUrl == null && name != null) {
      let words = name.split(' ');
      let initials = words.map(word => word.charAt(0).toUpperCase()).join('');
      return (
        <span style={{ width: '50%', height: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <Image src='bublii_bubble.png' id="avatar" style={{ height: '100%', width: '100%' }} />
          <h1 className="" style={{ position: 'absolute', color: 'black', margins: '0', width: '100%', textAlign: 'center', fontSize: '5vw' }}>{initials}</h1>
        </span>
      );
    } else {
      return (
        <span style={{ width: '50%', height: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Image src={picUrl} id="avatar" style={{ height: '100%', width: '100%' }} />
        </span>
      );
    }
  };
  const getChannels = useCallback(async (name) => {
    try {      
        const token = localStorage.getItem('auth-token');        
        
        // Fetch gallery channels
        const channelsResponse = await fetch(`/api/gal/getChannels?galleryName=${encodeURIComponent(name)}`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });
        if(channelsResponse){
          const channelsData = await channelsResponse.json();
          //console.log("Channels response ", channelsData);    
          const galleryName = Object.keys(channelsData)[0];
          const channels = channelsData[galleryName];
          if(!Array.isArray(channels)) {channels = [];}
          //console.log("Channels ", channels); 
          setGalleryChannels(prevChannels => {
            //console.log('Setting galleryChannels:', JSON.stringify(channels));
            return channels;
          });        
        }
    } catch (error) {
      //console.error('Login failed:', error);
      setGalleryChannels([]);
    }
  }, []);
  
  const GalleryList = React.memo(() => {
    const galleryNames = userGalleries.map((membership) => membership.GalleryName);
    const handleGalleryClick = useCallback((galleryName) => {
      console.log("Getting Channels for " + galleryName);
      getChannels(galleryName);
    }, [getChannels]);
  
    return (        
      userGalleries.map((item, index) => (
        <Nav.Link 
          eventKey={item.GalleryName} 
          key={index} 
          onClick={() => handleGalleryClick(item.GalleryName)}
        >
          <span className="channel-icon">
            <Icon name={item.icon || FindClosestIcon(item.GalleryName)} size={24} />
          </span>
          {item.GalleryName}
        </Nav.Link>
      ))
    );
  });
  const GalleryPageList = ({ galleries }) => {
    return (        
        galleries.map((item, index) => (
        <Gallery item={item} key={index} galleryChannels={galleryChannels} gallerySize={galleryNavWidth} user={userVar}/>
      ))
    
    );
  }; 
  
  const MessageList = ({ messages }) => {
    return (
      <span>
        {messages.map((item, index) =>
          <div className="message recipient flex items-center justify-end my-2">
            <div className="text bg-[#7ed957] text-black p-2 rounded-lg mr-2 max-w-[60%]">{item.message}</div>
            <User className="icon" />
          </div>
        )}
      </span>
    )
  };
  
  const ModalAddGallery = () => {
    return(
        <Modal.Body> 
            <h5 className="text-center">Create a Gallery</h5>
            <form onSubmit={handleSubmitGallery}>
            <Col>
                <Row><label>Name:</label></Row>
                <Row><input type='text' id='newName-gallery' value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder='Name of your new Gallery' autoFocus/></Row>
                <Row><input type='submit' value="Submit" /></Row>
            </Col>
            </form>
        </Modal.Body>
    );
  };
  
  // Push the gallery to database
  const createGallery = async (galleryName) => {
    // Get the auth token, for example from localStorage or a cookie
    const token = localStorage.getItem('auth-token');  // Adjust according to where you store your token
    
    try {
      // Send POST request to backend to create gallery
      const response = await fetch('/gal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Pass token as Bearer in the Authorization header
        },
        body: JSON.stringify({ galleryName }), // Pass the gallery name in the body
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        // Handle server error
        console.error('Error:', result);
        alert('Failed to create gallery: ' + result.msg || 'Unknown error');
        return;
      }
  
      // Successfully created the gallery
      console.log('Gallery created:', result);
      alert('Gallery created successfully!');
  
      // Optionally, you can update the UI here with the new gallery or trigger a re-fetch of galleries
  
    } catch (error) {
      console.error('An error occurred:', error);
      alert('An error occurred while creating the gallery.');
    }
  };
  
  // SHARED ELEMENT LIST
  const contextValue = {
    ProfilePic: ProfilePic,
    Username: "@John_Doe77",
    Displayname: "Johnny Dough",
    Aboutme: "John Doe is a mysteriously unlucky man, whose name is mostly found on corpses.",
  };
  return(
    <section>
      <Tab.Container className="tab-content text-start" defaultActiveKey="page-1">
        <Row className='justify-content-start' id="main-container">
          <Resizable id="gallery-sidebar-resizable" maxWidth={"15vw"} minWidth={"3vw"} enable={{ right: true }} size={{ width: ToPX(galleryNavWidth) }}
            onResizeStop={(e, direction, ref, d) => {  
                if(d.width != 0){      
                    let ratio = Number((100 * (d.width) / window.innerWidth).toFixed(2));
                    let prev = Number(parseFloat(galleryNavWidth));
                    let newWidth = (prev + ratio).toFixed(2);           
                    setGalleryNavWidth(newWidth);
                }
            }}>
            <Col id="sidebar-list">
              <Nav variant="pills" defaultActiveKey="Me" className="flex-column d-flex align-items-start">
                <Nav.Link eventKey="page-dm"><span className="channel-icon"><MessageCircleDashed /></span> Direct Messages</Nav.Link>
                <Nav.Link className="separator" disabled></Nav.Link>
                <GalleryList />
                <Nav.Link onClick={() => handleClick('addGallery-modal')} className="add-gallery"><span className="channel-icon"><Plus /></span> Add a Gallery</Nav.Link>
                <Nav.Link onClick={() => handleClick('status-modal')} className="mt-auto user-status"><span className="channel-icon"><CircleUser /></span> Me</Nav.Link>
                <Nav.Link onClick={() => handleClick('settings-modal')} className=""><span className="channel-icon"><LoaderPinwheel /></span> Settings</Nav.Link>
              </Nav>
            </Col>
          </Resizable>
          <Col id="pages">
            <Tab.Content id="pages-content">                  
                <Tab.Pane eventKey="page-dm" className="no-parent-padding">
                    <Col id="sidebar-dm">
                    <Nav id="dm-list" variant="pills" defaultActiveKey="Me" className="flex-column d-flex align-items-start">
                        <Row id="sidebar-dm-options">
                        <Col>Private</Col>
                        </Row>
                        <div className="separator" disabled></div>
                        <Nav.Link><icons.User /> John Doe</Nav.Link>
                        <Nav.Link><icons.User /> Jane Doe</Nav.Link>
                        <Nav.Link><icons.User /> Julie Doe</Nav.Link>
                    </Nav>                      
                    </Col>
                    <ChatContainer barSizes={galleryNavWidth + dmNavWidth} user={userVar}/>
                </Tab.Pane>
              <GalleryPageList galleries={userGalleries} />
            </Tab.Content>
          </Col>
        </Row >
      </Tab.Container>
      <Modal show={showState === 'addGallery-modal'} onHide={handleClose} id="addGallery-modal" className="modal-dialog-centered">
        <Modal.Dialog><Modal.Header><Button className="btn-close" onClick={handleClose}></Button></Modal.Header> <ModalAddGallery /> </Modal.Dialog>
       </Modal>

      <Modal show={showState === 'status-modal'} onHide={handleClose} id="status-modal" className="modal-dialog-centered">
        <Modal.Dialog >
          <Modal.Header><Button className="btn-close" onClick={handleClose}></Button></Modal.Header>
          <Modal.Body>
            <h5 className="text-center">Your Status</h5>
            <Form>
                <ProfilePic />
                <Row><Form.Label id="placeholder"></Form.Label></Row>
                <Row><Form.Label id="placeholder"></Form.Label></Row>
                <Row><input type="submit" value="Logout" onClick={logout}></input></Row>
            </Form>
          </Modal.Body>
        </Modal.Dialog>
      </Modal>
      <Modal show={showState === 'settings-modal'} onHide={handleClose} id="settings-modal" fullscreen="true">
        <Modal.Dialog className="modal-dialog-centered modal-fullscreen">
          <Modal.Header><div id="settings-close-button"><Button className="btn-close" onClick={handleClose}></Button></div></Modal.Header>
          <Modal.Body>
            <AppContext.Provider value={contextValue}>
              <Settings userVars={userVar}/>
            </AppContext.Provider>
          </Modal.Body>
        </Modal.Dialog>
      </Modal>

    </section>
    );
}

export default Main;
