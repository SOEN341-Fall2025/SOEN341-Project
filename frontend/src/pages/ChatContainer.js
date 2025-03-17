
import React, { useState } from 'react';
import { Icon, FindClosestIcon, AppContext, UpdateStyle, HexToRGBA } from '../AppContext';
import { Resizable } from 're-resizable';
import { Image, Modal, Tab, Col, Row, Button, Nav, Form, TabContainer } from 'react-bootstrap'
import * as icons from 'lucide-react';
import { LoaderPinwheel, Plus, CircleUser, MessageCircleDashed, Camera, Mic, ArrowLeft, User } from 'lucide-react';
function ChatContainer({barSizes, user, header}) {
    var bars = Math.abs(barSizes);
    var bg = HexToRGBA(user.clrAccent, 0.7);
  return (
    <div className="mainview no-parent-padding">
      <div id="top-box" style={{ backgroundColor: bg, left: `calc(${user.sizeInnerSidebar} + 5vw)` }}>
        <Nav.Link>
          <span></span> {header}
        </Nav.Link>
      </div>
      
      <div className="chat-container rounded-lg p-4 shadow-lg text-center" style={{ position: 'absolute', right: '2vw', backgroundColor: bg,
       height: '80vh', bottom: '8vh', maxWidth: '85%', left: `calc(${user.sizeInnerSidebar} + 1vw)` }}
      >
        {/* Go Back Button */}
        <div className="back-button flex items-center cursor-pointer mb-2">
          <img
            src="images/arrow.png"
            alt="Go Back"
            className="w-10 h-10 mr-2"
          />
          <span className="text-gray-700">Go Back</span>
        </div>

        {/* Chat Box */}
        <div className="chat-box border rounded-lg p-4 bg-gray-100">
          <div className="chat-header text-center font-bold text-lg p-2 bg-gradient-to-r from-[#cdffd8] to-[#94b9ff] text-black rounded-md">
            *Chat Name*
          </div>

          {/* Messages */}
          <div className="message user flex items-center my-2">
            <User className="icon" />
            <div className="text bg-[#5592ed] text-white p-2 rounded-lg ml-2 max-w-[60%]">
              Hello! How are you?
            </div>
          </div>

          <div className="message recipient flex items-center justify-end my-2">
            <div className="text bg-[#7ed957] text-black p-2 rounded-lg mr-2 max-w-[60%]">
              I'm good, thanks!
            </div>
            <User className="icon" />
          </div>
        </div>

        <Row id="chat-box" className="d-flex align-items-center">
          {/* Icons (Plus, Camera, Mic) */}
          <Col className="d-flex gap-2">
            <div id="plus">
              <icons.Plus />
            </div>
            <div id="camera">
              <Camera />
            </div>
            <div id="mic">
              <Mic />
            </div>
          </Col>

          {/* Input Box and Send Button */}
          <Col className="flex-grow-1">
            <div className="chat-input d-flex gap-2 align-items-center">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-grow-1 p-2 rounded border"
              />
              <button className="p-2 bg-[#4facfe] text-white rounded-md">
                Send
              </button>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default ChatContainer;
