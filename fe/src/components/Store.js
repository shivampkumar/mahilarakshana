import React, { useState } from 'react';
import { Tabs, Tab, Card, Form, Button, ListGroup } from 'react-bootstrap';
// import './TrustedContacts.css';
import './Store.css';

function TrustedContacts() {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewContact({ ...newContact, [name]: value });
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    setContacts([...contacts, newContact]);
    setNewContact({ name: '', phone: '', email: '' });
  };

  return (
    <div className="trusted-contacts-container">
      <Tabs defaultActiveKey="addContact" id="trusted-contacts-tabs" className="trusted-contacts-tabs">
        <Tab eventKey="addContact" title="Add Contact" className="trusted-contacts-tab">
          <AddContactTab
            newContact={newContact}
            handleInputChange={handleInputChange}
            handleAddContact={handleAddContact}
          />
        </Tab>
        <Tab eventKey="viewContacts" title="View Contacts" className="trusted-contacts-tab">
          <ViewContactsTab contacts={contacts} />
        </Tab>
      </Tabs>
    </div>
  );
}

function AddContactTab({ newContact, handleInputChange, handleAddContact }) {
  return (
    <Card className="trusted-contacts-card">
      <Card.Body>
        <h2 className="trusted-contacts-section-title">Add Trusted Contact</h2>
        <Form onSubmit={handleAddContact}>
          <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={newContact.name}
              onChange={handleInputChange}
              placeholder="Enter name"
              required
            />
          </Form.Group>

          <Form.Group controlId="formPhone">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={newContact.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              required
            />
          </Form.Group>

          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={newContact.email}
              onChange={handleInputChange}
              placeholder="Enter email"
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Add Contact
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

function ViewContactsTab({ contacts }) {
  return (
    <Card className="trusted-contacts-card">
      <Card.Body>
        <h2 className="trusted-contacts-section-title">Trusted Contacts</h2>
        {contacts.length > 0 ? (
          <ListGroup variant="flush">
            {contacts.map((contact, index) => (
              <ListGroup.Item key={index}>
                <strong>{contact.name}</strong> - {contact.phone} - {contact.email}
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p>No contacts added yet.</p>
        )}
      </Card.Body>
    </Card>
  );
}

export default TrustedContacts;
