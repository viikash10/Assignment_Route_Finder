import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icon issue with Leaflet in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import Draggable from 'react-draggable';
import RouteFinderForm from '../components/RouteFinderForm';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MapWithRoute = () => {
  const [route, setRoute] = useState([]);
  const [map, setMap] = useState(null);

  const startPoint = [54.5200, 13.4050]; // Berlin
  const endPoint = [43.8566, 2.3522]; // Paris

  // App.js code

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

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const response = await axios.get('https://api.openrouteservice.org/v2/directions/driving-car', {
          params: {
            api_key: '5b3ce3597851110001cf62484c108c60eec4413aa187e0bf3d84a39c',
            start: `${startPoint[1]},${startPoint[0]}`,
            end: `${endPoint[1]},${endPoint[0]}`,
            format: 'geojson',
            profile: 'foot-walking'
          }
        });
        const routeCoordinates = response.data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRoute(routeCoordinates);
      } catch (error) {
        console.error('Error fetching the route:', error);
      }
    };

    fetchRoute();
  }, []);

  return (
    <MapContainer  center={startPoint} zoom={6} whenCreated={setMap} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={startPoint} />
      <Marker position={endPoint} />
      {route.length > 0 && <Polyline positions={route} color="blue" />}
     
    </MapContainer>
  );
};

export default MapWithRoute;
