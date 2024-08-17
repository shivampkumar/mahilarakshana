import React from 'react';
import { Tabs, Tab, Card } from 'react-bootstrap';
import './Store.css';

function Store() {
  return (
    <div className="store-container">
      <Tabs defaultActiveKey="merch" id="store-tabs" className="store-tabs">
        <Tab eventKey="merch" title="Merch" className="store-tab">
          <MerchTab />
        </Tab>
        <Tab eventKey="experiences" title="Experiences" className="store-tab">
          <ExperiencesTab />
        </Tab>
      </Tabs>
    </div>
  );
}

function MerchTab() {
  return (
    <Card className="store-card">
      <Card.Body>
        <h2 className="store-section-title">Merch</h2>
        <ul className="store-item-list">
          <li className="store-item">Park Hat</li>
          <li className="store-item">Park Hoodie</li>
          <li className="store-item">T-shirt</li>
          <li className="store-item">Mug</li>
          <li className="store-item">Keychain</li>
        </ul>
      </Card.Body>
    </Card>
  );
}

function ExperiencesTab() {
  return (
    <Card className="store-card">
      <Card.Body>
        <h2 className="store-section-title">Experiences</h2>
        <ul className="store-item-list">
          <li className="store-item">Guided Movie Tour</li>
          <li className="store-item">Seneca Village Tour</li>
          <li className="store-item">Nature Walk</li>
          <li className="store-item">Bird Watching</li>
          <li className="store-item">Bike Rental</li>
        </ul>
      </Card.Body>
    </Card>
  );
}

export default Store;
