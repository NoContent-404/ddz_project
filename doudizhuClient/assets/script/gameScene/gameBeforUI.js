import global from './../global'
cc.Class({
    extends: cc.Component,
    properties: {
        readyButton: cc.Node,
        gameStartButton: cc.Node,
        gameBeforUI: cc.Node
    },
    onLoad(){

        this.node.on('init', ()=>{
            if (global.playerData.houseMangerID === global.playerData.accountID){
                this.readyButton.active = false;
                this.gameStartButton.active = true;

            }else {
                this.readyButton.active = true;
                this.gameStartButton.active = false;
            }
        });
        global.socket.onGameStart(()=>{
            this.gameBeforUI.active = false;
        });
        global.socket.onChangeHouseManager((data)=>{    //  改变房主
            global.playerData.houseMangerID = data;
            if (global.playerData.accountID === data){
                this.readyButton.active = false;
                this.gameStartButton.active = true;
            }
        });
    },
    onButtonClick(event, customData){
        switch (customData){
            case 'ready':
                console.log('ready');
                global.socket.notifyReady();
                break;
            case 'start-game':
                console.log('start game');
            global.socket.requestAddRobot({isrobot : true},(err,data)=>{

                if(err){
                    console.log('err = ' + err)
                }else{
                    console.log('添加机器人成功，开始游戏 = ' +data)
                }
            });






                // global.socket.requestStartGame((err, data)=>{
                //     if (err){
                //         console.log('err = ' + err);
                //     }else {
                //         console.log('game start data = ' + data);
                //     }
                // });
                break;
            default:
                break;
        }
    },
})