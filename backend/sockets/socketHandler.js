export const handleSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Track room states
    let currentQuizRoom = null;

    // Join room for a specific quiz leaderboard
    socket.on('joinQuizLeaderboard', ({ quizId }) => {
      if (!quizId) return;

      // If already in a room, leave it
      if (currentQuizRoom) {
        socket.leave(currentQuizRoom.toString());
        const previousRoomSize = io.sockets.adapter.rooms.get(currentQuizRoom.toString())?.size || 0;
        io.to(currentQuizRoom.toString()).emit('activeParticipants', { count: previousRoomSize });
      }

      currentQuizRoom = quizId.toString();
      socket.join(currentQuizRoom);

      console.log(`Socket ${socket.id} joined quiz room: ${currentQuizRoom}`);

      // Count active participants in room
      const roomSize = io.sockets.adapter.rooms.get(currentQuizRoom)?.size || 0;
      io.to(currentQuizRoom).emit('activeParticipants', { count: roomSize });
    });

    // Leave room explicitly
    socket.on('leaveQuizLeaderboard', () => {
      if (currentQuizRoom) {
        socket.leave(currentQuizRoom.toString());
        console.log(`Socket ${socket.id} left quiz room: ${currentQuizRoom}`);
        const roomSize = io.sockets.adapter.rooms.get(currentQuizRoom.toString())?.size || 0;
        io.to(currentQuizRoom.toString()).emit('activeParticipants', { count: roomSize });
        currentQuizRoom = null;
      }
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
      if (currentQuizRoom) {
        const roomSize = io.sockets.adapter.rooms.get(currentQuizRoom.toString())?.size || 0;
        io.to(currentQuizRoom.toString()).emit('activeParticipants', { count: roomSize });
      }
    });
  });
};
