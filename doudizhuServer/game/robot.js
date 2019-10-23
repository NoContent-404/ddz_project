const myDB = require('../db');
const Room = require('./room');
const gameContorller = require('./game-controller');
const Carder = require('./carder');

module.exports = function(){
    let that ={};

    that.kingBoom = {};
    
    let robot = undefined;
    let robot1 = undefined;
    // that.getKBoom = function(){
    // return kingBoom;
    // }

    that.getRobot = function (data){
        return robot;
    }



that.selectRobot = function(palyer,data,socket,room,cb){
 
    
    
    myDB.getPlayerInfoWithIsRobot(data,(err,robotmsg)=>{
        if(err){
            console.log(' robot.js ==>  db.js   查找机器人出现错误 = ' ,err);
        }else{
            // console.log('robot.js ==>   db.js   查找机器人成功 = 机器人 ：' ,JSON.stringify(robotmsg))
            
            // console.log('房间  ==>  '+JSON.stringify(room.roomID) +' ==> 需要加入机器人')
            // console.log('房间  ==>  '+JSON.stringify(robotmsg[0].nick_name) +' ==> 需要加入机器人')
         
            // robot = gameContorller.createRobot(robotmsg[0],socket,that);
            
            // robot.isReady = true;
            // robot.isoccupy = true;
            // robot.isOnLine = false;
           
            // gameContorller.joinRoom(room.roomID,robot,(err,robotdata)=>{
            //     if(err){
            //         console.log(err)
            //     }else{
            //         console.log('加入成功')
            //         console.log('房间玩家列表  ==>  '+room.getPlayerList().length)
            //         robot.setRoom(robotdata.room)
            //         console.log(JSON.stringify(robot.getRoom()))
            //         room.playerReady(robot);
            //     }
            // });



            // robot1 = gameContorller.createRobot(robotmsg[1],socket,that);
           
            // robot1.isReady = true;
            // robot1.isoccupy = true;
            // robot1.isOnLine = false;
     
            // gameContorller.joinRoom(room.roomID,robot1,(err,robotdata)=>{
            //     if(err){
            //         console.log(err)
            //     }else{
            //         console.log('加入成功')
            //         console.log('房间玩家列表  ==>  '+room.getPlayerList().length)
            //         robot1.setRoom(robotdata.room)
            //         room.playerReady(robot1);
            //     }
            // })

            // room.houseManagerStartGame(palyer,(err,data)=>{
            //     if(err){

            //     }else{
            //         console.log('开始游戏')
            //     }
                

            // });

            
            // let roomPlayerList = room.getPlayerList();
            // for(let i=0;i<roomPlayerList.length;i++){
            //     if(!roomPlayerList[i].isrobot){
            //         let playerCards = roomPlayerList[i].cards;
            //         let cards = playerCards;
            //         // for(let i=0;i<room.buttonCards.length;i++){
            //         //     cards.push(room.buttonCards[i])
            //         //     console.log('显示牌组 ==> '+ JSON.stringify(cards))
            //         // }
            //         splitPlayerCards(cards);
            //         console.log('玩家 ==> 牌组 ==>  :' + JSON.stringify( roomPlayerList[i].cards))
            //     }else{
            //         console.log('AI_Robot_'+ i +' ==> 牌组 ==>  :' + JSON.stringify( roomPlayerList[i].cards))
            //     }
            // }
           
           
            
            if(cb){
                cb(null,robotmsg)
            }
        }
    })




    
};












 const splitPlayerCards = function(playerCards,cardsValue,PlayerPushCardList){
    playerCards.sort((a, b) => {    //  排序
        return a.value - b.value;
    });
    console.log('拆分 ==> 玩家牌组 ==>  :' + JSON.stringify( playerCards))
   
    let weigth = 0;
    
    /**
     *    1.查看是否王炸，如果有则把王炸拆分出来（优先级:0）
     */
    kingBoom = getKingBoom(playerCards);
    if(kingBoom){
        // weigth = weigth + 3;
        // // for(let i=0;i<playerCards.length;i++){
        // //     for(let j=0;j<kingBoom.length;j++)
        // //     if(playerCards[i].king === kingBoom[j].king){
        // //         playerCards.splice(i,1);
        // //     }
        // // }
        console.log('有王炸');
    }
    


    /**
     *    2.查看是否能够组成普通炸弹，如果有则把普通炸弹拆分出来（优先级:1）
     */
    let fourBoom = getRepeatCardsList(4,playerCards);
    if(fourBoom.length > 0){
        for(let i=0;i<fourBoom.length;i++){
            weigth = weigth + 2;
        }
        let del;
        for(let i=0;i<playerCards.length;){
             del = false;
            for(let j=0;j<fourBoom.length;j++){
                if(playerCards[i].value === fourBoom[j][0].value){
                        playerCards.splice(i,1);
                        del = true;
                        break ;
                }
            }
            if(del){
                i=0;
            }else{
                i++;
            }
        }

        console.log('剩余 ==>' + playerCards.length+'张牌'); 
        console.log('有炸弹 ==>' + fourBoom.length+'个'); 
    }

   
     /**
     *    3.查看是否能够组成飞机，如果有则把飞机拆分出来（优先级:2）
     */
    let threeCardsList = getRepeatCardsList(3,playerCards);
    // if(plane.length>0){
    
        
    //     let del;
    //     for(let i=0;i<playerCards.length;){
    //          del = false;
    //         for(let j=0;j<plane.length;j++){
    //             if(playerCards[i].value === plane[j][0].value){
    //                     playerCards.splice(i,1);
    //                     del = true;
    //                     break ;
    //             }
    //         }
    //         if(del){
    //             i=0;
    //         }else{
    //             i++;
    //         }
    //     }
        console.log('剩余 ==>' + playerCards.length+'张牌'); 
        console.log('有单张 ==>' + threeCardsList.length+'个'); 
    // }


    let solaList = getRepeatCardsList(1,playerCards)
    let newSola = [];
    for(let i in solaList){
        newSola.push(solaList[i][0]);
    }
    // if(sola.length > 0 ){
    //     for(let i=0;i<playerCards.length;){
    //         del = false;
    //        for(let j=0;j<sola.length;j++){
    //            if(playerCards[i].value === sola[j][0].value){
    //                    playerCards.splice(i,1);
    //                    del = true;
    //                    break ;
    //            }
    //        }
    //        if(del){
    //            i=0;
    //        }else{
    //            i++;
    //        }
    //    }

    // }

    console.log('单张数据 = ' + JSON.stringify(solaList))

    console.log('有单张 ==>' + solaList.length+'个'); 

   


    /**
     * 对子
     */
    let doubleList = getRepeatCardsList(2,playerCards);
   
    let newDoubleList = [];
    for(let i in doubleList){
        for(let j=0;j<doubleList[i].length;j++){
            newDoubleList.push(doubleList[i][j]);
        }
    }
    // if(pair.length>0){

    //     let del;
    //     for(let i=0;i<playerCards.length;){
    //          del = false;
    //         for(let j=0;j<pair.length;j++){
    //             if(playerCards[i].value === pair[j][0].value){
    //                     playerCards.splice(i,1);
    //                     del = true;
    //                     break ;
    //             }
    //         }
    //         if(del){
    //             i=0;
    //         }else{
    //             i++;
    //         }
    //     }
        console.log('剩余 ==>' + playerCards.length+'张牌'); 
        console.log('有对子 ==>' + doubleList.length+'个'); 
    // }



    /**
     * 从单张中去除能够成为顺子的牌
     * 
     */

    let scroll = getScrollCardsList(6,newSola);
    console.log('有顺子' +scroll.length);
    
    


    /**
     * 获取连对
     */
    let doubleScroll = getDoubleScorllCardsList(newDoubleList);
    console.log('有连对' +doubleScroll.length);
    
   
    /**
     * 拆分3带1
     */
    let threeWithOne = getThreeWithOne(threeCardsList,newSola);
    console.log('3带1 ==> ' + threeWithOne);

    

    /**
     * 拆分3带2
     */
    let threeWithDouble = getThreeWithDouble(threeCardsList,doubleList);
    console.log('3带2 ==> ' + threeWithOne);

    

    /**
     * 拆分飞机
     */
    let plane = getPlane(playerCards,PlayerPushCardList);
    
    /**
     * 拆分飞机带单
     */
    let planeWithOne = getPlaneWithOne(plane,solaList,PlayerPushCardList);
    

    /**
     * 拆分飞机带对子
     */
    let planeWithTow = getPlaneWithTow(plane,doubleList,PlayerPushCardList);
    
    let canPushCardsList = getCanPushCardsList(kingBoom, fourBoom,threeCardsList,solaList,doubleList,
        scroll,doubleScroll,threeWithOne,threeWithDouble,plane,planeWithOne,planeWithTow);

    let value ;
    if(cardsValue === undefined){
        value = 'no';
    }else{
        value = cardsValue.name;
    }
    //  返回牌组
    switch(value){
        case 'One' : return solaList;   //  单张
        case 'Double' : return doubleList;  //  对子
        case 'Three' : return threeCardsList;   //   三张
        case 'Boom' : return fourBoom;  //  4炸弹
        case 'ThreeWithOne' : return threeWithOne;  //  3带1
        case 'ThreeWithTwo' : return threeWithDouble;   //  3带对子
        case 'Plane' : return plane;     //  飞机
        case 'PlaneWithOne' : return planeWithOne;  //  飞机带单张
        case 'PlaneWithTwo' : return planeWithTow;  //  飞机带对子
        case 'Scroll' : return scroll;  //  单顺
        case 'DoubleScroll' : return doubleScroll;  //  连对
        case 'FourWithOne' : return fourBoom;   //  4带1
        case 'FourWithTow' : return fourBoom;   //  4带对子

        default : return canPushCardsList;
    }








    // return sola;

};

 const getKingBoom = function (cardList) {  //  获取王炸
        let list = [];
        for (let i = 0; i < cardList.length; i++) {
            let card = cardList[i];
            if (card.king !== undefined) {
                list.push(card);
            }
        }
        if (list.length === 2) {
            return list;
        } else {
            return false;
        }
};

const getRepeatCardsList = function (num, cardsB) { 
    //获取重复次数为num 的牌的列表的组合
    let map = {};
    for (let i = 0; i < cardsB.length; i++) {
        let key = -1;
        if (cardsB[i].king === undefined){
            key = cardsB[i].value;
        }else {
            key = cardsB[i].king;
        }


        if (map.hasOwnProperty(key)) {
            map[key].push(cardsB[i]);
        } else {
            map[key] = [cardsB[i]];
        }
    }
    var list = [];
    for (let i in map) {
        if (map[i].length === num) {
            // list.push(map[i].substring(0, 2));
            let l = [];
            for (let j = 0; j < num; j++) {
                l.push(map[i][j]);
            }
            list.push(l);
        }
    }

    return list;

};

const getScrollCardsList = function (length, cards) {

    let cardList = [];
    let map = {};
    for (let i = 0 ; i < cards.length ; i ++){
        if (!map.hasOwnProperty(cards[i].value)){
            cardList.push(cards[i]);
            map[cards[i].value] = true;
        }
    }

    cardList.sort((a, b)=>{
        return a.value - b.value;
    });
    let cardsList = [];
    for (let i = 0 ; i <(cardList.length - length); i ++){
        let list = [];
        for (let j = i ; j < i + length ; j ++){
            list.push(cardList[j]);
        }
        cardsList.push(list);
    }
    console.log('cars list =  ' + JSON.stringify(cardsList));
    let endList = [];
    for (let i = 0 ; i < cardsList.length ; i ++){
        let flag = true;
        for (let j = 0 ; j < (cardsList[i].length - 1) ; j ++){
            if (Math.abs(cardsList[i][j].value - cardsList[i][j + 1].value) !== 1){
                flag = false;
            }
        }

        if (flag === true){
            endList.push(cardsList[i]);
        }
    }
    return endList;
};





const getDoubleScorllCardsList = function (cards) { //  获取双顺子

    let map = {};

    for(let i=0;i<cards.length;i++){
        let key = -1;
        if (cards[i].king === undefined){
            key = cards[i].value;
        }else {
            key = cards[i].king;
        }


        if (map.hasOwnProperty(key)) {
            map[key].push(cards[i]);
        } else {
            map[key] = [cards[i]];
        }
    }


    let list = [];
    for (let i in map) {    //  获取到所有的对子
        if (map[i].length === 2) {
            let l = [];
            for (let j = 0; j < 2; j++) {
                l.push(map[i][j]);
            }
            list.push(l);
        }
    }
    list.sort((a,b)=>{
        return a[0].value - b[0].value;
    });


    let groupList = [];
    let keys = Object.keys(map);
            keys.sort((a, b) => {
                return Number(a) - Number(b);
            });
            let noConnect = -1; //  记录断开位置
            for (let i = 0; i < (keys.length - 1); i++) {
                let getList = [];
                if (Math.abs(Number(keys[i]) - Number(keys[i + 1])) !== 1) {
                   
                    for(let j=i;j>-1;j--){
                        for(let k=0;k<map[keys[i]].length;k++){ 
                            getList.unshift(map[keys[j]][k]);
                        }
                    }
                    noConnect = i;
                    if(getList.length > 5 ){
                        groupList.push(getList)
                    }
                    
                }else{
                    if(i === keys.length - 2){
                        for(let j=i+1;j>noConnect;j--){
                            for(let k=0;k<map[keys[j]].length;k++){
                                getList.unshift(map[keys[j]][k]);
                            }
                            
                        }
                        if(getList.length > 5){
                            groupList.push(getList);
                        }
                        
                        
                    }
                }
            }

    console.log('所有的对子' + groupList)
    return groupList;
};





const getThreeWithOne = function (three, one) {
    let threeCards = JSON.parse(JSON.stringify(three)); //  复制数组  
    
    let oneCards = JSON.parse(JSON.stringify(one));//  复制数组  
    let list = [];
    if(threeCards === undefined || oneCards === undefined){
        return list;
    }


    for(let i=0;i<threeCards.length;i++){
        list.push(threeCards[i]);
    }
    for(let i=0;i<list.length;i++){
        list[i].push(oneCards[0]);
    }


    return list;

}



const getThreeWithDouble = function (three, Double) {
    let threeCards =  JSON.parse(JSON.stringify(three)); //  复制数组  
    let DoubleCards =  JSON.parse(JSON.stringify(Double)); //  复制数组  
    let list = [];
    if(threeCards === undefined || DoubleCards === undefined){
        return list;
    }


    for(let i=0;i<threeCards.length;i++){
        list.push(threeCards[i]);
    }
    for(let i=0;i<list.length;i++){
        for(let j in DoubleCards[0]){
            list[i].push(DoubleCards[0][j]);
        } 
    }
    return list;
};




    const getPlaneMinValue = function (cardsA) {    //  获取最小值
        let map = {}; //，3，3，3，4，4，4
        for (let i = 0 ; i < cardsA.length ; i ++){
            if (map.hasOwnProperty(cardsA[i].value)){
                map[cardsA[i].value].push(cardsA[i]);
            }else {
                map[cardsA[i].value] = [cardsA[i]];
            }
        }
        // {
        //     '3': [card, card, card],
        //     '4': [card, card ,card]
        // }
        let minNum = 100;
        for (let  i in map){
            if (Number(i) < minNum){
                minNum = Number(i);
            }
        }
        return minNum;
    };

    //  飞机
    const getPlane = function(cards,cardsA){
        let list = getRepeatCardsList(3,cards);
        

        let map = {};
        for (let i = 0 ; i < list.length ; i ++){
            if (map.hasOwnProperty(list[i][0].value)){
                // map[list[i][0].value].push(list[i]);
            }else {
                map[list[i][0].value] = list[i];
            }
        }
        let keys = Object.keys(map);
        keys.sort((a,b)=>{
            return Number(a) - Number(b);
        });


        let lengthA = 0;
        let num = 0;
        if(cardsA !== undefined){
        let listA = getRepeatCardsList(3,cardsA);
         num =  getPlaneMinValue(cardsA);
        for(let i in listA){
            lengthA = lengthA + listA[i].length;
        }
        for(let i in keys){
            if(keys[i] <= num){
                keys.splice(i,1)
            }
        }


        }
        
        let tempCardsList = [];
        let l = [];
        let cont = 0; 
        for (let i = cont ; i < (keys.length); i ++){
            if (Math.abs(Number(keys[i]) - Number(keys[i + 1])) !== 1){
               
                for (let j = cont ; j <=i + cont  ; j++){
                    for(let k in map[keys[j]]){
                        l.push(map[keys[j]][k]);
                    }
                    if(cardsA !== undefined){
                        if(l.length === lengthA){
                            tempCardsList.push(l);
                            i=tempCardsList.length -1;
                            cont = tempCardsList.length;
                            l = [];
                            break;
                        }
                    }
                }

                if(cardsA === undefined){
                    cont = i+1;
                    if(l.length>1){
                        tempCardsList.push(l);
                        l = [];
                    }
                }
                

            }
        }
        let cardsList = [];
        if(cardsA !== undefined){
           
            for (let i = 0 ; i < tempCardsList.length ; i ++){
                let valueB = getPlaneMinValue(tempCardsList[i]);
                if (valueB > num){
                    cardsList.push(tempCardsList[i]);
                }
            }


        }else{
            cardsList.push(tempCardsList[0])
        }
        
        return cardsList;
    }


    const getPlaneWithOne = function(myCards,mySolaList,PlayerPushCardList){ //  飞机带单
       let list = [];
        if(mySolaList.length === 0 || myCards.length === 0){
            return list;
        }

       
        let solaList =  JSON.parse(JSON.stringify(mySolaList)); //  复制数组  
        let cards =  JSON.parse(JSON.stringify(myCards)); //  复制数组 
        
        let cardsNum = cards[0].length / 3;
            if(solaList.length >= cardsNum){
                for(let i=0;i<cardsNum;i++){
                    cards[0].push(solaList[i][0]);
                }
                list = cards[0];
            }
            return list;
    

        
    };



    const getPlaneWithTow = function(myCards,myDoubleList,PlayerPushCardList){ //  飞机带单
        let list = [];
        if(myDoubleList.length === 0 || myCards.length === 0){
            return list;
        }
 
        
        let doubleList =  JSON.parse(JSON.stringify(myDoubleList)); //  复制数组  
        let cards =  JSON.parse(JSON.stringify(myCards)); //  复制数组 
         
        let cardsNum = cards[0].length / 3;
        if(doubleList.length >= cardsNum){
            for(let i=0;i<cardsNum;i++){
                for(let j=0;j<2;j++){
                    cards[0].push(doubleList[i][j]);
                }
            }
            list = cards[0];
        }
        return list;
 
     };

const getCanPushCardsList = function(kingBoom, fourBoom,threeCardsList,solaList,doubleList,scroll,doubleScroll,
    threeWithOne,threeWithDouble,plane,planeWithOne,planeWithTow){
  
    if( solaList.length !== 0){     //  单顺
        return  solaList;
    }
    
    if( doubleScroll.length !== 0){     //  双顺
        return  doubleScroll;
    }

    if( planeWithOne.length !== 0){     //  飞机带单张
        return  planeWithOne;
    }

    if( planeWithTow.length !== 0){     //  飞机带对子
        return  planeWithTow;
    }

    if( plane.length !== 0){        //  飞机
        return  plane;
    }


    if( threeWithOne.length !== 0){     //  三带单
        return  threeWithOne;
    }
    if( threeWithDouble.length !== 0){      //  三带对子
        return  threeWithDouble;
    }

    if( threeCardsList.length !== 0){   //  三张
        return  threeCardsList;
    }

    if( doubleList.length !== 0){   //  对子
        return  doubleList;
    }

    if( scroll.length !== 0){   //  单张
        return  scroll;
    }


    if( fourBoom.length !== 0){ //  炸弹
        return  fourBoom;
    }

    if( kingBoom.length !== 0){ //  火箭
        return  kingBoom;
    }
};

// };
const getCardsValue = function (cardList) {
    // return true;
    if (cardList.name === 'One') {
        console.log('单张牌');
        console.log('返回单张 = ' + JSON.stringify(that.sola));
        return that.sola;
    }
    return 'false';
    
};
that.spliceCards = splitPlayerCards;
that.getRorbotCards = getCardsValue;

return that;

}





// exports.createRobot = function (data) { //  创建机器人
//     let player = Player(data, socket, null, this,robot);
//     _playerList.push(player);
//     console.log('在线玩家人数 = '+_playerList.length)
// };
