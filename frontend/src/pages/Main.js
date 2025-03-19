
import '../style/app.css';
import '../style/settings.css';
import '../style/style.css';
import React, { useState, useEffect, useCallback } from 'react';
import { Icon, FindClosestIcon, AppContext, UpdateStyle, GetStyle, ToPX } from '../AppContext.js';
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
  const [newUserName, setNewUserName] = useState("");
  const [currentUser, setCurrentUser] = useState("");

  const [galleryNavWidth, setGalleryNavWidth] = useState(3.5);  
  const [dmNavWidth, setDmNavWidth] = useState(17);  
  const [userGalleries, setUserGalleries] = useState(galleries); 
  const [error, setError] = useState(false);

  const[userNames, setUserNames] = useState([]);
  
  const [userChannels, setUserChannels] = useState([
    { galleryName: 'Gift Ideas', channelName: 'General', icon: '' },
    { galleryName: 'Work Server', channelName: 'Cook', icon: '' }
]);   
  const [galleryChannels, setGalleryChannels] = useState([
    { galleryName: 'Gift Ideas', channelName: 'General', icon: 'hashtag' }]
  );
  const [newMessage, setNewMessage] = useState("");
  const [directMessages, setDirectMessages] = useState([]);

  const logout = () => {    
    localStorage.removeItem('authToken');
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
      if (!userData?.settings) {
        console.warn("userData.settings is undefined, skipping setStyles.");
        return; // Exit the function early if settings are not available
      }
  
      const newUserVar = { ...userVar };
      newUserVar.clrAccent = userData.settings?.clrAccent || userVar.clrNavbar;
      newUserVar.clrChat = userData.settings?.clrChat || userVar.clrNavbar;
      newUserVar.clrNavbar = userData.settings?.clrNavbar || userVar.clrNavbar;
      newUserVar.clrNavbarGradient = userData.settings?.clrNavbarGradient || userVar.clrNavbarGradient;
  
      setUserVar(newUserVar);
  
      UpdateStyle("--color-accent", newUserVar.clrAccent);
      UpdateStyle("--color-bar", newUserVar.clrNavbar);
      UpdateStyle("--color-bar-gradient", newUserVar.clrNavbarGradient);
    }
  
    setStyles();
  }, [userVar.settings]);
    
  /*SECTION - FUNCTIONS */
   const handleClose = () => setShowState(false);
   function handleClick(key) { setShowState(key); }
  const handleChannels = (newGalleryName, newChannelName, newIcon) => {
    setUserChannels([...userChannels, { galleryName: newGalleryName, channelName: newChannelName, icon: newIcon }]);
  };

  const handleSubmitChannel = (event) => {
    event.preventDefault();
    handleChannels(newGalleryName, newChannelName, '');
  }

  const handleGalleries = (newname, newicon) => {
    setUserGalleries([...userGalleries, { GalleryName: newname, icon: newicon }]);
    createGallery(newname);
  };
  
  const handleSubmitGallery = (event) => {
    event.preventDefault();  // Prevents page reload on submit
    handleGalleries(newName, '');  // Pass the new name and any other parameters
  };

  const handleUsers = (newUserName) => {
    setUserNames([...userNames, {username: newUserName}]);
  };

  const handleSubmitUser = async (event) => {
    event.preventDefault();  // Prevents page reload on submit
    console.log("handleSubmitUser is accessed");
    const verifyUser = await fetchUser(newUserName);  // Pass the new name and any other parameters
    console.log("Verify User", verifyUser);
    if(verifyUser){
      handleUsers(newUserName);
    }else{
      console.log("Unsuccessful");
    }
  };

  
  const handleMessages = (newMessage) => {
    setDirectMessages([...directMessages, { senderID: 'Jane Doe', receiverID: 'John Doe', message: newMessage }]);
  };

  const handleSubmitMessages = (event) => {
    event.preventDefault(); // Prevents page reload on submit
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
        <span style={{ width: '50%', height: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Image src='bublii_bubble.png' id="avatar" style={{ height: '100%', width: '100%' }} />
          <h1 className="carousel-caption" style={{ position: 'absolute', color: 'black' }}>&nbsp;{initials}</h1>
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
        const channelsResponse = await fetch(`/api/gallery/getChannels?galleryName=${encodeURIComponent(name)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
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

  const GalleryChannelList = ({ g }) => {
    return (
        g.map((item, index) => (
          <Nav.Link eventKey={item.name} onClick={() => setNewGalleryName(item.name)}>
            <span className="channel-icon">
              <Icon name={item.icon || FindClosestIcon(item.name)} size={24} />
            </span>
            {item.name}
          </Nav.Link>
        ))
    );
  };
  
  const GalleryPageList = ({ galleries }) => {
    return (        
        galleries.map((item, index) => (
        <Gallery item={item} key={index} galleryChannels={galleryChannels} gallerySize={galleryNavWidth} user={userVar}/>
      ))
    
    );
  }; 

  const UserList = () => {
    return (
      userNames.map((item, index) =>
        <Nav.Link eventKey={item.username} onClick={() => setCurrentUser(item.username)}>
      <span className="user-icon">
        <Icon name={icons.User2} size={24} />
      </span>
      {item.username}
    </Nav.Link>
      )
    );
  };

  useEffect(() => {
    console.log("currentUser:",currentUser);
    if(currentUser !== ""){
    fetchDMs(currentUser);
    }
      
    }, [currentUser]);

  const UserChatList = ({usernames}) => {
    return (
      <>
        {usernames.map((item, index) => {
          // Check if the username matches the currentUser
          if (item.username === currentUser) {
            return (
              <ChatContainer
                key={index}  // Add a key to help React identify each item in the list
                eventKey={item.username}
                barSizes={galleryNavWidth + dmNavWidth}
                user={userVar}
                header={item.username}
                messages={directMessages}
              />
            );
          }
          return null; // Return null if the username doesn't match currentUser
        })}
      </>
    );
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
                placeholder='Name of your new Gallery' /></Row>
                <Row><input type='submit' value="Submit" /></Row>
            </Col>
            </form>
        </Modal.Body>
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

  const ModalAddUser = () => {
    return(
        <Modal.Body> 
            <h5 className="text-center">Add a User</h5>
            <form onSubmit={handleSubmitUser}>
            <Col>
                <Row><label>Name:</label></Row>
                <Row><input type='text' id='newName-user' value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder='Name of your new User' /></Row>
                <Row><input type='submit' value="Submit" /></Row>
            </Col>
            </form>
        </Modal.Body>
    );
  };

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

  const fetchUser = async (username) => {
    let verifyUser = false;
    try {
      // Make GET request to the backend with the Authorization header
      const response = await fetch(`/dm/fetch-user?username=${username}`);
      if (!response.ok) {
        return verifyUser;
      } 

      const result = await response.json();
      console.log(result.user.username,username);
      
      verifyUser = (username === result.user.username) && !userNames.some(user => user.username === username);

      
    } catch (error) {
      setError('An error occurred while fetching galleries: ' + error.message);
    }
    return verifyUser;

  };

  //fetch the users' name if they have ever contacted with the logged in user
  const fetchDmUsers = async () => {

    const token = localStorage.getItem('authToken');  // Adjust according to where you store your token
  
    try {
      // Send POST request to backend to create gallery
      const response = await fetch('/dm/contacts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Pass token as Bearer in the Authorization header
        },
      });

      const result = await response.json();

      setUserNames(result.data.map(contact => ({...contact})));

    } catch (error) {
      console.error('An error occurred:', error);
      alert('An error occurred while fetching contacts.');
    }
  

  };

  const fetchDMs = async (username) => {
    const token = localStorage.getItem('authToken');  // Adjust according to where you store your token

    try {
        // Send GET request to backend to retrieve DMs
        const response = await fetch(`/dm/retrieve?username=${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,  // Pass the token in Authorization header
            },
        });

        // Check if the response is OK (status code 200)
        if (!response.ok) {
            throw new Error('Failed to fetch DMs');
        }

        // Parse the JSON response
        const result = await response.json();

        if (result?.updatedData) {
          // Map the relevant fields (Message, PopperID, BubblerID)
          const messageDetails = result.updatedData.map(item => ({
              PopperUsername: item.PopperUsername,
              BubblerUsername: item.BubblerUsername,
              Message: item.Message
          }));

          // Log the message details to see the output
          setDirectMessages(messageDetails);
      } else {
          console.log('No messages found');
      }

        // Handle the result (you can process or display it)
        if (result.msg === "DMs were fetched.") {
            console.log('Fetched DMs:', result.updatedData);
            // Do something with the data, e.g., display messages
        } else {
            console.error('Error fetching DMs:', result);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        alert('An error occurred while fetching DMs.');
    }
};

  // Push the gallery to database
  const createGallery = async (galleryName) => {
    // Get the auth token, for example from localStorage or a cookie
    const token = localStorage.getItem('authToken');  // Adjust according to where you store your token
  
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
                <Nav.Link eventKey="page-dm" onClick={fetchDmUsers}><span className="channel-icon"><MessageCircleDashed /></span> Direct Messages</Nav.Link>
                <Nav.Link className="seperator" disabled><hr /><hr /></Nav.Link>
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
                        <Nav.Link className="separator" disabled><hr /><hr /></Nav.Link>
                        <UserList/>
                        <Nav.Link onClick={() => handleClick('addUser-modal')} className="add-user"><span className="channel-icon"><Plus /></span> Add a User</Nav.Link>

                    </Nav>                      
                    </Col>
                    <UserChatList usernames={userNames}/>
                </Tab.Pane>
              <GalleryPageList galleries={userGalleries} />
            </Tab.Content>
          </Col>
        </Row >
      </Tab.Container>
      <Modal show={showState === 'addGallery-modal'} onHide={handleClose} id="addGallery-modal" className="modal-dialog-centered">
        <Modal.Dialog >
          <Modal.Header><Button className="btn-close" onClick={handleClose}></Button></Modal.Header>
          <ModalAddGallery />
        </Modal.Dialog>
      </Modal>

      <Modal show={showState === 'addUser-modal'} onHide={handleClose} id="addUser-modal" className="modal-dialog-centered">
        <Modal.Dialog >
          <Modal.Header><Button className="btn-close" onClick={handleClose}></Button></Modal.Header>
          <ModalAddUser />
        </Modal.Dialog>
      </Modal>

      <Modal show={showState === 'addChannel-modal'} onHide={handleClose} id="addChannel-modal" className="modal-dialog-centered">
        <Modal.Dialog >
          <Modal.Header><Button className="btn-close" onClick={handleClose}></Button></Modal.Header>
          <ModalAddChannel />
        </Modal.Dialog>
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
