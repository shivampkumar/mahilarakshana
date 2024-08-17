import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import Icon1 from './assets/download.png';
import bronzeIcon from './assets/bronze-icon.png';
import silverIcon from './assets/silver-icon.png';
import goldIcon from './assets/gold-icon.png';
import dullIcon from './assets/dull-icon.png'

function MapView({ incidents, setIncidents }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCQxNdJeOBALdHCKwnuOaDJgCSyE0jEKrA'
  });

  const containerStyle = {
    width: '650px',
    height: '950px'
  };

  const [userLocation, setUserLocation] = useState(null);
  const [center, setCenter] = useState({
    // lat: 37.773972,
    // lng: -122.431297,
    lat: '',
    lng: '',
    zoom: '', //changing the zoom value seems to alter the default starting location on the map
  });
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportDetails, setReportDetails] = useState({
    gpsCoordinate: '',
    description: '',
    severity: '',
  });

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
    // console.log("Icon Credits: FlatIcon")
    // navigator.geolocation.getCurrentPosition(function (position) {
    //   setUserLocation({
    //     lat: userLock.latitude,
    //     lng: userLock.longitude,
    //   });
    // });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({
          lat: latitude,
          lng: longitude,
        });
        setCenter({
          lat: latitude,
          lng: longitude,
          zoom: 15,
        });
      },
      (error) => console.error('Error fetching location', error)
    );
  }, []);

  const handleReportButtonClick = () => {
    setShowReportForm(true);
    setReportDetails({
      ...reportDetails,
      gpsCoordinate: `${userLocation.lat}, ${userLocation.lng}`,
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setReportDetails({
      ...reportDetails,
      [name]: value,
    });
  };

  const handleSubmitReport = (e) => {
    e.preventDefault();
    console.log("submitting report");
    fetch('http://20.168.8.23:8080/api/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gpsCoordinate: reportDetails.gpsCoordinate,
        description: reportDetails.description,
        severity: reportDetails.severity,
        timestamp: new Date().toISOString(),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
        setShowReportForm(false);
      })
      .catch((error) => console.error('Error:', error));
  };


  const [map, setMap] = React.useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  // const onLoad = React.useCallback(function callback(map) {
  //   const bounds = new window.google.maps.LatLngBounds(center);
  //   map.fitBounds(bounds);

  //   setMap(map);
  // }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  // const handleMarkerClick = (place) => {
  //   setSelectedPlace(place);
  // };

  // const handleInfoWindowClose = () => {
  //   setSelectedPlace(null);
  // };

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


  const fetchIncidents = (bounds) => {
    if (!bounds) {
      console.error('Map bounds are not available.');
      return;
    }

    const topLeft = {
      lat: bounds.getNorthEast().lat(),
      lng: bounds.getSouthWest().lng(),
    };
    const bottomRight = {
      lat: bounds.getSouthWest().lat(),
      lng: bounds.getNorthEast().lng(),
    };

    console.log("Top Left:", topLeft);
    console.log("Bottom Right:", bottomRight);

    fetch('http://20.168.8.23:8080/api/get_problems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        top_left: topLeft,
        bottom_right: bottomRight,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setIncidents(data);  // Update the incidents in the parent component
      })
      .catch((error) => console.error('Error:', error));
    // console.log("Incidents:", incidents);
  };

  const onLoad = useCallback((mapInstance) => { 
    setMap(mapInstance);

    // Delay the fetch to ensure the bounds are ready
    setTimeout(() => {
      const bounds = mapInstance.getBounds();
      fetchIncidents(bounds);
    }, 500); // Adjust delay as necessary
  }, []);

  
  const handleMarkerClick = (incident) => {
    setSelectedIncident(incident);
  };

  const handleInfoWindowClose = () => {
    setSelectedIncident(null);
  };

  const onBoundsChanged = useCallback(() => {
    if (map) {
      const bounds = map.getBounds();
      fetchIncidents(bounds);
    }
  }, [map]);
  

  return (
    <div style={{ display: 'flex' }}>
      <div>
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={center.zoom}
            options={mapOptions}
            onLoad={onLoad}
            // onBoundsChanged={onBoundsChanged}
          >
            {incidents.map((incident, index) => (
              <Marker
                key={index}
                position={{ lat: incident.gpsCoordinate[1], lng: incident.gpsCoordinate[0] }}
                onClick={() => handleMarkerClick(incident)}
              />
            ))}

            {selectedIncident && selectedIncident.gpsCoordinate && (
              <InfoWindow
                position={{ lat: selectedIncident.gpsCoordinate[1], lng: selectedIncident.gpsCoordinate[0] }}
                onCloseClick={handleInfoWindowClose}
              >
                <div>
                  <h4>{selectedIncident.description}</h4>
                  <p>Severity: {selectedIncident.severity}</p>
                  <p>Timestamp: {new Date(selectedIncident.timestamp).toLocaleString()}</p>
                </div>
              </InfoWindow>
            )}
            {locations.map((location, i) => (
              <Marker
                key={i}
                position={location.location}
                title={location.name}
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
                onCloseClick={() => setSelectedPlace(null)}
              >
                <div>
                  <h4>{selectedPlace.name}</h4>
                  <p>{selectedPlace.info}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </div>
      <div style={{ marginLeft: '20px' }}>
        <button onClick={handleReportButtonClick}>Create Report</button>
        {showReportForm && (
          <form onSubmit={handleSubmitReport} style={{ marginTop: '20px' }}>
            <div>
              <label>GPS Coordinate:</label>
              <input
                type="text"
                name="gpsCoordinate"
                value={reportDetails.gpsCoordinate}
                readOnly
              />
            </div>
            <div>
              <label>Description:</label>
              <textarea
                name="description"
                value={reportDetails.description}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <label>Severity:</label>
              <select
                name="severity"
                value={reportDetails.severity}
                onChange={handleFormChange}
                required
              >
                <option value="">Select Severity</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <button type="submit">Submit Report</button>
          </form>
        )}
      </div>
    </div>
  );

  // return isLoaded ? (
  //   <GoogleMap
  //     mapContainerStyle={containerStyle}
  //     center={center}
  //     zoom={center.zoom}
  //     onLoad={onLoad}
  //     onUnmount={onUnmount}
  //     options={mapOptions}
  //   >
  //     {locations.map((location, i) => (
  //       <Marker
  //         key={i}
  //         position={location.location}
  //         title={location.name}
  //         icon={getMarkerIcon(location.visits)}
  //         onClick={() => handleMarkerClick(location)}
  //       />
  //     ))}
  //     {userLocation && (
  //       <Marker
  //         position={userLocation}
  //         icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
  //       />
  //     )}
  //     {selectedPlace && (
  //       <InfoWindow
  //         position={selectedPlace.location}
  //         onCloseClick={handleInfoWindowClose}
  //       >
  //         <div>
  //           <h4>{selectedPlace.name}</h4>
  //           <p>{selectedPlace.info}</p>
  //           <p>Visits: {selectedPlace.visits}</p>
  //         </div>
  //       </InfoWindow>
  //     )}
  //   </GoogleMap>
  // ) : (
  //   <></>
  // );
}

export default React.memo(MapView);
