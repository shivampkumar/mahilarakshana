import React from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import Icon1 from './assets/download.png';
import bronzeIcon from './assets/bronze-icon.png';
import silverIcon from './assets/silver-icon.png';
import goldIcon from './assets/gold-icon.png';
import dullIcon from './assets/dull-icon.png'

function MapView() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: ''
  });

  const containerStyle = {
    width: '420px',
    height: '890px'
  };

  const [userLocation, setUserLocation] = React.useState(null);
  const [selectedPlace, setSelectedPlace] = React.useState(null);

  const center = {
    lat: 40.7829,
    lng: -73.9654,
    zoom: 14,
  };

  const mapOptions = {
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ],
    mapTypeControl: false,
    mapTypeControlOptions: {
      mapTypeIds: []
    },
    heading: 30,
  };

  const bounds = {
    north: 40.8005,
    south: 40.7646,
    east: -73.9499,
    west: -73.9815,
  };

  const userLock = {
    latitude: 40.7794,
    longitude: -73.9689
  };

  const locations = [
    {
      name: 'Bethesda Fountain',
      location: {
        lat: 40.7740,
        lng: -73.9708
      },
      info: 'Beautiful fountain located in Central Park.',
      visits: 3
    },
    {
      name: 'Belvedere Castle',
      location: {
        lat: 40.7794,
        lng: -73.9690
      },
      info: 'Scenic castle with panoramic views of Central Park.',
      visits: 7
    },
    {
      name: 'Central Park Zoo',
      location: {
        lat: 40.7678,
        lng: -73.9718
      },
      info: 'Charming zoo featuring a variety of animals.',
      visits: 12
    },
    {
      name: 'Strawberry Fields',
      location: {
        lat: 40.7757,
        lng: -73.9748
      },
      info: 'Peaceful memorial dedicated to John Lennon.',
      visits: 2
    },
    {
      name: 'The Ramble',
      location: {
        lat: 40.7790,
        lng: -73.9696
      },
      info: 'Tranquil wooded area with scenic paths.',
      visits: 15
    }
  ];

  React.useEffect(() => {
    console.log("Icon Credits: FlatIcon")
    navigator.geolocation.getCurrentPosition(function (position) {
      setUserLocation({
        lat: userLock.latitude,
        lng: userLock.longitude,
      });
    });
  }, []);

  const [map, setMap] = React.useState(null);

  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);

    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const handleMarkerClick = (place) => {
    setSelectedPlace(place);
  };

  const handleInfoWindowClose = () => {
    setSelectedPlace(null);
  };

  const getMarkerIcon = (visits) => {
    if (visits === 0) {
      // Return a dull icon for places that have not been visited
      return dullIcon;
    } else if (visits < 5) {
      return bronzeIcon;
    } else if (visits < 10) {
      return silverIcon;
    } else {
      return goldIcon;
    }
  };
  

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={center.zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {locations.map((location, i) => (
        <Marker
          key={i}
          position={location.location}
          title={location.name}
          icon={getMarkerIcon(location.visits)}
          onClick={() => handleMarkerClick(location)}
        />
      ))}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
        />
      )}
      {selectedPlace && (
        <InfoWindow
          position={selectedPlace.location}
          onCloseClick={handleInfoWindowClose}
        >
          <div>
            <h4>{selectedPlace.name}</h4>
            <p>{selectedPlace.info}</p>
            <p>Visits: {selectedPlace.visits}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : (
    <></>
  );
}

export default React.memo(MapView);
