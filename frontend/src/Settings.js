import './style/Settings.css';
import { useState } from 'react';
import { Component } from 'react';
import $ from 'jquery';
import { Image } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';
import { Container } from 'react-bootstrap';
import { Row } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
import { Tab } from 'react-bootstrap';
import { Tabs } from 'react-bootstrap';
import { Nav } from 'react-bootstrap';

function Settings() {

      
    const [modalState, setModalState] = useState("close");
    const handleClose = () => setModalState(false);
    const handleShow = () => setModalState(true);
    function handleClick(key) {
        setModalState(key);
    }
    
    return (      
      <section>
        <div className="settings">
          <Tab.Container className="tab-content settings-page col-6 col-md-7 ps-5 pe-10 pt-10 text-start" defaultActiveKey="settings-profile">            
          <Row>
              <Col sm={3}>
              <Nav variant="pills" className="flex-column">
                  <Form.Label className="label labelnav px-3">User Settings</Form.Label>
                  <Nav.Item><Nav.Link eventKey="settings-profile">My Profile</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="settings-account">My Accounts</Nav.Link></Nav.Item>
                  <Form.Label className="label labelnav px-3">App Settings</Form.Label>
                  <Nav.Item><Nav.Link eventKey="settings-view">Appearance</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="settings-chats">Chat & Channels</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="settings-notif">Notifications</Nav.Link></Nav.Item>
                </Nav>
              </Col>              
              <Col sm={9}>
                <Tab.Content>                  
                  <Tab.Pane eventKey="settings-profile">
                    <h3>Profile</h3>       
                    <Form.Group className="divframe">
                      <Form.Label className="label px-1">Display Name</Form.Label>
                      <div className="justify-between">
                        <Form.Control type="text" plaintext defaultValue="Johnny" id="display-name" aria-label="Johnny" disabled />            
                        <Button variant="secondary" id="modal-profile-1" onClick={() => handleClick('modal-profile-1')}>🖊</Button>
                      </div>                    
                      <Form.Label className="label px-1">User Name</Form.Label>
                      <div className="justify-between">      
                        <Form.Control type="text" plaintext defaultValue="@John_Smith77" id="user-name" disabled />
                        <Button variant="secondary" onClick={handleClick} id="modal-profile-2">🖊</Button>
                      </div>                    
                      <Form.Label className="label px-1">About Me</Form.Label>
                      <div className="justify-between">      
                        <Form.Control as="textarea" rows={3} disabled />
                        <Button variant="secondary" onClick={handleClick} id="modal-profile-2">🖊</Button>
                      </div>      
                      <Form.Label className="label px-1">Avatar</Form.Label>   
                      <Row className="justify-between"> 
                        <Image src="https://png.pngtree.com/png-clipart/20230328/original/pngtree-blue-water-bubbles-png-image_9007263.png" id="avatar" fluid />
                        <Button variant="secondary" onClick={handleClick} id="modal-profile-3">🖊</Button>
                      </Row>                    
                    </Form.Group>        
                  
                  
                    <Modal show={modalState === 'modal-profile-1'} onHide={handleClose} id="modal-profile-1" >
                      <Modal.Dialog className="modal-dialog modal-dialog-centered">
                          <Modal.Header><Button className="btn-close" data-bs-dismiss="modal"></Button></Modal.Header>
                          <Modal.Body>                      
                            <h5 className="text-center">Change Your Display Name</h5>
                            <h6 className="label text-center">Enter Modified Name and Password</h6>
                            <Form>
                              <Form.Group>
                                <Form.Label for="modEmail">Display Name</Form.Label>
                                <Form.Control type="email" id="modEmail" aria-describedby="modEmail" placeholder="Enter email" />
                                <small id="emailHelp" className="form-text text-muted">Please only use numbers, letter, underscores, or periods.</small>
                              </Form.Group>
                              <Form.Group>
                                <Form.Label for="exampleForm.ControlPassword1">Password</Form.Label>
                                <Form.Control type="password" id="exampleForm.ControlPassword1" placeholder="Password" />
                              </Form.Group>
                              <Button type="submit" className="btn btn-primary">Submit</Button>
                            </Form>
                          </Modal.Body>
                      </Modal.Dialog>
                    </Modal>
                    <Modal show={modalState === "modal-one"} onHide={handleClose} eventKey="modal-profile-2" >
                      <Modal.Dialog className="modal-dialog modal-dialog-centered">
                          <Modal.Header><Button className="btn-close" data-bs-dismiss="modal"></Button></Modal.Header>
                          <Modal.Body>                      
                            <h5 className="text-center">Change Your Username</h5>
                            <h6 className="label text-center">Enter Modified Name and Password</h6>
                          </Modal.Body>
                      </Modal.Dialog>
                    </Modal>
                    <Modal show={modalState === "modal-one"} onHide={handleClose} eventKey="modal-profile-3" >
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