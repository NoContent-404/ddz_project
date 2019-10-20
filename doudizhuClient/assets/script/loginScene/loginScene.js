import global from './../global'
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        let id = 'unique_id';
        if(this.GetUrlPara(id) != ""){

            if (this.GetUrlPara(id) == "no") {
                window.location.href="http://192.168.1.251:8092/pages/websiteAuthorh/index.html?appId=sk1bff720bb1364622&callbackUrl=http://192.168.1.4:3000/login";
                console.log("无ID");
            } else {
                console.log("有ID");
                this.GetUrlPara(id);
                console.log(this.GetUrlPara(id));
                global.socket.requestLogin({
                    uniqueID: this.GetUrlPara(id),
                }, (err, result) => {
                    if (err) {
                        console.log('err = ' + err);
                    }else {
                        
                        //={"nick_name":"憨憨","accountID":"20190919022526","avatarUrl":"http://192.168.1.251:80/avatar/o/158/10000158.jpg","goldCount":100}
                        console.log('result = ' + JSON.stringify(result));
                        global.playerData.goldCount = result.goldCount;
                        global.playerData.accountID = result.accountID;
                        global.playerData.nickName  = result.nick_name;
                        global.playerData.avatarUrl = result.avatarUrl;

                        global.socket.pingyes(global.playerData.accountID);
                        //登录成功进入大厅


                        cc.director.loadScene('hallScene');
                        
                    }
                });
            }
        }
        },

    //截取URl？后面的信息
    GetUrlPara (token) {
        let url = document.location.href.toString();
        console.log("链接="+url);
        let arrObj = url.split("?");
        if (arrObj.length > 1) {
            let arrPara = arrObj[1].split("&");
            let arr;

            for (let i = 0; i < arrPara.length; i++) {
                arr = arrPara[i].split("=");
                if (arr != null && arr[0] == token) {
                    console.log('cookie = ' + decodeURI(arr[1]));
                    return arr[1];
                }
            }
            return "";
        }
        else {
            return "";
        }

    },







    start () {
        // let socket = io("http://localhost:3000");
        // socket.on('welcome', (data)=>{
        //     console.log('welcome ' + data);
        // });
       // global.socket.init();
       // global.socket = SocketController();
        global.socket.init();

        global.eventListener.on('test', (data)=>{
            console.log('test success' + data);
        });
        global.eventListener.on('test', (data)=>{
            console.log('test 1 sucess' + data);
        });
        global.eventListener.fire('test', 'ok');


    },

    onButtonClick(event, customData){
        let id = 'unique_id';
         this.GetUrlPara(id);
        if(this.GetUrlPara(id)== ""){
            window.location.href="http://192.168.1.4:3000/cookie";
        }else {

        }
     //    switch (customData){
     //        case 'wx_login':
     //            console.log('wx 登陆');
     //            global.socket.requestLogin({
     //                uniqueID: global.playerData.uniqueID,
     //                accountID: global.playerData.accountID,
     //                nickName: global.playerData.nickName,
     //                avatarUrl: global.playerData.avatarUrl
     //            },(err, result)=>{
     //                if (err){
     //                    console.log('err = ' + err);
     //                }else {
     //                    console.log('result = ' + JSON.stringify(result));
     //                    global.playerData.goldCount = result.goldCount;
     //                    cc.director.loadScene('hallScene');
     //                }
     //            });
     //            break;
     //        default:
     //            break;
     //    }
    }
    // update (dt) {},
});
