import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import Icon1 from './assets/download.png';
import bronzeIcon from './assets/bronze-icon.png';
import silverIcon from './assets/silver-icon.png';
import goldIcon from './assets/gold-icon.png';
import dullIcon from './assets/dull-icon.png';

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
    lat: '',
    lng: '',
    zoom: 15, // Default zoom value
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

  useEffect(() => {
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

  const [map, setMap] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const fetchIncidents = useCallback((bounds) => {
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
  }, [setIncidents]);

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);

    setTimeout(() => {
      const bounds = mapInstance.getBounds();
      fetchIncidents(bounds);
    }, 500); // Adjust delay as necessary
  }, [fetchIncidents]);

  const onBoundsChanged = useCallback(() => {
    if (map) {
      const bounds = map.getBounds();
      fetchIncidents(bounds);
    }
  }, [map, fetchIncidents]);

  const handleMarkerClick = (incident) => {
    setSelectedIncident(incident);
  };

  const handleInfoWindowClose = () => {
    setSelectedIncident(null);
  };

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
            onBoundsChanged={onBoundsChanged}
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
}

export default React.memo(MapView);
