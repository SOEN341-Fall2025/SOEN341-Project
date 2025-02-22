import './style/App.css';
import './style/Settings.css';

import React from 'react';
import { useState } from 'react';
import { Resizable } from 're-resizable';
import { Modal, Tab, Col, Row, Button, Nav, Form } from 'react-bootstrap'
import Settings from './Settings.js';
import $ from 'jquery';

function App() {  
      
  const [showState, setShow] = useState("close");
  const handleClose = () => setShow(false);
  function handleClick(key) {
    setShow(key);
  }
  const [width, setWidth] = React.useState("3.5");
  const [height, setHeight] = React.useState(200);
  const updateStyle = (styleProperty, newValue) => document.documentElement.style.setProperty(styleProperty, newValue);
  
  return(
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
                    <Nav.Link eventKey="page-dm"><span className="channel-icon">👨‍👨‍👧‍👧</span> DMs</Nav.Link>
                    <Nav.Link className="seperator" disabled><hr /><hr /></Nav.Link>
                    <Nav.Link eventKey="page-1"><span className="channel-icon">🎁</span> Gift Ideas</Nav.Link>
                    <Nav.Link eventKey="link-2"><span className="channel-icon">🎶</span> Music Channel</Nav.Link>
                    <Nav.Link eventKey="disabled"><span className="channel-icon">💼</span> Work Server </Nav.Link>
                    <Nav.Link onClick={() => handleClick('status-modal')} className="mt-auto user-status"><span className="channel-icon">🕵️‍♂️</span> Me</Nav.Link>
                    <Nav.Link onClick={() => handleClick('settings-modal')} className=""><span className="channel-icon">⚙</span> Settings</Nav.Link>
                  </Nav>
                </Col>            
              </Resizable>       
              
              <Col id="pages">
              <Tab.Content id="pages-content">
                    <Tab.Pane eventKey="page-dm">
                      <h3>Direct Messages</h3>       
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
                  
                </Form>
                </Modal.Body>
            </Modal.Dialog>
          </Modal>
          <Modal show={showState === 'settings-modal'} onHide={handleClose} id ="settings-modal" fullscreen="true">
            <Modal.Dialog className="modal-dialog-centered modal-fullscreen">
              <Modal.Header><div id="settings-close-button"><Button className="btn-close" onClick={handleClose}></Button></div></Modal.Header>
                <Modal.Body>
                <Settings />
                </Modal.Body>
            </Modal.Dialog>
          </Modal>
      </section>
    );
  }

export default App;
