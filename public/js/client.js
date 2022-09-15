(function(){
    const socket = io.connect();
    //const roomButtons = $(".joinToRoomButton");
    let RoomNameValue = $("#room-name");
    let roomsContainer = $("#roomsContainer");
    let CreateRoomForm = $("#create-room");
    var roomsWindow = Handlebars.compile( $("#rooms-window").html() );
    var roomWindow = Handlebars.compile( $("#room-window").html() );
    let fullRoomInfo = $("#fullRoomInfo");
    let nameExistInfo = $("#nameExist");
    let gameInfo = $("#gameInfo");
    let roomContainer = $("#room");
    let gameBoardContainer = $("#gameBoard");
    let gameButtons = $(".game-board__gameButton");
    let FreeButtonList = [];
    let moves = 0;
    let player;
    roomContainer.hide();
    gameBoardContainer.hide();
    let playerCross = true;


    //Creating New Room Form - Checking if is not empty value
    CreateRoomForm.on("submit", (e)=>{
        e.preventDefault();
   
        
        let roomName = RoomNameValue.val();
        if(roomName === "")
        {
            nameExistInfo.empty();
            message ="Nie podano nazwy";
            nameExistInfo.append(message);
        }
        else{
            socket.emit("newRoomCreate",roomName);
            nameExistInfo.empty();
            message ="utworzono pokój " + roomName;
            nameExistInfo.append(message);
    
        }

    });
    socket.on("nameExist",(roomName)=>{
        nameExistInfo.empty();
        let message = "Pokój "+roomName+" już istnieje";
        nameExistInfo.append(message);
    });
    //Creating new Room button
    socket.on("newRoom",(roomName)=>{
        let RoomsInfo = roomsWindow({
            roomName: roomName
        });
       roomsContainer.append(RoomsInfo);
    });
  
    //Join to Game Room Button reaction 
    $(document).on( "click", '.joinToRoomButton',function() {
        let thisRoomName = $(this).text();

    socket.emit("joinToRoom",thisRoomName,socket.id);
    });
    //showing room gameboard 
    socket.once("hi",(roomName)=>{
        
        CreateRoomForm.hide();
        roomsContainer.hide();
        roomContainer.show();
        
        //reactions for game button click
        gameButtons.each(function(gameButton){
            $(this).on('click',function(){
                gameButton = $(this).val();
                socket.emit("move",gameButton,playerCross);
            });        
        });
        let RoomInfo = roomWindow({
        roomName: roomName
    });
        roomContainer.append(RoomInfo);
        gameBoardContainer.show();
    });
    socket.on("changePlayer",()=>{
        playerCross = !playerCross;
    });
    //Showing Existing rooms buttons
    socket.on("rooms",(allRooms)=>{
       
        allRooms.forEach(room => {
            let RoomsList = roomsWindow({  roomName:room
            });
            roomsContainer.append(RoomsList);
        });
    
    });
    //message to user if room is full
    socket.once("fullRoom",(fullRoomMessage)=>{
        fullRoomInfo.append(fullRoomMessage);
        
    });
    //leave room button
    $(document).on("click","#leave",()=>{
        socket.emit("roomLeave");
        window.location.reload();
    });
    //reset game button
    $(document).on("click","#reset",()=>{
        socket.emit("resetGame");
    });
    //reaction for leaving room for this client
    socket.on("youLeaveRomm",()=>{
        CreateRoomForm.show();
        roomsContainer.show();
        roomContainer.hide();
        gameBoardContainer.hide();
    });
    //reaction for others that someone leave room
    socket.on("clientLeave",()=>{
       message= "Towarzysz gry opuścił pokoj";
       gameInfo.empty();
       gameInfo.append(message);
    });

    //unblock all game buttons
    socket.on("unblock",()=>{
        gameButtons.prop('disabled', false);
    });
    socket.on("block",()=>{
        gameButtons.prop('disabled', true);
    });

    //block buttons with sign
    socket.on("blockButtonswithSign",(gameButton)=>{
        FreeButtonList.push(gameButton);
        FreeButtonList.forEach((b)=>{
            gameButtons[b].disabled=true;
        });
    });
    socket.on("waiting",()=>{
        message ="Czekamy na przeciwnika";
        gameInfo.append(message);
    });
    socket.on("start",()=>{
        message ="teraz gra X";
        gameInfo.empty();
        gameInfo.append(message);
    });
    socket.on("insertX",(gameButton)=>{
        gameButtons[gameButton].append("X");
        moves++;
        player="X";
        gameInfo.empty();
        message ="teraz gra O";
        gameInfo.append(message);
        WinCheck(gameButtons,moves,player);
    });
    socket.on("insertO",(gameButton)=>{
        gameButtons[gameButton].append("O");
        moves++;
        player="O";
        message ="teraz gra X";
        gameInfo.empty();
        gameInfo.append(message);
        WinCheck(gameButtons,moves,player);
       
    });
    socket.on("Reset",()=>{
       gameButtons.each((b)=>{
            gameButtons[b].textContent="";
            playerCross = true;
            FreeButtonList =[];
       
        });
        gameInfo.empty();
        message ="teraz gra X";
        gameInfo.append(message);
    });
    function WinCheck(gameButtons,moves,player){
  
        if(gameButtons[0].textContent == gameButtons[1].textContent && gameButtons[1].textContent == gameButtons[2].textContent && gameButtons[2].textContent != ""   ){
            win(player);
        }
        else if(gameButtons[3].textContent == gameButtons[4].textContent && gameButtons[4].textContent == gameButtons[5].textContent && gameButtons[5].textContent != ""   ){
            win(player);
        }
        else if(gameButtons[6].textContent == gameButtons[7].textContent && gameButtons[7].textContent == gameButtons[8].textContent && gameButtons[8].textContent != ""   ){
            win(player);
        }
        else if(gameButtons[0].textContent == gameButtons[3].textContent && gameButtons[3].textContent == gameButtons[6].textContent && gameButtons[6].textContent != ""   ){
            win(player);
        }
        else if(gameButtons[1].textContent == gameButtons[4].textContent && gameButtons[4].textContent == gameButtons[7].textContent && gameButtons[7].textContent != ""   ){
            win(player);
        }
        else if(gameButtons[2].textContent == gameButtons[5].textContent && gameButtons[5].textContent == gameButtons[8].textContent && gameButtons[2].textContent != ""   ){
            win(player);
        }
        else if(gameButtons[0].textContent == gameButtons[4].textContent && gameButtons[4].textContent == gameButtons[8].textContent && gameButtons[8].textContent != ""   ){
            win(player);
        }
        else if(gameButtons[2].textContent == gameButtons[4].textContent && gameButtons[4].textContent == gameButtons[6].textContent && gameButtons[6].textContent != ""   ){
            win(player);
        }
        else if(moves==9){
            gameInfo.empty();
            message="Remis";
            gameInfo.append(message);
        }
    
    }
    function win(player){
        if(player =="X")
        {   
            message ="Wygrywa X";
            gameInfo.empty();
            gameInfo.append(message);
            socket.emit("win");
        }
        else{
            message ="Wygrywa O";
            gameInfo.empty();
            gameInfo.append(message);
            socket.emit("win");
        }
    }
})();

