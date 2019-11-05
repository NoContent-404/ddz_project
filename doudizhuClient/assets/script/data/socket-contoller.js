import EventListener from './../utility/event-listener'

const SocketController  = function () {
    let that = {};
    let _socket = io(defines.serverUrl);
    let _callBackMap = {};
    let _callBackIndex = 0;
    let _event = EventListener({});
    // socket.on('connection', ()=>{
    //    console.log('链接成功');
    // });
    //
    
    

    // _socket.on('trusteeship-card',(data) => {
    //     cc.systemEvent.emit('trusteeship-card', data);
    // })
    _socket.on('start',(data) => {
        console.log(data)
        _socket.emit('yes',data.player.accountID);
    })

    // _socket.on('start',(data) => {
    //     console.log(data)
    //     _socket.emit('yes',data.player.accountID);
    // })

    // _socket.on('reconnection',(data) => {
    //     console.log('重连的的房间号码 = '+data)
    //     that.requestJoinRoom(data,(err, data)=>{
    //         if (err){
    //             console.log('err = ' + err);
    //         }else {
    //             cc.hallScene.globalProper(data)
    //         }
    //     });
    // })



    _socket.on('notify', (data)=>{
        console.log('notify = ' + JSON.stringify(data));
        let callBackIndex = data.callBackIndex;
        if (_callBackMap.hasOwnProperty(callBackIndex)){
            let cb = _callBackMap[callBackIndex];
            if (data.data.err){
                cb(data.data.err);
            }else {
                cb(null,data.data);

            }
        }
        let type = data.type;
        _event.fire(type, data.data);
    });

    that.init = function () {

    };
    // that.requestWxLogin = function (data, cb) {
    //     socket.emit('wx-login', data);
    // };
    const notify = function (type, data, callBakIndex) {
        _socket.emit('notify', {type: type,  data: data, callBackIndex: callBakIndex});
    };

    const request = function (type,data, cb) {
        _callBackIndex ++;
        _callBackMap[_callBackIndex] = cb;
        notify(type, data, _callBackIndex);
    };
    that.pingyes = function (data) {
        _socket.emit('yes',data);
        
    };

   


    that.requestLogin = function (data, cb) {
        request('login',data, cb);
        
    };


 


    that.requestCreateRoom = function (data, cb) {
        request('create_room', data, cb);
    };
    that.requestJoinRoom = function (data, cb) {    //  加入房间
        request('join_room', data, cb);
    };

    that.requestQuickJoinRoom = function ( cb) {    //  加入房间
        request('quick_to_join', {}, cb);
    };


    that.requestEnterRoomScene = function (cb) {
        request('enter_room_scene', {},cb);
    };
    that.requestStartGame = function (cb) {
        request('start_game', {}, cb);
    };


    that.requestAddRobot = function (data,cb) {      //  机器人
        request('add_robot', data, cb);
    };













    that.requestPlayerPushCard = function (value, cb) {

        request('myself-push-card', value, cb);
    };
    that.requestTipsCards = function (cb) {
        request('request-tips', {}, cb);
    };

    that.requestTrusteeship= function (cb) {   //  托管    (时间 2019/10/10)
        request('player_trusteeship', {}, cb);
    };

    that.notifyReady = function () {
        notify('ready', {}, null);
    };

    that.notifyLeaveReady = function (data, cb) {   //  离开
        notify('leave_room', data, cb);
    };
 









   


    that.notifyRobState = function (value) {
        notify('rob-state', value, null);
    };

    that.notifyEnd = function (value) {
        notify('end-game', value, null);
    };


    



    that.onPlayerJoinRoom = function (cb) {
        _event.on('player_join_room', cb);
    };

    that.onSSA = function (cb) {    //  托管出牌
        _event.on('trusteeship-card', cb);
    };



    that.onPlayerPushCardType = function (cb) {
        _event.on('player-push-card-type', cb);
    };

    
    that.onPlayeTimeOutCard = function (cb) {
        _event.on('time-Out-Card', cb);
    };
    that.onPlayeTimeOutNoCard = function (cb) {
        _event.on('time-out-noCard', cb);
    };

    that.onPlayeTimeOutNoRob = function (cb) {
        _event.on('time-out-noRob', cb);
    };
  


   
    that.onPlayerReady = function (cb) {
        _event.on('player_ready', cb);
    };
    that.onGameStart = function (cb) {
        _event.on('game_start', cb);
    };
    that.onChangeHouseManager = function (cb) {
        _event.on('change_house_manager', cb);
    };
    that.onPushCard = function (cb) {
        _event.on('push_card', cb);
    };
    that.onCanRobMater = function (cb) {
        _event.on('can-rob-master', cb);
    };
    that.onPlayerRobState = function (cb) {
        _event.on('player-rob-state', cb);
    };
    that.onChangeMaster = function (cb) {
        _event.on('change-master', cb);
    };
    that.onShowBottomCard = function (cb) {
        _event.on('show-bottom-card', cb);
    };
    that.onCanPushCard = function (cb) {
        _event.on('can-push-card', cb);
    };
    that.onPlayerPushCard = function (cb) {  
        _event.on('player-push-card', cb);
    };
    that.notifyPlayerLeave = function (cb) {   //  离开
        _event.on('leave-player', cb);
    };

    that.requestReConnection = function (data,cb) {        //  查询玩家游戏信息
        // _socket.emit('select_game',data);
        request('select_game', data, cb);
    };
    // that.notifyPlayerReConnection = function (cb) {   //  查询玩家游戏信息
    //     _event.on('select_player_message', cb);
    // };

    return that;
};
export default SocketController;