import React, { useState, useEffect } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import './ParkGPT.css';

function ParkGpt() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [plantImage, setPlantImage] = useState(null);
    const [plantName, setPlantName] = useState('');
    const [plantDescription, setPlantDescription] = useState('');
    const [file, setFile] = useState(null)

    const handleQuestionSubmit = async (e) => {
        e.preventDefault();
        // Call the OpenAI GPT-3 API to get the answer based on the question
        // Use your preferred method for making API calls to the GPT-3 model
        const answer = await getAnswerFromGPT("Answer the following question with respect to a visit to Central Park:\n" + question);
        setAnswer(answer);
        setQuestion('');
    };

    const getAnswerFromGPT = async (question) => {
        const response = await axios.post('https://api.openai.com/v1/engines/text-davinci-003/completions', {
            prompt: question,
            max_tokens: 60
        }, {
            headers: {
                'Authorization': `Bearer ` //replace with new openai api key to help with profile descriptions creation
            }
        });

        // Use response.data.choices[0].text to get the generated text
        const answer = response.data.choices[0].text.trim();
        return answer;
    };

    const identifyPlant = async (imageFile) => {
        const formData = new FormData();
        formData.append('image1', imageFile);
        formData.append('latitude', '49.207'); // You should adjust these coordinates to the user's actual location
        formData.append('longitude', '16.608'); // You should adjust these coordinates to the user's actual location
        formData.append('similar_images', 'true');

        const response = await axios.post('https://plant.id/api/v3/identification', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Api-Key': 'oyXqOA6GPZKe2ls2p0ytEXl9PFbeTwoLMx7LSA7ZBpuczbE0SZ' // Replace this with your actual API key
            }
        });

        const plantData = response.data.result.classification.suggestions[0];
        return plantData;
    };

    function handleChange(event) {
        setFile(event.target.files[0]);
        console.log("fiiewifh", event.target.files[0])
        console.log("Filer", event);
        console.log("File:", file)
    }

    useEffect(() => {
        console.log("Updated File:", file);
    }, [file]);

    const handleImageUpload = (e) => {
        console.log("Getting here......")

        const file = e.target.files[0];
        console.log(file);
        identifyPlantFromImage(file);
    };

    const identifyPlantFromImage = async (imageFile) => {
        const plantData = await identifyPlant(imageFile);
        setPlantName(plantData.name);
        setPlantDescription(plantData.details.description.value);
        setPlantImage(URL.createObjectURL(imageFile));
    };


    return (
        <div className="parkgpt-container">
            <Card>
                <Card.Header as="h2">Ask a Question</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleQuestionSubmit}>
                        <Form.Group controlId="questionForm">
                            <Form.Control
                                type="text"
                                placeholder="Ask a question..."
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                    {answer && (
                        <Form.Group controlId="answerForm">
                            <Form.Label><strong>Answer:</strong></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={10} // Adjust as needed
                                value={answer}
                                readOnly
                            />
                        </Form.Group>
                    )}
                </Card.Body>
            </Card>

            <Card>
                <Card.Header as="h2">Plant Identification</Card.Header>
                <Card.Body>
                    <form onSubmit={handleImageUpload}>
                        <h1>React File Upload</h1>
                        <input type="file" onChange={handleChange} />
                        <button type="submit">Upload</button>
                    </form>
                    {plantImage && (
                        <div className="plant-image-container">
                            <img src={plantImage} alt="Plant" className="plant-image" />
                            <Card.Text className="plant-name">{plantName}</Card.Text>
                            <Card.Text className="plant-description">{plantDescription}</Card.Text>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}
export default ParkGpt;
