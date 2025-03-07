
import './style/app.css';
import './style/settings.css';
import React, { useState } from 'react';
import AppContext from './AppContext';
import Settings from './pages/Settings.js';
import './style/style.css';
import Login from './pages/Login.js';


import $ from 'jquery';
import { Resizable } from 're-resizable';

import { Image, Modal, Tab, Col, Row, Button, Nav, Form, TabContainer } from 'react-bootstrap'



import * as icons from 'lucide-react';
import { LoaderPinwheel } from 'lucide-react';
import { CircleUser } from 'lucide-react';
import { MessageCircleDashed } from 'lucide-react';
import { Camera } from 'lucide-react';
import { Mic } from 'lucide-react';
import { ArrowLeft} from 'lucide-react';
import { User } from 'lucide-react';

function App() {    
      
  const [showState, setShow] = useState("close");
  const handleClose = () => setShow(false);
  function handleClick(key) {
    setShow(key);
  }  
  const findClosestIcon = (name) => {
    const iconNames = Object.keys(icons);
    const words = name.toLowerCase().split(' ');
    
    for (const word of words) {
      const match = iconNames.find(iconName => 
        iconName.toLowerCase().includes(word)
      );
      if (match) return match;
    }
    
    return 'HelpCircle'; // Default icon if no match found
  };
  
  // ELEMENTS
  const Icon = ({ name, ...props }) => {
    const iconName = name || findClosestIcon(props.alt || '');
    const LucideIcon = icons[iconName];
    return LucideIcon ? <LucideIcon {...props} /> : null;
  };
  const ProfilePic = () => {
    let picUrl = userProfile.profilepic;
    let name = userProfile.displayname;
    let words = name.split(' ');
    let initials = words.map(word => word.charAt(0).toUpperCase()).join('');
    if(picUrl.length === 0){
      return (
        <span style={{ width: '50%', height: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>          
          <Image src='bublii_bubble.png' id="avatar" style={{ height:'100%', width:'100%' }} />
          <h1 className="carousel-caption" style={{ position: 'absolute',  color:'black' }}>&nbsp;{initials}</h1>
        </span>
      );
    } else{
      return(
        <span style={{ width: '50%', height: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Image src={picUrl} id="avatar" style={{ height:'100%', width:'100%' }} />
        </span>
      );
    }
  };
  
  const GalleryList = ({ galleries }) => {
    return (
      <span>
        {galleries.map((item, index) => (
          <Nav.Link eventKey={item.name}>
            <span className="channel-icon">
              <Icon name={item.icon || findClosestIcon(item.name)} size={24} />
            </span> 
            {item.name}
          </Nav.Link>
        ))}
      </span>
    );
  };
  
  // VARIABLES AND DATA
  const [width, setWidth] = React.useState("3.5");
  const [height, setHeight] = React.useState(200);
  const updateStyle = (styleProperty, newValue) => document.documentElement.style.setProperty(styleProperty, newValue);
  const userGalleries = [
    // GET items from database
    { name: 'Gift Ideas', icon: '' },
    { name: 'Music Channel', icon: 'Music' },
    { name: 'Work Server', icon: '' },
  ];
  const userProfile = {
    // GET items from database
    username: "@John",
    displayname: "Johnny Sanders",
    profilepic: "bublii_bubble.png",
  };

  // SHARED ELEMENT LIST
  const contextValue = {
      ProfilePic: ProfilePic,
      Username: "@John_Doe77",
      Displayname: "Johnny Dough",
      Aboutme: "John Doe is a mysteriously unlucky man, whose name is mostly found on corpses.",
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async (email, password) => {
    // Here, you can add authentication logic (API call or checking credentials)
    // For now, just set it to true to simulate successful login

    console.log("DEBUG: handleLogin called with:", email, password);

    try{
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.token) {
        console.log("Login was unsuccessful.", data);
        setIsLoggedIn(false);
        return;
      }

      console.log("Login was successful.", data);
      setIsLoggedIn(true);

    }catch(error){
      console.error("There was an error during login.");
    }
  };

  return(
      <section>      

        {/* Step 3: Conditionally render Login page or App page */}
      {isLoggedIn ? (
        <section>
          <Tab.Container className="tab-content text-start" defaultActiveKey="page-1">
            <Row className='justify-content-start' id="main-container">
              <Resizable id="sidebar-resizable" maxWidth="20vw" minWidth="3vw" enable={{ right:true }}
              size={{ width, height }}
              onResizeStop={(e, direction, ref, d) => {
                setHeight(height + d.height);
                let ratio = (100 * d.width / window.innerWidth);
                let w = (parseInt(width, 10) + ratio) + 'vw';
                updateStyle("--user-sidebar-length", w);
                setWidth(w);
              }}>
                <Col id="sidebar-list">
                  <Nav variant="pills" defaultActiveKey="Me" className="flex-column d-flex align-items-start">
                    <Nav.Link eventKey="page-dm"><span className="channel-icon"><MessageCircleDashed /></span> Direct Messages</Nav.Link>
                    <Nav.Link className="seperator" disabled><hr /><hr /></Nav.Link>
                    <GalleryList galleries={userGalleries} />
                    <Nav.Link onClick={() => handleClick('status-modal')} className="mt-auto user-status"><span className="channel-icon"><CircleUser /></span> Me</Nav.Link>
                    <Nav.Link onClick={() => handleClick('settings-modal')} className=""><span className="channel-icon"><LoaderPinwheel /></span> Settings</Nav.Link>
                  </Nav>
                </Col>            
              </Resizable>       
              
              <Col id="pages">
              <Tab.Content id="pages-content">
                    <Tab.Pane eventKey="page-dm" className="no-parent-padding">
                    <div id="mainpage-dms">
                      <div id="sidebar-dms">
                        
                      <Tab.Container>
                      <Col id="sidebar-dm">
                        <Nav id="dm-list" variant="pills" defaultActiveKey="Me" className="flex-column d-flex align-items-start">
                          <Row id="sidebar-dm-options">
                            <Col>Private</Col>
                          </Row>
                          <Nav.Link className="seperator" disabled><hr /><hr /></Nav.Link>
                          <Nav.Link><icons.User/> John Doe</Nav.Link>
                          <Nav.Link><icons.User/> Jane Doe</Nav.Link>
                          <Nav.Link><icons.User/> Julie Doe</Nav.Link>

                        </Nav>

                      </Col>

                    </Tab.Container>
                      </div>
<div id="mainview-dms">
                                              
                        <div className="chat-container">
      {/* Go Back Button */}
      <div className="back-button">
        <ArrowLeft className="w-10 h-10 mr-2" />
        <span className="text-gray-700">Go Back</span>
      </div>

      {/* Chat Box */}
      <div className="chat-box">
        <div className="chat-header">*Chat Name*</div>

        {/* Messages */}
        <div className="message user ">
        <User className="icon" />
          <div className="text">Hello! How are you?</div>
        </div>

        <div className="message recipient ">
          <div className="text ">I'm good, thanks!</div>
          <User className="icon" />
        </div>
        </div>

         <Row id="chat-box" className="d-flex align-items-center">
         {/* Icons (Plus, Camera, Mic) */}
         <Col className="d-flex gap-2">
        <div id="plus"><icons.Plus /></div>
        <div id="camera"><Camera /></div>
        <div id="mic"><Mic /></div>
        </Col>

        {/* Input Box and Send Button */}
        <Col className="flex-grow-1">
        <div className="chat-input">
         <input
           type="text"
           placeholder="Type a message..."
           className="flex-grow-1 p-2 rounded border"
         />
          <button className="p-2 bg-[#4facfe] text-white rounded-md">Send</button>
        </div>
        </Col>
        </Row>
      
      
</div>
                      </div>
                    </div>
                    
                      <Form.Group className="divframe"></Form.Group>
                    </Tab.Pane>  
                    <Tab.Pane eventKey="page-1">
                      <h3>Page 1</h3>       
                      <Form.Group className="divframe"></Form.Group>
                    </Tab.Pane> 
              </Tab.Content>
              </Col>
            </Row >
        </Tab.Container>
        <Modal show={showState === 'status-modal'} onHide={handleClose} id ="status-modal" className="modal-dialog-centered" fullscreen="false">
            <Modal.Dialog >
              <Modal.Header><Button className="btn-close" onClick={handleClose}></Button></Modal.Header>
                <Modal.Body>
                <h5 className="text-center">Your Status</h5>
                <Form>
                  <Col xs={6} md={4}>
                    <ProfilePic/>
                  </Col >
                </Form>
                </Modal.Body>
            </Modal.Dialog>
          </Modal>
          <Modal show={showState === 'settings-modal'} onHide={handleClose} id ="settings-modal" fullscreen="true">
            <Modal.Dialog className="modal-dialog-centered modal-fullscreen">
              <Modal.Header><div id="settings-close-button"><Button className="btn-close" onClick={handleClose}></Button></div></Modal.Header>
                <Modal.Body>
                <AppContext.Provider value={contextValue}>
                  <Settings />
                </AppContext.Provider>
                </Modal.Body>
            </Modal.Dialog>
          </Modal>

        </section>
      ) : (
        <Login onLogin={handleLogin} />
      )}
      </section>
    );
}

export default App;
