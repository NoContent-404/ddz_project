const robot = require('./robot');
module.exports = function (spec, socket, cbIndex, gameContorller) {

    let that = {};
    

    let _socket = socket;
    console.log('create new player = ' + JSON.stringify(spec));
    that.uniqueID = spec.unique_id;     //  标识
    that.nickName = spec.nick_name;     //  昵称
    that.accountID = spec.account_id;   //  acId
    that.avatarUrl = spec.avatar_url;   //  头像
    that.sex = spec.sex;   //  性别
    that.gold = spec.gold_count;    //  金币
    that.seatIndex = 0;     //  座位号
    that.isReady = false;   //  准备状态
    that.cards = [];    //  牌组
    that.isOnLine = true;   //  是否在线
    that.isTrusteeship = false; //  是否托管
    that.isoccupy = spec.isoccupy;    //  机器人是否被占用
    that.isrobot = spec.isrobot;    //  是否为机器人
    that._robot = robot();





    let _room = undefined;  //  房间号
    const notify = function (type, data, callBackIndex) {
        console.log('反 notify type=' + JSON.stringify(type));
        console.log('反 notify data=' + JSON.stringify(data));
        if(that.isrobot){
            console.log('机器人');
        }else{
            _socket.emit('notify', {        
                type: type,
                data: data,
                callBackIndex: callBackIndex
            });
        }
       
    };
   

        notify('login',{    //  登录成功返回用户信息

            nick_name :that.nickName,
            accountID :that.accountID,
            avatarUrl :that.avatarUrl,
            goldCount: that.gold
        }, cbIndex);
    
   

    _socket.on('yes',(myId) =>{
        let roomName
        if(_room){
             roomName = _room;
        }else{
            roomName = undefined;
        }
        console.log('我的ID = ' +myId)   //  可用
        // timerStart(1000,_socket,myId,{
        //     player : that,
        //     myRoom :roomName
        // });
    })


 

    
    _socket.on('disconnect', ()=>{
        console.log('玩家掉线');
        
        that.isOnLine = false;
        that.isTrusteeship = false; //  变回非托管状态
        let  List1 =   gameContorller.getPlayerList();         
        let roomList  = gameContorller.getroomList();
        console.log('在线玩家列表 = ' +JSON.stringify(List1));
        if (_room){
            if(_room.getRoomState() <=1){
            
                _room.playerOffLine(that);
                // that.isReady = false;
                if(_room.getPlayerList().length === 0){
                    gameContorller.reMove(_room);
                    console.log('房间列表' + roomList)
                    
                }
            }else{
                console.log('游戏正在进行,玩家离线，实行玩家托管');
                _room.lostConnection(that);
            }
            
        }else{
            gameContorller.reMovePlayer(that);
            console. log('在线玩家人数 = ' + List1.length);   
        }
    });
    
    

    _socket.on('notify', (notifyData)=>{

        if(that.isrobot){
            return;
        }
        let type = notifyData.type;
        console.log('notify data = ' + JSON.stringify(notifyData.data));
        let callBackIndex = notifyData.callBackIndex;
        // console.log(_room);
       
        
        
        
        switch (type){
            case 'create_room':     //  创建房间
                // notify('create_room',{data: 'create_room'},callBackIndex);
                gameContorller.createRoom(notifyData.data, that, (err, data)=>{
                    if (err){
                        console.log('err =' + err);
                        notify('create_room',{err: err},callBackIndex);

                    }else {
                        console.log('data = ' + JSON.stringify(data));
                        notify('create_room',{data: data},callBackIndex);

                    }
                });

                break;

            case 'join_room':   //  加入房间
                console.log('join room data = ' + JSON.stringify(notifyData.data));
                gameContorller.joinRoom(notifyData.data, that,(err, data)=>{
                    if (err){
                        notify('join_room', {err: err}, callBackIndex);
                    }else{
                        _room = data.room;
                        notify('join_room', {data: data.data}, callBackIndex);
                    }
                });
                break;
            case 'quick_to_join':   //  快速加入房间
                console.log('join room data = ' + JSON.stringify(notifyData.data));
                gameContorller.quickToJoin(that,(err, data)=>{
                    if (err){
                        notify('join_room', {err: err}, callBackIndex);
                    }else{
                        if(data.msg !=undefined){
                            notify('join_room',{data: data} , callBackIndex);
                            return;
                        }
                        _room = data.room;
                        notify('join_room', {data: data.data}, callBackIndex);
                    }
                });
                break;
            case 'enter_room_scene':   //   进入房间成功
                if (_room){
                    _room.playerEnterRoomScene(that,(data)=>{
                        that.seatIndex = data.seatIndex;
                        notify('enter_room_scene', data, callBackIndex);
                    });
                }
                break;
            case 'ready':   //   准备
                
                if(that.isReady){
                    that.isReady = false;
                }else{
                    that.isReady = true;
                }
                
                if (_room){
                    _room.playerReady(that);
                }
                break;
            case 'start_game':  //  开始游戏
                if (_room){
                    _room.houseManagerStartGame(that, (err, data)=>{
                        if (err){
                            notify('start_game', {err: err}, callBackIndex);
                        }else {
                            notify('start_game', {data: data}, callBackIndex);

                        }
                    });
                }
                break;

            case 'add_robot':  //  添加AI机器人
                let addrobot = notifyData.data.isrobot;
                console.log('确认添加机器人 ==> '+JSON.stringify(notifyData.data))
                if (_room){
                    var get_result = function(callback) {
                        that._robot.selectRobot(that,addrobot,_socket,_room,(err,data)=>{
                            if(err){
                                console.log(err)
                            }else{
                                callback(data);
                                // console.log('查询到的机器人信息 ==> '+JSON.stringify(data))
                            }
                        });

                    }
                    
                }

                get_result(async function(data){

                    console.time('get_result')
                    console.log('数据库数据 = ' + JSON.stringify(data) )
                    
                    let Playernum = _room.getPlayerList();
                    
                        for(let j in data){
                           
                            if(data[j].isrobot && Playernum.length !== 3){
                            console.log('数据库数据 = ' + JSON.stringify(data[j]) )
                            let robot = await gameContorller.createRobot(data[j],_socket,that._robot);
                            robot.isReady = true;
                            robot.isoccupy = true;
                            robot.isOnLine = false;
                            gameContorller.joinRoom(_room.roomID,robot,(err,robotdata)=>{
                            if(err){
                                console.log(err)
                            }else{
                                console.log('加入成功')
                                console.log('房间玩家列表  ==>  '+_room.getPlayerList().length)
                                robot.setRoom(_room)
                                console.log(JSON.stringify(robot.getRoom()))
                                _room.playerReady(robot);
                            }
                            });

                            }
                     }
                     
                     _room.houseManagerStartGame(that, (err, data)=>{
                        if (err){
                            notify('start_game', {err: err}, callBackIndex);
                        }else {
                            notify('start_game', {data: data}, callBackIndex);

                        }
                    });
                    

                    console.log(_room.getPlayerList().length);
                    console.timeEnd('get_result')
                })
                break;


            case 'rob-state':   //  判定谁是地主
                if (_room){
                    _room.playerRobStateMaster(that, notifyData.data);
                }
                break;
            case 'myself-push-card':    //  我出的牌
                if (_room){

                    
                    _room.playerPushCard(that, notifyData.data, (err, data)=>{
                        if (err){
                            notify('myself-push-card', {err: err}, callBackIndex);
                        }else {
                            notify('myself-push-card', {data: data}, callBackIndex);

                        }
                    });
                }
                break;
            case 'request-tips':    //  返回提示牌
                if (_room){
                    _room.playerRequestTips(that, (err, data)=>{
                       if (err){
                           notify('request-tips', {err: err}, callBackIndex);
                       } else {
                           notify('request-tips', {data: data}, callBackIndex);
                       }
                    });
                }
                break;
            case 'player_trusteeship':    //  托管

            if (_room){

                if(that.isTrusteeship === false){
                    console.log('游戏正在进行,玩家实行托管');
                    that.isTrusteeship = true;  //  进行托管
                    _room.onTrusteeship(that,(err,data)=>{
                        if(err){

                        }else{
                            console.log('托管出的牌 = ' + JSON.stringify(data))
                            notify('player_trusteeship', {staus: true,data}, callBackIndex);
                        }
                    });
                   

               }else{
                    console.log('游戏正在进行,玩家取消托管');
                    that.isTrusteeship = false; //  取消托管
                    notify('player_trusteeship', {data:false}, callBackIndex);
                }
                    
                    

            }
               
                break;
            case 'leave_room':   //   玩家离开
             
            console.log('Leave room data = ' + JSON.stringify(notifyData.data));
            if(_room){
                
                gameContorller.leaveRoom(_room,notifyData.data, that ,(err, data)=>{
                    if (err){
                        notify('leave_room', {err: err}, callBackIndex);
                    }else{
                        
                        if(_room.getPlayerList().length === 0){
                            gameContorller.reMove(_room);
                        }
                        
                        console.log('离开的玩家数据 = ' +JSON.stringify(data) )
                        notify('leave_room', {data: data}, callBackIndex);
                    }
                });
            }
           
                break;

            case 'select_game':   //   查找玩家游戏信息（重连）
             
                console.log('收到玩家查询游戏');
                gameContorller.selectPlayer(notifyData.data,that,(err,data)=>{

                    if(err){
                        notify('select_game', {err: err}, callBackIndex);
                        // console.log(err)
                    }else{
                        // timerStart(1000,_socket,myId,{
                        //     player : that,
                        //     myRoom :roomName
                        // });
                        let  List1 =   gameContorller.getPlayerList();         
        
                        console.log('在线玩家人数 = ' +List1.length);
                        console.log(JSON.stringify(data))
                        notify('select_game', {data: data}, callBackIndex);
                    }


                }); //  查找玩家是否在房间中游戏
                


                // that.sendSelectPlayerMessage = function (data,callBackIndex) { //  发送玩家游戏信息（重连）
                //     notify('select_player_message', {data: data},callBackIndex);
                // };
               
                break;

            default:
                break;
        }
    });

    //向客户端发送有玩家加入房间信息
    that.sendPlayerJoinRoom = function (data) {
        notify('player_join_room', data, null);
    };

    //向客户端发送有玩家准备好消息
    that.sendPlayerReady = function (data) {
        notify('player_ready', data, null);
    };

    //  发送游戏状态
    that.sendGameStart = function () {
        notify('game_start', {}, null);
    };
    
    that.sendChangeHouseManager = function (data,readyStatus) { //  向客户端发送改变房主的信息
        notify('change_house_manager', {data:data,stauts : readyStatus}, null);
    };
    that.sendPushCard = function (cards) {  //  发送牌给客户端
        that.cards = cards;

        // console.log('牌 = ' + that.cards)

        notify('push_card', cards, null);
    };


    that.sendRePushCard = function (cards) {  //  发送牌给客户端
        // that.cards = cards;

        // console.log('牌 = ' + that.cards)

        notify('push_card', cards, null);
    };

  

    that.sendNoMaster = function (data) {  //  告诉客户端没有地主要重新发牌
        console.log("你要重新发牌");
        notify('No_master', data, null);
    }; 


    that.sendend = function (data) {  //  告诉客户端结算了
        
        notify('settle-accounts',data);
    };


    that.sendPlayerLeave = function (data) {  //  离开
        notify('leave-player', data, null);
    };
    that.sendPlayerCanRobMater = function (data,time) {
        notify('can-rob-master', {uid: data, time : time}, null);
    };


    that.sendPlayerRobStateMater = function (accountID, value , rate) {    //  向客户端发送玩家抢/不抢的状态
        notify('player-rob-state', {accountID: accountID, value: value , rate : rate}, null);
    };
    that.sendChangeMaster = function (player, cards) {  //  发送客户端谁是地主
        if (that.accountID  === player.accountID){
            for (let i = 0 ; i < cards.length ; i ++){
                this.cards.push(cards[i]);
            }
        }
        notify('change-master', player.accountID);
    };

    //发送给客户端:显示底牌
    that.sendShowBottomCard = function (data) {
        notify('show-bottom-card' , data);
    };
    that.sendPlayerCanPushCard = function (data, notPushCardNumber,time) {
        notify('can-push-card', {uid: data, count: notPushCardNumber , time : time});
    };
    that.sendPlayerLost = function (data) { //  发送玩家丢失
        notify('lost-connection', {uid: data},null);
    };
    that.sendPlayerTrusteeship = function (data) { //  发送玩家托管状态
        notify('player-trusteeship', {uid: data},null);
    };
    that.sendPlayerTrusteeshipCard = function (data) { //  发送玩家托卡牌
        notify('trusteeship-card', {data: data},null);
    };



    that.sendTimeout = function (data) {  //  发送超时信息
        
        notify('time-out', {data: data}, null);
    };

    that.sendTimeOutCard = function (data) { //  发送超时卡牌信息
        notify('time-Out-Card', {data: data}, null);
    };

    
    that.sendTimeOutNoCard = function (data,value) { //  发送超时卡牌信息
        notify('time-out-noCard',{player:data,value:value}, null);
    };

    that.sendTimeOutNoRob = function (data) { //  发送超时卡牌信息
        notify('time-out-noRob',data, null);
    };

    


    that.getRoom = function(){
        return _room;
    }
    that.setRoom = function(data){
        _room = data;
    }



    that.sendPushCardType = function(data) {    //  发送出牌的类型
        notify('player-push-card-type',data);
    }




    that.sendPlayerPushCard = function (data) { //  减少手牌数
        let isSpring = data.cardsValue;
        let accountID = data.accountID;     // 
        let cards = data.cards; 
        if (accountID === that.accountID){
            let cards = data.cards;
            for (let i = 0 ; i < cards.length; i ++){
                let card = cards[i];
                for (let j = 0 ; j < that.cards.length ; j ++){
                    if (card.id === that.cards[j].id){
                        that.cards.splice(j, 1);
                        j--;
                    }
                }
            }
        }
  

        // console.log('房间号 = ' + _room.roomID)
        
        
        if(that.cards.length === 0){
            // let RplayerList =_room.getPlayerList();
            // let spring = RplayerList[0].cards.length + RplayerList[1].cards.length + RplayerList[2].cards.length;
            // let master = _room.getRoomMaster();
            // let playerSpring  = undefined;
            // for(let i=0;i<RplayerList.length;i++){
            //     if(RplayerList[i].accountID !== master.accountID && RplayerList[i].cards.length === 17){  //  反春条件
            //         playerSpring = RplayerList[i];
            //     }
            // }

            // let isSpring;
            // if((spring === 34 && playerSpring !== undefined) || (data.MasterPushNum === 1 && playerSpring !== undefined) ){
            //     console.log('春天')
            //      isSpring = 'spring'
            // }else{
            //      isSpring = data.cardsValue
            // }
            that.sendPushCardType({ //  发送牌的类型
                cardsValue : data.cardsValue,
                cards: cards
            });

            //  判断输赢
            if(that.isrobot){
                console.log('机器人结束了')
                let plen = _room.getPlayerList();
                for(let i=0;i<plen.length;i++){
                    if(plen[i].isrobot === undefined){
                        let _room =plen[i].getRoom();
                        _room.houseManagerGameEnd(accountID);
                        
                    }
                }
            }else{
                _room.houseManagerGameEnd(accountID);
                
            }
           
        }else{
            that.sendPushCardType({
                cardsValue : data.cardsValue,
                cards: cards
            });
        }

        

        console.log('剩余牌数 = ' + that.cards.length)
     
        notify('player-push-card', data);
    };

    // that.send
    //
    // Object.defineProperty(that, 'nickName', {
    //     get(){
    //         return _nickName
    //     }
    // });
    var _delayWaitTime;
    var allPlayer = [];
    function  timerStart(millisecond,socket,myId,data) {
        
        clearTimeout(timerToken);
        clearTimeout(_delayWaitTime);
        // console.log('==============================='+JSON.stringify(data.player.accountID) );
        // console.log('==============================='+JSON.stringify(data.myRoom) );
        var timerToken = setTimeout(function () {

                if(socket){
                    if(allPlayer.length === 0){
                        allPlayer.push(data);
                       
                        socket.emit('start',data);
                        console.log(JSON.stringify(data)  + '刚刚出生')
                    }else{

                        for(let i=0;i<allPlayer.length;i++){
                            console.log(allPlayer[i].player.accountID);
                            console.log(myId);
                            if(allPlayer[i].player.accountID === myId){
                                console.log('socket = '+socket);
                                socket.emit('start',data);
                                console.log(JSON.stringify(allPlayer[i])  + '他还活着')
                                return;
                            }
                        }
                       
                        allPlayer.push(data);
                        socket.emit('start',data);



                        // console.log(JSON.stringify(allPlayer)  + '他还活着')
                    }
                    // socket.emit('start',data);
                    // console.log(JSON.stringify(data)  + '他还活着')



                    //  之后需要做的检测死亡需要做什么
                    _delayWaitTime =  setTimeout(function(){    //  检测死亡需要做什么
                        for(let i=0;i<allPlayer.length;i++){
                            if(allPlayer[i].player.accountID === myId){
                                allPlayer.splice(i, 1);
                                console.log('他死了')
                            }
                        
                        }
                    },3000)
                }else{
                    console.log('心跳连接发生错误，socket为false')
                }
                
                
            },
            millisecond
        );
    }




    return that;
};


