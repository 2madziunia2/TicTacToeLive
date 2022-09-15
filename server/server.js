
function init(io){
  let allRooms =[];
  let deleteRoomTime;
  io.on('connection', function(socket){
        //emiting to all users exsisting Rooms
        socket.emit('rooms', allRooms);
        //Reaction for recive new room name adding to array and emiting to all users(sockets)
        socket.on("newRoomCreate", (roomName)=>{
            socket.roomName = roomName;
            if(allRooms.includes(roomName))
            {
              io.emit("nameExist",roomName);
            }
            else{
              io.emit("newRoom", roomName);
              allRooms.push(roomName);
              
               deleteRoomTime = setTimeout(timeToDeleteRoom, 300000);
              
            }
          
        });
        function timeToDeleteRoom(roomName) {
            allRooms.splice(allRooms.indexOf(roomName),1);
        }
        //Reaction for join to Room reciving checking that the room have less than two users
        socket.on("joinToRoom",(roomName)=>{
            
          socket.join(roomName);
           clearTimeout(deleteRoomTime);
          if((io.sockets.adapter.rooms.get(roomName).size)<=2)
            {
              socket.join(roomName);
              io.to(roomName).emit("hi",roomName);
        
              if(io.sockets.adapter.rooms.get(roomName).size==1){
                  io.to(roomName).emit("waiting");
                  io.to(socket.id).emit("block");  
                }
              else{
                  io.to(roomName).emit("start"); 
                  io.to(socket.id).emit("block");
                  socket.broadcast.to(roomName).emit("unblock");
                }
            
             socket.on("move",(przycisk,playerCross)=>{
               if(playerCross){
                  io.to(roomName).emit("insertX",przycisk);
                  io.to(roomName).emit("blockButtonswithSign",przycisk);
                  socket.broadcast.to(roomName).emit("unblock");
                  io.to(socket.id).emit("block");
               }
               else{
                  io.to(roomName).emit("insertO",przycisk);
                  socket.broadcast.to(roomName).emit("unblock");
                  io.to(socket.id).emit("block");
               }
               io.to(roomName).emit("blockButtonswithSign",przycisk);
               io.to(roomName).emit("changePlayer");
              });
          
            }
            
            else{
              socket.leave(roomName);
              let fullRoomMessage ="Niestey pokój "+ roomName +" jest pełen";
              socket.emit("fullRoom",fullRoomMessage); 
            }  
            socket.on("win",()=>{
              io.to(roomName).emit("block");
            });
           socket.on("resetGame",()=>{
              io.to(roomName).emit("Reset");
              socket.broadcast.to(roomName).emit("unblock");
              io.to(socket.id).emit("block");
            });
           socket.on("roomLeave",()=>{
              socket.leave(roomName);
              socket.emit("youLeaveRomm");
              io.to(roomName).emit("block");
              io.to(roomName).emit("Reset");
              io.to(roomName).emit("clientLeave");
            });
           
            socket.on("disconnect",()=>{
              socket.leave(roomName);
              io.to(roomName).emit("block");
              io.to(roomName).emit("Reset");
              io.to(roomName).emit("clientLeave");
              
              if(io.sockets.adapter.rooms.get(roomName)){
                console.log("Zostaje");
              }else{
                allRooms.splice(allRooms.indexOf(roomName),1);
              }
            });
        });    
  });  
}
module.exports = init;