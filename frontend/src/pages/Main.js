
import '../style/app.css';
import '../style/settings.css';
import '../style/style.css';
import Settings from './Settings.js';
import Gallery from './Gallery.js';
import ChatContainer from './ChatContainer.js';
import { Resizable } from 're-resizable';
import * as icons from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { Icon, FindClosestIcon, AppContext, UpdateStyle, GetStyle, ToPX } from '../AppContext.js';
import { Image, Modal, Tab, Col, Row, Button, Nav, Form, TabContainer } from 'react-bootstrap'
import { LoaderPinwheel, Plus, CircleUser, MessageCircleDashed, Camera, Mic, ArrowLeft, User, User2 } from 'lucide-react';

function Main({ userData, userMetadata, galleries, galleriesData }) {    
      
  /* SECTION VARIABLES AND DATA  */

  /*
  const [newChannelName, setNewChannelName] = useState("");
  const [newGalleryName, setNewGalleryName] = useState("");
  const [galleryNavWidth, setGalleryNavWidth] = useState(3.5);  
  const [userChannels, setUserChannels] = useState([
    { galleryName: 'Gift Ideas', channelName: 'General', icon: '' },
    { galleryName: 'Work Server', channelName: 'Cook', icon: '' }
]);   
  const [dmNavWidth, setDmNavWidth] = useState(17);   
  
  */
  const [showState, setShowState] = useState("close");
  const [userGalleries, setUserGalleries] = useState(galleries); 
  const [galleryChannels, setGalleryChannels] = useState([]);
  const [userNames, setUserNames] = useState([]);  
  const [directMessages, setDirectMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState("");  
  const [newName, setNewName] = useState("");  
  const [newMessage, setNewMessage] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [error, setError] = useState(false);  
  
  const [userVar, setUserVar] = useState(() => {
    if (userMetadata) {
      return {
        sizeGallerySidebar: "3.5vw",
        sizeChannelSidebar: "17vw",
        clrAccent: '#d2a292',
        clrChat: '#f0ffff',
        clrNavbar: '#f0ffff',
        clrNavbarGradient: '#d2a292',
        userGalleries: JSON.stringify(galleries),
        profilepic: userMetadata.profile_picture_url,
        aboutme: userMetadata.about_me,
        userID: userMetadata.user_id,
        username: userMetadata.username,
        settings: userMetadata.settings
      };
  }
  return {
    sizeGallerySidebar: "3.5vw",
    sizeChannelSidebar: "17vw",
    clrAccent: '#d2a292',
    clrChat: '#f0ffff',
    clrNavbar: '#f0ffff',
    clrNavbarGradient: '#d2a292'
  };
});
  
  /* SECTION - FUNCTIONS / FETCHES */
  
  const logout = () => {    
    localStorage.removeItem('authToken');
  }  
  
  useEffect(() => {
    function setStyles() {
      if (!userData?.settings) {
        //console.warn("userData.settings is undefined, skipping setStyles.");
        return; // Exit the function early if settings are not available
      }
      console.log(JSON.stringify(userMetadata.settings));
      console.log(userMetadata);
      const newUserVar = { ...userVar };
      newUserVar.clrAccent = userData.settings?.clrAccent || userVar.clrNavbar;
      newUserVar.clrChat = userData.settings?.clrChat || userVar.clrNavbar;
      newUserVar.clrNavbar = userData.settings?.clrNavbar || userVar.clrNavbar;
      newUserVar.clrNavbarGradient = userData.settings?.clrNavbarGradient || userVar.clrNavbarGradient;
  
      setUserVar(newUserVar);
  
      UpdateStyle('--color-accent', newUserVar.clrAccent);
      UpdateStyle('--color-bar', newUserVar.clrNavbar);
      UpdateStyle('--color-bar-gradient', newUserVar.clrNavbarGradient);
    }
  
      setStyles();
  }, [userVar.settings]);
    
  const getChannels = useCallback(async (name, id) => {
    try {      
        const token = localStorage.getItem('authToken');        
        
        // Fetch gallery channels
        const channelsResponse = await fetch(`/gal/getChannels?galleryName=${encodeURIComponent(name)}&galleryID=${encodeURIComponent(id)}`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });
        
        if (!channelsResponse.ok) {
          console.error("Failed to fetch channels:", channelsResponse.status);
          setGalleryChannels([]);
          return;
        }

        const channelsData = await channelsResponse.json();  
        const galleryName = Object.keys(channelsData)[0];
        let channels = channelsData[galleryName];  

        if (!Array.isArray(channels)) {
          console.warn("Channels is not an array:", channels);
          channels = [];
        }

        setGalleryChannels(channels);
    } catch (error) {
      console.error("Error fetching channels:", error);
      setGalleryChannels([]);
    }
  }, []);

  useEffect(() => {
    console.log("Channels have been updated:", galleryChannels);
  }, [galleryChannels]);
  
  
  useEffect(() => {
    console.log("currentUser:", currentUser);
    if(currentUser !== ""){
      fetchDMs(currentUser);
    }
      
    }, [currentUser]);
  
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
  
    const saveChannels = async(channelName, galleryID) =>{
  
      // Get the auth token, for example from localStorage or a cookie
      const token = localStorage.getItem('authToken');  // Adjust according to where you store your token
  
      try {
        // Send POST request to backend to create gallery
        const response = await fetch('/gal/createChannel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Pass token as Bearer in the Authorization header
          },
          body: JSON.stringify({ channelName,galleryID }), // Pass the gallery name in the body
        });
  
        const result = await response.json();
    
        if (!response.ok) {
          // Handle server error
          console.error('Error:', result);
          alert('Failed to save channel: ' + result.msg || 'Unknown error');
          return;
        }
    
        // Successfully created the gallery
        console.log('Channel saved:', result);
        alert('Channel successfully!');
  
      } catch (error) {
        console.error('An error occurred:', error);
        alert('An error occurred while saving the channel.');
      }
  
    };

  /*SECTION - HANDLES (EVENTS) */

  function handleClick(key) { setShowState(key); }
  const handleClose = () => setShowState(false);
 
 
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
  
  const GalleryList = React.memo(() => {
    const galleryNames = userGalleries.map((membership) => membership.GalleryName);
    const handleGalleryClick = useCallback((galleryName, galleryID) => {
      console.log("Getting Channels for " + galleryName);
      getChannels(galleryName, galleryID);
    }, [getChannels]);
    return (        
      galleriesData.map((item, index) => (
        <Nav.Link 
          eventKey={item.GalleryName} 
          key={index} 
          onClick={() => {handleGalleryClick(item.GalleryName, item.GalleryID)}}
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
        <Gallery 
          key={index} 
          gallery={item} 
          galleryChannels={galleryChannels} 
          gallerySize={userVar.sizeGallerySidebar} 
          galleryName={item.GalleryName}
          userMetadata={userVar} 
        />
      ))
    
    );
  }; 

  const UserList = () => {
    return (
      userNames.map((item, index) =>
        <Nav.Link eventKey={item.username} onClick={() => setCurrentUser(item.username)}>
      <span className="user-icon">
        <User2 size={24} />
      </span>
      {item.username}
    </Nav.Link>
      )
    );
  };
  
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
                barSizes={userVar.sizeGallerySidebar + userVar.sizeChannelSidebar}
                user={userVar}
                header={item.username}
                messages={directMessages}
                type={"Channel"}
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
  const ModalAddUser = () => {};
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
  
  
  /** SECTION RENDER */
  return(
    <section>
      <Tab.Container className="tab-content text-start" defaultActiveKey="page-1">
        <Row className='justify-content-start' id="main-container">
          <Resizable id="gallery-sidebar-resizable" maxWidth={"18vw"} minWidth={"3.5vw"} enable={{ right: true }} size={{ width: ToPX(userVar.sizeGallerySidebar) }}
            onResizeStop={(e, direction, ref, d) => {  
                if(d.width != 0){      
                    let ratio = Number((100 * (d.width) / window.innerWidth).toFixed(2));
                    let prev = Number(parseFloat(userVar.sizeGallerySidebar));
                    let newWidth = (prev + ratio).toFixed(2);           
                    setUserVar.sizeGallerySidebar(newWidth);
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
                        <Nav.Link><User /> John Doe</Nav.Link>
                        <Nav.Link><User /> Jane Doe</Nav.Link>
                        <Nav.Link><User /> Julie Doe</Nav.Link>
                    </Nav>                      
                    </Col>
                    <UserChatList usernames={userNames}/>
                </Tab.Pane>
              <GalleryPageList galleries={galleriesData} />
            </Tab.Content>
          </Col>
        </Row >
      </Tab.Container>
      <Modal show={showState === 'addGallery-modal'} onHide={handleClose} id="addGallery-modal" className="modal-dialog-centered">
        <Modal.Dialog><Modal.Header><Button className="btn-close" onClick={handleClose}></Button></Modal.Header> <ModalAddGallery /> </Modal.Dialog>
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
        </Modal.Dialog>
      </Modal>
      <Modal show={showState === 'status-modal'} onHide={handleClose} id="status-modal" className="modal-dialog-centered">
        <Modal.Dialog >
          <Modal.Header><Button className="btn-close" onClick={handleClose}></Button></Modal.Header>
          <Modal.Body>
            <h5 className="text-center">Your Status</h5>
            <Form>
                
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
              <Settings userVars={userVar} ProfilePic={ProfilePic} />
              <Gallery 
                userGalleries={userGalleries} 
                setUserGalleries={setUserGalleries} 
              />
          </Modal.Body>
        </Modal.Dialog>
      </Modal>

    </section>
    );
}

export default Main;
