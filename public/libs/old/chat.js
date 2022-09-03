class User {
  constructor(name, id) {
    this.name = name;
    this.id = id;
  }
}

class Message {
  constructor(id, room, user, content) {
    this.id = id;
    this.room = room;
    this.user = user;
    this.content = content;
  }
}

class Room {
  constructor(roomName, roomId) {
    this.roomName = roomName;
    this.roomId = roomId;
    this.messages = [];
  }
}


let socket = io("ws://" + window.location.host, {
  path: "/ws/socket.io"
});

socket.on("AddMessage", (message) => {
  console.log(message);
})

class Chat {
  constructor() {
    this.socket = socket;
    this.rooms = [];
  }

  getRoom(room_id) {
    return this.rooms.find(room => room.roomId === room_id);
  }
}