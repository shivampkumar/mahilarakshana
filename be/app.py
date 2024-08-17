from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
# from bson import ObjectId
from urllib.parse import quote_plus
import os
from dotenv import load_dotenv
load_dotenv()
from datetime import datetime

app = Flask(__name__)
print("Name",__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
bcrypt = Bcrypt(app)
username = os.environ.get('MONGO_USERNAME')
password = os.environ.get('MONGO_PASSWORD')
username = quote_plus(username)
password = quote_plus(password)

# MongoDB setup
uri = f"mongodb+srv://{username}:{password}@safeway.4elzu.mongodb.net/?retryWrites=true&w=majority&appName=safeway"
client = MongoClient(uri)

db = client.safeway_db
users = db.users
reports = db.reports

@app.route('/api/register', methods=['POST','OPTIONS'])
@cross_origin()
def register():
    user_data = request.json
    user_data['password'] = bcrypt.generate_password_hash(user_data['password']).decode('utf-8')
    
    # Check if user already exists
    if users.find_one({'email': user_data['email']}):
        return jsonify({'message': 'User already exists'}), 400
    
    users.insert_one(user_data)
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST', 'OPTIONS'])
@cross_origin()
def login():
    user_data = request.json
    user = users.find_one({'email': user_data['email']})

    if user and bcrypt.check_password_hash(user['password'], user_data['password']):
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401
    
@app.route('/api/report', methods=['POST'])
@cross_origin()
def report():
    report_data = request.json
    report_data['timestamp'] = datetime.utcnow()  # Store the current timestamp
    
    # Insert the report into the 'reports' collection
    reports.insert_one(report_data)
    return jsonify({'message': 'Report submitted successfully'}), 201


@app.route('/api/get_problems', methods=['POST'])
@cross_origin()
def get_problems():
    bounding_box = request.json
    top_left = bounding_box['top_left']
    bottom_right = bounding_box['bottom_right']

    # Query to find all reports within the bounding box
    problems = list(reports.find({
        'gps_coordinate': {
            '$geoWithin': {
                '$box': [
                    [top_left['lng'], bottom_right['lat']],  # bottom-left corner
                    [bottom_right['lng'], top_left['lat']]  # top-right corner
                ]
            }
        }
    }))

    # Remove the MongoDB ObjectId and format the output
    for problem in problems:
        problem['_id'] = str(problem['_id'])

    return jsonify(problems), 200

#set up endpoint to save trusted contacts:



if __name__ == '__main__':
    app.run(host='0.0.0.0', port= 8080, debug=True)

