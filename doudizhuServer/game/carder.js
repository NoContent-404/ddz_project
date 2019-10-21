const Card = require('./card');
const CardValue = {
    "A": 12,
    "2": 13,
    "3": 1,
    "4": 2,
    "5": 3,
    "6": 4,
    "7": 5,
    "8": 6,
    "9": 7,
    "10": 8,
    "J": 9,
    "Q": 10,
    "K": 11
};
// 黑桃：spade
// 红桃：heart
// 梅花：club
// 方片：diamond
const CardShape = {
    "S": 1,
    "H": 2,
    "C": 3,
    "D": 4
};
const Kings = {
    "k": 14,
    "K": 15
};
module.exports = function () {
    let that = {};
    let _cardList = [];
    const createCards = function () {
        let cardList = [];
        for (let i in CardValue) {  //  循环点数
            for (let j in CardShape) {  //  循环花色
                let card = Card(CardValue[i], CardShape[j], 0);
                card.id = cardList.length;
                cardList.push(card);

            }
        }
        for (let i in Kings) {
            let card = Card(undefined, undefined, Kings[i]);
            card.id = cardList.length;
            cardList.push(card);
        }
        cardList.sort((a, b) => {
            return (Math.random() > 0.5) ? -1 : 1;
        });
        // for (let i = 0; i < cardList.length; i++) {
        //     console.log('card id = ' + cardList[i].id);
        // }
        return cardList;

    };


   

    that.getThreeCards = function () {  //  发牌
        let threeCardsMap = {};
        _cardList = createCards();
        for (let i = 0; i < 17; i++) {
            for (let j = 0; j < 3; j++) {
                if (threeCardsMap.hasOwnProperty(j)) {
                    threeCardsMap[j].push(_cardList.pop());
                } else {
                    threeCardsMap[j] = [_cardList.pop()];
                }
            }
        }

        //  测试牌组
        let cardList = [
            Card(CardValue['3'], CardShape.C),
            Card(CardValue['3'], CardShape.C),
            Card(CardValue['3'], CardShape.C),
            Card(CardValue['3'], CardShape.C),
            Card(CardValue['5'], CardShape.C),
            Card(CardValue['5'], CardShape.C),
            Card(CardValue['5'], CardShape.C),
            Card(CardValue['5'], CardShape.C),
            Card(CardValue['7'], CardShape.C),
            Card(CardValue['7'], CardShape.C),
            Card(CardValue['8'], CardShape.C),
            Card(CardValue['8'], CardShape.C),
            Card(CardValue['9'], CardShape.C),
            Card(CardValue['9'], CardShape.C),
            Card(CardValue['10'], CardShape.C),
            Card(CardValue['J'], CardShape.C),
            // Card(CardValue['J'], CardShape.C),
            Card(undefined, undefined, Kings.k),
            // Card(undefined, undefined, Kings.K),

        ];



        let cardListA = [
            Card(CardValue['3'], CardShape.C),
            Card(CardValue['3'], CardShape.C),
            Card(CardValue['3'], CardShape.C),
            Card(CardValue['3'], CardShape.C),
            Card(CardValue['5'], CardShape.C),
            Card(CardValue['5'], CardShape.C),
            Card(CardValue['5'], CardShape.C),
            Card(CardValue['5'], CardShape.C),
            Card(CardValue['10'], CardShape.C),
            Card(CardValue['Q'], CardShape.C),
            Card(CardValue['K'], CardShape.C),
            Card(CardValue['K'], CardShape.C),
            Card(CardValue['A'], CardShape.C),
            Card(CardValue['A'], CardShape.C),
            Card(CardValue['2'], CardShape.C),
            Card(CardValue['2'], CardShape.C),
            // Card(CardValue['J'], CardShape.C),
            Card(undefined, undefined, Kings.k),
            // Card(undefined, undefined, Kings.K),

        ];
        for (let i = 0; i < threeCardsMap[0].length; i++) {
            let id = threeCardsMap[0][i].id;
            cardList[i].id = id;
            threeCardsMap[0][i] = cardList[i]
        }
        for (let i = 0; i < threeCardsMap[1].length; i++) {
            let id = threeCardsMap[1][i].id;
            cardListA[i].id = id;
            threeCardsMap[1][i] = cardListA[i]
        }

        
        return [threeCardsMap[0], threeCardsMap[1], threeCardsMap[2], _cardList];
    };


    //  逻辑
    const isOneCard = function (cardList) { //  是否为单张
        if (cardList.length === 1) {
            return true;
        }
        return false;
    };
    const isDouble = function (cardList) {  //  是否为对子
        if (cardList.length === 2) {
            if (cardList[0].value !== undefined && cardList[0].value === cardList[1].value) {
                return true;
            }
        }
        return false;
    };

    const isThree = function (cardList) {   //  是否为三张
        if (cardList.length === 3) {

            let map = {};
            for (let i = 0; i < cardList.length; i++) {
                if (map.hasOwnProperty(cardList[i].value)) {
                    map[cardList[i].value]++;
                } else {
                    map[cardList[i].value] = 1;
                }
            }
            if (map[cardList[0].value] === 3) {
                return true;
            }


        }

        return false;
    };
    const isKingBoom = function (cardList) {    //  是否为王炸
        if (cardList.length !== 2){
            return false;
        }

        if (cardList[0].king !== undefined && cardList[1].king !== undefined) {
            return true;
        }
        return false;
    };
    const isFourBoom = function (cardList) {    //  是否为4炸
        if (cardList.length === 4) {
            let map = {};
            for (let i = 0; i < cardList.length; i++) {
                if (map.hasOwnProperty(cardList[i].value)) {
                    map[cardList[i].value]++;
                } else {
                    map[cardList[i].value] = 1;
                }
            }
            if (map[cardList[0].value] === 4) {
                return true;
            }
        }
        return false;
    };

    const isBoom = function (cardList) {    //  是否为炸弹
        if (isKingBoom(cardList)) {
            return true;
        }
        if (isFourBoom(cardList)) {
            return true;
        }
        return false;
    };
    const isThreeWithOne = function (cardList) {    //  是否3带单张
        console.log('card list =' + JSON.stringify(cardList));
        if (cardList.length === 4) {
            let map = {};
            for (let i = 0; i < cardList.length; i++) {
                let key = -1;
                if (cardList[i].value === undefined) {
                    key = cardList[i].king;
                } else {
                    key = cardList[i].value;
                }

                console.log('key = ' + key);
                if (map.hasOwnProperty(key)) {
                    map[key]++;
                } else {
                    map[key] = 1;
                }

            }
            let count = 0;  //  记录map中的个数
            let maxNum = -1;    //  记录map中的最大值
            for (let i in map) {
                count++;
                if (maxNum < map[i]) {
                    maxNum = map[i];
                }
            }
            if (count === 2 && maxNum === 3) {  
                return true;
            }

        }
        return false;
    };

    const isThreeWithTwo = function (cardList) {    //  是否3带2
        if (cardList.length === 5) {
            let map = {};
            for (let i = 0; i < cardList.length; i++) {
                let key = -1;
                if (cardList[i].value === undefined) {
                    key = cardList[i].king;
                } else {
                    key = cardList[i].value;
                }

                if (map.hasOwnProperty(key)) {
                    map[key]++;
                } else {
                    map[key] = 1;
                }
            }
            // map = {
            //     '4': 4,
            //     '1': 1
            // }
            let count = 0;
            let maxNum = -1;
            for (let i in map) {
                count++;
                if (maxNum < map[i]) {
                    maxNum = map[i];
                }
            }
            if (count === 2 && maxNum === 3) {
                return true;
            }

        }
        return false;
    };

    const isPlane = function (cardList) {   //  是否飞机
        console.log('card list length = ' + cardList.length);
        if (cardList.length > 5) {
            let map = {};
            for (let i = 0; i < cardList.length; i++) {
                if (map.hasOwnProperty(cardList[i].value)) {
                    map[cardList[i].value]++;
                } else {
                    map[cardList[i].value] = 1;
                }
            }
            // 333444
            // map{
                // 1：3，
                // 2：3
            // }

            // 333777
            // map{
                // 1：3，
                // 5：3
            // }
            let keys = Object.keys(map);
            // keys = {0：1，1：2}
            // keys = {0：1，1：5}
            console.log('map =' + JSON.stringify(map));
            if (keys.length > 1) {
                for (let i in map) {
                    if (map[i] !== 3) {
                        return false;
                    }
                }


                if (Math.abs(Number(keys[0]) - Number(keys[1])) === 1) {    // 判断是否连着的
                    return true;
                }

            } else {
                return false;
            }
        }

        // {
        //     '3': 3,
        //     '5': 3
        // }

        return false;
    };

    const isPlaneWithOne = function (cardList) {    //  是否飞机带单张
        if (cardList.length > 7) {
            let map = {};
            for (let i = 0; i < cardList.length; i++) { 
                let key = -1;
                if (cardList[i].king === undefined) {
                    key = cardList[i].value;
                } else {
                    key = cardList[i].king;
                }
                if (map.hasOwnProperty(key)) {  //  是否重复
                    map[key]++;
                } else {
                    map[key] = 1;
                }
            }

            console.log('map = ' + JSON.stringify(map));

            let keys = Object.keys(map);
            if (keys.length < 2 ) { 
                // let threeCount = 0;
                console.log('key 的长度不为3/4');
                return false;
            }

            let oneCount = 0;   //  记录单张个数
            let towCount = 0;
            let threeList = []; //  记录3张
            for (let i in map) {
                if (map[i] === 3) {
                    threeList.push(i);
                    // threeCount ++;
                }
                if (map[i] === 1) {
                    oneCount++;
                }
                if (map[i] === 2) {
                    towCount++;
                }
            }
            console.log('one count = ' + oneCount);
            console.log('three list = ' + JSON.stringify(threeList));
            if (threeList.length < 2 || (oneCount <2 && towCount !== 1)  || towCount === 2  ) {
                return false;
            }
            if (Math.abs(Number(threeList[0]) - Number(threeList[1])) === 1) {
                return true;
            }
        }
        console.log('length not 8');
        return false;
    };
    const isPlaneWithTwo = function (cardList) {    //  飞机带对子
        if (cardList.length > 9) {
            let map = {};
            for (let i = 0; i < cardList.length; i++) {
                let key = -1;
                if (cardList[i].king === undefined) {
                    key = cardList[i].value;
                } else {
                    key = cardList[i].king;
                }
                if (map.hasOwnProperty(key)) {
                    map[key]++;
                } else {
                    map[key] = 1;
                }
            }

            // {
            //     '3': 3,
            //     '4': 3,
            //     '5': 2,
            //     '6': 2
            // }
            let keys = Object.keys(map);
            if (keys.length < 3) {
                return false;
            }
            let twoCount = 0;   //  记录对子出现次数
            let threeList = []; //  记录3张
            for (let i in map) {    
                if (map[i] === 3) {
                    threeList.push(i);
                    // threeCount ++;
                }
                if (map[i] === 2) {
                    twoCount++;
                }
            }
            if (threeList.length < 2 || twoCount < 2) {
                return false;
            }
            for(let i = 0;i<threeList.length - 1 ; i++){
                if (Math.abs(Number(threeList[i]) - Number(threeList[i+1])) !== 1) {
                    return false;
                }
            }
            return true;


        }
        return false;
    };
    const isScroll = function (cardList) {  //  是否顺子
        if (cardList.length >= 5) { 
            cardList.sort((a, b) => {
                return a.value - b.value;
            });
            for (let i = 0; i < (cardList.length - 1); i++) {   //  验证是否为顺子
                if (Math.abs(cardList[i].value - cardList[i + 1].value) !== 1) {
                    return false;
                }
            }
            return true;
        }
        return false;
    };
    const isDoubleScroll = function (cardList) {    //  是否双顺子
        if (cardList.length >= 6) {
            let map = {};
            for (let i = 0; i < cardList.length; i++) {
                if (map.hasOwnProperty(cardList[i].value)) {
                    map[cardList[i].value]++;
                } else {
                    map[cardList[i].value] = 1;
                }
            }
            // {
            //     '3': 2,
            //     '4': 2,
            //     '5': 2
            // }
            for (let i in map) {
                if (map[i] !== 2) {
                    return  false;
                }
            }
            let keys = Object.keys(map);

            keys.sort((a, b) => {
                return Number(a) - Number(b);
            });
            for (let i = 0; i < (keys.length - 1); i++) {
                if (Math.abs(Number(keys[i]) - Number(keys[i + 1])) !== 1) {
                    return false;
                }
            }
            return true;

        }
        return false;
    };



    const isFourWithOne = function (cardList) {    //  是否4带单张
        if (cardList.length >= 5) {
            let map = {};
            for (let i = 0; i < cardList.length; i++) {
                if (map.hasOwnProperty(cardList[i].value)) {
                    map[cardList[i].value]++;
                } else {
                    map[cardList[i].value] = 1;
                }
            }
            // {
            //     '3': 2,
            //     '4': 2,
            //     '5': 2
            // }
            
            let oneCount = 0;   //  记录单张个数
            let towCount = 0;   //  记录对子个数
            let fourCount = 0;   //  记录单张个数
            let keys = Object.keys(map);
            if (keys.length <2) {
                return false;
            }

            for (let i in map) {
                if (map[i] === 4){
                    fourCount++;
                } 
                if(map[i] === 2){
                    towCount++;
                }
                if(map[i] ===1) {
                    oneCount++;
                }
            }

            
            if(fourCount === 1 && (oneCount === 2 || oneCount === 1) && towCount === 0|| (fourCount === 1 && towCount === 1 && oneCount === 0)){
                return true;
            }else{
                return false;
            }
            // return true;

        }
        return false;
    };




    const isFourWithTow = function (cardList) {    //  是否4带2对子
        if (cardList.length >= 5) {
            let map = {};
            for (let i = 0; i < cardList.length; i++) {
                if (map.hasOwnProperty(cardList[i].value)) {
                    map[cardList[i].value]++;
                } else {
                    map[cardList[i].value] = 1;
                }
            }
            // {
            //     '3': 2,
            //     '4': 2,
            //     '5': 2
            // }
            
            let TowCount = 0;   //  记录单张个数
            let fourCount = 0;   //  记录单张个数
            let keys = Object.keys(map);
            if (keys.length <2) {
                return false;
            }

            for (let i in map) {
                if (map[i] === 4){
                    fourCount++;
                } 
                if(map[i] === 2){
                    TowCount++;
                }
             
            }

            if(fourCount === 2){
                return  true;
            }
            if(fourCount === 1 && TowCount === 2){
                return true;
            }else{
                return false;
            }
            // return true;

        }
        return false;
    };













    const CardsValue = {
        'one': {
            name: 'One',
            value: 1
        },
        'double': {
            name: 'Double',
            value: 1
        },
        'three': {
            name: 'Three',
            value: 1
        },
        'boom': {
            name: 'Boom',
            value: 2
        },
        'threeWithOne': {
            name: 'ThreeWithOne',
            value: 1
        },
        'threeWithTwo': {
            name: 'ThreeWithTwo',
            value: 1
        },
        'plane': {
            name: 'Plane',
            value: 1
        },
        'planeWithOne': {
            name: 'PlaneWithOne',
            value: 1
        },
        'planeWithTwo': {
            name: 'PlaneWithTwo',
            value: 1
        },
        'scroll': {
            name: 'Scroll',
            value: 1
        },
        'doubleScroll': {
            name: 'DoubleScroll',
            value: 1
        },
        'fourWithOne': {
            name: 'FourWithOne',
            value: 1
        },
        'fourWithTow': {
            name: 'FourWithTow',
            value: 1
        }


    };


    const getCardsValue = function (cardList) {
        // return true;
        if (isOneCard(cardList)) {
            console.log('单张牌');
            return CardsValue.one;
        }
        if (isDouble(cardList)) {
            console.log('一堆牌');
            return CardsValue.double;
        }
        if (isThree(cardList)) {
            console.log('三张牌');
            return CardsValue.three;
        }
        if (isBoom(cardList)) {
            console.log('是否是炸弹');
            return CardsValue.boom;
        }
        if (isThreeWithOne(cardList)) {
            console.log('三带一');
            return CardsValue.threeWithOne;
        }
        if (isThreeWithTwo(cardList)) {
            console.log('三带二');
            return CardsValue.threeWithTwo;
        }
        if (isPlane(cardList)) {
            console.log('飞机');
            return CardsValue.plane;
        }
        if (isPlaneWithOne(cardList)) {
            console.log('飞机带翅膀');
            return CardsValue.planeWithOne;
        }
        if (isPlaneWithTwo(cardList)) {
            console.log('飞机带双翅膀');
            return CardsValue.planeWithTwo;
        }
        if (isScroll(cardList)) {
            console.log('顺子');
            return CardsValue.scroll;
        }
        if (isDoubleScroll(cardList)) {
            console.log('连队');
            return CardsValue.doubleScroll;
        }
        if (isFourWithOne(cardList)) {
            console.log('四带一');
            return CardsValue.fourWithOne;
        }
        if (isFourWithTow(cardList)) {
            console.log('四带二');
            return CardsValue.fourWithTow;
        }


        return false;
    };
    that.isCanPushCards = getCardsValue;


    const getOneCardValue = function (card) {   //  获取单张牌的点数
        let value = 0;
        if (card.value === undefined) {
            value = card.king;
        } else {
            value = card.value;
        }
        return value;
    };

    that.compareOne = function (a, b) { //  比较单张牌的大小
        console.log('对比单张牌型的大小');
        let valueA = getOneCardValue(a[0]);
        let valueB = getOneCardValue(b[0]);
        console.log('value a= ' + valueA);
        console.log('value b = ' + valueB);

        if (valueA > valueB) {
            return true;
        }
        return false;
    };
    that.compareDouble = that.compareOne;

    that.compareThree = that.compareOne;

   
    that.compareBoom = function (a, b) {    //  比较4炸弹
        if (a.length === 4 && b.length === 4) {
            return that.compareOne(a, b);
        } else {
            if (a.length < b.length) {
                return true;
            }
        }
        return false;
    };

    that.compareThreeWithOne = function (a, b) {    //  比较3带单张
        let listA = [];
        let listB = [];
        let mapA = {};
        // 3,3,3,4,4
        for (let i = 0; i < a.length; i++) {
            if (mapA.hasOwnProperty(a[i].value)) {
                listA.push(a[i]);
            } else {
                mapA[a[i].value] = 1;
            }
        }
        mapA = {};
        for (let i = 0; i < b.length; i++) {
            if (mapA.hasOwnProperty(b[i].value)) {
                listB.push(b[i]);
            } else {
                mapA[b[i].value] = 1;
            }
        }
        return that.compareThree(listA, listB);

    };
    
    that.compareThreeWithTwo = function (a, b) {
        let mapA = {};
        let mapB = {};
        // 3,3,3,4,4
        for (let i = 0; i < a.length; i++) {
            if (mapA.hasOwnProperty(a[i].value)) {
                mapA[a[i].value].push(a[i]);
            } else {
                mapA[a[i].value] = [a[i]];
            }
        }
        for (let i = 0; i < b.length; i++) {
            if (mapB.hasOwnProperty(b[i].value)) {
                mapB[b[i].value].push(b[i]);
            } else {
                mapB[b[i].value] = [b[i]];
            }
        }


        let listA = [];
        for (let i in mapA) {
            if (mapA[i].length === 3) {
                listA = mapA[i];
            }
        }

        let listB = [];
        for (let i in mapB) {
            if (mapB[i].length === 3) {
                listB = mapB[i];
            }
        }

        return that.compareThree(listA, listB);
    };


    that.compareFourWithOne = function (a, b) {    //  比较4带单张
        let listA = [];
        let listB = [];
        let mapA = {};
        // 3,3,3,4,4
        for (let i = 0; i < a.length; i++) {
            if (mapA.hasOwnProperty(a[i].value)) {
                listA.push(a[i]);
            } else {
                mapA[a[i].value] = 1;
            }
        }
        mapA = {};
        for (let i = 0; i < b.length; i++) {
            if (mapA.hasOwnProperty(b[i].value)) {
                listB.push(b[i]);
            } else {
                mapA[b[i].value] = 1;
            }
        }
        return that.compareThree(listA, listB);

    };




    that.comparePlane = function (a, b) {   //  比较飞机
        //33,44 5,6  44,55,7,8
        let mapA = {};
        for (let i = 0; i < a.length; i++) {
            if (mapA.hasOwnProperty(a[i].value)) {
                mapA[a[i].value].push(a[i]);
            } else {
                mapA[a[i].value] = [a[i]];
            }
        }
        // {
        //     '3': [card, card],
        //     '4': [card, card]
        // }
        let listA = [];
        let maxNum = 10;
        for (let i in mapA) {
            if (Number(i) < maxNum) {
                maxNum = Number(i);
                listA = mapA[i];
            }
        }
        // {
        //     '3': 1,
        //     '4': 1,
        //     '5': 3,
        //     '6': 3
        // }

        let mapB = {};
        for (let i = 0; i < b.length; i++) {
            if (mapB.hasOwnProperty(b[i].value)) {
                mapB[b[i].value].push(b[i]);
            } else {
                mapB[b[i].value] = [b[i]];
            }
        }
        maxNum = 10;
        let listB = [];
        for (let i in mapB) {
            if (Number(i) < maxNum) {
                maxNum = Number(i);
                listB = mapB[i];
            }
        }
        return that.compareThree(listA, listB);
    };
    that.comparePlaneWithOne = function (a, b) {    //  比较飞机带单张
        let mapA = {};
        //3,3,3,4,4,4,5,6
        let listA = [];
        for (let i = 0; i < a.length; i++) {
            if (mapA.hasOwnProperty(a[i].value)) {
                listA.push(a[i]);
            } else {
                mapA[a[i].value] = [a[i]];
            }
        }
        let mapB = {};
        let listB = [];
        for (let i = 0; i < b.length; i++) {
            if (mapB.hasOwnProperty(b[i].value)) {
                listB.push(b[i]);
            } else {
                mapB[b[i].value] = [b[i]];
            }
        }


        return that.comparePlane(listA, listB);

    };
    that.comparePlaneWithTwo = function (a, b) {    //  比较飞机带对子
        //3,3,3,4,4,4,5,5,6,6
        let mapA = {};
        for (let i = 0; i < a.length; i++) {
            if (mapA.hasOwnProperty(a[i].value)) {
                mapA[a[i].value].push(a[i]);
            } else {
                mapA[a[i].value] = [a[i]];
            }
        }
        let mapB = {};
        for (let i = 0; i < b.length; i++) {
            if (mapB.hasOwnProperty(b[i].value)) {
                mapB[b[i].value].push(b[i]);
            } else {
                mapB[b[i].value] = [b[i]];
            }
        }

        // {
        //     '3': [card, card, card],
        //     '4': [card, card, card],
        //     '5': [card, card],
        //     '6': [card, card]
        // }

        console.log('map a' + JSON.stringify(mapA));
        console.log('map b' + JSON.stringify(mapB));

        let listA = [];
        for (let i in mapA) {
            if (mapA[i].length === 3) {
                for (let j = 0; j < mapA[i].length; j++) {
                    listA.push(mapA[i][j]);
                }
            }
        }
        console.log('list a = ' + JSON.stringify(listA));

        let listB = [];
        for (let i in mapB) {
            if (mapB[i].length === 3) {
                for (let j = 0; j < mapB[i].length; j++) {
                    listB.push(mapB[i][j]);
                }
            }
        }
        console.log('list b = ' + JSON.stringify(listB));

        return that.comparePlane(listA, listB);

    };
    that.compareScroll = function (a, b) {  //  比较顺子
        console.log('a length = ' + a.length);
        console.log('b length =' + b.length);
        if (a.length === b.length) {

            let minNumA = 1000;
            for (let i = 0; i < a.length; i++) {
                if (a[i].value < minNumA) {
                    minNumA = a[i].value
                }
            }
            let minNumB = 1000;
            for (let i = 0; i < b.length; i++) {
                if (b[i].value < minNumB) {
                    minNumB = b[i].value;
                }
            }

            console.log('min a = ' + minNumA);
            console.log('min b = ' + minNumB);
            if (minNumA <= minNumB) {
                return false;
            }


        } else {
            return '不合适的牌形';
        }
        return true;
    };
    that.compareDoubleScroll = function (a, b) {    //  比较双顺子
        let mapA = {};
        let listA = [];
        for (let i = 0; i < a.length; i++) {
            if (mapA.hasOwnProperty(a[i].value)) {

            } else {
                mapA[a[i].value] = true;
                listA.push(a[i]);
            }
        }

        let mapB = {};
        let listB = [];
        for (let i = 0; i < b.length; i++) {
            if (mapB.hasOwnProperty(b[i].value)) {

            } else {
                mapB[b[i].value] = true;
                listB.push(b[i]);
            }
        }
        console.log('list a = ' + JSON.stringify(listA));
        console.log('list b = ' + JSON.stringify(listB));

        return that.compareScroll(listA, listB);
    };

    /***************************************    比较牌型    ************************************ */
    
    that.compare = function (a, b) {    //  比较牌型
        // return false;

        let cardsValueA = getCardsValue(a);
        let cardsValueB = getCardsValue(b);
        if (cardsValueA.value > cardsValueB.value) {
            return true;
        } else if (cardsValueA.value === cardsValueB.value) {

            if (cardsValueA.name === cardsValueB.name) {

                let str = 'compare' + cardsValueA.name;
                console.log('str = ' + str);

                let method = that[str];

                let result = method(a, b);
                if (result === true) {
                    return true;
                } else {
                    return '不合适牌型';
                }
                // return method(a,b);
                // let result = method(a, b)
                // if (result === true) {
                //     return result;
                // }else {
                //     return ''
                // }

            } else {
                return '不合适牌型';
            }
        }
        return '你的牌太小了';

    };

     /***************************************    end    ************************************ */




    const getCardListWithStart = function (start, cards) {
        //单牌提示方法，从某个值开始 获取剩下的牌的列表的组合
        console.log('start = ' + start);
        cards.sort((a, b) => {
            return a.value - b.value;
        });
        console.log('cards')
        let list = [];
        for (let i = 0; i < cards.length; i++) {
            let key = -1;
            if (cards[i].king === undefined) {
                key = cards[i].value;
            } else {
                key = cards[i].king;
            }
            if (key > start) {
                list.push(cards[i]);
            }
        }
        let map = {};
        for (let i = 0; i < list.length; i++) {
            let key = -1;
            if (list[i].king === undefined) {
                key = list[i].value;
            } else {
                key = list[i].king;
            }
            if (map.hasOwnProperty(key)) {

            } else {
                map[key] = [list[i]];
            }
        }

        return map;

    };

    const getKingBoom = function (cardList) {
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
        // [[2,2],[1,1]]
        console.log('list = ' + JSON.stringify(list));

        return list;

    };
    const getFourBoom = function (cardList) {   //  获取4炸
        let list = getRepeatCardsList(4, cardList);
        console.log('get four boom  = ' + JSON.stringify(list));
        if (list.length === 0) {
            return false;
        }
        return list;
    };
    that.tipsOne = function (cardsA, cardsB) {  //  提示单张
        let map = getCardListWithStart(cardsA[0].value, cardsB);
        let list = [];
        for (let i in map) {
            list.push(map[i]);
        }
        let kingBoom = getKingBoom(cardsB);
        if (kingBoom !== false) {
            list.push(kingBoom);
        }
        let fourBoomList = getFourBoom(cardsB);
        if (fourBoomList !== false) {
            // list.push(fourBoom);
            for (let i = 0; i < fourBoomList.length; i++) {
                list.push(fourBoomList[i]);
            }
        }
        console.log('tips one list = ' + JSON.stringify(list));
        return list;
    };

    that.tipsDouble = function (cardsA, cardsB) {   //  提示对子

        let list = getRepeatCardsList(2, cardsB);
        let cardsList = [];
        for (let i = 0; i < list.length; i++) {
            if (list[i][0].value > cardsA[0].value) {
                cardsList.push(list[i]);
            }
        }
        console.log('cards list = ' + JSON.stringify(cardsList));
        let kingBoom = getKingBoom(cardsB);
        if (kingBoom !== false) {
            cardsList.push(kingBoom);
        }
        let fourBoomList = getFourBoom(cardsB);
        if (fourBoomList !== false) {
            // cardsList.push(fourBoom);
            for (let i = 0; i < fourBoomList.length; i++) {
                cardsList.push(fourBoomList[i]);
            }
        }
        return cardsList;
    };

    that.tipsThree = function (cardsA, cardsB) {    //  提示三张
        let list = getRepeatCardsList(3, cardsB);
        console.log('list = ' + JSON.stringify(list));
        let cardsList = [];
        for (let i = 0; i < list.length; i++) {
            if (list[i][0].value > cardsA[0].value) {
                cardsList.push(list[i]);
            }
        }
        let kingBoom = getKingBoom(cardsB);
        if (kingBoom !== false) {
            cardsList.push(kingBoom);
        }
        let fourBoomList = getFourBoom(cardsB);
        if (fourBoomList !== false) {
            // cardsList.push(fourBoom);
            for (let i = 0; i < fourBoomList.length; i++) {
                cardsList.push(fourBoomList[i]);
            }
        }
        console.log('tips three cards list = ' + JSON.stringify(cardsList));
        return cardsList;
    };

    that.tipsBoom = function (cardsA, cardsB) { //  提示炸弹
        let cardsList = [];
        if (cardsA.length === 2) {
            return cardsList;
        } else {
            let list = getRepeatCardsList(4, cardsB);
            for (let i = 0; i < list.length; i++) {
                if (list[i][0].value > cardsA[0].value) {
                    cardsList.push(list[i]);
                }
            }
        }

        let result = getKingBoom(cardsB);
        if (result !== false) {
            cardsList.push(result);
        }

        return cardsList;
    };
    const getRepeatValue = function (num, cardList) {   //  获取重复的值
        let map = {};
        for (let i = 0; i < cardList.length; i++) {
            if (map.hasOwnProperty(cardList[i].value)) {
                map[cardList[i].value].push(cardList[i]);
            } else {
                map[cardList[i].value] = [cardList[i]];
            }
        }
        for (let i in map){
            if (map[i].length === num){
                return Number(i);
            }
        }
    };
    
    const getThreeWithNumCardsList = function (num, cardsA, cardsB) {   //  提示3带1
        let valueA = getRepeatValue(3,cardsA);  //  返回   卡牌的 value
        console.log('value a = ' + valueA);
        let list = getRepeatCardsList(3, cardsB);
        let cardList = [];
        for (let i = 0 ; i < list.length ; i ++){
            if (list[i][0].value > valueA){
                cardList.push(list[i]);
            }
        }

        let oneList = getRepeatCardsList(num, cardsB);//    获取单或者对子
        let minNum = 100;
        let oneCard = undefined;
        for (let i = 0 ; i < oneList.length ; i ++){
            if (oneList[i][0].value < minNum){
                minNum = oneList[i][0].value;
                oneCard = oneList[i];
            }
        }
        for (let i = 0 ; i < cardList.length ; i ++){
            let l = cardList[i];
            if (oneCard !== undefined){
                for (let j = 0 ; j < oneCard.length ; j ++){
                    l.push(oneCard[j]);
                }
            }
        }

        if(oneCard === undefined){
            cardList = [];
        }

        let kingBoom = getKingBoom(cardsB);
        if (kingBoom !== false) {
            cardList.push(kingBoom);
        }
        let fourBoomList = getFourBoom(cardsB);
        if (fourBoomList !== false) {
            // cardsList.push(fourBoom);
            for (let i = 0; i < fourBoomList.length; i++) {
                cardList.push(fourBoomList[i]);
            }
        }

        return cardList;
    };





    const getFourWithNumCardsList = function (num, cardsA, cardsB) {
        
        let cardList = [];
        
        let fourBoomList = getFourBoom(cardsB);
        let oneCard= getRepeatCardsList(1, cardsB);


        if (fourBoomList !== false) {
            // cardsList.push(fourBoom);
            for (let i = 0; i < fourBoomList.length; i++) {
                cardList.push(fourBoomList[i]);
            }
        }
        let kingBoom = getKingBoom(cardsB);
        if (kingBoom !== false) {
            cardList.push(kingBoom);
        }

        return cardList;
    };

















    
    that.tipsThreeWithOne = function (cardsA, cardsB) { //  提示3带1
        //3,3,3,4
        return getThreeWithNumCardsList(1, cardsA, cardsB);

    };
    that.tipsThreeWithTwo = function (cardsA, cardsB) { //  提示3带对子
        console.log('三道二的提示');
        return getThreeWithNumCardsList(2, cardsA, cardsB);
    };


    that.tipsFourWithOne = function (cardsA, cardsB) { //  提示4带1/4带2
        //3,3,3,3,4
        //3,3,3,3,4,4
        let oneCard= getRepeatCardsList(1, cardsB);

        return getFourWithNumCardsList(1, cardsA, cardsB);

    };
    that.tipsFourWithTow = function (cardsA, cardsB) { //  提示4带2对子
        //3,3,3,3,4,4,5,5
        //3,3,3,3,4,4,4,4
        return getFourWithNumCardsList(2, cardsA, cardsB);

    };






    const getPlaneMinValue = function (cardsA) {
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

    const getPlaneWithStart = function (num, cardsB,cardsA) {
        let list = getRepeatCardsList(3,cardsB);
        let listA = getRepeatCardsList(3,cardsA);
        let lengthA = 0;
        for(let i in listA){
            lengthA = lengthA + listA[i].length;
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
        for(let i in keys){
            if(keys[i] <= num){
                keys.splice(i,1)
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
                    if(l.length === lengthA){
                        tempCardsList.push(l);
                        i=tempCardsList.length -1;
                        cont = tempCardsList.length;
                        l = [];
                        break;
                    }
                    
                }
                
            }
        }
        let cardsList = [];
        for (let i = 0 ; i < tempCardsList.length ; i ++){
            let valueB = getPlaneMinValue(tempCardsList[i]);
            if (valueB > num){
                cardsList.push(tempCardsList[i]);
            }
        }
        return cardsList;
    };
    that.tipsPlane = function (cardsA, cardsB) {    //  提示飞机
        console.log('提示飞机');
        let valueA =  getPlaneMinValue(cardsA);
        let cardsList = getPlaneWithStart(valueA ,cardsB,cardsA);
        let kingBoom = getKingBoom(cardsB);
        if (kingBoom !== false) {
            cardsList.push(kingBoom);
        }
        let fourBoomList = getFourBoom(cardsB);
        if (fourBoomList !== false) {
            // cardsList.push(fourBoom);
            for (let i = 0; i < fourBoomList.length; i++) {
                cardsList.push(fourBoomList[i]);
            }
        }


        return cardsList;
    };

    that.tipsPlaneWithOne = function (cardsA, cardsB) { //  提示飞机带1
        // let list = that.tipsPlane(cardsA, cardsB);
        let valueA = getPlaneMinValue(cardsA);
        console.log('value a = ' + valueA);

        let listA = getRepeatCardsList(3,cardsA);
        let lenA = listA.length;

        let cardsList = getPlaneWithStart(valueA, cardsB,cardsA);
        console.log('cards list = ' + JSON.stringify(cardsList));
        let oneCard = getRepeatCardsList(1, cardsB);
        console.log('one card = ' + JSON.stringify(oneCard));
        oneCard.sort((a,b)=>{
            return a[0].value - b[0].value;
        });
        if(oneCard.length <lenA){
            cardsList = [];
        }else{

            for (let i = 0 ; i < cardsList.length ; i ++){
                let cards = cardsList[i];
                for (let j = 0 ; j < lenA ; j ++){
                    cards.push(oneCard[j][0]);
                }
            }
        }
        // if (oneCard.length >= 2){
        //     for (let i = 0 ; i < cardsList.length ; i ++){
        //         let cards = cardsList[i];
        //         for (let j = 0 ; j < lenA ; j ++){
        //             cards.push(oneCard[j][0]);
        //         }
        //     }
        // }else{
        //     cardsList = [];
        // }

        let kingBoom = getKingBoom(cardsB);
        if (kingBoom !== false) {
            cardsList.push(kingBoom);
        }
        let fourBoomList = getFourBoom(cardsB);
        if (fourBoomList !== false) {
            // cardsList.push(fourBoom);
            for (let i = 0; i < fourBoomList.length; i++) {
                cardsList.push(fourBoomList[i]);
            }
        }

        return cardsList;
    };

    that.tipsPlaneWithTwo = function (cardsA, cardsB) { //  提示飞机带对子
        let valueA = getPlaneMinValue(cardsA);
        let listA = getRepeatCardsList(3,cardsA);
        let lenA = listA.length;
        console.log('value a = ' + valueA);
        let cardsList = getPlaneWithStart(valueA, cardsB,cardsA);
        console.log('cards list = ' + JSON.stringify(cardsList));
        let twoCard = getRepeatCardsList(2, cardsB);
        console.log('one card = ' + JSON.stringify(twoCard));
        twoCard.sort((a,b)=>{
            return a[0].value - b[0].value;
        });

        if(twoCard.length < lenA){
            cardsList = [];
        }else{
            for (let i = 0 ; i < cardsList.length ; i ++){
                let cards = cardsList[i];
                for (let j = 0 ; j < lenA ; j ++){
                    // cards.push(twoCard[j][0]);
                    for (let h = 0 ; h < twoCard[j].length ; h ++){
                        cards.push(twoCard[j][h]);
                    }

                }
            } 
        }
        // if (twoCard.length >= 2){
        //     for (let i = 0 ; i < cardsList.length ; i ++){
        //         let cards = cardsList[i];
        //         for (let j = 0 ; j < lenA ; j ++){
        //             // cards.push(twoCard[j][0]);
        //             for (let h = 0 ; h < twoCard[j].length ; h ++){
        //                 cards.push(twoCard[j][h]);
        //             }

        //         }
        //     }
        // }


        let kingBoom = getKingBoom(cardsB);
        if (kingBoom !== false) {
            cardsList.push(kingBoom);
        }
        let fourBoomList = getFourBoom(cardsB);
        if (fourBoomList !== false) {
            // cardsList.push(fourBoom);
            for (let i = 0; i < fourBoomList.length; i++) {
                cardsList.push(fourBoomList[i]);
            }
        }
        return cardsList;
    };

    const getScrollMinNum = function (cardList) {
        let minNum = 100;
        for (let i = 0 ; i < cardList.length ; i ++){
            if (cardList[i].value < minNum){
                minNum = cardList[i].value;
            }
        }
        return minNum;
    };
    const getScrollCardsList = function (length, cards) {   //  获取顺子

        let cardList = [];
        let map = {};
        for (let i = 0 ; i < cards.length ; i ++){
            if(cards[i].value === undefined || cards[i].value === 13){

            }else{
                if (!map.hasOwnProperty(cards[i].value)){
                    cardList.push(cards[i]);
                    map[cards[i].value] = true;
                }
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
    that.tipsScroll = function (cardsA,cardsB) {    //  提示顺子
        let valueA = getScrollMinNum(cardsA);
        let list = getScrollCardsList(cardsA.length,cardsB);
        console.log('tips scroll list = ' + JSON.stringify(list));
        let cardsList = [];
        for (let i = 0 ; i < list.length ; i ++){
            let valueB = getScrollMinNum(list[i]);
            if (valueB > valueA){
                cardsList.push(list[i]);
            }
        }
        let kingBoom = getKingBoom(cardsB);
        if (kingBoom !== false) {
            cardsList.push(kingBoom);
        }
        let fourBoomList = getFourBoom(cardsB);
        if (fourBoomList !== false) {
            // cardsList.push(fourBoom);
            for (let i = 0; i < fourBoomList.length; i++) {
                cardsList.push(fourBoomList[i]);
            }
        }

        return cardsList;
    };
    const getDoubleScorllMinValue = function (cardList) {
        //3,3,4,4,5,5
        //[[3,3], [4,4], [5,5]]
        cardList.sort((a ,b)=>{
            return a.value - b.value;
        });
        return cardList[0].value;
    };
    that.tipsDoubleScroll = function (cardsA,cardsB) {  //  提示双顺子
        //[[3,3],[4,4],[5,5]]
        //[3,3,4,4,5,5];

        //3,3,3,4,4,4,5,5,5
        console.log('cards a = ' + JSON.stringify(cardsA));
        let valueA = getDoubleScorllMinValue(cardsA);
        console.log('tips double scroll = ' + valueA);
        // let list = getRepeatCardsList(2, cardsB);
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
        console.log('map  = ' + JSON.stringify(map));
        // {
        //     '3': [card, card,card],
        //     '4': [card, card, card],
        //     '5': [card, card, card]
        // }
        var list = [];
        for (let i in map) {
            if (map[i].length >= 2) {
                // list.push(map[i].substring(0, 2));
                let l = [];
                for (let j = 0; j < 2; j++) {
                    l.push(map[i][j]);
                }
                if(l[0].value !== 13){
                    list.push(l);
                }
                
            }
        }
        // [[2,2],[1,1]]
        // console.log('list = ' + JSON.stringify(list));
        list.sort((a,b)=>{
            return a[0].value - b[0].value;
        });
        console.log('list = ' + JSON.stringify(list));
        let groupList = [];
        let length = Math.round(cardsA.length * 0.5);
        console.log('length  = ' + length);
        for (let i = 0 ; i < (list.length - length + 1); i ++){ //  得到所有可能成为双顺的
            let l = [];
            for (let j = i ; j < (i + length) ; j ++){
                l.push(list[j]);
            }
            groupList.push(l);
        }
        console.log('group list = ' + JSON.stringify(groupList));
        let doubleScrollList = [];
        for (let i = 0 ; i < groupList.length ; i ++){
            let group = groupList[i];
            console.log('group = ' + JSON.stringify(group));
            let flag = true;
            for (let j = 0 ; j < (group.length - 1) ;  j ++){
                let cards = group[j];
                console.log('cards = ' + JSON.stringify(cards));
                if (Math.abs(group[j][0].value - group[j + 1][0].value) !== 1){ //  判断是否相邻
                    flag = false;
                }
            }
            console.log('flag  = ' + flag);
            if (flag === true){
                let endList = [];
                for (let j = 0 ; j < group.length ; j ++){
                    endList.push(group[j][0]);
                    endList.push(group[j][1]);

                }
                let valueB = getDoubleScorllMinValue(endList);
                if (valueB > valueA){
                    doubleScrollList.push(endList);
                }
            }
        }
        let kingBoom = getKingBoom(cardsB);
        if (kingBoom !== false) {
            doubleScrollList.push(kingBoom);
        }
        let fourBoomList = getFourBoom(cardsB);
        if (fourBoomList !== false) {
            // cardsList.push(fourBoom);
            for (let i = 0; i < fourBoomList.length; i++) {
                doubleScrollList.push(fourBoomList[i]);
            }
        }
        return doubleScrollList;
    };
    that.getTipsCardsList = function (cardsA, cardsB) { //  获取提示牌组cardsA当前玩家出的牌,cardsB玩家手牌
        if (cardsA === undefined) { //  如果当前没有人要
            let list = [];
            let map = getCardListWithStart(0, cardsB);
            for (let i in map) {
                list.push(map[i]);
            }
            return list;


        } else {    
 
            let cardsValue = getCardsValue(cardsA);
            let name = cardsValue.name;
            let str = 'tips' + name;
            let method = that[str];
            return method(cardsA, cardsB);
        }
    };

    // const CardsValue = {
    //     'one': {
    //         name: 'One',
    //         value: 1
    //     },
    //     'double': {
    //         name: 'Double',
    //         value: 1
    //     },
    //     'three': {
    //         name: 'Three',
    //         value: 1
    //     },
    //     'boom': {
    //         name: 'Boom',
    //         value: 2
    //     },
    //     'threeWithOne': {
    //         name: 'ThreeWithOne',
    //         value: 1
    //     },
    //     'threeWithTwo': {
    //         name: 'ThreeWithTwo',
    //         value: 1
    //     },
    //     'plane': {
    //         name: 'Plane',
    //         value: 1
    //     },
    //     'planeWithOne': {
    //         name: 'PlaneWithOne',
    //         value: 1
    //     },
    //     'planeWithTwo': {
    //         name: 'PlaneWithTwo',
    //         value: 1
    //     },
    //     'scroll': {
    //         name: 'Scroll',
    //         value: 1
    //     },
    //     'doubleScroll': {
    //         name: 'DoubleScroll',
    //         value: 1
    //     }
    //
    //
    // };

    return that;
};