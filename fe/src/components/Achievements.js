import React from 'react';
import { Card, ListGroup, ProgressBar, Button } from 'react-bootstrap';
import './Achievements.css';

import bronzeIcon from './assets/bronze-icon.png';
import silverIcon from './assets/silver-icon.png';
import goldIcon from './assets/gold-icon.png';
import dullIcon from './assets/dull-icon.png';

function Achievements({ incidents }) {
  return (
    <div className="achievements-container">
      <Card>
        <Card.Header as="h2">Incidents</Card.Header>
        <ListGroup variant="flush">
          {incidents.length > 0 ? (
            incidents.map((incident, index) => (
              <ListGroup.Item key={index}>
                <div className="incident-item">
                  <span className="incident-location">
                    {incident.gpsCoordinate.lat}, {incident.gpsCoordinate.lng}
                  </span>
                  <span className="incident-description">
                    {incident.description}
                  </span>
                  <span className="incident-severity">
                    Severity: {incident.severity}
                  </span>
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

  // const milestones = [
  //   { name: 'Bethesda Fountain', count: 5 },
  //   { name: 'Belvedere Castle', count: 3 },
  //   { name: 'Central Park Zoo', count: 2 },
  //   { name: 'Strawberry Fields', count: 4 },
  //   { name: 'The Ramble', count: 1 },
  // ];

  // const getMilestoneIcon = (count) => {
  //   if (count === 0) {
  //     return dullIcon;
  //   } else if (count < 5) {
  //     return bronzeIcon;
  //   } else if (count < 10) {
  //     return silverIcon;
  //   } else {
  //     return goldIcon;
  //   }
  // };

  // const tasks = [
  //   { name: 'Visit Bow Bridge', points: 10, progress: 50 },
  //   { name: 'Complete a 5-mile walk', points: 15, progress: 75 },
  //   { name: 'Explore the Conservatory Garden', points: 20, progress: 25 },
  //   { name: 'Claim Reward Task', points: 30, progress: 100 },
  // ];

  // return (
  //   <div className="achievements-container">
  //     <Card>
  //       <Card.Header as="h2">Visits</Card.Header>
  //       <ListGroup variant="flush">
  //         {milestones.map((milestone, index) => (
  //           <ListGroup.Item key={index}>
  //             <div className="milestone-item">
  //               <img
  //                 src={getMilestoneIcon(milestone.count)}
  //                 alt={`${milestone.name} Icon`}
  //                 className="milestone-icon"
  //               />
  //               <span className="milestone-name">{milestone.name}</span>
  //               <span className="milestone-count">{milestone.count}</span>
  //             </div>
  //           </ListGroup.Item>
  //         ))}
  //       </ListGroup>
  //     </Card>

  //     <Card>
  //       <Card.Header as="h2">In Progress Tasks</Card.Header>
  //       <ListGroup variant="flush">
  //         {tasks.map((task, index) => (
  //           <ListGroup.Item key={index}>
  //             <div className="task-item">
  //               <span className="task-name">{task.name}</span>
  //               <span className="task-points">{task.points} points</span>
  //               {task.progress === 100 && (
  //                 <Button variant="success" className="claim-button">
  //                   Claim Reward
  //                 </Button>
  //               )}
  //             </div>
  //             <ProgressBar now={task.progress} label={`${task.progress}%`} />
  //           </ListGroup.Item>
  //         ))}
  //       </ListGroup>
  //     </Card>
  //   </div>
  // );
}

export default Achievements;
