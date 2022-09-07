import io from "socket.io";
const socket = io();

export const emitEvent = (io, event, data) => {
  socket.emit(event, data);
};
