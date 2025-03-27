import React, { useState, useEffect } from 'react';
import { User, ArrowLeft, Camera, Mic, Plus } from 'lucide-react';  // Assuming you're using lucide-react
import { Row, Col, Nav } from 'react-bootstrap';
import { HexToRGBA } from '../AppContext';

function Exhibit({user}){


    return (
        <>
        <div>
        {user}

        </div>
        </>
    )

}

export default Exhibit;