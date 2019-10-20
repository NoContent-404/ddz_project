import global from './../global'
import EventListener from './../utility/event-listener'
cc.Class({
    extends: cc.Component,
    properties: {
        gameingUI: cc.Node,
        cardPrefab: cc.Prefab,
        playerCardPos: cc.Node,
        robUI: cc.Node,
        playUI: cc.Node,
        tipsLabel: cc.Label,
        pushCardNode: cc.Node,
        noPushCardButton: cc.Node
    },
    onLoad() {
        let _event = EventListener({})
        _event.removeListener('add-card-to-player');
        cc.gameingUI= this;
        this.bottomCards = [];
        let bottomCardData = [];
        this.cardList = [];
        this.chooseCardDataList = [];
        this.tipsCardsList = [];
        this.tipsCardsIndex = 0;
        global.socket.onPushCard((data) => {
            console.log('从服务端返回的牌组push card' + JSON.stringify(data));
            this.pushCard(data);
        });
      

        global.socket.onSSA((data) => { //  托管出牌
            console.log(' gggg ');
            for (let i = 0; i < this.cardList.length; i++) {
                this.cardList[i].emit('pushed-card', data.data);
            }
            for (let i = 0; i < data.data.length; i++) {
                let cardData = data.data[i];
                for (let j = 0; j < this.cardList.length; j++) {
                    let card = this.cardList[j];
                    if (card.getComponent('card').id === cardData.id) {
                        this.cardList.splice(j, 1);
                    }
                }
            }
      
        });






        // this.pushCard();
        global.socket.onCanRobMater((data) => {
            console.log('can rob master data = ' + data);
            if (data === global.playerData.accountID) {
                this.robUI.active = true;

                // var _time = 9;
                // this.schedule(function(){
                //
                //     this.robUI.getChildByName('clock').getChildByName('time').getComponent(cc.Label).string = _time--;
                //
                //     cc.log("计时器："+_time)
                //     if(_time == -1){
                //         global.socket.notifyRobState('no-ok');
                //         console.log('不抢');
                //         this.robUI.active = false;
                //     }
                //
                //     //0代表执行1次，
                //     //cc.macro.REPEAT_FOREVER
                //
                //
                //
                // },1,9,0);
            }

        });




       















        global.socket.onShowBottomCard((data) => {
            console.log('show bottom card  = ' + JSON.stringify(data));
            bottomCardData = data;
            // for (let i = 0; i < data.length; i++) {
            //     let card = this.bottomCards[i];
            //     card.getComponent('card').showCard(data[i]);
            // };

            // this.node.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(() => {
            //     let index = 0;
            //     const runActionCb = () => {
            //         index++;
            //         if (index === 3) {
            //             this.node.emit('add-card-to-player');
            //         }
            //     };
            //     for (let i = 0; i < this.bottomCards.length; i++) {
            //         let card = this.bottomCards[i];
            //         let width = card.width;
            //         this.runCardAction(card, cc.p((this.bottomCards.length - 1) * -0.5 * width * 0.7 + width * 0.7 * i, 240), runActionCb);
            //     }
            //     // this.bottomCards = [];
            // })));

            this.threeButtonCard(data);




        });
        global.socket.onCanPushCard((data) => {
            console.log('on can push card = ' + JSON.stringify(data));
            // {
            //     uid: data,
            //         account
            // :
            //     3
            // }
            let uid = data.uid;
            let count = data.count;
            if (uid === global.playerData.accountID) {
                console.log('count  = ' + count);
                this.noPushCardButton.active = true;
                if (count === 2){
                    this.noPushCardButton.active = false;
                }
                this.playUI.active = true;
                for (let i = 0; i < this.pushCardNode.children.length; i++) {
                    this.pushCardNode.children[i].destroy();
                }
                this.tipsCardsList = [];
                this.tipsCardsIndex = 0;
            }
        });
        global.socket.onPlayerPushCard((data) => {
            console.log('player push card = ' + JSON.stringify(data));
            if (data.accountID === global.playerData.accountID) {
                let cardsData = data.cards;
                for (let i = 0; i < cardsData.length; i++) {
                    let card = cc.instantiate(cc.gameingUI.cardPrefab);
                    card.parent = cc.gameingUI.pushCardNode;
                    card.scale = 0.6;
                    let width = card.width;
                    card.x = (cardsData.length - 1) * -0.5 * width * 0.7 + width * 0.7 * i;
                    card.getComponent('card').showCard(cardsData[i]);
                }
            }
            // for (let i = 0 ; i < this.playerNodeList.length ; i ++){
            //     this.playerNodeList[i].emit('player-push-card', data);
            // }
        });
        this.node.on('master-pos', (event) => {
            let detail = event.detail;
            this.masterPos = detail;
        });
        
        this.node.on('add-card-to-player', () => {
            if (global.playerData.accountID === global.playerData.masterID) {
                for (let i = 0; i < bottomCardData.length; i++) {
                    let card = cc.instantiate(this.cardPrefab);
                    card.parent = this.gameingUI;
                    card.scale = 0.8;
                    card.x = card.width * 0.4 * (17 - 1) * -0.5 + card.width * 0.4 * this.cardList.length;
                    card.y = -250;
                    card.getComponent('card').showCard(bottomCardData[i], global.playerData.accountID);
                    this.cardList.push(card);
                }
                this.sortCards();
            }
        });

     
        // cc.systemEvent.on('trusteeship-card', (event) => {   //  托管
        //     let detail = event.detail;
        //     console.log('托管啦',JSON.stringify(detail) );

        // });

        cc.systemEvent.on('choose-card', (event) => {
            let detail = event.detail;
            this.chooseCardDataList.push(detail);
        });

        
        cc.systemEvent.on('un-choose-card', (event) => {
            let detail = event.detail;
            for (let i = 0; i < this.chooseCardDataList.length; i++) {
                if (this.chooseCardDataList[i].id === detail.id) {
                    console.log('取消选择牌' + detail.id);
                    this.chooseCardDataList.splice(i, 1);
                }
            }
        });
        // cc.systemEvent.on('rm-card-from-list', (event)=>{
        //     let detail = event.detail;
        //     for (let i = 0 ; i < this.cardList.length ; i ++){
        //         let card = this.cardList[i];
        //         if (card.getComponent('card').id === detail){
        //             this.cardList.splice(i, 1);
        //         }
        //     }
        // });
    },
    runCardAction(card, pos, cb) {
        let moveAction = cc.moveTo(0.5, pos);
        let scaleAction = cc.scaleTo(0.5, 0.6);
        card.runAction(scaleAction);
        card.runAction(cc.sequence(moveAction, cc.callFunc(() => {
            // card.destroy();
            if (cb) {
                cb();
            }
        })));
    },
    sortCards() {
        this.cardList.sort(function (x, y) {
            let a = x.getComponent('card').cardData;
            let b = y.getComponent('card').cardData;
            if (a.hasOwnProperty('value') && b.hasOwnProperty('value')) {
                return b.value - a.value;
            }
            if (a.hasOwnProperty('king') && !b.hasOwnProperty('king')) {
                return -1;
            }
            if (!a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                return 1;
            }
            if (a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                return b.king - a.king;
            }
        });

        let x = this.cardList[0].x;

        for (let i = 0; i < this.cardList.length; i++) {
            let card = this.cardList[i];
            card.zIndex = i;
            card.x = x + card.width * 0.4 * i;
        }
        this.referCardsPos();
    },

    
    pushCard(data) {

        // {"value":6,"shape":4,"id":27},{"king":1,"id":52}
        if (data) {
            data.sort(function (a, b) {
                if (a.hasOwnProperty('value') && b.hasOwnProperty('value')) {
                    return b.value - a.value;
                }
                if (a.hasOwnProperty('king') && !b.hasOwnProperty('king')) {
                    return -1;
                }
                if (!a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                    return 1;
                }
                if (a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                    return b.king - a.king;
                }
            });

            for (let i = 0; i < data.length; i++) {
                let card = cc.instantiate(this.cardPrefab);
                card.parent = this.gameingUI;
                card.scale = 0.8;
                card.x = card.width * 0.4 * (17 - 1) * -0.5 + card.width * 0.4 * i;
                card.y = -250;
                card.getComponent('card').showCard(data[i], global.playerData.accountID);
                this.cardList.push(card);
            }
            console.log('cardList的牌' + this.cardList);

        }


        this.bottomCards = [];
        for (let i = 0; i < 3; i++) {
            let card = cc.instantiate(this.cardPrefab);
            card.parent = this.gameingUI;
            card.scale = 0.8;
            card.y = 60;
            card.x = (card.width * 0.8 + 20) * (3 - 1) * -0.5 + (card.width * 0.8 + 20) * i;
            this.bottomCards.push(card);
        }
    },



    threeButtonCard(data){
        
        for (let i = 0; i < data.length; i++) {
            let card = this.bottomCards[i];
            card.getComponent('card').showCard(data[i]);
        };


        this.node.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(() => {
            let index = 0;
            const runActionCb = () => {
                index++;
                if (index === 3) {
                    this.node.emit('add-card-to-player');
                }
            };
            for (let i = 0; i < this.bottomCards.length; i++) {
                let card = this.bottomCards[i];
                let width = card.width;
                this.runCardAction(card, cc.p((this.bottomCards.length - 1) * -0.5 * width * 0.7 + width * 0.7 * i, 240), runActionCb);
            }
            // this.bottomCards = [];
        })));
    },










    onButtonClick(event, customData) {
        switch (customData) {
            case 'rob':
                console.log('抢');
                global.socket.notifyRobState('ok');
                this.robUI.active = false;
                break;
            case 'no-rob':
                global.socket.notifyRobState('no-ok');
                console.log('不抢');
                this.robUI.active = false;
                break;
            case 'no-push':
                console.log('不出');
                this.playUI.active = false;
                global.socket.requestPlayerPushCard([], () => {
                    console.log('不出牌回调');
                });
                break;
            case 'tip':
                // console.log('托管');

                // global.socket.requestTrusteeship((err,data)=>{
                //     if(err){
                //         console.log('');
                //     }else{
                //         console.log('托管成功',data.data)

                        
                //         // if(data.staus === true){
                            
                //         //     for (let i = 0; i < this.cardList.length; i++) {
                //         //         this.cardList[i].emit('pushed-card', data.data);
                //         //     }
                //         //     for (let i = 0; i < data.data.length; i++) {
                //         //         let cardData = data.data[i];
                //         //         for (let j = 0; j < this.cardList.length; j++) {
                //         //             let card = this.cardList[j];
                //         //             if (card.getComponent('card').id === cardData.id) {
                //         //                 this.cardList.splice(j, 1);
                //         //             }
                //         //         }
                //         //     }
                //         //     console.log('托管成功',JSON.stringify(data))
                //         // }else{
                //         //     console.log('取消托管成功',JSON.stringify(data))
                //         // }
                        
                //     }
                // });



                console.log('提示');
                if (this.tipsCardsList.length === 0) {
                    global.socket.requestTipsCards((err, data) => {
                        if (err) {

                        } else {
                            console.log('data = ' + JSON.stringify(data));
                            this.tipsCardsList = data.data;
                            console.log('this.tipsCardsList =  ' + JSON.stringify(this.tipsCardsList));
                            this.showTipsCards(this.tipsCardsList);
                            // this.tipsCardsIndex ++;
                        }
                    });
                } else {
                    // let cards = this.tipsCardsList[this.tipsCardsIndex];
                    this.showTipsCards(this.tipsCardsList);
                }

                this.tipsCardsIndex ++;
                if (this.tipsCardsIndex >= this.tipsCardsList.length){
                    this.tipsCardsIndex = 0;
                }


                break;
            case 'ok-push':
                if (this.chooseCardDataList.length === 0) {
                    return;
                }
                global.socket.requestPlayerPushCard(this.chooseCardDataList, (err, data) => {
                    console.log('err = ' + err);
                    if (err) {
                        console.log('push card err=' + err);
                        if (this.tipsLabel.string === '') {
                            this.tipsLabel.string = err;
                            setTimeout(() => {
                                this.tipsLabel.string = '';
                            }, 2000);
                        }
                        ///
                        for (let i = 0; i < this.cardList.length; i++) {
                            this.cardList[i].emit('init-y', this.chooseCardDataList);
                        }
                        this.chooseCardDataList = [];

                    } else {

                        console.log('choose card data list =' + JSON.stringify(this.chooseCardDataList));
                        for (let i = 0; i < this.cardList.length; i++) {
                            this.cardList[i].emit('pushed-card', this.chooseCardDataList);
                        }

                        for (let i = 0; i < this.chooseCardDataList.length; i++) {
                            let cardData = this.chooseCardDataList[i];
                            for (let j = 0; j < this.cardList.length; j++) {
                                let card = this.cardList[j];
                                if (card.getComponent('card').id === cardData.id) {
                                    this.cardList.splice(j, 1);
                                }
                            }
                        }


                        console.log('牌的数量' + this.cardList.length);
                        console.log('push card data = ' + JSON.stringify(data));
                        this.playUI.active = false;
                        this.chooseCardDataList = [];
                        this.referCardsPos();
                    }
                });
                if(this.cardList === 19){
                    // global.socket.notifyEnd('end game');
                    cc.director.loadScene('hallScene');
                }
                console.log('出牌');
                break;
            default:
                break;
        }
    },
    referCardsPos() {
        for (let i = 0; i < this.cardList.length; i++) {
            let card = this.cardList[i];
            let width = card.width;
            card.x = (this.cardList.length - 1) * width * 0.4 * -0.5 + width * 0.4 * i;
        }
    },
    showTipsCards(cardsList) {
        if (cardsList.length === 0) {
            if (this.tipsLabel.string === '') {
                this.tipsLabel.string = '你没有大过上家的牌形';
                setTimeout(() => {
                    this.tipsLabel.string = '';
                }, 2000);
            }


            return;
        }

        let cards = cardsList[this.tipsCardsIndex];
        for (let i = 0; i < this.cardList.length; i++) {
            this.cardList[i].emit('init-y');
        }
        for (let i = 0; i < this.cardList.length; i++) {
            // init-y
            this.cardList[i].emit('tips-card', cards);
        }
        this.tipsCardsIndex++;
        if (this.tipsCardsIndex >= cardsList.length) {
            this.tipsCardsIndex = 0;
        }


    },
});