const myDB = require('../db');
const Room = require('./room');
const gameContorller = require('./game-controller');
const Carder = require('./carder');

module.exports = function(){
    let that ={};

    
    let robot = undefined;
 

    that.getRobot = function (data){
        return robot;
    }



that.selectRobot = function(palyer,data,socket,room,cb){
 
    myDB.getPlayerInfoWithIsRobot(data,(err,robotmsg)=>{
        if(err){
            console.log(' robot.js ==>  db.js   查找机器人出现错误 = ' ,err);
        }else{
            if(cb){
                cb(null,robotmsg)
            }
        }
    })

};



const getPlayerWeigth = function (playerCardsList, buttonCardsList,  pushCards) {   //  获取手牌价值
    let weigth = 0;
    let playerCards =  JSON.parse(JSON.stringify(playerCardsList)); //  复制数组 
    let buttonCards =  JSON.parse(JSON.stringify(buttonCardsList)); //  复制数组 
    for(let i=0;i<buttonCards.length;i++){
        playerCards.push(buttonCards[i]);
    }

    let map = splitPlayerCards(playerCards,pushCards);

    //  炸弹
    if(map.kingBoom.length > 0){
        weigth = weigth + 14;
    }
    if(map.fourBoom.length > 0){
        weigth = weigth + 13;
    }

    //  飞机
    if(map.planeWithOne.length > 0){
        weigth = weigth + 12;
    }
    if(map.planeWithTow.length > 0){
        weigth = weigth + 11;
    }
    if(map.plane.length > 0){
        weigth = weigth + 10;
    }


    


    //  顺子
    if(map.doubleScroll.length > 0){
        weigth = weigth + 9;
    }
    if(map.scroll.length > 0){
        weigth = weigth + 8;
    }
    if(map.threeWithOne.length > 0){
        weigth = weigth + 7;
    }




    //  3张
    if(map.threeWithOne.length > 0){
        weigth = weigth + 6;
    }
    if(map.threeWithDouble.length > 0){
        weigth = weigth + 5;
    }
    if(map.threeCardsList.length > 0){
        weigth = weigth + 4;
    }



    //  对子
    if(map.doubleList.length > 0){
        weigth = weigth + 3;
    }
    if(map.solaList.length > 0){
        for(let i=0;i<map.solaList.length;i++ ){
            if(map.solaList[i].value === undefined){
                weigth = weigth + 2;
            }
            if(map.solaList[i].value === 13){
                weigth = weigth + 1;
            }
        }
       
    }
    
    return weigth;
};



 const splitPlayerCards = function(cards,PlayerPushCardList){

    let playerCards =  JSON.parse(JSON.stringify(cards)); //  复制数组  

    playerCards.sort((a, b) => {    //  排序
        return a.value - b.value;
    });
    console.log('拆分 ==> 玩家牌组 ==>  :' + JSON.stringify( playerCards))
   
    let weigth = 0;
    
    /**
     *    1.查看是否王炸，如果有则把王炸拆分出来（优先级:0）
     */

   let kBoom = getKingBoom(playerCards);
   let kingBoom = [];
    if(kBoom){
        let l = [];
        for(let i=0;i<kBoom.length;i++){
           l.push(kBoom[i]);
        }
        kingBoom.push(l);
      
        
        for(let i=0;i<playerCards.length;i++){
            
            if(playerCards[i].value === undefined){
                playerCards.splice(i,1);
                i--;
            }
        }
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
     *    3.查看是否能够组成三张，如果有则把飞机拆分出来（优先级:2）
     */
    let threeCardsList = getRepeatCardsList(3,playerCards);
    if(threeCardsList.length>0){
    
        let del;
        for(let i=0;i<playerCards.length;){
             del = false;
            for(let j=0;j<threeCardsList.length;j++){
                if(playerCards[i].value === threeCardsList[j][0].value){
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
        console.log('有单张 ==>' + threeCardsList.length+'个'); 
    }


    let solaList = getRepeatCardsList(1,playerCards)
    let newSola = [];
    for(let i in solaList){
        newSola.push(solaList[i][0]);
    }
    if(solaList.length > 0 ){
        for(let i=0;i<playerCards.length;){
            del = false;
           for(let j=0;j<solaList.length;j++){
               if(playerCards[i].value === solaList[j][0].value){
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

    }

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
    if(doubleList.length>0){

        let del;
        for(let i=0;i<playerCards.length;){
             del = false;
            for(let j=0;j<doubleList.length;j++){
                if(playerCards[i].value === doubleList[j][0].value){
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
        console.log('有对子 ==>' + doubleList.length+'个'); 
    }



    /**
     * 从单张中去除能够成为顺子的牌
     * 
     */
    let scroll = getScrollCardsList(solaList);


    if(scroll.length>0){
        for(let i=0,len=scroll.length;i<len;i++){
            newSola = newSola.filter(item => {
                let idList= scroll[i].map(v => v.value)
                return !idList.includes(item.value)
            })
        }
        
        console.log('位置 = >' + newSola)
        solaList = [];
        for(let i=0,len = newSola.length;i<len;i++){
            let l=[];
            l.push(newSola[i]);
            solaList.push(l);
        }
        // let del;
        // for(let i=0;i<solaList.length;){
        //      del = false;
        //     for(let j=0;j<scroll.length;j++){
        //         if(solaList[i].value === scroll[j][0].value){
        //                 solaList.splice(i,1);
        //                 del = true;
        //                 break ;
        //         }
        //     }
        //     if(del){
        //         i=0;
        //     }else{
        //         i++;
        //     }
        // }
        console.log('剩余 ==>' + playerCards.length+'张牌'); 
        console.log('有顺子' +scroll.length);
    }




    
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
    


    kingBoom, fourBoom,threeCardsList,solaList,doubleList,scroll,doubleScroll,
    threeWithOne,threeWithDouble,plane,planeWithOne,planeWithTow
    let map = {};
    
    map['kingBoom'] = kingBoom
    map['fourBoom'] = fourBoom
    map['threeCardsList'] = threeCardsList
    map['solaList'] = solaList
    map['doubleList'] = doubleList
    map['scroll'] = scroll
    map['doubleScroll'] = doubleScroll
    map['threeWithOne'] = threeWithOne
    map['threeWithDouble'] = threeWithDouble
    map['plane'] = plane
    map['planeWithOne'] = planeWithOne
    map['planeWithTow'] = planeWithTow

   
    

    // let value ;
 
    // if(cardsValue === undefined){
    //     value = 'no';
    // }else{
    //     value = cardsValue.name;
    // }
    // //  返回牌组
    // switch(value){
    //     case 'One' : 
    //          return solaList;   //  单张
    //     case 'Double' :
    //          return doubleList;  //  对子
    //     case 'Three' : 
    //          return threeCardsList;   //   三张
    //     case 'Boom' :
    //          return fourBoom;  //  4炸弹
    //     case 'ThreeWithOne' :
    //          return threeWithOne;  //  3带1
    //     case 'ThreeWithTwo' :
    //          return threeWithDouble;   //  3带对子
    //     case 'Plane' :
    //          return plane;     //  飞机
    //     case 'PlaneWithOne' :
    //          return planeWithOne;  //  飞机带单张
    //     case 'PlaneWithTwo' :
    //          return planeWithTow;  //  飞机带对子
    //     case 'Scroll' : 
    //          return scroll;  //  单顺
    //     case 'DoubleScroll' :
    //          return doubleScroll;  //  连对
    //     case 'FourWithOne' :
    //          return fourBoom;   //  4带1
    //     case 'FourWithTow' :
    //          return fourBoom;   //  4带对子

    //     default :
    //         let canPushCardsList = getCanPushCardsList(kingBoom, fourBoom,threeCardsList,
    //                                                     solaList,doubleList,scroll,doubleScroll,
    //                                                     threeWithOne,threeWithDouble,plane,planeWithOne,
    //                                                     planeWithTow);

    //     console.log('Robot 自动出牌数据 =》' + canPushCardsList)
    //     return canPushCardsList;
    // }

    return map;

};



const getTips = function (cards,cardsValue,PlayerPushCardList) {
    
    let map = splitPlayerCards(cards,PlayerPushCardList);
    console.log('数据 =>' + map.doubleList)

    for(let i in map){
        if(map[i] === undefined){
            map[i] = [];
        }
    }

    let value ;
   
    if(cardsValue === undefined){
        value = 'no';
    }else{
        value = cardsValue.name;
    }
    //  返回牌组
    switch(value){
        case 'One' : 
             return map.solaList;   //  单张
        case 'Double' :
             return map.doubleList;  //  对子
        case 'Three' : 
             return map.threeCardsList;   //   三张
        case 'Boom' :
             return map.fourBoom;  //  4炸弹
        case 'ThreeWithOne' :
             return map.threeWithOne;  //  3带1
        case 'ThreeWithTwo' :
             return map.threeWithDouble;   //  3带对子
        case 'Plane' :
             return map.plane;     //  飞机
        case 'PlaneWithOne' :
             return map.planeWithOne;  //  飞机带单张
        case 'PlaneWithTwo' :
             return planeWithTow;  //  飞机带对子
        case 'Scroll' : 
             return map.scroll;  //  单顺
        case 'DoubleScroll' :
             return map.doubleScroll;  //  连对
        case 'FourWithOne' :
             return map.fourBoom;   //  4带1
        case 'FourWithTow' :
             return map.fourBoom;   //  4带对子

        default :
            let canPushCardsList = getCanPushCardsList(map.kingBoom, map.fourBoom,map.threeCardsList,
                map.solaList,map.doubleList,map.scroll,map.doubleScroll,
                map.threeWithOne,map.threeWithDouble,map.plane,map.planeWithOne,
                map.planeWithTow);

        console.log('Robot 自动出牌数据 =》' + canPushCardsList)
        return canPushCardsList;
        }        
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

const getScrollCardsList = function (solaCards) {

    let cardList = [];
    let map = {};
    let cards =  JSON.parse(JSON.stringify(solaCards)); //  复制数组  
    for(let i=0 ; i <cards.length ;i++){
        if(cards[i][0].value === undefined || cards[i][0].value === 13){
            cards.splice(i,1);
            i--;
        }
    }
 
    for (let i = 0 ; i < cards.length ; i ++){
        if (!map.hasOwnProperty(cards[i][0].value)){
            cardList.push(cards[i][0]);
            map[cards[i][0].value] = true;
        }
    }

    cardList.sort((a, b)=>{
        return a.value - b.value;
    });

    

    let cardsList = [];
    let l=[];
    let count = 0;
    if(cards.length <5){
        return cardsList;
    }
    for(let i=0;i<cards.length -1;i++){
        count++;
        
        if (Math.abs(cards[i][0].value - cards[i+1][0].value) !== 1){
            
            if(count >= 5){
                for(let j=i- count + 1; j<= i; j++){
                    l.push(cards[j][0]);
                }
                cardsList.push(l);
                count = 0;
                l=[];
            }
            count = 0;
            
        }

        if(i+1 === cards.length - 1 && count >= 4){
            for(let j=i- count + 1; j<= i + 1; j++){
                l.push(cards[j][0]);
            }
            cardsList.push(l);
            count = 0;
            l=[];
        }
    }




    return cardsList;
};





const getDoubleScorllCardsList = function (Dcards) { //  获取双顺子

    let map = {};
    let groupList = [];
    let cards =  JSON.parse(JSON.stringify(Dcards)); //  复制数组  

    if(cards.length === 0 ){
        return  groupList;
    }

    for(let i in cards){
        if(cards[i].value === undefined || cards[i].value === 13){
            cards.splice(i,1);
        }
    }

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


    
    let count = 0;
    let l=[];
    for(let i = 0, len = list.length - 1; i<len ; i++){
        count++;
        // console.log(Math.abs(Number(list[i][0].value) - Number(list[i+1][0].value)) !== 1   )
        if ( Math.abs(Number(list[i][0].value) - Number(list[i+1][0].value)) !== 1   ){
            
    
            if(count>=3){
                for(let j=i-count + 1,len = i + 1 ;j < len ;j++){
                    for(let k in list[j]){
                        l.push(list[j][k])
                    }
                }
                groupList.push(l);
                l=[];
                count = 0;
            }
            count = 0;

        }

        if(i+1 === list.length - 1 && count >= 2){
            for(let j=i- count + 1; j<= i + 1; j++){
                for(let k in list[j]){
                    l.push(list[j][k])
                }
            }
            groupList.push(l);
            count = 0;
            l=[];
        }
    }

    console.log('所有的连对对子' + groupList)
    return groupList;
};





const getThreeWithOne = function (three, one) {
    let threeCards = JSON.parse(JSON.stringify(three)); //  复制数组  
    
    let oneCards = JSON.parse(JSON.stringify(one));//  复制数组  
    let list = [];
    if(threeCards.length === 0 || oneCards.length === 0){
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
    if(threeCards.length === 0 || DoubleCards.length === 0){
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
        console.log('飞机');
        let cardsList = [];
        let list = getRepeatCardsList(3,cards);

        if(list.length < 1 ){
            console.log('没有飞机，返回 []')
            return cardsList;
        }



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
               
                for (let j = cont ; j <i + cont  ; j++){
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
                    
                    if(l.length>=6){
                        cont = i+1;
                        tempCardsList.push(l);
                        l = [];
                    }else{
                        cont = i+1;
                        l = [];
                     
                    }
                }
                

            }
        }
       
        if(cardsA !== undefined ){
           
            for (let i = 0 ; i < tempCardsList.length ; i ++){
                let valueB = getPlaneMinValue(tempCardsList[i]);
                if (valueB > num){
                    cardsList.push(tempCardsList[i]);
                }
            }


        }else{
            if(tempCardsList.length !== 0){
                cardsList.push(tempCardsList[0])
            }
            
        }
        console.log('飞机数据 =》' + cardsList)
        return cardsList;
    };


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
            console.log('飞机数据带单 =》' + list)
            return list;
    

        
    };



    const getPlaneWithTow = function(myCards,myDoubleList,PlayerPushCardList){ //  飞机带单
        let list = [];
        if(myDoubleList.length === 0 || myCards.length === 0 ){
            return list;
        }
 
        
        let doubleList =  JSON.parse(JSON.stringify(myDoubleList)); //  复制数组  
        let cards =  JSON.parse(JSON.stringify(myCards)); //  复制数组 
        
        let cardsNum = cards[0].length / 3;
        if(myCards.length<2){
            return list;
        }
        
        if(doubleList.length >= myCards.length){
            for(let i=0;i<myCards.length;i++){
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
  
  
    
    if( scroll.length !== 0){   //  单顺
        console.log('robot 自动出顺子牌 =》' +JSON.stringify(scroll) )
        return  scroll;
    }


    if( doubleScroll.length !== 0){     //  双顺
        console.log('robot 自动出双顺牌 =》' +JSON.stringify(solaList) )
        return  doubleScroll;
    }

    if( planeWithOne.length !== 0){     //  飞机带单张
        console.log('robot 自动出飞机带单牌 =》' +JSON.stringify(solaList) )
        return  planeWithOne;
    }

    if(  planeWithTow.length !== 0){     //  飞机带对子
        console.log('robot 自动出飞机带对子出牌 =》' +JSON.stringify(solaList) )
        return  planeWithTow;
    }

    if( plane.length !== 0){        //  飞机
        console.log('robot 自动出飞机不带牌 =》' +JSON.stringify(plane) )
        return  plane;
    }

    if( threeWithOne.length !== 0){     //  三带单
        console.log('robot 自动出三带一牌 =》' +JSON.stringify(solaList) )
        return  threeWithOne;
    }
    if( threeWithDouble.length !== 0){      //  三带对子
        console.log('robot 自动出三带对子牌 =》' +JSON.stringify(solaList) )
        return  threeWithDouble;
    }

    if( threeCardsList.length !== 0){   //  三张
        console.log('robot 自动出三张不带牌 =》' +JSON.stringify(solaList) )
        return  threeCardsList;
    }

    if( doubleList.length !== 0){   //  对子
        console.log('robot 自动出对子牌 =》' +JSON.stringify(solaList) )
        return  doubleList;
    }

    if( solaList.length !== 0){     //  单张
        console.log('robot 自动出单张牌 =》' +JSON.stringify(solaList) )
        return  solaList;
    }

    if( fourBoom.length !== 0){ //  炸弹
        console.log('robot 自动出普通炸弹牌 =》' +JSON.stringify(solaList) )
        return  fourBoom;
    }

    if( kingBoom.length !== 0){ //  火箭
        console.log('robot 自动出王炸牌 =》' +JSON.stringify(solaList) )
        return  kingBoom;
    }
};


that.spliceCards = splitPlayerCards;    //  机器人牌型拆分

that.robotTips = getTips;   //  获取出牌提示

that.getweigth = getPlayerWeigth;   //  获取价值
return that;

}

