import React, { useState, useEffect } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import './App.css';
import MapView from './components/MapView';
import Achievements from './components/Achievements';
import Login from './components/Login';
import Register from './components/Register';
import axios from 'axios';

function App() {
  const [incidents, setIncidents] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('user_id')); // Load login state from localStorage
  const [tabValue, setTabValue] = useState(isLoggedIn ? 'Map' : 'login'); // Default to 'Map' if logged in
  const [userId, setUserId] = useState(localStorage.getItem('user_id') || '');
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

      // Persist login state in localStorage
      localStorage.setItem('user_id', response.data.user_id);
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

  useEffect(() => {
    if (isLoggedIn) {
      setTabValue('Map');
    }
  }, [isLoggedIn]);

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
          activeKey={tabValue}
          onSelect={(k) => setTabValue(k)}
          id="bottom-menu-tabs"
          className="bottom-menu-bar"
        >
          <Tab eventKey="Map" title="MapView">
            <div className="tab-content">
              <MapView incidents={incidents} setIncidents={setIncidents} />
            </div>
          </Tab>
          <Tab eventKey="incidents" title="Incidents">
            <div className="tab-content">
              <Achievements incidents={incidents}></Achievements>
            </div>
          </Tab>
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
