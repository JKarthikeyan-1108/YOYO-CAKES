import React, { useEffect, useRef, useState, useCallback } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { 
  Navigation, 
  MapPin, 
  Search, 
  Crosshair, 
  AlertCircle, 
  Loader2, 
  Store,
  CheckCircle2
} from 'lucide-react';
import { FALLBACK_DELIVERY_SETTINGS, estimateRoadDistanceKm } from '@/services/deliveryService';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
  street?: string;
  locality?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

interface InteractiveGoogleMapProps {
  initialCoords?: { latitude: number; longitude: number };
  onLocationSelected: (location: LocationCoordinates) => void;
  maxRadiusKm?: number;
  storeLocation?: { latitude: number; longitude: number; name: string };
  height?: string;
  interactive?: boolean;
}

export type GeolocationStatus = 
  | 'idle' 
  | 'requesting' 
  | 'success' 
  | 'permission-denied' 
  | 'unavailable' 
  | 'timeout' 
  | 'unsupported';

export default function InteractiveGoogleMap({
  initialCoords = { latitude: 13.085, longitude: 80.2101 },
  onLocationSelected,
  maxRadiusKm = FALLBACK_DELIVERY_SETTINGS.maxRadiusKm,
  storeLocation = {
    latitude: FALLBACK_DELIVERY_SETTINGS.latitude,
    longitude: FALLBACK_DELIVERY_SETTINGS.longitude,
    name: FALLBACK_DELIVERY_SETTINGS.storeName,
  },
  height = '340px',
  interactive = true,
}: InteractiveGoogleMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [useFallbackMap, setUseFallbackMap] = useState(false);
  const [geoStatus, setGeoStatus] = useState<GeolocationStatus>('idle');
  const [geoErrorMsg, setGeoErrorMsg] = useState<string>('');
  
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: initialCoords.latitude,
    lng: initialCoords.longitude,
  });

  const [formattedAddress, setFormattedAddress] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Derive road distance directly during render
  const distanceFromStore = estimateRoadDistanceKm(
    storeLocation.latitude,
    storeLocation.longitude,
    currentCoords.lat,
    currentCoords.lng
  );

  // Google Maps SDK references
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const circleInstanceRef = useRef<any>(null);
  const geocoderInstanceRef = useRef<any>(null);
  const autocompleteInstanceRef = useRef<any>(null);

  // Reverse Geocoding helper
  const performReverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      // 1. If Google Maps Geocoder is available
      if (geocoderInstanceRef.current) {
        try {
          const res = await geocoderInstanceRef.current.geocode({
            location: { lat, lng },
          });

          if (res.results && res.results.length > 0) {
            const best = res.results[0];
            let postalCode = '';
            let city = '';
            let locality = '';
            let state = '';
            let street = '';

            for (const comp of best.address_components) {
              if (comp.types.includes('postal_code')) postalCode = comp.long_name;
              if (comp.types.includes('locality')) city = comp.long_name;
              if (comp.types.includes('sublocality') || comp.types.includes('neighborhood')) {
                locality = comp.long_name;
              }
              if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
              if (comp.types.includes('route') || comp.types.includes('street_number')) {
                street += (street ? ' ' : '') + comp.long_name;
              }
            }

            const addressText = best.formatted_address;
            setFormattedAddress(addressText);

            onLocationSelected({
              latitude: lat,
              longitude: lng,
              formattedAddress: addressText,
              street,
              locality: locality || city || 'Chennai',
              city: city || 'Chennai',
              state: state || 'Tamil Nadu',
              postalCode: postalCode || '600001',
            });
            return;
          }
        } catch (err) {
          console.warn('[Google Geocoder] Reverse geocode error:', err);
        }
      }

      // 2. Fallback reverse geocoding via server API or local estimation
      try {
        const resp = await fetch('/api/delivery/reverse-geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: lat, longitude: lng }),
        });
        if (resp.ok) {
          const data = await resp.json();
          setFormattedAddress(data.formattedAddress);
          onLocationSelected({
            latitude: lat,
            longitude: lng,
            formattedAddress: data.formattedAddress,
            street: data.street,
            locality: data.locality,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
          });
          return;
        }
      } catch {
        // Ignored
      }

      // Default fallback
      const fallbackText = `Pin Location (${lat.toFixed(4)}, ${lng.toFixed(4)}), Chennai`;
      setFormattedAddress(fallbackText);
      onLocationSelected({
        latitude: lat,
        longitude: lng,
        formattedAddress: fallbackText,
        city: 'Chennai',
        state: 'Tamil Nadu',
        locality: 'Selected Location',
        postalCode: '600001',
      });
    },
    [onLocationSelected]
  );

  // Initialize Google Maps JavaScript API
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      // Gracefully switch to interactive canvas mode if no Google Maps API Key is configured yet
      setUseFallbackMap(true);
      performReverseGeocode(initialCoords.latitude, initialCoords.longitude);
      return;
    }

    setOptions({
      key: apiKey,
      v: 'weekly',
    });

    Promise.all([
      importLibrary('maps'),
      importLibrary('places'),
    ])
      .then(() => {
        const google = (window as any).google;
        if (!mapContainerRef.current || !google?.maps) return;

        geocoderInstanceRef.current = new google.maps.Geocoder();

        // Create Map
        const map = new google.maps.Map(mapContainerRef.current, {
          center: { lat: initialCoords.latitude, lng: initialCoords.longitude },
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'simplified' }],
            },
          ],
        });
        mapInstanceRef.current = map;

        // Bakery Store Marker (Gold Crown / Flag)
        new google.maps.Marker({
          position: { lat: storeLocation.latitude, lng: storeLocation.longitude },
          map,
          title: `Bakery Kitchen: ${storeLocation.name}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#92400E',
            fillOpacity: 1,
            strokeColor: '#FEF3C7',
            strokeWeight: 3,
          },
        });

        // Delivery Radius Circle Boundary
        const deliveryCircle = new google.maps.Circle({
          strokeColor: '#D97706',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#F59E0B',
          fillOpacity: 0.12,
          map,
          center: { lat: storeLocation.latitude, lng: storeLocation.longitude },
          radius: maxRadiusKm * 1000, // in meters
        });
        circleInstanceRef.current = deliveryCircle;

        // Customer Draggable Delivery Pin
        const marker = new google.maps.Marker({
          position: { lat: initialCoords.latitude, lng: initialCoords.longitude },
          map,
          draggable: interactive,
          animation: google.maps.Animation.DROP,
          title: 'Drag me to your exact entrance!',
        });
        markerInstanceRef.current = marker;

        // Listen for drag end
        marker.addListener('dragend', () => {
          const pos = marker.getPosition();
          if (pos) {
            const lat = pos.lat();
            const lng = pos.lng();
            setCurrentCoords({ lat, lng });
            performReverseGeocode(lat, lng);
          }
        });

        // Click on map to move marker
        map.addListener('click', (e: any) => {
          if (!interactive || !e.latLng) return;
          marker.setPosition(e.latLng);
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          setCurrentCoords({ lat, lng });
          performReverseGeocode(lat, lng);
        });

        // Setup Places Autocomplete
        if (searchInputRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
            fields: ['geometry', 'formatted_address', 'name', 'address_components'],
            componentRestrictions: { country: 'in' },
          });
          autocomplete.bindTo('bounds', map);
          autocompleteInstanceRef.current = autocomplete;

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) return;

            map.setCenter(place.geometry.location);
            map.setZoom(16);
            marker.setPosition(place.geometry.location);

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            setCurrentCoords({ lat, lng });

            if (place.formatted_address) {
              setFormattedAddress(place.formatted_address);
              let postalCode = '';
              let city = '';
              let locality = '';
              let state = '';
              let street = '';

              if (place.address_components) {
                for (const comp of place.address_components) {
                  if (comp.types.includes('postal_code')) postalCode = comp.long_name;
                  if (comp.types.includes('locality')) city = comp.long_name;
                  if (comp.types.includes('sublocality') || comp.types.includes('neighborhood')) {
                    locality = comp.long_name;
                  }
                  if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
                  if (comp.types.includes('route') || comp.types.includes('street_number')) {
                    street += (street ? ' ' : '') + comp.long_name;
                  }
                }
              }

              onLocationSelected({
                latitude: lat,
                longitude: lng,
                formattedAddress: place.formatted_address,
                street,
                locality: locality || city || 'Chennai',
                city: city || 'Chennai',
                state: state || 'Tamil Nadu',
                postalCode: postalCode || '600001',
              });
            } else {
              performReverseGeocode(lat, lng);
            }
          });
        }

        performReverseGeocode(initialCoords.latitude, initialCoords.longitude);
      })
      .catch((err: unknown) => {
        console.warn('[Google Maps Loader] Failed loading maps API, falling back to interactive canvas mode:', err);
        setUseFallbackMap(true);
        performReverseGeocode(initialCoords.latitude, initialCoords.longitude);
      });
  }, [initialCoords.latitude, initialCoords.longitude, interactive, maxRadiusKm, onLocationSelected, performReverseGeocode, storeLocation.latitude, storeLocation.longitude, storeLocation.name]);

  /**
   * Browser Geolocation API ("Use My Current Location")
   * Called ONLY upon explicit customer action.
   */
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('unsupported');
      setGeoErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setGeoStatus('requesting');
    setGeoErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGeoStatus('success');
        setCurrentCoords({ lat: latitude, lng: longitude });

        // Update Google Map instance if loaded
        if (mapInstanceRef.current && markerInstanceRef.current && (window as any).google?.maps) {
          const google = (window as any).google;
          const latLng = new google.maps.LatLng(latitude, longitude);
          mapInstanceRef.current.panTo(latLng);
          mapInstanceRef.current.setZoom(16);
          markerInstanceRef.current.setPosition(latLng);
        }

        performReverseGeocode(latitude, longitude);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoStatus('permission-denied');
            setGeoErrorMsg('GPS location permission denied. You can manually type your address or drag the map pin.');
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoStatus('unavailable');
            setGeoErrorMsg('GPS signal is currently unavailable. Please search your address or enter manually.');
            break;
          case err.TIMEOUT:
            setGeoStatus('timeout');
            setGeoErrorMsg('Location request timed out. Please try again or enter your address manually.');
            break;
          default:
            setGeoStatus('unavailable');
            setGeoErrorMsg('Unable to retrieve GPS coordinates. Please enter your address below.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  const handleFallbackCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const newLat = Number((storeLocation.latitude - y * 0.08).toFixed(4));
    const newLng = Number((storeLocation.longitude + x * 0.08).toFixed(4));
    setCurrentCoords({ lat: newLat, lng: newLng });
    performReverseGeocode(newLat, newLng);
  };

  const handleFallbackCanvasTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!interactive || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width - 0.5;
    const y = (touch.clientY - rect.top) / rect.height - 0.5;
    const newLat = Number((storeLocation.latitude - y * 0.08).toFixed(4));
    const newLng = Number((storeLocation.longitude + x * 0.08).toFixed(4));
    setCurrentCoords({ lat: newLat, lng: newLng });
    performReverseGeocode(newLat, newLng);
  };

  const isServiceable = distanceFromStore <= maxRadiusKm;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Top Controls Bar: Search & GPS Button */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search area, apartment, landmark, or street..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:border-[var(--color-brand-primary-dark)] text-xs sm:text-sm bg-white shadow-xs outline-none"
          />
          <Search size={15} className="absolute left-3 top-3 text-gray-400" />
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={geoStatus === 'requesting'}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer ${
            geoStatus === 'requesting'
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-[var(--color-brand-primary-dark)] hover:bg-[#85300B] text-white active:scale-95'
          }`}
        >
          {geoStatus === 'requesting' ? (
            <>
              <Loader2 size={16} className="animate-spin text-amber-700" />
              <span>Locating GPS...</span>
            </>
          ) : (
            <>
              <Crosshair size={16} className="animate-pulse" />
              <span>Use My Current Location</span>
            </>
          )}
        </button>
      </div>

      {/* Geolocation Status Messages */}
      {geoStatus === 'permission-denied' && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2 animate-fade-in">
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-amber-600" />
          <div className="flex-1">
            <span className="font-bold">Location Permission Denied: </span>
            {geoErrorMsg}
          </div>
        </div>
      )}

      {(geoStatus === 'unavailable' || geoStatus === 'timeout') && (
        <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-xs flex items-start gap-2 animate-fade-in">
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-gray-500" />
          <div className="flex-1">
            <span className="font-semibold">GPS Note: </span>
            {geoErrorMsg}
          </div>
        </div>
      )}

      {/* Map Display Viewport */}
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-gray-300 shadow-inner bg-[#E5E3DF]"
        style={{ height }}
      >
        {!useFallbackMap ? (
          <div ref={mapContainerRef} className="w-full h-full" />
        ) : (
          /* Interactive Canvas Fallback Map when Google Maps JS SDK is loading or pending API key */
          <div 
            onClick={handleFallbackCanvasClick}
            onTouchStart={handleFallbackCanvasTouch}
            className="relative w-full h-full bg-[#E5E3DF] flex flex-col items-center justify-center p-4 select-none cursor-pointer"
          >
            {/* Grid Pattern resembling map streets */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px), radial-gradient(#9ca3af 1px, #E5E3DF 1px)',
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 12px 12px'
              }}
            />

            {/* Simulated Delivery Radius Circle */}
            <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border-2 border-dashed border-amber-500/70 bg-amber-400/10 pointer-events-none flex items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-amber-700/80 bg-amber-100/80 px-2 py-0.5 rounded-full shadow-xs">
                Bakery Service Zone ({maxRadiusKm} km)
              </span>
            </div>

            {/* Bakery Kitchen Icon (Center Offset) */}
            <div className="absolute top-1/4 left-1/3 flex items-center gap-1 bg-[#4A2411] text-amber-100 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md z-10">
              <Store size={13} className="text-amber-400" />
              <span>YOYO CAKES Kitchen</span>
            </div>

            {/* Draggable Simulated Delivery Pin */}
            <div className="relative z-20 flex flex-col items-center cursor-move active:scale-105 transition-transform group">
              <div className="bg-[#B12704] text-white px-3 py-1 rounded-full text-[11px] font-extrabold shadow-lg flex items-center gap-1.5 border border-white/50">
                <MapPin size={13} className="text-white" />
                <span>Delivery Pin</span>
              </div>
              <div className="w-4 h-4 bg-[#B12704] rotate-45 -mt-2 shadow-xs" />
              <div className="w-6 h-2 bg-black/20 rounded-full blur-[1px] mt-1" />
            </div>

            {/* Helper Hint */}
            <div className="absolute bottom-3 left-3 right-3 text-center pointer-events-none">
              <span className="text-[11px] bg-white/90 backdrop-blur-xs text-gray-700 px-3 py-1.5 rounded-full border border-gray-200 shadow-xs font-medium inline-block">
                📍 Tap or click "Use My Current Location" to pinpoint your gate
              </span>
            </div>
          </div>
        )}

        {/* Live Delivery Distance & Boundary Chip Overlay */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 backdrop-blur-md ${
              isServiceable
                ? 'bg-emerald-900/90 text-emerald-100 border border-emerald-400/40'
                : 'bg-rose-900/90 text-rose-100 border border-rose-400/40'
            }`}
          >
            {isServiceable ? (
              <>
                <CheckCircle2 size={13} className="text-emerald-300" />
                <span>Serviceable ({distanceFromStore} km)</span>
              </>
            ) : (
              <>
                <AlertCircle size={13} className="text-rose-300" />
                <span>Outside Area ({distanceFromStore} km)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Selected Coordinates & Formatted Address Readout Card */}
      <div className="p-3.5 rounded-2xl bg-white border border-gray-200/90 shadow-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-brand-chocolate)]">
            <Navigation size={14} className="text-[var(--color-brand-primary-dark)]" />
            <span>Pinpoint Location</span>
          </div>
          <div className="font-mono text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md font-semibold">
            {currentCoords.lat.toFixed(5)}° N, {currentCoords.lng.toFixed(5)}° E
          </div>
        </div>

        <p className="text-xs text-gray-700 leading-relaxed font-medium">
          {formattedAddress || 'Locating address details for selected pin...'}
        </p>

        {!isServiceable && (
          <p className="text-[11px] text-rose-600 font-semibold pt-1 border-t border-rose-100">
            ⚠️ This address is beyond our fresh cake delivery radius ({maxRadiusKm} km). Please select Store Pickup at checkout.
          </p>
        )}
      </div>
    </div>
  );
}
