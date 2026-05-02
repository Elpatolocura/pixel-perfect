import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
  loading: boolean;
  error: string | null;
  permission: PermissionState | null;
}

// Use a reliable IP-based location service as fallback
const IP_LOCATION_API = 'https://ipapi.co/json/';

export const useLocation = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useState<LocationState>(() => {
    // Try to load saved location preference
    const saved = localStorage.getItem('eventia_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          loading: false,
          error: null,
          permission: 'granted'
        };
      } catch (e) {
        // ignore
      }
    }
    return {
      latitude: null,
      longitude: null,
      city: null,
      country: null,
      loading: true,
      error: null,
      permission: null,
    };
  });

  // Calculate distance using Haversine formula (in km)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return d;
  };

  const saveLocation = (lat: number, lng: number, city: string, country: string) => {
    const locData = { latitude: lat, longitude: lng, city, country };
    localStorage.setItem('eventia_location', JSON.stringify(locData));
    setLocation(prev => ({
      ...prev,
      ...locData,
      loading: false,
      error: null
    }));
  };

  const fetchIpLocation = async () => {
    try {
      const response = await fetch(IP_LOCATION_API);
      if (!response.ok) throw new Error('IP Location failed');
      const data = await response.json();
      if (data.latitude && data.longitude) {
        saveLocation(data.latitude, data.longitude, data.city || 'Ubicación actual', data.country_name || '');
      }
    } catch (error) {
      console.error('IP Location error:', error);
      setLocation(prev => ({ ...prev, loading: false, error: 'No se pudo detectar ubicación' }));
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      if (!response.ok) throw new Error('Geocoding failed');
      const data = await response.json();
      const city = data.address.city || data.address.town || data.address.village || 'Ubicación Desconocida';
      const country = data.address.country || '';
      saveLocation(latitude, longitude, city, country);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // If geocoding fails but we have coords, we just use the coords
      saveLocation(latitude, longitude, 'Cerca de ti', '');
    }
  };

  const requestLocation = () => {
    setLocation(prev => ({ ...prev, loading: true, error: null }));
    
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, loading: false, error: 'Geolocalización no soportada' }));
      fetchIpLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        let errorMessage = 'No se pudo obtener la ubicación';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Permiso de ubicación denegado';
        }
        
        setLocation(prev => ({ 
          ...prev, 
          loading: false, 
          error: errorMessage,
          permission: error.code === error.PERMISSION_DENIED ? 'denied' : 'prompt'
        }));
        fetchIpLocation();
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    // Only request automatically if we don't have a saved location
    if (!localStorage.getItem('eventia_location')) {
      requestLocation();
    }
  }, []);

  return {
    ...location,
    requestLocation,
    setManualLocation: saveLocation,
    calculateDistance
  };
};
