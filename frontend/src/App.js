import './style/App.css';
import './style/Settings.css';

import React from 'react';
import { useState } from 'react';
import { Resizable } from 're-resizable';
import { Modal, Grid, Col, Row, Button, Nav } from 'react-bootstrap'
import Settings from './Settings.js';
import $ from 'jquery';

function App() {
  
  const [showState, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);  
  const [width, setWidth] = React.useState("3vw");
  const [height, setHeight] = React.useState(200);
  
  return(
    <section>      
          <Resizable id="sidebar" maxWidth="20vw" minWidth="3vw" enable={ {right:true} }
          size={{ width, height }}
          onResizeStop={(e, direction, ref, d) => {
            setWidth(width + d.width);
            setHeight(height + d.height);
          }}>
            <Col id="sidebar-col">
              <Nav variant="pills" defaultActiveKey="Me" className="flex-column d-flex align-items-start">
                <Nav.Link eventKey="link-0"><span className="channel-icon">👨‍👨‍👧‍👧</span> DMs</Nav.Link>
                <Nav.Link eventKey="seperator" disabled><hr /><hr /></Nav.Link>
                <Nav.Link eventKey="link-1"><span className="channel-icon">🎁</span> Gift Ideas</Nav.Link>
                <Nav.Link eventKey="link-2"><span className="channel-icon">🎶</span> Music Channel</Nav.Link>
                <Nav.Link eventKey="disabled"><span className="channel-icon">💼</span> Work Server </Nav.Link>
                <Nav.Link eventKey="Me" className="mt-auto p-2"><span className="channel-icon">🕵️‍♂️</span> Me</Nav.Link>
              </Nav>
            </Col>            
          </Resizable>
      <Button id="open-settings" variant="primary" onClick={handleShow}>⚙</Button>

      <Modal show={showState} onHide={handleClose} eventKey="settings-modal" id ="settings-modal" fullscreen="true">
        <Modal.Dialog className="modal-dialog modal-dialog-centered modal-fullscreen">
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
