import global from "../../global";

cc.Class({
    extends: cc.Component,
    properties: {
        headImage: cc.Sprite,
        idLabel: cc.Label,
        nickNameLabel: cc.Label,
        goldLabel: cc.Label,
        readyIcon: cc.Node,
        offlineIcon: cc.Node,
        cardsNode: cc.Node,
        pushCardNode: cc.Node,
        cardPrefab: cc.Prefab,
        tipsLabel: cc.Label,
        infoNode: cc.Node,
        timeLabel: cc.Label,
        robIconSp: cc.Sprite,
        masterIcon: cc.Node,
        robIcon: cc.SpriteFrame,
        noRobIcon: cc.SpriteFrame
    },
    onLoad() {

        this.cardList = [];
        this.readyIcon.active = false;
        this.offlineIcon.active = false;
        this.node.on('game-start', () => {
            this.readyIcon.active = false;
        });
        this.node.on('push-card', () => {
            if (this.accountID !== global.playerData.accountID) {
                this.pushCard();
            }
        });
        this.node.on('can-rob-mater', (event) => {
            let detail = event.detail;
            if (detail === this.accountID && detail !== global.playerData.accountID) {
                this.infoNode.active = true;
                this.tipsLabel.string = '正在抢地主';
                this.timeLabel.string = '5';
            }
        });

       


        this.node.on('rob-state', (event) => {
            let detail = event.detail;
            console.log(' player node  rob state detail = ' + JSON.stringify(detail));
            if (detail.accountID === this.accountID) {
                this.infoNode.active = false;
                switch (detail.value) {
                    case 'ok':
                        this.robIconSp.node.active = false;
                        this.robIconSp.spriteFrame = this.robIcon;
                        break;
                    case 'no-ok':
                        this.robIconSp.node.active = false;
                        this.robIconSp.spriteFrame = this.noRobIcon;
                        break;
                    default:
                        break;
                }
            }
        });
        this.node.on('change-master', (event) => {
            let detail = event.detail;
            this.robIconSp.node.active = false;
            console.log('这个节点的名称 = '+this.robIconSp.node.name);
            if (detail === this.accountID) {
                this.masterIcon.active = true;
                this.masterIcon.scale = 0.6;
                this.masterIcon.runAction(cc.scaleTo(0.3, 1).easing(cc.easeBackOut()));
            }
        });
        this.node.on('add-three-card', (event) => {
            let detail = event.detail;
            if (detail === this.accountID) {
                for (let i = 0; i < 3; i++) {
                    this.pushOneCard();
                }
            }
        });
        this.node.on('player-push-card', (event) => {
            let detail = event.detail;
            // {
            //     accountID: player.accountID,
            //         cards: cards
            // }

            if (detail.accountID === this.accountID && this.accountID !== global.playerData.accountID) {
                this.playerPushCard(detail.cards);
            }
        });
        // this.pushCard();
        // for (let i = 0 ; i < 3 ; i ++){
        //     this.pushOneCard();
        // }
    },
    initWithData(data, index,findNode) {
        // {"nickName":"小明14","accountID":"2162095","avatarUrl":"https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=1665110666,1033370706&fm=27&gp=0.jpg","gold":100}]}
        let slef = this;
        slef.accountID = data.accountID;
        slef.idLabel.string = 'ID:' + data.accountID;
        slef.nickNameLabel.string = data.nickName;
        slef.goldLabel.string = data.gold;
        slef.index = index;
        slef.node.name = data.accountID;
        cc.loader.load({url: data.avatarUrl, type: 'jpg'}, (err, tex) => {
            cc.log('Should load a texture from RESTful API by specify the type: ' + (tex instanceof cc.Texture2D));
            let oldWidth = 72;
            console.log('old withd' + oldWidth);
            slef.headImage.spriteFrame = new cc.SpriteFrame(tex);
            let newWidth = slef.headImage.node.width;
            console.log('new withd' + newWidth);
            slef.headImage.node.scale = oldWidth / newWidth;
        });


        slef.node.on('player_ready', (event) => {
            let detail = event.detail;
            console.log('player ready detail = ' + detail);
            if (detail === slef.accountID) {
                slef.readyIcon.active = true;
            }
        });


        if (index === 1) {
            if(findNode){
                console.log('重新进入不转向')
            }else{
                slef.cardsNode.x *= -1;
                slef.pushCardNode.x *= -1;
            }
                
        }
            
        
    },
    pushCard() {
        this.cardsNode.active = true;
        for (let i = 0; i < 17; i++) {
            let card = cc.instantiate(this.cardPrefab);
            card.parent = this.cardsNode;
            card.scale = 0.4;
            let height = card.height;
            card.y = (17 - 1) * 0.5 * height * 0.4 * 0.3 - height * 0.4 * 0.3 * i;
            this.cardList.push(card);
        }
    },


    pushOneCard() {
        let card = cc.instantiate(this.cardPrefab);
        card.parent = this.cardsNode;
        card.scale = 0.4;
        let height = card.height;
        card.y = (17 - 1) * 0.5 * height * 0.4 * 0.3 - this.cardList.length * height * 0.4 * 0.3;
        this.cardList.push(card);
        console.log('玩家手里剩下的牌' + this.cardList);
    },



    playerPushCard(cardsData) {
        for (let i = 0 ; i < this.pushCardNode.children.length ; i ++){
            this.pushCardNode.children[i].destroy();
        }
        for (let i = 0; i < cardsData.length; i++) {
            let card = cc.instantiate(this.cardPrefab);
            card.parent = this.pushCardNode;
            card.scale = 0.25;
            let height = card.height;
            card.y = (cardsData.length - 1) * 0.5 * height * 0.4 * 0.3 - i * height * 0.4 * 0.3;
            card.getComponent('card').showCard(cardsData[i]);
        }
        //每出一次牌，就销毁玩家头像旁的牌的相应数量
        for (let i = 0; i < cardsData.length; i++) {
            let card = this.cardList.pop();
            card.destroy();
        }
        this.referCardPos();
    },



    playerPushCardB(cardsData) {
       
        for (let i = 0; i < cardsData.length; i++) {
            let card = cc.instantiate(this.cardPrefab);
            card.parent = this.pushCardNode;
            card.scale = 0.4;
            let height = card.height;
            card.y = (cardsData.length - 1) * 0.5 * height * 0.4 * 0.3 - i * height * 0.4 * 0.3;
            // card.getComponent('card').showCard(cardsData[i]);
        }
       
        this.referCardPos();
    },





    //重新刷新牌的位置
    referCardPos() {
        for(let i = 0 ; i < this.cardList.length ; i ++){
            let card = this.cardList[i];
            let height = card.height;
            card.y = (this.cardList.length - 1) * 0.5 * height * 0.4 * 0.3 - height * 0.4 * 0.3 * i;
        }
    }
});