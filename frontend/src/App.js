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

// Customizing the default icon
L.Marker.prototype.options.icon = L.icon({
  iconUrl: 'path/to/icon.png', // Path to your custom icon
  iconSize: [25, 41], // Size of the icon
  iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
  popupAnchor: [-34, -41] // Point from which the popup should open relative to the iconAnchor
});

function App() {

  const mapRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapRef.current) {
          mapRef.current.flyTo([latitude, longitude], 13);
          // Adding a marker for the current location
          const marker = new L.marker([latitude, longitude]).addTo(mapRef.current);
          marker.bindPopup("<b>Your Location</b><br>Click to see details.").openPopup();
        }
      },
      (error) => {
        console.error("Error Code = " + error.code + " - " + error.message);
      }
    );
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Route Finder</h1>
      </header>
      <main>
      <MapContainer ref={mapRef} center={[40.7128, 74.0060]} zoom={13} style={{ height: "100vh", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {/* Other map layers and components */}
        </MapContainer>
        
        <Draggable className="draggable">
            <div className='Input-box'>
              <RouteFinderForm />
            </div>
          </Draggable>
         
        

        {/* Route Result to be displayed on the map itself */}
       <RouteResults />
      </main>
    </div>
  );
}

export default App;
