const defines = require('./../defines');
const Carder = require('./carder');
const myDB = require('./../db');   
const robot = require('./robot');
const async = require('async');

/*************      Redis      ***** */

const redis = require('redis');
const client = redis.createClient(6379,'192.168.1.99');


/**************               ******** */
const RoomState = {
    Invalide: -1,
    WaitingReady: 1,    //  等待玩家准备状态
    StartGame: 2,       //  开始游戏状态
    PushCard: 3,        //  出牌阶段状态
    RobMater: 4,        //  抢地主状态
    ShowBottomCard: 5,  //  显示底牌状态
    Playing: 6          //  开始游戏阶段
    
};
const getRandomStr = function (count) {
    let str = '';
    for (let i = 0; i < count; i++) {
        str += Math.floor(Math.random() * 10);
    }
    return str;
};
const getSeatIndex = function (playerList) {
    let z = 0;

    if (playerList.length === 0) {
        return z;
    }
    for (let i = 0; i < playerList.length; i++) {
        if(playerList.length > 1){
            if (z !== playerList[0].seatIndex && z !== playerList[1].seatIndex) {
                return z;
            }
        }else{
            if (z !== playerList[i].seatIndex) {
                return z;
            }
        }
        
        z++;
    }
    console.log('z = ' + z);
    return z;
};
module.exports = function (spec, player) {
    let that = {};
    // that.roomID = getRandomStr(6);
    that.roomID = '123456';
    that.buttonCards = undefined;
    let config = defines.createRoomConfig[spec.rate];
    let _bottom = config.bottom;    //  房间底数
    let _rate = config.rate;        //  房间倍数
    let _houseManager = player;     //  房主
    let _playerList = [];   //  玩家列表
    let _carder = Carder();
    let _lostPlayer = undefined;
    let _robMaterPlayerList = [];   //  抢地主玩家列表
    let _pushPlayerList = [];   //  出牌玩家列表
    let _master = undefined;    //  地主
    let _masterIndex = undefined;   //  房主位置
    let _threeCardsList = [];   //  三组牌列表
    let _currentPlayerPushCardList = undefined; //当前玩家出的牌
    let _currentPlayerPushCardListPlayer = undefined;  //  当前出牌的玩家
    let _notPushCardNumber = 2;   //有几个玩家选择不出牌
    let _canRobPlayer = undefined;  //  记录是谁能抢地主
    let _canPutCardPlayer = undefined;  //  能出牌玩家
    let _recordrobMaterList = [];     //  记录抢地主次数
    let _robMaterNum = 0;


 
    // let cards = _carder.getThreeCards();
    //
    // for (let i = 0 ; i < cards.length ; i ++){
    //     for (let j = 0 ; j < cards[i].length ; j ++){
    //         let card = cards[i][j];
    //         console.log( i + ' value = ' + card.value, 'shape' + card.shape, 'king ' + card.king);
    //     }
    // }
    // that.gold = spec.gold;
    that.getPlayerList = function(){
        return _playerList;
    };
    that.getRoomState = function(){
        return _state;
    };
    that.getRoomMaster = function(){
        return _master;
    };
    that.setRoomMaster = function(data){
        return _master;
    };

 

    let _state = RoomState.Invalide;
    const setState = function (state) {
        if (state === _state) {
            return
        }
        switch (state) {
            case RoomState.WaitingReady:
                break;
            case RoomState.StartGame:
                 _recordrobMaterList = [];     //   记录已经抢地主的玩家列表
                _robMaterNum = 0;   //  记录抢地主次数
                for (let i = 0; i < _playerList.length; i++) {
                    _playerList[i].cards = [];
                    _playerList[i].sendGameStart();
                }

                setState(RoomState.PushCard);
                break;
            case RoomState.PushCard:
                console.log('push card');
                _threeCardsList = _carder.getThreeCards();  //  得到牌组
                
                // console.log('牌组= '+JSON.stringify(_threeCardsList) )   

                for (let i = 0; i < _playerList.length; i++) {
                    _playerList[i].sendPushCard(_threeCardsList[i]);
                }
                that.buttonCards = _threeCardsList[3];   //  记录房间底牌
                setState(RoomState.RobMater);
                break;
            case RoomState.RobMater:
                _robMaterPlayerList = [];
                if (_lostPlayer === undefined) {
                    for (let i = _playerList.length - 1; i >= 0; i--) {
                        _robMaterPlayerList.push(_playerList[i]);
                    }
                
                }

                turnPlayerRobMater();

                break;
            case RoomState.ShowBottomCard:
                for (let i = 0; i < _playerList.length; i++) {
                    _playerList[i].sendShowBottomCard(_threeCardsList[3]);
                }
                setTimeout(() => {
                    setState(RoomState.Playing);
                }, 2000);
                break;
            case RoomState.Playing:
                console.log('进入出牌阶段');
                for (let i = 0; i < _playerList.length; i++) {
                    if (_playerList[i].accountID === _master.accountID) {
                        _masterIndex = i;
                    }
                }
                turnPushCardPlayer();

                break;
           
            default:
                break;
        }
        _state = state;
    };
    setState(RoomState.WaitingReady);
    that.joinPlayer = function (player) {   //  加入玩家
        player.seatIndex = getSeatIndex(_playerList);

        for (let i = 0; i < _playerList.length; i++) {
            _playerList[i].sendPlayerJoinRoom({
                nickName: player.nickName,
                accountID: player.accountID,
                avatarUrl: player.avatarUrl,
                gold: player.gold,
                seatIndex: player.seatIndex,
                
            })
        }


        _playerList.push(player);

    };


    /****************************   重连加入玩家    ******************************** */
    that.reJoinPlayer = function (player) {   //  重新加入玩家
        
        for (let i = 0; i < _playerList.length; i++) {
            if( player.accountID ===  _playerList[i].accountID){
                player.seatIndex =  _playerList[i].seatIndex;
                console.log('座位 = ' + i);
            }
        }

        for (let i = 0; i < _playerList.length; i++) {

                // _playerList[i].sendPlayerJoinRoom({
                //    roomPlayerMsg : _playerList
                // })
                // if(player.accountID === _playerList[i].accountID){
                //     _playerList[i].sendRePushCard(_threeCardsList[3]);
                // }
                
                    _playerList[i].sendPlayerJoinRoom({
                        nickName: player.nickName,
                        accountID: player.accountID,
                        avatarUrl: player.avatarUrl,
                        gold: player.gold,
                        seatIndex: player.seatIndex
                       
                     })
                
                
                

        }
        // _playerList.push(player);
    };

  /****************************   重连加入玩家end    ******************************** */



    that.playerReEnterRoomScene = function(player, cb) {
        let playerData = [];
        for (let i = 0; i < _playerList.length; i++) {
            playerData.push({
                nickName: _playerList[i].nickName,
                accountID: _playerList[i].accountID,
                avatarUrl: _playerList[i].avatarUrl,
                gold: _playerList[i].gold,
                seatIndex: _playerList[i].seatIndex,
                cards : _playerList[i].cards,
                buttonCard : _threeCardsList[3]
                
            });
        }

        if (cb) {
            cb({
                seatIndex: player.seatIndex,
                playerData: playerData,
                roomID: that.roomID,
                houseManagerID: _houseManager.accountID
            })
        }

    }


    that.playerEnterRoomScene = function (player, cb) {

        if(_state>=2){
          that.playerReEnterRoomScene(player, cb);
          return;
        }
        let playerData = [];
        for (let i = 0; i < _playerList.length; i++) {
            playerData.push({
                nickName: _playerList[i].nickName,
                accountID: _playerList[i].accountID,
                avatarUrl: _playerList[i].avatarUrl,
                gold: _playerList[i].gold,
                seatIndex: _playerList[i].seatIndex
            });
        }
        // let index = getSeatIndex(_playerList);

        



        if (cb) {
            cb({
                seatIndex: player.seatIndex,
                playerData: playerData,
                roomID: that.roomID,
                houseManagerID: _houseManager.accountID
            })
        }
    };

    const referTurnPushPlayer = function () {   //  第一个出牌
        console.log("地主 = " + _masterIndex)
        let index = _masterIndex;   
        for (let i = 2; i >= 0; i--) {
            let z = index;
            if (z >= 3) {
                z = z - 3;
            }
            _pushPlayerList[i] = _playerList[z];
            index++;
        }
    };

    const turnPushCardPlayer = function () {    //  轮流出牌
        if (_pushPlayerList.length === 0) {
            referTurnPushPlayer();
        }

        let player = _pushPlayerList.pop();
        _canPutCardPlayer = player;

        
        for (let i = 0; i < _playerList.length; i++) {
            if(_playerList[i].isOnLine !== false){
                _playerList[i].sendPlayerCanPushCard(player.accountID,_notPushCardNumber);
            }
            
        }

        if(player.isOnLine === false || player.isTrusteeship === true){  //  判断玩家是否掉线/是否托管
            console.log(' on Line state =' +player.isOnLine)
            that.collocation(player);
            return;
        }


        
    };


    /****************************************** 比较牌的大小    ********************************** */
    //  比较牌的大小
    that.playerPushCard = function (player, cards, cb) {
        if (cards.length === 0) {   //  玩家不出牌
            _notPushCardNumber ++;
            console.log('玩家不出牌' + _notPushCardNumber);
            turnPushCardPlayer();   //  进行轮换
        } else {
            let cardsValue = _carder.isCanPushCards(cards); //  返回我出的牌的类型    三张：Three

            if (cardsValue) {
                if (_currentPlayerPushCardList === undefined || _notPushCardNumber === 2) {
                    if (cb) {
                        cb(null, 'push card success');
                    }
                    _currentPlayerPushCardList = cards;
                    _currentPlayerPushCardListPlayer = player;
                    sendPlayerPushCard(player, cards,cardsValue);  //  减少手牌

                    
                    if(player.cards.length === 0){
                        console.log('玩家剩余手牌数213 = ' + player.cards.length);
                    }else{
                    turnPushCardPlayer();
                    }
                } else {
                    //
                    let result = _carder.compare(cards, _currentPlayerPushCardList);
                    console.log('对比牌型的大小' + result);

                    if (result === true){
                        if (cb) {
                            cb(null, cardsValue);
                        }
                        _currentPlayerPushCardList = cards;
                        _currentPlayerPushCardListPlayer = player;
                        sendPlayerPushCard(player, cards,cardsValue);  //  减少手牌

                        console.log('玩家剩余手牌数229 = ' + JSON.stringify(player));
                        
                        if(player.cards.length === 0){
                            console.log('玩家剩余手牌数213 = ' + player.cards.length);
                        }else{
                        turnPushCardPlayer();
                        }
                     
                        
                    }else {
                        if (cb){
                            cb(result);
                        }
                    }
                }

            } else {
                if (cb) {
                    cb('不可用的牌型');

                }
            }
        }

    };
/****************************************** 比较牌的大小end    ********************************** */


    //  提示
    that.playerRequestTips = function (player, cb) {
        let cardList = player.cards;
        if (cb){
            // let list = [];

            let cardsList = _carder.getTipsCardsList(_currentPlayerPushCardList, cardList);
            console.log('提示牌组  = ' + JSON.stringify(cardsList) );
            // for (let i = 0 ; i < cardList.length ; i ++){
            //     let cards = [];
            //     cards.push(cardList[i]);
            //     list.push(cards);
            // }
            cb(null, cardsList);
        }
    };
    const sendPlayerPushCard = function (player, cards,cardsValue) {   //  向客户端发送牌组及玩家的消息
        _notPushCardNumber = 0; 
        for (let i = 0; i < _playerList.length; i++) {

            _playerList[i].sendPushCardType({
                cardsValue : cardsValue,
                cards: cards
            })



            _playerList[i].sendPlayerPushCard({
                accountID: player.accountID,
                cards: cards
            })
        }
    };

    that.playerRobStateMaster = function (player, value) {  //  抢玩家抢地主的状态
        if (value === 'ok') {   //  抢
            console.log(' rob master ok');
            _recordrobMaterList.push(player);
            
            _rate = _rate * 2;
            if(_robMaterNum === 3 ){
                if(_recordrobMaterList[0].accountID === player.accountID){
                    _master = player
                }
                
                
            }
            _robMaterNum++
            
        } else if (value === 'no-ok') { //  不抢
            console.log('rob master no ok');
            if(_robMaterNum === 3 ){
                if(_recordrobMaterList[0].accountID === player.accountID){
                    _master = _recordrobMaterList[_recordrobMaterList.length - 1]
                }
                
                
            }
            _robMaterNum++;
          
        }
        

        

        for (let i = 0; i < _playerList.length; i++) {  //  发送玩家抢地主的状态
            _playerList[i].sendPlayerRobStateMater(player.accountID, value);
        }


        turnPlayerRobMater();   //  轮到下一个玩家抢
    };

    const changeHouseManager = function () {    //  改变房主
        if (_playerList.length === 0) {
            return;
        }
        _houseManager = _playerList[0];
        for (let i = 0; i < _playerList.length; i++) {
            _playerList[i].sendChangeHouseManager(_houseManager.accountID);
        }
    };

    const turnPlayerRobMater = function () {
        if (_robMaterPlayerList.length === 0) {
            console.log('抢地主结束');
            if(_recordrobMaterList.length === 1){
                _master = _recordrobMaterList[0]
            }else{

                if(_master === undefined && _recordrobMaterList.length>0){
                    let player = _recordrobMaterList[0];
                    _canRobPlayer = player; //  记录
                    if(player.isOnLine === false  || player.isTrusteeship === true){    //  判断玩家是否掉线/托管
                        console.log('no OnLine  =' +player.isOnLine)
                        console.log('player trusteeship = ' + player.isTrusteeship)
                        that.collocation(player);
                        return;
                    }
    
                    console.log('可抢地主玩家信息 = ' + JSON.stringify(player))
                    for (let i = 0; i < _playerList.length; i++) {  //  发送玩家能抢地主的状态
                        _playerList[i].sendPlayerCanRobMater(player.accountID);
                    }
                    return;
                }
               
            }
            if( _master === undefined && _robMaterNum ===3 && _recordrobMaterList.length ===0){
                console.log('玩家没有抢地主');
                //  告诉客户端每个玩家都要销毁节点，让客户端重新发送发牌请求
                for(let i = 0;i<_playerList.length; i++){
                    _playerList[i].sendNoMaster(_playerList);
                }
                _state = -1;
                // setState(RoomState.PushCard);   //  重新发牌
            }else{
                changeMaster();
            }
            
            return;
        }

        console.log("抢地主玩家列表 = " + JSON.stringify(_robMaterPlayerList));

        let player = _robMaterPlayerList.pop();
        _canRobPlayer = player; //  记录
        if(player.isOnLine === false  || player.isTrusteeship === true){    //  判断玩家是否掉线/托管
            console.log('no OnLine  =' +player.isOnLine)
            console.log('player trusteeship = ' + player.isTrusteeship)
            that.collocation(player);
            return;
        }

        console.log('可抢地主玩家信息 = ' + JSON.stringify(player))



        for (let i = 0; i < _playerList.length; i++) {  //  发送玩家能抢地主的状态
            _playerList[i].sendPlayerCanRobMater(player.accountID);
        }
    };
    const changeMaster = function () {
        for (let i = 0; i < _playerList.length; i++) {
            console.log('地主'+_master)
            _playerList[i].sendChangeMaster(_master,_threeCardsList[3]);
        }
        setState(RoomState.ShowBottomCard);
    };


    // const gameStart = function () {
    //     for (let i = 0 ; i < _playerList.length ; i ++){
    //         _playerList[i].sendGameStart();
    //     }
    // };
    that.playerOffLine = function (player) {    //  删除掉线玩家
        for (let i = 0; i < _playerList.length; i++) {
            if (_playerList[i].accountID === player.accountID) {

                that.playerLeave(player);
                
                if (player.accountID === _houseManager.accountID && _playerList.length !== 0) {
                    changeHouseManager();
                }
            }
        }
    };

    


    that.playerReady = function (player) {
        for (let i = 0; i < _playerList.length; i++) {
            _playerList[i].sendPlayerReady(player.accountID);
        }
    };
    that.houseManagerStartGame = function (player, cb) {
        //  defines.roomFullPlayerCount = 3
    
        if (_playerList.length !== defines.roomFullPlayerCount) {


            if (cb) {
                cb('玩家不足，不能开始游戏!');
            }
            return;
        }
        for (let i = 0; i < _playerList.length; i++) {
            if (_playerList[i].accountID !== _houseManager.accountID) {
                if (_playerList[i].isReady === false) {
                    if (cb) {
                        cb('有玩家未准备，不能开始游戏!');
                    }
                    return;
                }
            }
        }
        if (cb) {
            cb(null, 'success');
        }
        // gameStart();
        setState(RoomState.StartGame);
    };

/************************************************   游戏结算    *********************** */
    //  游戏结算
    that.houseManagerGameEnd = function (winId) {

       
        if(winId === _master.accountID){
            //  地主赢
            
            for(let i=0;i<_playerList.length;i++){
                
                _playerList[i].isReady = false; //  设置未准备状态 
                if(_playerList[i].accountID == winId){
                    _playerList[i].gold = _playerList[i].gold + (_rate * config.bottom * 2);  //  赢 ： 玩家金币 = 原玩家金币 + （倍数 * 底数 * 2）

                }else{
                    _playerList[i].gold = _playerList[i].gold - (_rate * config.bottom);  //  输 ： 玩家金币 = 原玩家金币 - （倍数 * 底数）

                }

                let pldata = {
                    unique_id : _playerList[i].uniqueID,
                    account_id : _playerList[i].accountID,
                    nick_name : _playerList[i].nickName,
                    gold_count : _playerList[i].gold,
                    avatar_url : _playerList[i].avatarUrl,
                    sex : _playerList[i].sex
                    
                };
                    //  更新玩家数据
                      myDB.updataPlayerInfo(_playerList[i], (err , data)=>{
                if(err){
                    console.log('更新错误 = '+ err);
                }else{
                    if(_playerList[i].isrobot !== undefined){
                       client.send_command('lset',['user:' +_playerList[i].uniqueID+':data',0,JSON.stringify( pldata)], function(err,data) {
                            console.log(data);          // OK
                        })
                        console.log('更新成功 = ' + JSON.stringify(data));
                    }
                    if(i===2){
                        msg()
                    }
                    
                }
            });

 
            }
        }else{
            //  农民赢
            for(let i=0;i<_playerList.length;i++){

                _playerList[i].isReady = false; //  设置未准备状态
                if(_playerList[i].accountID == _master.accountID){
                    _playerList[i].gold = _playerList[i].gold - (_rate * config.bottom * 2);  //  赢 ： 玩家金币 = 原玩家金币 + （倍数 * 底数 * 2）
            
                }else{
                   
                    _playerList[i].gold = _playerList[i].gold + (_rate * config.bottom);  //  输 ： 玩家金币 = 原玩家金币 - （倍数 * 底数）
         
                }
              

                let pldata = {
                    unique_id : _playerList[i].uniqueID,
                    account_id : _playerList[i].accountID,
                    nick_name : _playerList[i].nickName,
                    gold_count : _playerList[i].gold,
                    avatar_url : _playerList[i].avatarUrl,
                    sex : _playerList[i].sex
                    
                };
                //  更新玩家数据
                myDB.updataPlayerInfo(_playerList[i], (err , data)=>{
                    if(err){
                        console.log('更新错误 = '+ err);
                    }else{
                        if(_playerList[i].isrobot !== true){
                             client.send_command('lset',['user:' +_playerList[i].uniqueID+':data',0,JSON.stringify(pldata)], function(err,data) {
                                console.log(data);          // OK
                                if(i===2){
                                    msg();
                                   }
                            })
                            
                        }
                        console.log('更新成功 = ' + JSON.stringify(data));
                       
                    }
                });

            

        }

    }

 
    var msg = function(){
        for (let i = 0; i < _playerList.length; i++) {  //  发送结束消息

            // if(_playerList[i].isOnLine === false){
            //         that.playerLeave(_playerList[i]);
            // }
            if(_playerList[i].isrobot !== undefined){
                that.playerLeave(_playerList[i]);
                i--;
            }else{
                _playerList[i].sendend({
                    roomPlayerList: _playerList,
                    houseManager : _houseManager.accountID,
                    winId : winId
                });
            }
            
        }
        
      
         _lostPlayer = undefined;
         _robMaterPlayerList = [];   //  抢地主玩家列表
         _pushPlayerList = [];   //  出牌玩家列表
         _master = undefined;    //  房主
         _masterIndex = undefined;   //  房主位置
         _threeCardsList = [];   //  三组牌列表
         _currentPlayerPushCardList = undefined; //当前玩家出的牌
         _notPushCardNumber = 0;   //有几个玩家选择不出牌
        _state = RoomState.Invalide;
    }

    };



    


    
    
/************************************************   游戏结算end    *********************** */
    




    //  获取房间玩家总数
    that.getPlayerCount = function () {
        return _playerList.length;
    };
   

/************************************************   玩家离开    ************************** */
     //  玩家离开
     that.playerLeave = function(player){


        for(let i=0;i<_playerList.length ; i++){
            if(_playerList[i].accountID === player.accountID){
                _playerList.splice(i, 1);
            }
        }


        for(let i=0;i<_playerList.length ; i++){
            // if(_playerList[i].accountID === player.accountID){
                
            // }else{
                _playerList[i].sendPlayerLeave(player); 
            // }
        }
       
       
        if (player.accountID === _houseManager.accountID) {
            changeHouseManager();
        }



        
        return console.log('玩家离开后剩余玩家 = ' + _playerList.length); 
    };
    

/***********************************************  托管   ********************** */

    that.onTrusteeship = function(player ,cb){
         //  通知房间另外两位玩家有人托管了
        for(let i=0;i<_playerList.length;i++){
            if(_playerList[i].accountID !== player.accountID){
                _playerList[i].sendPlayerTrusteeship(player.accountID);
            }
        }
        
        that.collocation(player,(err,data)=>{
            
            if(cb){
                cb(null,data);
            }
        });
    };

/***********************************************  托管end   ********************** */





/***********************************************  掉线   ********************** */
     
    that.lostConnection = function(player){
        //  通知房间另外两位玩家有人掉线了
        for(let i=0;i<_playerList.length;i++){
            if(_playerList[i].accountID !== player.accountID){
                _playerList[i].sendPlayerLost(player.accountID);
            }
        }
        that.collocation(player);
    };
/***********************************************  掉线end   ********************** */




/***********************************************  自动出牌   ********************** */
    that.collocation = function(player,cb){  //  掉线
        let cardsList = [];
        
        
        console.log('当前房间进展状态 = ' + _state)
        console.log(' _room 掉线玩家数据 = ' + JSON.stringify(player));
       if(player.isOnLine === false || player.isTrusteeship === true){
            if(_state > 1 && _state < 4){
                if(_canRobPlayer.accountID === player.accountID){   //  掉线玩家让他不抢地主
                    for(let i=0;i<_playerList.length;i++){
                        _playerList[i].sendPlayerRobStateMater(player.accountID,'no-ok');
                    }
                    turnPlayerRobMater();   //  轮到下一个玩家抢
                }
                console.log('进入抢地主状态');
                return;
            }

            if(_state > 2){ //  出牌阶段
                let lostPlayerCardList = player.cards;

                if(_currentPlayerPushCardListPlayer === undefined){

                }else{
                    if(_currentPlayerPushCardListPlayer.accountID === player.accountID){
                        _currentPlayerPushCardList = undefined;
                    }
                }
               
                // cardsValue = _carder.isCanPushCards(_currentPlayerPushCardList); //  返回我出的牌的类型    三张：Three
                cardsList = _carder.getTipsCardsList(_currentPlayerPushCardList, lostPlayerCardList);  //  获取提示牌组
                
                console.log('提示牌组  = ' + JSON.stringify(cardsList) );
                if(player.accountID === _canPutCardPlayer.accountID){
                    if(cardsList.length !== 0){

                        if(player.isrobot){ //  机器人出牌
                            
                        let cardsValue;

                        let robot ;
                        if(_currentPlayerPushCardList !== undefined){
                             cardsValue = _carder.isCanPushCards(_currentPlayerPushCardList); //  返回我出的牌的类型    三张：Three
                        }
                       
                        robot = player._robot.spliceCards(player.cards,cardsValue,_currentPlayerPushCardList);
                        if(cardsList.length === 1 && cardsList[0].length === 2){
                            if( cardsList[0][0].value === undefined && cardsList[0][1].value === undefined){
                                robot = cardsList;
                            }
                        }
                        cardsList = [];
                    //     if(cardsValue === undefined){
                    //         console.log(typeof robot[0]);
                    //         console.log(cardsValue);
                    //    }

                        if(_currentPlayerPushCardList !== undefined){
                          
                            let result;
                            if(robot.length>0){
                                
                                for(let i in robot){
                                     result = _carder.compare(robot[i], _currentPlayerPushCardList);
                                    if(result === true){

                                        cardsList.push(robot[i]);
                                        break;
                                    }
                                }
                            }
                        }else{
                            if(robot.length>0){
                                console.log('查看数据 = 》' + JSON.stringify(robot[0]) )
                                cardsList.push(robot[0]);
                            }else{
                                cardsList = [];
                            }
                            
                        }

                    }


                            console.log('玩家== >' + player.nickName );
                            console.log('数据 == >' + JSON.stringify(cardsList[0]) );


                            if(player.isTrusteeship === true){
                                player.sendPlayerTrusteeshipCard(cardsList[0]);
                            }
                            if(cardsList.length !== 0){
                                that.playerPushCard(player,cardsList[0]); 
                                if(cb){
                                    if(cb){
                                        cb(null,cardsList[0]);
                                    }
                                }  
                            }else{
                                that.playerPushCard(player,cardsList,cb);  
                            }
                           
                            return;
                        }
                        cardsList = [];
                        that.playerPushCard(player,cardsList,cb);
                        if(cb){
                            if(cb){
                                cb(null,cardsList[0]);
                            }
                        }
                        }else{
                            that.playerPushCard(player,cardsList,cb);   //  不要
                            
                        }
                     
                        
                  
                


                if(cb){
                    if(cb){
                        cb(null,cardsList[0]);
                    }
                }

            }
       }



    };
/***********************************************  自动出牌end   ********************** */



    Object.defineProperty(that, 'bottom', {
        get() {
            return _bottom;
        }
        // set(val) {
        //     _bottom = val;
        // }
    });
    Object.defineProperty(that, 'rate', {
        get() {
            return _rate;
        }
    });
    return that;
};