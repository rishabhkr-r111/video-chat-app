from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
cors = CORS(app, resources={
            r"/socket.io/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")


emailToSocketIdMap = {}
socketidToEmailMap = {}

@socketio.on('connect')
def handle_connect():
    print(f"Socket Connected: {request.sid}")

@socketio.on('room:join')
def handle_room_join(data):
    email = data['email']
    room = data['room']
    emailToSocketIdMap[email] = request.sid
    socketidToEmailMap[request.sid] = email
    join_room(room)
    emit('user:joined', {'email': email, 'id': request.sid}, room=room)
    emit('room:join', data, room=request.sid)

@socketio.on('user:message')
def handle_user_message(data):
    to = data['to']
    print("user:message", data)
    emit('incomming:message', data, room=to)

@socketio.on('user:call')
def handle_user_call(data):
    to = data['to']
    offer = data['offer']
    emit('incomming:call', {'from': request.sid, 'offer': offer}, room=to)

@socketio.on('call:accepted')
def handle_call_accepted(data):
    to = data['to']
    ans = data['ans']
    emit('call:accepted', {'from': request.sid, 'ans': ans}, room=to)

@socketio.on('peer:nego:needed')
def handle_peer_nego_needed(data):
    to = data['to']
    offer = data['offer']
    emit('peer:nego:needed', {'from': request.sid, 'offer': offer}, room=to)
    print("peer:nego:needed", offer)

@socketio.on('peer:nego:done')
def handle_peer_nego_done(data):
    to = data['to']
    ans = data['ans']
    emit('peer:nego:final', {'from': request.sid, 'ans': ans}, room=to)
    print("peer:nego:done", ans)

if __name__ == '__main__':
    socketio.run(app)
