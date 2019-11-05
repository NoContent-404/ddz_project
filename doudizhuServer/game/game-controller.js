const Player = require('./player');
const Room = require('./room');
const robot = require('./robot');
const defines = require('./../defines');
let _playerList = [];// 在线玩家
let _roomList = []; //  房间列表



exports.getroomList = function(){
    return _roomList;
}
exports.getPlayerList = function(){
    return _playerList;
}

exports.selectPlayer = function(data,player,cb){  //  搜索玩家
    let roomState ;
    for(let i=0;i<_roomList.length;i++){
        let rpList = _roomList[i].getPlayerList();
        console.log('房间玩家列表 = ' + rpList);
        console.log('房间状态 = ' + _roomList[i].getRoomState())
        roomState = _roomList[i].getRoomState();
        if(roomState >= 2){ //  当房间正在进行游戏的时候
            let RMPLList = _roomList[i].getRobMaterPlayerList();
            for(let j=0;j<rpList.length;j++){
                if(data == rpList[j].accountID){
                    rpList[j].isOnLine = true;
                    player.cards = rpList[j].cards;
                    player.uniqueID =  rpList[j].uniqueID;
                    player.nickName =  rpList[j].nickName;
                    player.avatarUrl =  rpList[j].avatarUrl;
                    player.isReady =  rpList[j].isReady;
                    player.accountID =  rpList[j].accountID;
                    player.gold =  rpList[j].gold;
                    player.seatIndex =  rpList[j].seatIndex;
                    player.isTrusteeship =  rpList[j].isTrusteeship;

                    rpList.splice(j,1,player);
                    _playerList.splice(j,1,player);
                    for(let k = 0;k<RMPLList.length;k++){

                        if(data == RMPLList[k].accountID){
                            RMPLList.splice(k,1,player);
                        }

                    }

                    console.log('重连获取的房间信息 = ' + _roomList[i].roomID)
                    // socket.emit('reconnection',_roomList[i].roomID);
                    let master = _roomList[i].getRoomMaster();
                    if(master === undefined){
                        master = null
                    }
                    if (cb) {
                        
                        cb(null, {
                            roomID: _roomList[i].roomID,
                            master: master
                        });
                    }
                    return rpList[j];
                }
            } 
        }
    }
}

exports.createPlayer = function (data, socket, callBackIndex) {
    
  
    let player = Player(data, socket, callBackIndex, this,robot);
    _playerList.push(player);
};

exports.createRobot = function (data, socket,AI) { //  创建机器人
    let player = Player(data, socket, null, this,AI);
    _playerList.push(player);
    // console.log('在线玩家人数 = '+_playerList.length)
    return player;
   
};










exports.createRoom = function (data, player, cb) {
    //gold = 100;
    //player = 101;
    //todo 检测金币是够足够
    let needCostGold = defines.createRoomConfig[data.rate];
    if (player.gold < needCostGold) {
        if (cb) {
            cb('gold not enough');
        }
        return;
    }

    let room = Room(data, player);
    _roomList.push(room);
    if (cb) {
        cb(null, room.roomID);
    }
};

exports.joinRoom = function (data, player, cb) {
    console.log('房间 id = ' + data);
    for (let i = 0; i < _roomList.length; i++) {
    
        if (_roomList[i].roomID === data) {
            let room = _roomList[i];
            let roomPlayer = room.getPlayerList();
            //  判断房间是否满人
            if (room.getPlayerCount() === 3){
                for(let i=0;i<roomPlayer.length;i++){
                    if(roomPlayer[i].accountID === player.accountID){
                        
                        // player = roomPlayer[i];
                        // console.log('我在房间的数据= ' + JSON.stringify(player));
                        // roomPlayer.splice(i,1);
                        // roomPlayer.push(player);
                        room.reJoinPlayer(player);
                        

                        if (cb) {
                            
                            cb(null, {
                                room: room,
                                data: {bottom: room.bottom, rate: room.rate},
                                playerList : roomPlayer
                            });
                        }
                        return;
                        
                    }
                }
                
                if (cb){
                    cb('房间已满！');
                }
                return;
            }


            room.joinPlayer(player);
            if (cb) {
                cb(null, {
                    room: room,
                    data: {bottom: room.bottom, rate: room.rate}
                });
            }
            return;

        }
  
    }
    if (cb) {
        cb('no have this room' + data);
    }
};

exports.quickToJoin = function (player,cb) {
    console.log('快速开始')
    for(let i=0,len = _roomList.length ; i<len ; i++){
        let room = _roomList[i];
        if(room.getPlayerCount() !== 3){
            room.joinPlayer(player);
            if (cb) {
                cb(null, {
                    room: room,
                    data: {bottom: room.bottom, rate: room.rate}
                });
            }
            return;
        }
    }

    
    let room = Room({rate :"rate_1"}, player);

    _roomList.push(room);
    if (cb) {
        cb(null,{
            msg : 'create',
            roomID : room.roomID
            
        } );
    }

}


exports.leaveRoom = function(myRoom, data ,player, cb){

    console.log('离开房间，返回大厅')
    for (let i = 0; i < _roomList.length; i++) {
        
        // console.log('我的房间ID类型'+ typeof myRoom.roomID)
        if (_roomList[i].roomID === myRoom.roomID) {
            _roomList[i].playerLeave(player);
        }
    }
    if(cb){
        cb(null,{
            accountID : player.accountID,
            nickName : player.nickName,
            avatarUrl : player.avatarUrl,
            gold : player.gold

        });
    }
};

exports.reMove = function(room){
    for(let i=0;i<_roomList.length;i++){
        if(_roomList[i].roomID === room.roomID){
            _roomList.splice(i,1);
        }
    }
};



