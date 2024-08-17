import React from 'react';
import { Card, ListGroup, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import './Achievements.css';

function Achievements({ incidents }) {
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

  return (
    <div className="achievements-container">
      <Card className="mt-4">
        <Card.Header as="h2">Incidents</Card.Header>
        <ListGroup variant="flush">
          {incidents.length > 0 ? (
            incidents.map((incident, index) => (
              <ListGroup.Item key={index}>
                <div className="incident-item">
                  <Row className="mb-2">
                    <Col xs={12} md={6}>
                      <strong>Location:</strong>
                      <br />
                      Lat: {incident.gpsCoordinate[1]}, Lng: {incident.gpsCoordinate[0]}
                    </Col>
                    <Col xs={12} md={6}>
                      <strong>Severity:</strong>
                      <br />
                      {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                    </Col>
                  </Row>
                  <Row className="mb-2">
                    <Col xs={12}>
                      <strong>Description:</strong>
                      <br />
                      {incident.description}
                    </Col>
                  </Row>
                  <Row className="mb-2">
                    <Col xs={6}>
                      <Button variant="success" onClick={() => handleUpvote(incident._id)}>
                        Upvote ({incident.upvotes || 0})
                      </Button>
                    </Col>
                    <Col xs={6}>
                      <Button variant="danger" onClick={() => handleDownvote(incident._id)}>
                        Downvote ({incident.downvotes || 0})
                      </Button>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12}>
                      <strong>Timestamp:</strong>
                      <br />
                      {new Date(incident.timestamp).toLocaleString()}
                    </Col>
                  </Row>
                </div>
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item>No incidents found in the current area.</ListGroup.Item>
          )}
        </ListGroup>
      </Card>
    </div>
  );
}

export default Achievements;
