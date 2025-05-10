import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import axios from 'axios';
import debounce from 'lodash.debounce';

interface MapProps {
  center: { lat: number; lng: number };
  zoom: number;
  markerPosition: { lat: number; lng: number };
  onLocationSelect: (location: { lat: number; lng: number }) => void;
}

const Map: React.FC<MapProps> = ({ center, zoom, markerPosition, onLocationSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const customIcon = L.icon({
    iconUrl:
      'data:image/svg+xml;charset=UTF-8,' +
      encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="32" viewBox="0 0 384 512">
        <path fill="red" d="M192 0C86 0 0 86 0 192c0 77.41 111.4 222.6 168.5 292.2a24.1 24.1 0 0 0 39 0C272.6 414.6 384 269.4 384 192 384 86 298 0 192 0zm0 272a80 80 0 1 1 0-160 80 80 0 0 1 0 160z"/>
      </svg>`),
    iconSize: [20, 32],
    iconAnchor: [10, 32],
    popupAnchor: [0, -32],
  });

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapRef.current.style.height = '100vh';
      mapRef.current.style.width = '100%';

      mapInstance.current = L.map(mapRef.current).setView([center.lat, center.lng], zoom);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & Carto',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(mapInstance.current);

      L.marker([markerPosition.lat, markerPosition.lng], { icon: customIcon }).addTo(mapInstance.current);

      mapInstance.current.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        onLocationSelect({ lat, lng });
        mapInstance.current.setView([lat, lng], zoom);
        L.marker([lat, lng], { icon: customIcon }).addTo(mapInstance.current);
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.off();
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [center, zoom, markerPosition, onLocationSelect]);

  const fetchSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit: 5,
        },
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedFetchSuggestions(e.target.value);
  };

  const handleSuggestionClick = (location: any) => {
    setSearchQuery('');
    setSuggestions([]);
    onLocationSelect({ lat: location.lat, lng: location.lon });
    mapInstance.current.setView([location.lat, location.lon], zoom);
    L.marker([location.lat, location.lon], { icon: customIcon }).addTo(mapInstance.current);
  };

  return (
    <div className="relative w-full h-screen">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-xl">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && suggestions.length > 0) {
                handleSuggestionClick(suggestions[0]);
              }
            }}
            placeholder="Buscar ubicación..."
            className="w-full p-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-black"
          />
          {searchQuery && suggestions.length > 0 && (
            <ul className="absolute bg-white border border-gray-300 rounded-md shadow-md w-full z-50 max-h-60 overflow-auto mt-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-black"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div ref={mapRef} className="w-full h-full z-10" />
    </div>
  );
};

export default Map;
