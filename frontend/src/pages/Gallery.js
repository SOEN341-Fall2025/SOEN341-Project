

import React, { useState } from 'react';
import { Icon, FindClosestIcon, AppContext, UpdateStyle, GetStyle, ToVW, ToPX } from '../AppContext';
import { Resizable } from 're-resizable';
import { Image, Modal, Tab, Col, Row, Button, Nav, Form, TabContainer } from 'react-bootstrap'
import * as icons from 'lucide-react';
import { LoaderPinwheel, Plus, CircleUser, MessageCircleDashed, Camera, Mic, ArrowLeft, User } from 'lucide-react';
import ChatContainer from './ChatContainer.js';
function Gallery({ item, index, userChannels, gallerySize, user }) {  
  
    const [showState, setShow] = useState("close"); 
    const [channelNavWidth, setChannelSize] = useState(17);  
    function handleClick(key) { setShow(key); }
    const GalleryChannelsList = ({ galleryName, channels }) => {
        return (
            <span>
            {channels.map((item, index) => {
                // Check if the galleryName matches the item's galleryName
                if (galleryName === item.galleryName) {
                return (
                    <Nav.Link key={index} eventKey={item.channelName}>
                    <span className="channel-icon">
                        <Icon name={item.icon || FindClosestIcon(item.channelName)} size={24} />
                    </span>
                    {item.channelName}
                    </Nav.Link>
                );
                }
                return null; // Ensure the map function returns something in all cases
            })}
            </span>
        );
    };
      

  return (
    <Tab.Pane eventKey={item.name} id="">
          <Tab.Container id="">
            <Col id="sidebar-channels" style={{ width: user.sizeInnerSidebar}} >
              <Nav
                id="dm-list"
                variant="pills"
                defaultActiveKey="Me"
                className="flex-column d-flex align-items-start"
              >
                <Row id="sidebar-dm-options">
                  <Col>Channels</Col>
                </Row>
                <Nav.Link className="seperator" disabled>
                  <hr />
                  <hr />
                </Nav.Link>
                <Nav.Link>
                  <icons.Gamepad2Icon /> Game Room
                </Nav.Link>
                <GalleryChannelsList
                  galleryName={item.name}
                  channels={userChannels}
                />
                <Nav.Link
                  onClick={() => handleClick("addChannel-modal")}
                  className="add-channel"
                >
                  <span className="channel-icon">
                    <Plus />
                  </span>{" "}
                  Add a Channel
                </Nav.Link>
              </Nav>
            </Col>
          </Tab.Container>
        <ChatContainer barSizes={(Number(gallerySize) + Number(channelNavWidth))} header={item.channelName} user={user}/>
    </Tab.Pane>
  );
}

export default Gallery;
