import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';



// Fix icon issue with Leaflet in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MapWithRoute = () => {
  const [route, setRoute] = useState([]);
  const [startLocation, setStartLocation] = useState({ lat: 52.5200, lng: 13.4050 }); // Default to Berlin
  const [distance, setDistance] = useState(5); // Default distance in km
  const [unit, setUnit] = useState('km'); // Default unit

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetchRoute();
  };

  const fetchRoute = async () => {
    try {
      // Convert distance to kilometers if in miles
      const distanceInKm = unit === 'miles' ? distance * 1.60934 : distance;

      const getRandomCoordinates = (center, radius, count) => {
        const coordinates = [];
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * 2 * Math.PI;
          const distance = Math.random() * radius;
          const latitude = center.lat + (distance / 111) * Math.cos(angle);
          const longitude = center.lng + (distance / 111) * Math.sin(angle) / Math.cos(center.lat * (Math.PI / 180));
          coordinates.push([latitude, longitude]);
        }
        return coordinates;
      };

      const waypoints = getRandomCoordinates(startLocation, distanceInKm, 3);
      waypoints.unshift([startLocation.lat, startLocation.lng]);
      waypoints.push([startLocation.lat, startLocation.lng]);

      const coordinatesString = waypoints.map(coord => coord.reverse().join(',')).join('|');

      const response = await axios.get('https://api.openrouteservice.org/v2/directions/foot-walking', {
        params: {
          api_key: 'YOUR_API_KEY',
          coordinates: coordinatesString,
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


  

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div>
          <label>
            Start Location (lat, lng):
            <input
              type="text"
              value={`${startLocation.lat}, ${startLocation.lng}`}
              onChange={(e) => {
                const [lat, lng] = e.target.value.split(',').map(Number);
                setStartLocation({ lat, lng });
              }}
            />
          </label>
        </div>
        <div>
          <label>
            Distance:
            <input
              type="number"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
            />
            <select value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="km">Kilometers</option>
              <option value="miles">Miles</option>
            </select>
          </label>
        </div>
        <button type="submit">Generate Route</button>
      </form>
      <MapContainer center={[startLocation.lat, startLocation.lng]} zoom={13} style={{ height: '80vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[startLocation.lat, startLocation.lng]} />
        {route.length > 0 && <Polyline positions={route} color="blue" />}
      </MapContainer>
    </div>
  );
};

export default MapWithRoute;
