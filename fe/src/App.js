import React, { useState, useEffect } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import './App.css';
import MapView from './components/MapView';
import Achievements from './components/Achievements';
import Store from './components/Store';
import ParkGpt from './components/ParkGpt';
import Login from './components/Login';
import Register from './components/Register';
import axios from 'axios';

function App() {
  const [incidents, setIncidents] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tabValue, setTabValue] = useState('login');
  const [userId, setUserId] = useState('');
  const [safetyContacts, setSafetyContacts] = useState([]);

  const API_BASE_URL = 'http://20.168.8.23:8080/api';

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
      console.log(response.data);
      setUserId(response.data.user_id);
      setSafetyContacts([response.data.safety_contact_1, response.data.safety_contact_2]);
      setIsLoggedIn(true);
      setTabValue('Map'); // Switch to Map tab after login
    } catch (error) {
      console.error(error);
      alert('Login failed');
    }
  };

  const handleRegister = async (email, password, safetyContact1, safetyContact2) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        email,
        password,
        safety_contact_1: safetyContact1,
        safety_contact_2: safetyContact2,
      });
      console.log(response.data);
      alert('Registration successful');
      setTabValue('login'); // Switch to login tab after successful registration
    } catch (error) {
      console.error(error);
      alert('Registration failed');
    }
  };

  const renderUserView = () => {
    if (!isLoggedIn) {
      return (
        <Tabs
          activeKey={tabValue}
          onSelect={(k) => setTabValue(k)}
          id="auth-tabs"
          className="bottom-menu-bar"
        >
          <Tab eventKey="login" title="Login">
            <Login onLogin={handleLogin} />
          </Tab>
          <Tab eventKey="register" title="Register">
            <Register onRegister={handleRegister} />
          </Tab>
        </Tabs>
      );
    } else {
      return (
        <Tabs
          defaultActiveKey="Map"
          id="bottom-menu-tabs"
          className="bottom-menu-bar"
        >
          <Tab eventKey="Map" title="MapView">
            <div className="tab-content">
              <MapView setIncidents={setIncidents} />
            </div>
          </Tab>
          <Tab eventKey="incidents" title="Incidents">
            <div className="tab-content">
              <Achievements incidents={incidents}></Achievements>
            </div>
          </Tab>
          {/* <Tab eventKey="trustedcontacts" title="Contacts">
            <div className="tab-content">
              <h2>Emergency Contacts</h2>
              <Store></Store>
            </div>
          </Tab> */}
          {/* <Tab eventKey="parkgpt" title="ParkGPT">
            <div className="tab-content">
              <h2>ParkGPT</h2>
              <ParkGpt/>
            </div>
          </Tab> */}
        </Tabs>
      );
    }
  };

  return (
    <div className="app-container">
      <div className="content-container">
        {renderUserView()}
      </div>
    </div>
  );
}

export default App;
