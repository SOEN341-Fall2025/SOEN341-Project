import '../style/settings.css';
import React from 'react';
import {AppContext} from '../AppContext.js';
import { useContext } from 'react';
import { useState } from 'react';


import { Image, Button, Form , Modal, Row, Col, Tab, Nav } from 'react-bootstrap';

function Settings() {
    
      const [modalState, setModalState] = useState("close");
      const [newAboutMe, setNewAboutMe] = useState("About me text");
      const [newUsername, setNewUsername] = useState("Enter new username");
      const [newPassword, setNewPassword] = useState( "Enter new Password");

      const getCookie = (name) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
      };
      const handleClose = () => setModalState(false);
      function handleClick(key) {
          setModalState(key);
      }
      const changeAboutMe = async ( newAboutMe) => {
        try {
        const token = getCookie("authToken");
         console.log("Sending data:", { token, newAboutMe }); 
          const response = await fetch("/api/newaboutme", {
            method: "POST",
            headers: {
               'Authorization': `Bearer ${token}`,
              "Content-Type": "application/json"
             
            },
            body: JSON.stringify({ newAboutMe }), 
          });
      
          const data = await response.json();
          console.log("Response from backend:", data); 
      
          if (!response.ok) {
            console.log("Update was unsuccessful.", data);
            return;
          }
      
          console.log("Update was successful.", data);
         handleClose();
        } catch (error) {
          console.error("There was an error in updating about me.", error);
        }
      };
      const changeusername = async ( newUsername) => {
        try {
        const token = getCookie("authToken");
         console.log("Sending data:", { token, newUsername }); 
          const response = await fetch("/api/newusername", {
            method: "PUT",
            headers: {
               'Authorization': `Bearer ${token}`,
              "Content-Type": "application/json"
             
            },
            body: JSON.stringify({ newUsername }), 
          });
      
          const data = await response.json();
          console.log("Response from backend:", data); 
      
          if (!response.ok) {
            console.log("Update was unsuccessful.", data);
            return;
          }
      
          console.log("Update was successful.", data);

         handleClose();
        } catch (error) {
      console.error("There was an error in updating username.", error);
        }
      };
 const changePassword = async ( newPassword) => {


        try {

        const token = getCookie("authToken");
         console.log("Sending data:", { token, newPassword }); 
          const response = await fetch("/api/newpassword", {
            method: "POST",
            headers: {
               'Authorization': `Bearer ${token}`,
              "Content-Type": "application/json"

            },
            body: JSON.stringify({ newPassword}), 
            
          });
        
          const data = await response.json();  
          console.log("reaponse:", response); 
          console.log("Response from backend:", data); 

          if (!response.ok) {
            console.log("Update was unsuccessful.", data);
            return;
          }

          console.log("Update was successful.", data);

         handleClose();
        } catch (error) {
          console.error("There was an error in updating password.", error);
        }
      };

      const { ProfilePic } = useContext(AppContext);
return (      
      <section>
        <div className="settings">
          <Tab.Container className="tab-content settings-page col-6 col-md-7 ps-5 pe-10 pt-10 text-start" defaultActiveKey="settings-profile">            
          <Row>
              <Col sm={3} id="settings-nav" className="d-flex flex-column justify-content-center">
              <Nav variant="pills" className="flex-column ps-30">
                  <Form.Label className="label labelnav px-3">User Settings</Form.Label>
                  <Nav.Item><Nav.Link eventKey="settings-profile">My Profile</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="settings-account">My Accounts</Nav.Link></Nav.Item>
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
                <Form.Label className="label px-1">Password</Form.Label>
                      <div className="justify-between">
<input type="password" row={1} placeholder={"Enter new password"} disabled />      

                        <Button variant="secondary" id="modal-profile-1" onClick={() => handleClick('modal-profile-1')}>🖊</Button>
                      </div>                    
                      <Form.Label className="label px-1">User Name</Form.Label>
                      <div className="justify-between">      
                        <Form.Control type="textarea" row={1} placeholder={newUsername} disabled />
                        <Button variant="secondary" id="modal-profile-2" onClick={() => handleClick('modal-profile-2')}>🖊</Button>
                      </div>                    
                      <Form.Label className="label px-1">About Me</Form.Label>
                      <div className="justify-between">      
                        <Form.Control as="textarea" rows={5} placeholder={newAboutMe} disabled />
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
 <h5 className="text-center">Change Your Password</h5>
                            <h6 className="label text-center">Enter new Password</h6>
                            <Form>
                              <Form.Group>      

                                <small id="emailHelp" className="form-text text-muted">Please only use numbers, letter, underscores, or periods.</small>
                              </Form.Group>
                              <Form.Group>
 <input type="password" rows={1} cols={40} onChange={(e) => setNewPassword(e.target.value)}/> 
                              <Button onClick={() => changePassword(newPassword)}>Submit</Button> 
                             </Form.Group>                        
                             </Form>
                          </Modal.Body>
                      </Modal.Dialog>
                    </Modal>
                    <Modal show={modalState === "modal-profile-2"} onHide={handleClose} eventKey="modal-profile-2" >
                      <Modal.Dialog className="modal-dialog modal-dialog-centered">
                          <Modal.Header><Button className="btn-close" data-bs-dismiss="modal"></Button></Modal.Header>
                          <Modal.Body> 
                            <Form>      
                               <Form.Group>   
                               <label>
                                <textarea
                                name="postContent"
                                placeholder={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                rows={1}
                                 cols={40}
      
                                /> 
                                 </label>
                               <Button onClick={() => changeusername(newUsername)}>Update Username</Button>
                               </Form.Group> 
                             </Form>         
                          </Modal.Body>
                      </Modal.Dialog>
                    </Modal>
                    <Modal show={modalState === "modal-profile-3"} onHide={handleClose} eventKey="modal-profile-3" >
                      <Modal.Dialog className="modal-dialog modal-dialog-centered">
                          <Modal.Header><Button className="btn-close" data-bs-dismiss="modal"></Button></Modal.Header>
                          <Modal.Body>
          
                           <div>
    
                             <label>
                                <textarea
                                name="postContent"
                                placeholder={newAboutMe}
                                onChange={(e) => setNewAboutMe(e.target.value)}
                                rows={4}
                                 cols={40}
      
                                /> 
                                 </label>
    <Button onClick={() => changeAboutMe(newAboutMe)}>Update About Me</Button>
  </div>
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
                                  <Form.Label for="avatarFile">Upload new avatar</Form.Label>
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
                        <Form.Control plaintext type="password" value="********" id="email" aria-label="********" disabled />
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
                      <Form.Label for="colorForm.Control" className="form-label">Accent Color</Form.Label>
                      <div className="d-flex flex-column">   
                        <div className="justify-between"> 
                          <Form.Control type="color" id="colorForm.Control1" defaultValue="#c9ffed" title="Choose your color" />                   
                          <Button type="submit" className="btn btn-secondary" id="colorEdit-accent">Change 🖊</Button>
                        </div>
                        <Form.Label className="form-control form-control-color" id="prevColor1"></Form.Label>
                      </div>
                    </Form.Group>
                    <Form.Group className="divframe"> 
                      <Form.Label for="colorForm.Control" className="form-label">Background Color</Form.Label>
                      <div className="d-flex flex-column">   
                        <div className="justify-between"> 
                          <Form.Control type="color" id="colorForm.Control2" defaultValue="#f0ffff" title="Choose your color" />                   
                          <Button type="submit" className="btn btn-secondary" id="colorEdit-bkg">Change 🖊</Button>
                        </div>
                        <Form.Label className="form-control form-control-color" id="prevColor2"></Form.Label>
                      </div>
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
