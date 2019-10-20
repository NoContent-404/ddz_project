import global from './../global'
cc.Class({
    extends: cc.Component,
    properties: {
        bottomLabel: cc.Label,
        rateLabel: cc.Label,
        roomIDLabel: cc.Label,
        playerNodePrefab: cc.Prefab,
        playerPosNode: cc.Node
    },
    onLoad(){
        this.playerNodeList = [];
        this.bottomLabel.string = '底:' + global.playerData.bottom;
        this.rateLabel.string = '倍:' + global.playerData.rate;
        global.socket.requestEnterRoomScene((err, data)=>{  //  加入房间
            if (err){
                console.log('err = ' + err);
            }else {
                console.log('enter room scene = ' + JSON.stringify(data));
                // let seatIndex = data.seatIndex;
                this.playerPosList = [];
                this.initPlayerPos(data.seatIndex);
                let playerData = data.playerData;
                let roomID = '房间ID:' + data.roomID;
                this.roomIDLabel.string = roomID;
                global.playerData.houseMangerID = data.houseManagerID;
                for (let i = 0 ; i < playerData.length ; i ++){
                    this.addPlayerNode(playerData[i]);
                }
            }
            this.node.emit('init');
        });




        global.socket.onPlayerJoinRoom((data)=>{
            console.log('on player join room  =' + JSON.stringify(data));
            this.addPlayerNode(data);
        });
        global.socket.onPlayerReady((data)=>{
            for (let i = 0 ; i < this.playerNodeList.length ; i ++){
                this.playerNodeList[i].emit('player_ready', data);
            }
        });
        global.socket.onGameStart(()=>{
           for (let i = 0 ; i < this.playerNodeList.length ; i ++){
               this.playerNodeList[i].emit('game-start');
           }
        });
        global.socket.onPushCard(()=>{
            console.log('game scene push card');
           for (let i = 0 ; i < this.playerNodeList.length ; i ++){
               this.playerNodeList[i].emit('push-card');
           }
        });
        global.socket.onCanRobMater((data)=>{
            for (let i = 0 ; i < this.playerNodeList.length ; i ++){
                this.playerNodeList[i].emit('can-rob-mater', data);
            }
        });
        global.socket.onPlayerRobState((data)=>{
            for (let i = 0 ; i < this.playerNodeList.length ; i ++){
                this.playerNodeList[i].emit('rob-state', data);
            }
        });
        global.socket.onChangeMaster((data)=>{
            console.log('on change master = ' + data);
            global.playerData.masterID = data;
            for (let i = 0 ; i < this.playerNodeList.length ; i ++){
                let node = this.playerNodeList[i];
                node.emit('change-master', data);
                if (node.getComponent('playerNode').accountID === data){
                    this.node.emit('master-pos', node.position);
                }
            }
        });
        global.socket.onPlayerPushCard((data)=>{
            console.log('player push card = ' + JSON.stringify(data));
            for (let i = 0 ; i < this.playerNodeList.length ; i ++){
               this.playerNodeList[i].emit('player-push-card', data);
            }
        });
        this.node.on('add-card-to-player', ()=>{
            if (global.playerData.accountID !== global.playerData.masterID){
                for (let i = 0 ; i < this.playerNodeList.length ; i ++){
                    this.playerNodeList[i].emit('add-three-card', global.playerData.masterID);
                }
            }
        });


        //  玩家离开删除头像
        global.socket.notifyPlayerLeave((data) => {
            console.log(' leave-player ');
            this.delPlayerNode(data)
            
        });
    },
    initPlayerPos(seatIndex){
        // let children = this.playerPosNode.children;
        switch (seatIndex){
            case 0:
                this.playerPosList[0] = 0;
                this.playerPosList[1] = 1;
                this.playerPosList[2] = 2;

                break;

            case 1:

                this.playerPosList[1] = 0;
                this.playerPosList[2] = 1;
                this.playerPosList[0] = 2;

                break;
            case 2:
                this.playerPosList[2] = 0;
                this.playerPosList[0] = 1;
                this.playerPosList[1] = 2;
                break;
            default:
                break;
        }
    },
    addPlayerNode(data){
        
        if( this.playerNodeList.length > 0 ){
            for(let i=0;i<this.playerNodeList.length;i++){
                if(this.playerNodeList[i].name === data.accountID){
                    
                    let selNode = this.node.getChildByName(data.accountID)
                    selNode.getComponent('playerNode').initWithData(data, this.playerPosList[data.seatIndex],selNode);
                    
                    return;
                }
                
            }
        }
        
        
        if(data.cards !== undefined && global.playerData.accountID === data.accountID){ //  重连发牌

            console.log('三张底牌 = ' + data.buttonCard);
            let playerNode = cc.instantiate(this.playerNodePrefab);
            playerNode.parent = this.node;
            playerNode.getComponent('playerNode').initWithData(data, this.playerPosList[data.seatIndex]);
            playerNode.position = this.playerPosNode.children[this.playerPosList[data.seatIndex]].position;
            cc.gameingUI.pushCard(data.cards)
            cc.gameingUI.threeButtonCard(data.buttonCard)
            // cc.gameingUI.threeButtonCard(data.)
            this.playerNodeList.push(playerNode);
            return;
        }
        
        if(data.cards !== undefined && global.playerData.accountID !== data.accountID){
            let playerNode = cc.instantiate(this.playerNodePrefab);
            playerNode.parent = this.node;
            playerNode.getComponent('playerNode').initWithData(data, this.playerPosList[data.seatIndex]);
            playerNode.getComponent('playerNode').playerPushCardB(data.cards);
            playerNode.position = this.playerPosNode.children[this.playerPosList[data.seatIndex]].position;
            this.playerNodeList.push(playerNode);
            return;
        }
        
        let playerNode = cc.instantiate(this.playerNodePrefab);
        playerNode.parent = this.node;
        playerNode.getComponent('playerNode').initWithData(data, this.playerPosList[data.seatIndex]);
        playerNode.position = this.playerPosNode.children[this.playerPosList[data.seatIndex]].position;
        this.playerNodeList.push(playerNode);
        

       
    },

    delPlayerNode(data){    //  删除头像
        let delNode = this.node.getChildByName(data.accountID)
        console.log('找到这个节点 = ' + delNode.name)
        delNode.destroy();
        for(let i=0;i<this.playerNodeList.length;i++){
            if(this.playerNodeList[i].name === data.accountID){
                this.playerNodeList.splice(i, 1);
                return;
            }
            
        }
    // let delNode = this.playerPosNode.children[this.playerPosList[data.seatIndex]];

    }
});