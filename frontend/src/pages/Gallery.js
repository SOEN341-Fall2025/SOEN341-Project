

import React, { useState } from 'react';
import { Icon, FindClosestIcon, AppContext, UpdateStyle, GetStyle, ToVW, ToPX } from '../AppContext';
import { Resizable } from 're-resizable';
import { Image, Modal, Tab, Col, Row, Button, Nav, Form, TabContainer } from 'react-bootstrap'
import * as icons from 'lucide-react';
import { LoaderPinwheel, Plus, CircleUser, MessageCircleDashed, Camera, Mic, ArrowLeft, User } from 'lucide-react';
import ChatContainer from './ChatContainer.js';
function Gallery({ item, index, galleryChannels, gallerySize, user }) {  
    const [showState, setShow] = useState("close"); 
    const [channelNavWidth, setChannelSize] = useState(17);  
    const [thisChannels, setTheseChannels] = useState(galleryChannels);  
    const [newChannelName, setNewChannelName] = useState("");
    function handleClick(key) { setShow(key); }
    const GalleryChannelsList = () => {
      thisChannels.map((item, index) => {
          return (
              <Nav.Link key={index} eventKey={item.ChannelName}>
              <span className="channel-icon">
              <Icon name={item.icon || FindClosestIcon(item.ChannelName)} size={24} />
              </span>
              {item.ChannelName}
              </Nav.Link>
          );
          return null; // Ensure the map function returns something in all cases
      });
    };
    const GalleryChannelList = ({ channels }) => {
      if(channels.length > 0){
        return (
          channels.map((item, index) => (
              <Nav.Link eventKey={item.ChannelName} key={index} onClick={() => setNewChannelName(item.ChannelName)}>
                <span className="channel-icon">
                  <Icon name={item.icon || FindClosestIcon(item.ChannelName)} size={24} />
                </span>
                {item.ChannelName}
              </Nav.Link>
            ))
        );
      }
    };
  return (
    <Tab.Pane eventKey={item.GalleryName} className="gallery-pane" >
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
                </Nav.Link>
                <GalleryChannelList channels={thisChannels}/>
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
