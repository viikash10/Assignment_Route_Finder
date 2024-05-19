import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Form-Style.css';

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
  const [map, setMap] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [distance, setDistance] = useState(''); // Default distance in kilometers
  const [unit, setUnit] = useState('km');
  const [errorMessage, setErrorMessage] = useState('');

  const mapRef = useRef(null);

  useEffect(() => {
    const fetchCurrentLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setStartPoint([latitude, longitude]);
          setEndPoint([latitude, longitude]);
        },
        (error) => {
          console.error("Error Code = " + error.code + " - " + error.message);
          // Handle errors, optionally retry fetching the location
          if (error.code === error.PERMISSION_DENIED) {
            // Inform the user or prompt them to enable location services
          } else {
            // Retry fetching the location after a delay (e.g., 5 seconds)
            setTimeout(fetchCurrentLocation, 5000);
          }
        }
      );
    };

    fetchCurrentLocation();
  }, []);

  useEffect(() => {
    if (startPoint && distance<30 && unit === 'km') {
      // Convert distance to degrees (approximate)
      const earthRadius = 6371; // Earth's radius in kilometers
      const angularDistance = ((distance) / earthRadius)/2; //since we need to get half of the distance 
      // Generate random angle in radians
      const randomAngle = Math.random() * 2 * Math.PI;

      // Calculate new endpoint coordinates using Haversine formula
      const newEndLatitude = Math.asin(Math.sin(startPoint[0] * Math.PI / 180) * Math.cos(angularDistance) +
        Math.cos(startPoint[0] * Math.PI / 180) * Math.sin(angularDistance) * Math.cos(randomAngle));
      const newEndLongitude = (startPoint[1] * Math.PI / 180) + Math.atan2(Math.sin(randomAngle) * Math.sin(angularDistance) * Math.cos(startPoint[0] * Math.PI / 180),
        Math.cos(angularDistance) - Math.sin(startPoint[0] * Math.PI / 180) * Math.sin(newEndLatitude));

      // Convert back to degrees
      setEndPoint([newEndLatitude * 180 / Math.PI, newEndLongitude * 180 / Math.PI]);
    }
  }, [startPoint, distance]);

  useEffect(() => {
    if (startPoint && endPoint) {
      const fetchRoute = async () => {
        try {
          const response = await axios.get('https://api.openrouteservice.org/v2/directions/foot-walking', {
            params: {
              api_key: 'YOUR_API_KEY',
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
    }
  }, [startPoint, endPoint]);

  const handleDistanceChange = (event) => {
    setDistance(event.target.value);
  };

  const handleUnitChange = (event) => {
    setUnit(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Validate distance
    if (!distance) {
      setErrorMessage('Please enter a distance.');
      return;
    } else if (unit === 'km' && distance > 30) {
      setErrorMessage('Maximum distance for walking is 30 kilometers.');
      return;
    } else if (unit === 'mi' && distance > 19) {
      setErrorMessage('Maximum distance for walking is 19 miles.');
      return;
    }

    // Clear error message
    setErrorMessage('');
    
    // Trigger route update
    setRoute([]); // Clear previous route if any

    if (startPoint) {
      // Convert distance to degrees (approximate)
      const earthRadius = 6371; // Earth's radius in kilometers
      const angularDistance = (distance/2) / earthRadius; // since we need to cover half of the distance only as after that same distance needs to be cover to come back

      // Generate random angle in radians
      const randomAngle = Math.random() * 2 * Math.PI;

      // Calculate new endpoint coordinates using Haversine formula
      const newEndLatitude = Math.asin(Math.sin(startPoint[0] * Math.PI / 180) * Math.cos(angularDistance) +
        Math.cos(startPoint[0] * Math.PI / 180) * Math.sin(angularDistance) * Math.cos(randomAngle));
      const newEndLongitude = (startPoint[1] * Math.PI / 180) + Math.atan2(Math.sin(randomAngle) * Math.sin(angularDistance) * Math.cos(startPoint[0] * Math.PI / 180),
        Math.cos(angularDistance) - Math.sin(startPoint[0] * Math.PI / 180) * Math.sin(newEndLatitude));

      // Convert back to degrees
      setEndPoint([newEndLatitude * 180 / Math.PI, newEndLongitude * 180 / Math.PI]);
    }
  };

  return (
    startPoint && (
      <div>
        <div className='Form-Style'>
        <form onSubmit={handleSubmit} className='form-field'>
          <select id="unit" value={unit} onChange={handleUnitChange} className='unit-field'>
            <option value="km">Kilometers</option>
            <option value="mi">Miles</option>
          </select>
          <input
            type="number"
            id="distance"
            placeholder='Enter Distance'
            onChange={handleDistanceChange}
            value={distance}
            required
            className='distance-field'
          />
          <div className='btn-container'>
            <button type="submit" className="btn">Find Route</button>
          </div>
        </form>
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <MapContainer ref={mapRef} zoom={17} center={startPoint} whenCreated={setMap} style={{ height: '100vh', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={startPoint} />
          {route.length > 0 && <Polyline positions={route} color="blue" dashArray="10, 10" />}
        </MapContainer>
      </div>
    )
  );
};

export default MapWithRoute;
