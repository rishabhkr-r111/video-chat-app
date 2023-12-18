from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, resources={
            r"/socket.io/*": {"origins": "http://localhost:5173"}})
socketio = SocketIO(app, cors_allowed_origins="http://localhost:5173")

chat_rooms = {}


@app.route('/')
def main():
    return render_template('index.html')


@app.route('/new-chat/<chat_id>')
def chat(chat_id):
    if chat_id not in chat_rooms:
        chat_rooms[chat_id] = {}
        return "Chat room created"
    else:
        return "Chat room already exists"


@app.route('/join-chat/<chat_id>')
def chat_join(chat_id):
    if chat_id in chat_rooms:
        return "You are in chat room"
    else:
        return "You are not in chat room"


@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['room']
    print(username, room)
    join_room(room)
    emit('message', f'{username} has entered the room.', room=room)


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
    emit('message', msg['msg'], room=msg['room'])


if __name__ == '__main__':
    socketio.run(app)
