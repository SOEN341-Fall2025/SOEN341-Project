import '../style/settings.css';
import React from 'react';
import { AppContext, RGB_A } from '../AppContext';
import { useContext } from 'react';
import { useState } from 'react';
import { Image, Button, Form , Modal, Row, Col, Tab, Nav } from 'react-bootstrap';

function Settings({userVars}) {
    
      const [modalState, setModalState] = useState("close");
      const handleClose = () => setModalState(false);
      function handleClick(key) {
          setModalState(key);
      }              
      const [alphas, setAlphas] = useState({});
    const updateUser = async (userId, columnName, newValue) => {
        const token = localStorage.getItem('auth-token');    
        try {       
          const updateResponse = await fetch('/api/auth/updateUser', {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, columnName, newValue })
          });
          if (!updateResponse.ok) {
            throw new Error(`HTTP error! status: ${updateResponse.status}`);
          }
          const updateData = await updateResponse.json();
          console.log("Channels response ", updateData);       
          return updateData;
      } catch (error) {
        console.error('Request failed:', error);
      } 
    };
    const handleDone = () => {
      console.log(JSON.stringify(userVars.settings));
      window.location.reload();      
    }
    const handleAlphaChange = (event) => {
      setAlphas[event.target.id] = parseFloat(event.target.value)
      console.log(alphas);
    };
      const handleColorChange = (event) => {
          const color = event.target.value; // Get the selected color
          const id = event.target.id;      // Get the ID of the input
          console.log(`Before ${id} change: ${userVars.settings[id]}`);
          /*const a = alphas[id];
          if(a){color = RGB_A(color, a)}*/
          /*console.log(`Seetings: ${id}, ${userVars.settings[id]}`);
          console.log(`Seetings: ${id}, new: ${userVars.settings[id]}`);
          console.log(userVars.settings);*/
          userVars.settings[id] = color;
          console.log(`After ${id} change: ${userVars.settings[id]}`);
          const userId = userVars.userID;    
          updateUser(userId, "settings", userVars.settings);
      }
      const { ProfilePic, Username, Displayname, Aboutme } = useContext(AppContext);
    return (      
      <section>
        <div className="settings">
          <Tab.Container className="tab-content settings-page col-6 col-md-7 ps-5 pe-10 pt-10 text-start" defaultActiveKey="settings-profile">            
          <Row>
              <Col sm={4} id="settings-nav" className="d-flex flex-column justify-content-center">
              <Nav variant="pills" className="flex-column ps-30">
                  <Form.Label className="label labelnav px-3">User Settings</Form.Label>
                  <Nav.Item><Nav.Link eventKey="settings-profile">My Profile</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="settings-account">My Account</Nav.Link></Nav.Item>
                  <Form.Label className="label labelnav px-3">App Settings</Form.Label>
                  <Nav.Item><Nav.Link eventKey="settings-view">Appearance</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="settings-chats">Chat & Channels</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="settings-notif">Notifications</Nav.Link></Nav.Item>
                </Nav>
              </Col>              
              <Col sm={5} id="settings-pages">
                <Tab.Content style={{width:'50%'}}>                  
                  <Tab.Pane eventKey="settings-profile">
                    <h3>Profile</h3>       
                    <Form.Group className="divframe">
                      <Form.Label className="label px-1">Display Name</Form.Label>
                      <div className="justify-between">
                        <Form.Control type="text" plaintext defaultValue={Displayname} id="display-name" disabled />            
                        <Button variant="secondary" id="modal-profile-1" onClick={() => handleClick('modal-profile-1')}>🖊</Button>
                      </div>                    
                      <Form.Label className="label px-1">User Name</Form.Label>
                      <div className="justify-between">      
                        <Form.Control type="text" plaintext defaultValue={Username} id="user-name" disabled />
                        <Button variant="secondary" id="modal-profile-2" onClick={() => handleClick('modal-profile-2')}>🖊</Button>
                      </div>                    
                      <Form.Label className="label px-1">About Me</Form.Label>
                      <div className="justify-between">      
                      <div className="flex-grow">
                        <Form.Control as="textarea" rows={5} style={{width:'10vw!important'}} placeholder={Aboutme} disabled /> </div>
                        <Button variant="secondary" id="modal-profile-3" onClick={() => handleClick('modal-profile-3')}>🖊</Button>
                      </div>      
                      <Form.Label className="label px-1">Avatar</Form.Label>   
                      <div className="justify-between"> 
                        <ProfilePic />
                        <Button variant="secondary" id="modal-profile-4" onClick={() => handleClick('modal-profile-4')}>🖊</Button>
                      </div>                    
                    </Form.Group>        
                  
                  
                    <Modal show={modalState === 'modal-profile-1'} onHide={handleClose} id="modal-profile-1" >
                      <Modal.Dialog className="modal-dialog modal-dialog-centered">
                          <Modal.Header><Button className="btn-close" data-bs-dismiss="modal"></Button></Modal.Header>
                          <Modal.Body>                      
                            <h5 className="text-center">Change Your Display Name</h5>
                            <h6 className="label text-center">Enter Modified Name and Password</h6>
                            <Form>
                              <Form.Group>
                                <Form.Label htmlFor="modEmail">Display Name</Form.Label>
                                <Form.Control type="email" id="modEmail" aria-describedby="modEmail" placeholder="Enter email" />
                                <small id="emailHelp" className="form-text text-muted">Please only use numbers, letter, underscores, or periods.</small>
                              </Form.Group>
                              <Form.Group>
                                <Form.Label htmlFor="exampleForm.ControlPassword1">Password</Form.Label>
                                <Form.Control type="password" id="exampleForm.ControlPassword1" placeholder="Password" />
                              </Form.Group>
                              <Button type="submit" className="btn btn-primary">Submit</Button>
                            </Form>
                          </Modal.Body>
                      </Modal.Dialog>
                    </Modal>
                    <Modal show={modalState === "modal-profile-2"} onHide={handleClose} eventKey="modal-profile-2" >
                      <Modal.Dialog className="modal-dialog modal-dialog-centered">
                          <Modal.Header><Button className="btn-close" data-bs-dismiss="modal"></Button></Modal.Header>
                          <Modal.Body>                      
                            <h5 className="text-center">Change Your Username</h5>
                            <h6 className="label text-center">Enter Modified Name and Password</h6>
                          </Modal.Body>
                      </Modal.Dialog>
                    </Modal>
                    <Modal show={modalState === "modal-profile-3"} onHide={handleClose} eventKey="modal-profile-3" >
                      <Modal.Dialog className="modal-dialog modal-dialog-centered">
                          <Modal.Header><Button className="btn-close" data-bs-dismiss="modal"></Button></Modal.Header>
                          <Modal.Body>                      
                            <h5 className="text-center">Change Your About Me</h5>
                          </Modal.Body>
                      </Modal.Dialog>
                    </Modal>
                    <Modal show={modalState === "modal-profile-4"} onHide={handleClose} eventKey="modal-profile-4" >
                      <Modal.Dialog className="modal-dialog modal-dialog-centered">
                          <Modal.Header><Button className="btn-close" data-bs-dismiss="modal"></Button></Modal.Header>
                          <Modal.Body>                      
                            <h5 className="text-center">Change Your Avatar</h5>
                            <h6 className="label text-center">Enter Modified Image</h6>
                            <Form>
                              <Form.Group>
                                <div className="d-flex align-items-start flex-column">
                                  <Form.Label htmlFor="avatarFile">Upload new avatar</Form.Label>
                                  <Form.Control type="file" id="avatarFile" />
                                </div>
                              </Form.Group>
                              <div className="justify-end"><Button type="submit" className="btn btn-secondary" id="avatarChanger">Done</Button></div>
                            </Form>
                          </Modal.Body>
                      </Modal.Dialog>
                    </Modal>
                  </Tab.Pane>
                  
                  <Tab.Pane className="tab-pane" eventKey="settings-account" role="tabpanel">
                    <h3>Account</h3>              
                    <Form.Group className="divframe">
                      <Form.Label className="label px-1">Password</Form.Label>   
                      <div className="justify-between">   
                        <Form.Control plaintext type="password" defaultValue="********" id="email" aria-label="********" disabled />
                        <Button  className="btn edit btn-primary" data-bs-toggle="modal" data-bs-target="#modal-profile-4">🖊</Button>
                      </div>      
                      <Form.Label className="label px-1">Email</Form.Label>   
                      <div className="justify-between">   
                        <Form.Control plaintext type="email" defaultValue="j.smith77@gmail.com" id="email" disabled />
                        <Button  className="btn edit btn-primary" data-bs-toggle="modal" data-bs-target="#modal-profile-3">🖊</Button>
                      </div>  
                    </Form.Group>            
                    <Modal show={modalState === "modal-one"} onHide={handleClose} eventKey="settings-account-modal-1" >
                      <Modal.Dialog className="modal-dialog modal-dialog-centered">
                          <Modal.Header><Button className="btn-close" data-bs-dismiss="modal"></Button></Modal.Header>
                          <Modal.Body>                      
                            <h5 className="text-center">Change Your Password</h5>
                            <h6 className="label text-center">Enter Modified Name and Password</h6>
                          </Modal.Body>
                      </Modal.Dialog>
                    </Modal>
                    <Modal show={modalState === "modal-one"} onHide={handleClose} eventKey="settings-account-modal-2" >
                      <Modal.Dialog className="modal-dialog modal-dialog-centered">
                          <Modal.Header closeButton>
                          <Modal.Title>Modal heading</Modal.Title></Modal.Header>
                          <Modal.Body>                      
                            <h5 className="text-center">Change Your Email</h5>
                            <h6 className="label text-center">Enter Modified Name and Password</h6>
                          </Modal.Body>
                      </Modal.Dialog>
                    </Modal>
                  </Tab.Pane>
                  
                  <Tab.Pane className="tab-pane" eventKey="settings-view" role="tabpanel">
                    <h3>Appearance</h3>         
                    <Form.Group className="divframe"> 
                      <Form.Label htmlFor="colorForm.Control" className="form-label">Accent Color</Form.Label>
                      <div className="d-flex flex-column">   
                        <Form.Control 
                              type="color" 
                              id="clrAccent" 
                              defaultValue={userVars.clrAccent} 
                              onChange={handleColorChange} 
                              title="Choose your color"/> 
                        </div>
                    </Form.Group>
                    <Form.Group className="divframe"> 
                      <Form.Label htmlFor="colorForm.Control" className="form-label">Navbar Color</Form.Label>
                      <div className="d-flex flex-column">   
                        <Form.Control 
                              type="color" 
                              id="clrNavbar" 
                              defaultValue={userVars.clrNavbar} 
                              onChange={handleColorChange} 
                              title="Choose your color"/> </div>
                    </Form.Group>
                    <Form.Group className="divframe"> 
                      <Form.Label htmlFor="colorForm.Control" className="form-label">Navbar Gradient Color</Form.Label>
                      <div className="d-flex flex-column">   
                        <Form.Control 
                              type="color" 
                              id="clrNavbarGradient" 
                              defaultValue={userVars.clrNavbarGradient} 
                              onChange={handleColorChange} 
                              title="Choose your color"/> </div>
                    </Form.Group>
                    <Form.Group className="divframe"> 
                      <Form.Label htmlFor="colorForm.Control" className="form-label">Chatbox Color</Form.Label>
                      <div className="d-flex flex-column">   
                        <Form.Control 
                              type="color" 
                              id="clrChat" 
                              defaultValue={userVars.clrChat} 
                              onChange={handleColorChange} 
                              title="Choose your color"/> 
                        </div>
                    </Form.Group>
                    <Form.Group className="divframe"> 
                    <Form.Label className="form-control form-control-color" id="prevColor2"></Form.Label>
                    <Row>
                      <div className="hover-text" style={{ width:'fit-content'}}>
                        <input className='btn btn-primary' type='submit' value="Done" onClick={handleDone}/>
                        <span className="hover-text-content">Warning: This will reload the page!</span>
                      </div>
                    </Row>  
                    </Form.Group> 
                    <Modal show={modalState === "modal-one"} onHide={handleClose} eventKey="settings-modal" >
                      <Modal.Dialog className="modal-dialog modal-dialog-centered">
                        <Modal.Header><Button className="btn-close" data-bs-dismiss="modal"></Button></Modal.Header>
                          <Modal.Body>                      
                          </Modal.Body>
                      </Modal.Dialog>
                    </Modal>                 
                  </Tab.Pane>
                  
                  <Tab.Pane className="tab-pane" eventKey="settings-chats" role="tabpanel">
                    <h3>Chat & Channels</h3>                      
                    <Form.Group className="divframe"></Form.Group>
                    
                    <Modal show={modalState === "modal-one"} onHide={handleClose} eventKey="settings-chats-modal" >
                      <Modal.Dialog className="modal-dialog modal-dialog-centered">
                        <Modal.Header><Button className="btn-close" data-bs-dismiss="modal"></Button></Modal.Header>
                          <Modal.Body>                      
                          </Modal.Body>
                      </Modal.Dialog>
                    </Modal>
                  </Tab.Pane>
                  
                  <Tab.Pane className="tab-pane" eventKey="settings-notif" role="tabpanel">
                    <h3>Notifications</h3>                      
                    <Form.Group className="divframe"></Form.Group>
                    
                    <Modal show={modalState === "modal-one"} onHide={handleClose} eventKey="settings-notif-modal" >
                      <Modal.Dialog className="modal-dialog modal-dialog-centered">
                        <Modal.Header><Button className="btn-close" data-bs-dismiss="modal"></Button></Modal.Header>
                          <Modal.Body>                      
                          </Modal.Body>
                      </Modal.Dialog>
                    </Modal>
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>        
        </div>
      </section>
    );
  }

  export default Settings;