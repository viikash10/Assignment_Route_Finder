import React, { useEffect, useRef } from 'react';
import './App.css';
/* src/index.css */
import 'leaflet/dist/leaflet.css';
import { MapContainer, Popup, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet directly for icon customization
// import Draggable
import Draggable from 'react-draggable'; 

import RouteFinderForm from './components/RouteFinderForm';
import RouteResults from './components/RouteResults';
import Test from './Utils/Api.js';

// Customizing the default icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
function App() {


  return (
    <div className="App">
      <header className="App-header">
        <h1>Route Finder</h1>
      </header>
      <main>
          <Test/>
      </main>
    </div>
  );
}

export default App;
