const rooms = {};

function init(room) {
  if (!rooms[room]) {
    rooms[room] = [];
  }
}

module.exports = {
  add(room, stroke) {
    init(room);

    rooms[room].push(stroke);

    console.log("Saved strokes:", rooms[room].length);
  },

  get(room) {
    init(room);
    return rooms[room];
  },

  undo(room, userId) {
    init(room);

    console.log("Undo for:", userId);

    for (let i = rooms[room].length - 1; i >= 0; i--) {
      if (rooms[room][i].userId === userId) {
        console.log("Removed stroke");

        rooms[room].splice(i, 1);
        return;
      }
    }

    console.log("No stroke found for user");
  },
};
