import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import './App.css';
import MapView from './components/MapView';
import Achievements from './components/Achievements';
import Store from './components/Store';
import ParkGpt from './components/ParkGpt'

function App() {
  return (
    <div className="app-container">
      <div className="content-container">
        {/* Content for each tab */}
        <Tabs
          defaultActiveKey="Map"
          id="bottom-menu-tabs"
          className="bottom-menu-bar"
        >
          <Tab eventKey="Map" title="MapView">
            <div className="tab-content">
              <MapView />
            </div>
          </Tab>
          <Tab eventKey="incidents" title="Incidents">
            <div className="tab-content">
              <Achievements></Achievements>
            </div>
          </Tab>
          <Tab eventKey="trustedcontacts" title="Contacts">
            <div className="tab-content">
              <h2>Emergency Contacts</h2>
              <Store></Store>
            </div>
          </Tab>
          <Tab eventKey="parkgpt" title="ParkGPT">
            <div className="tab-content">
              <h2>ParkGPT</h2>
              <ParkGpt/>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
