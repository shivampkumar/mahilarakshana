import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import axios from 'axios';
import cautionIcon from './assets/cautionicon.jpg';

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
  
  const previousBounds = useRef(null);

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
    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          setUserLocation((prevLocation) => {
            if (
              !prevLocation ||
              (prevLocation.lat !== latitude || prevLocation.lng !== longitude)
            ) {
              setCenter({
                lat: latitude,
                lng: longitude,
                zoom: 15,
              });
              return {
                lat: latitude,
                lng: longitude,
              };
            }
            return prevLocation;
          });
        },
        (error) => console.error('Error fetching location', error),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }

    return () => {
      if (navigator.geolocation && watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
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

  const handleUpvote = async (reportId) => {
    try {
      await axios.post(`http://20.168.8.23:8080/api/upvote/${reportId}`, { user_id: localStorage.getItem('user_id') });
      // Optionally, refresh the list of incidents or update the UI to reflect the upvote
    } catch (error) {
      console.error('Error upvoting the report', error);
    }
  };

  const handleDownvote = async (reportId) => {
    try {
      await axios.post(`http://20.168.8.23:8080/api/downvote/${reportId}`, { user_id: localStorage.getItem('user_id') });
      // Optionally, refresh the list of incidents or update the UI to reflect the downvote
    } catch (error) {
      console.error('Error downvoting the report', error);
    }
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

  const boundsAreDifferent = (newBounds) => {
    if (!previousBounds.current) return true;
    
    const { north, south, east, west } = newBounds;
    const previous = previousBounds.current;

    return (
      north !== previous.north ||
      south !== previous.south ||
      east !== previous.east ||
      west !== previous.west
    );
  };

  const fetchIncidents = useCallback((bounds) => {
    if (!bounds) {
      console.error('Map bounds are not available.');
      return;
    }

    const newBounds = {
      north: bounds.getNorthEast().lat(),
      south: bounds.getSouthWest().lat(),
      east: bounds.getNorthEast().lng(),
      west: bounds.getSouthWest().lng(),
    };

    if (!boundsAreDifferent(newBounds)) {
      return;
    }

    previousBounds.current = newBounds;

    const topLeft = {
      lat: newBounds.north,
      lng: newBounds.west,
    };
    const bottomRight = {
      lat: newBounds.south,
      lng: newBounds.east,
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
            // onBoundsChanged={onBoundsChanged}
          >
            {incidents.map((incident, index) => (
              <Marker
                key={index}
                position={{ lat: incident.gpsCoordinate[1], lng: incident.gpsCoordinate[0] }}
                icon={cautionIcon}
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
                  <p>Upvotes: {selectedIncident.upvotes || 0}</p>
                  <p>Downvotes: {selectedIncident.downvotes || 0}</p>
                  <button onClick={() => handleUpvote(selectedIncident._id)}>Upvote</button>
                  <button onClick={() => handleDownvote(selectedIncident._id)}>Downvote</button>
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
