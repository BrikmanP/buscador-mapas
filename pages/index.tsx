import { useState } from 'react';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('../components/Map'), {
  ssr: false,
});

const Home = () => {
  const [selectedLocation, setSelectedLocation] = useState({ lat: 4.60971, lng: -74.08175 }); 
  const [zoom, setZoom] = useState(12);

  return (
    <div className="p-4">
      <h1 className="text-center text-2xl my-4">Ubicaciones</h1>
      <Map 
        center={selectedLocation} 
        zoom={zoom} 
        markerPosition={selectedLocation} 
        onLocationSelect={setSelectedLocation} 
      />
    </div>
  );
};

export default Home;
