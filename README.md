1 stage:
just node.js with socket.io
webclient sends and recievs own message
mobile app sends and recieves own message

Server side application for Notify project

Built upon:

- node.js
- socket.io
- mongoDb
- mongoose
- docker

Following functions should be supported:
on API towards enterprise CRM:

- receive POST with message for mobile client
- save this message to mongoDb ??

on API towards mobile client (Flutter based)

- setup socket based communication with auto-reconnect enabled;
- use 2 custom events: 'send-message', 'message'
- emit message received from CRM to target mobile client
  // io.to(socketId).emit('message',"Hey there!");

Flutter client notes:

- required param {'transports':'websocket'}
- local host in Flutter dev is 10.0.2.2
