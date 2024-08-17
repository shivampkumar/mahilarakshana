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
          defaultActiveKey="go"
          id="bottom-menu-tabs"
          className="bottom-menu-bar"
        >
          <Tab eventKey="go" title="Go">
            <div className="tab-content">
              <MapView />
            </div>
          </Tab>
          <Tab eventKey="achievements" title="Achievements">
            <div className="tab-content">
              <Achievements></Achievements>
            </div>
          </Tab>
          <Tab eventKey="store" title="Store">
            <div className="tab-content">
              <h2>Store</h2>
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
