import React, { useEffect, useState } from 'react';
import './RouteFinder.css'; ;

function RouteFinderForm() {
  const [distance, setDistance] = useState('');
  const [unit, setUnit] = useState('km');

  const handleSubmit = (event) => {
    // event.preventDefault();
    // Handle form submission logic here
    console.log(`Finding route for ${distance} ${unit}`);
  };

   // Effect to log distance and unit whenever they change
   useEffect(() => {
    console.log(`Distance: ${distance}, Unit: ${unit}`);
  }, [distance, unit]); // Dependency array includes distance and unit


  return (
    <form onSubmit={handleSubmit} className='form-field'>
     <select id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} className='unit-field'>
    <option value="km">Kilometers</option>
    <option value="mi">Miles</option>
  </select>
  <input
    type="number"
    id="distance"
    placeholder='Enter Distance'
    value={distance}
    onChange={(e) => setDistance(e.target.value)}
    required
    className='distance-field'
  />
 
  <div className='btn-container'>
    <button type="submit" className="btn">Find Route</button>
  </div>
</form>

  );
}

export default RouteFinderForm;
