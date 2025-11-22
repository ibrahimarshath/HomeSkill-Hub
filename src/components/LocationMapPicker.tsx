import { useState, useCallback, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";

const libraries: ("places")[] = ["places"];

interface LocationMapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number, address: string) => void;
}

const defaultCenter = {
  lat: 12.9716, // Bangalore default
  lng: 77.5946,
};

export function LocationMapPicker({ latitude, longitude, onLocationChange }: LocationMapPickerProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  );
  const [address, setAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Initialize autocomplete for search
    if (searchInputRef.current) {
      autocompleteRef.current = new google.maps.places.Autocomplete(searchInputRef.current, {
        types: ["geocode"],
      });

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const addr = place.formatted_address || "";
          
          setMarkerPosition({ lat, lng });
          setAddress(addr);
          map.setCenter({ lat, lng });
          map.setZoom(15);
          onLocationChange(lat, lng, addr);
        }
      });
    }

    // Set initial position if provided
    if (latitude && longitude) {
      map.setCenter({ lat: latitude, lng: longitude });
      map.setZoom(15);
      reverseGeocode(latitude, longitude);
    }
  }, [latitude, longitude]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const addr = results[0].formatted_address;
          setAddress(addr);
          onLocationChange(lat, lng, addr);
        }
      });
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      reverseGeocode(lat, lng);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMarkerPosition({ lat, lng });
        if (map) {
          map.setCenter({ lat, lng });
          map.setZoom(15);
        }
        reverseGeocode(lat, lng);
      },
      () => {
        alert("Could not get your current location.");
      }
    );
  };

  if (!isLoaded) {
    return (
      <Card className="p-4">
        <p className="text-muted-foreground">Loading map...</p>
        <p className="text-xs text-muted-foreground mt-2">
          Note: Google Maps API key required. Add VITE_GOOGLE_MAPS_API_KEY to your .env file.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search for a location (e.g., 'Bangalore, India')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="button" variant="outline" onClick={handleUseCurrentLocation}>
          <MapPin className="h-4 w-4 mr-2" />
          My Location
        </Button>
      </div>

      <div className="w-full h-[400px] rounded-lg overflow-hidden border">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={markerPosition || defaultCenter}
          zoom={markerPosition ? 15 : 10}
          onLoad={onMapLoad}
          onClick={handleMapClick}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {markerPosition && (
            <Marker
              position={markerPosition}
              draggable={true}
              onDragEnd={(e) => {
                if (e.latLng) {
                  const lat = e.latLng.lat();
                  const lng = e.latLng.lng();
                  setMarkerPosition({ lat, lng });
                  reverseGeocode(lat, lng);
                }
              }}
            />
          )}
        </GoogleMap>
      </div>

      {address && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-semibold mb-1">Selected Location:</p>
          <p className="text-sm text-foreground">{address}</p>
        </div>
      )}

      {!address && (
        <p className="text-sm text-muted-foreground text-center">
          Search for a location above to set the task location
        </p>
      )}
    </Card>
  );
}

