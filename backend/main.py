from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
cors = CORS(app, resources={
            r"/socket.io/*": {"origins": "http://localhost:5173"}})
socketio = SocketIO(app, cors_allowed_origins="http://localhost:5173")

chat_rooms = []


@app.route('/')
def main():
    return render_template('index.html')


@app.route('/create-room', methods=['POST'])
def chat():
    data = request.get_json()
    print(data)
    if data['room'] not in chat_rooms:
        chat_rooms.append(data['room'])
        username = data['username']
        room = data['room']
        print(username, room)
        return "Chat room created", 200
    else:
        return  "Chat room already exists", 404


@app.route('/join-room', methods=['POST'])
def chat_join():
    data = request.get_json()
    print(data)
    if data['room'] in chat_rooms:
        username = data['username']
        room = data['room']
        print(username, room)
        return "Chat room joined", 200
    else:
        return "Room not found", 404

@socketio.on('join')
def on_join(data):
        username = data['username']
        room = data['room']
        print(username, room)
        join_room(room)
        emit('message', {'user': username, 'msg' : 'Entered the room', 'room' : room} , room=room)       
        


@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['room']
    leave_room(room)
    emit('message', f'{username} has left the room.', room=room)


@app.route('/api/messages', methods=['POST'])
def send_message():
    data = request.get_json()
    room = data.get('room')
    message = data.get('message')
    socketio.emit('message', message, room=room)
    return jsonify({'status': 'Message sent'})


@socketio.on('message')
def handle_message(msg):
    print(msg)
    emit('message', msg , room=msg['room'])


if __name__ == '__main__':
    socketio.run(app)
