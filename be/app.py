from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from bson import ObjectId
from urllib.parse import quote_plus
import os
from dotenv import load_dotenv
from datetime import datetime
from sentence_transformers import SentenceTransformer  
from sklearn.metrics.pairwise import cosine_similarity

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# Initialize Bcrypt for password hashing
bcrypt = Bcrypt(app)

# Get MongoDB credentials from environment variables
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


# Initialize the sentence transformer model (optional)
model = SentenceTransformer('all-MiniLM-L6-v2')

def calculate_similarity(description1, description2):
    # Vectorize the descriptions
    embeddings1 = model.encode([description1])
    embeddings2 = model.encode([description2])

    # Compute cosine similarity
    return cosine_similarity(embeddings1, embeddings2)[0][0]

@app.route('/api/register', methods=['POST', 'OPTIONS'])
@cross_origin()
def register():
    user_data = request.json
    # Use generate_password_hash to hash the password
    user_data['password'] = bcrypt.generate_password_hash(user_data['password']).decode('utf-8')
    
    # Check if user already exists
    if users.find_one({'email': user_data['email']}):
        return jsonify({'message': 'User already exists'}), 400
    
    # Generate a unique user ID and record creation time
    user_data['user_id'] = str(ObjectId())
    user_data['created_at'] = datetime.utcnow()

    # Insert the new user into the database
    users.insert_one(user_data)
    return jsonify({'message': 'User registered successfully', 'user_id': user_data['user_id']}), 201

@app.route('/api/login', methods=['POST', 'OPTIONS'])
@cross_origin()
def login():
    user_data = request.json
    user = users.find_one({'email': user_data['email']})

    if user and bcrypt.check_password_hash(user['password'], user_data['password']):
        return jsonify({
            'message': 'Login successful',
            'user_id': user['user_id'],
            'safety_contact_1': user.get('safety_contact_1'),
            'safety_contact_2': user.get('safety_contact_2')
        }), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401
    
@app.route('/api/report', methods=['POST'])
@cross_origin()
def report():
    report_data = request.json
    coordinates = list(map(float, report_data['gpsCoordinate'].split(', ')))
    # MongoDB expects [longitude, latitude]
    coordinates = [coordinates[1], coordinates[0]]
    report_data['gpsCoordinate'] = coordinates
    report_data['timestamp'] = datetime.utcnow()  # Store the current timestamp
    
    # Query for existing reports within a certain radius
    nearby_reports = list(reports.find({
        'gpsCoordinate': {
            '$geoWithin': {
                '$centerSphere': [coordinates, 0.002]  # ~111 meters radius
            }
        }
    }))

    print("Nearby reports", nearby_reports)
    
    # Compare descriptions for similarity
    similar_report = None
    max_similarity = 0.0
    similarity_threshold = 0.8  # You can adjust this threshold

    for report in nearby_reports:
        similarity = calculate_similarity(report_data['description'], report['description'])
        if similarity > max_similarity:
            max_similarity = similarity
            similar_report = report

    if similar_report and max_similarity >= similarity_threshold:
        # Update the existing report instead of adding a new one
        print("similar_report adding")
        reports.update_one(
            {'_id': similar_report['_id']},
            {
                '$set': {'description': f"{similar_report['description']} / {report_data['description']}"},
                '$inc': {'upvotes': 1}
            }
        )
        return jsonify({'message': 'Similar report found, updated the existing report.'}), 200
    else:
        print("new report creating")
        # Insert as a new report
        report_data['upvotes'] = 0  # Initialize upvotes
        report_data['downvotes'] = 0  # Initialize downvotes
        print("report_data", report_data)
        reports.insert_one(report_data)
        return jsonify({'message': 'Report submitted successfully'}), 201

@app.route('/api/get_problems', methods=['POST'])
@cross_origin()
def get_problems():
    bounding_box = request.json
    top_left = bounding_box['top_left']
    bottom_right = bounding_box['bottom_right']
    print("top_left",top_left)
    print("bottom_right",bottom_right)
    # Query to find all reports within the bounding box
    problems = list(reports.find({
        'gpsCoordinate': {
            '$geoWithin': {
                '$box': [
                    [top_left['lng'], bottom_right['lat']],  # bottom-left corner
                    [bottom_right['lng'], top_left['lat']]  # top-right corner
                ]
            }
        }
    }))
    print("problems",problems)

    # Remove the MongoDB ObjectId and format the output
    for problem in problems:
        problem['_id'] = str(problem['_id'])

    return jsonify(problems), 200

#set up endpoint to save trusted contacts:
@app.route('/api/upvote/<report_id>', methods=['POST'])
@cross_origin()
def upvote(report_id):
    user_id = request.json.get('user_id')
    report = reports.find_one({'_id': ObjectId(report_id)})

    if not report:
        return jsonify({'message': 'Report not found'}), 404

    # Avoid double voting (optional feature)
    if user_id in report.get('upvoters', []):
        return jsonify({'message': 'You have already upvoted this report'}), 400

    # Do not allow upvoting if the user has already downvoted
    if user_id in report.get('downvoters', []):
        return jsonify({'message': 'You have already downvoted this report'}), 400
    
    reports.update_one(
        {'_id': ObjectId(report_id)},
        {
            '$inc': {'upvotes': 1},
            '$addToSet': {'upvoters': user_id}  # Add user_id to the upvoters list
        }
    )
    return jsonify({'message': 'Upvote successful'}), 200


@app.route('/api/downvote/<report_id>', methods=['POST'])
@cross_origin()
def downvote(report_id):
    user_id = request.json.get('user_id')
    report = reports.find_one({'_id': ObjectId(report_id)})

    if not report:
        return jsonify({'message': 'Report not found'}), 404

    # Avoid double voting (optional feature)
    if user_id in report.get('downvoters', []):
        return jsonify({'message': 'You have already downvoted this report'}), 400
    
    # Do not allow downvoting if the user has already upvoted
    if user_id in report.get('upvoters', []):
        return jsonify({'message': 'You have already upvoted this report'}), 400

    reports.update_one(
        {'_id': ObjectId(report_id)},
        {
            '$inc': {'downvotes': 1},
            '$addToSet': {'downvoters': user_id}  # Add user_id to the downvoters list
        }
    )
    return jsonify({'message': 'Downvote successful'}), 200



if __name__ == '__main__':
    app.run(host='0.0.0.0', port= 8080, debug=True)

