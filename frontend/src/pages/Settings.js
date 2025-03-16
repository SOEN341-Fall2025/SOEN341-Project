import '../style/settings.css';
import React from 'react';
import { AppContext } from '../AppContext';
import { useContext } from 'react';
import { useState } from 'react';
import { Image, Button, Form , Modal, Row, Col, Tab, Nav } from 'react-bootstrap';

function Settings({userVars}) {
    
      const [modalState, setModalState] = useState("close");
      const handleClose = () => setModalState(false);
      function handleClick(key) {
          setModalState(key);
      }              
          
    const updateUser = async (userId, columnName, newValue) => {
        const token = localStorage.getItem('auth-token');    
        try {      
          const updateResponse = await fetch('/api/auth/updateUser', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ userId, columnName, newValue })
          });
          const updateData = await updateResponse.json();
          if(updateData){
            console.log("Channels response ", updateData);    
          }
      } catch (error) {
        console.error('Request failed:', error);
      } 
    };
      const handleColorChange = (event) => {
          const color = event.target.value; // Get the selected color
          const id = event.target.id;      // Get the ID of the input
          console.log(`Color: ${color}, ID: ${id}`);
          userVars.settings[id] = color;
          //console.log(userVars.settings);
          const userId = userVars.userID;    
          updateUser(userId, "settings", userVars.settings);
      }
      const { ProfilePic, Username, Displayname, Aboutme } = useContext(AppContext);
    return (      
      <section>
        <div className="settings">
          <Tab.Container className="tab-content settings-page col-6 col-md-7 ps-5 pe-10 pt-10 text-start" defaultActiveKey="settings-profile">            
          <Row>
              <Col sm={3} id="settings-nav" className="d-flex flex-column justify-content-center">
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
              <Col sm={9} id="settings-pages">
                <Tab.Content>                  
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
                        <Form.Control as="textarea" rows={5} placeholder={Aboutme} disabled />
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
                        <div className="justify-between"> 
                          <Form.Control type="color" id="colorForm.Control1" defaultValue={userVars.clrAccent} title="Choose your color" disabled/>                   
                          <Button type="submit" className="btn btn-secondary" id="colorEdit-accent" onClick={() => handleClick('settings-view-modal-1')}>Change 🖊</Button>
                        </div>
                        <Form.Label className="form-control form-control-color" id="prevColor1"></Form.Label>
                      </div>
                    </Form.Group>
                    <Form.Group className="divframe"> 
                      <Form.Label htmlFor="colorForm.Control" className="form-label">Navbar Color</Form.Label>
                      <div className="d-flex flex-column">   
                        <div className="justify-between"> 
                          <Form.Control type="color" id="colorForm.Control2" defaultValue={userVars.clrNavbar} title="Choose your color" disabled />                   
                          <Button type="submit" className="btn btn-secondary" id="colorEdit-bkg" onClick={() => handleClick('settings-view-modal-2')}>Change 🖊</Button>
                        </div>
                        <Form.Label className="form-control form-control-color" id="prevColor2"></Form.Label>
                      </div>
                    </Form.Group>
                    <Modal show={modalState === "settings-view-modal-1"} onHide={handleClose} eventKey="settings-view-modal-1" >
                      <Modal.Dialog className="modal-dialog modal-dialog-centered">
                          <Modal.Header closeButton>
                          <Modal.Title>Choose your Accent</Modal.Title></Modal.Header>
                          <Modal.Body>                      
                            <h6 className="label text-center">Enter Modified Hex Value</h6>                            
                            <Form.Control 
                              type="color" 
                              id="clrAccent" 
                              defaultValue={userVars.clrAccent} 
                              onChange={handleColorChange} 
                              title="Choose your color"/> 
                            <Row><input type='submit' value="Submit" onClick={handleClose}/></Row>
                          </Modal.Body>
                      </Modal.Dialog>
                    </Modal>
                    <Modal show={modalState === "settings-view-modal-2"} onHide={handleClose} eventKey="settings-view-modal-2" >
                      <Modal.Dialog className="modal-dialog modal-dialog-centered">
                          <Modal.Header closeButton>
                          <Modal.Title>Choose your Nav Color</Modal.Title></Modal.Header>
                          <Modal.Body>                      
                            <h6 className="label text-center">Enter Modified Hex Value</h6>
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