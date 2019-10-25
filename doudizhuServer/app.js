// const socket = require('socket.io');
// const app = socket(3000);
const myDB = require('./db');
const defines = require('./defines'); 
const gameController = require('./game/game-controller');

const express = require('express');
const app     = express();
const server  = require('http').createServer(app);
const io      = require('socket.io')(server);
const cookieParser = require('cookie-parser');  //  设置，写入cookie
const request = require('request');     //  发送http网络请求
const url = require('url');     //  获取http地址，可获取参数
const chinaTime = require('china-time');    //  获取北京时间

const redis = require('redis');
const client = redis.createClient(6379,'192.168.1.99');






app.use(cookieParser());    
app.use('/login', function (req,res) {
    var arg = url.parse(req.url, true).query; 
    console.log( arg.code)


    //  拼接code
    request.post({url:'http://192.168.1.251:8092/open/code/oauth?code='+arg.code
    },
     function(error, response, body) {
         var body = JSON.parse(body)
        console.log(body)

        let str = body.data.openId.replace(/[\r\n]/g,"")
        str = str.replace(/\ +/g,"");

        
         myDB.getPlayerInfoWithopenID(str, (err, data) => {
            if (err) {
                console.log('err =  ' + err);
            } else {
                console.log('data =  ' + JSON.stringify(data));
                if (data.length === 0) {    //  如果不纯在这个登录的人

                    //  生成随机数


                    let loginData = body.data;
                    let ac = chinaTime('YYYYMMDDhhmmss');
                    myDB.createPlayerInfo(  //  创建这个人
                        ac,
                        ac,
                        loginData.nickName,
                        defines.defaultGoldCount,
                        loginData.image,
                        str,
                        loginData.sex,
 
                    );
                    // res.setHeader('Set-Cookie','username=1111;path=/;httponly')
                    res.cookie('user',ac,{maxAge: 60 * 1000 * 300});
                    res.redirect(302, 'http://192.168.1.4:7456/?unique_id='+ ac);
                }else{
                    // res.setHeader('Set-Cookie','username=1111;path=/;httponly')
                    res.cookie('user',data[0].unique_id,{maxAge:60 * 1000 * 300});
                    console.log(data[0].unique_id)
                    res.redirect(302, 'http://192.168.1.4:7456/?unique_id='+data[0].unique_id);
                } 
            }
        });


       
    })



    
    // res.setHeader('Set-Cookie','username=1111;path=/;httponly')
    // console.log(req.cookies.user);
    // var username = req.cookies.user;
    // if(req.cookies.user == undefined){
    //     console.log("cookie no exist")
    // }else{
        
    //     console.log("cookie exist")
    // }
   
})



//  cookie 判断

app.use('/cookie', function (req,res) {
    // res.clearCookie('user'); 
    
    // res.setHeader('Set-Cookie','username=1111;path=/;httponly')
    //  console.log(unique_id);
    var unique_id = req.cookies.user;
    

    if(unique_id == undefined){
        // res.redirect(302, 'http://192.168.1.251:8092/pages/websiteAuthorh/index.html?appId=sk1bff720bb1364622&callbackUrl=http://192.168.1.4:3000/login');
        res.redirect(302, 'http://192.168.1.4:7456/?unique_id=no');
        console.log("cookie no exist ：告诉他需要验证登录")
    }else{
        console.log("cookie = "+ unique_id)
        res.redirect(302, 'http://192.168.1.4:7456/?unique_id='+unique_id);
        console.log("cookie exist this name:"+unique_id)
    }
   
})




console.log('defines = ' + defines.defaultGoldCount);
myDB.connect({
    "host": "192.168.1.99",
    "port": 3306,
    "user": "root",
    "password": "123456",
    "database": "hhq"
});
// myDB.getPlayerInfoWithUniqueID('20190919102018', (err, data) => {
//     console.log('data = ' + JSON.stringify(data));
// });
var dd= 0;



io.on('connection', function (socket) {

    dd++;
    console.log('a  user connection' + dd);
    socket.emit('connection', 'connection success');
    
    socket.on('notify', (notifyData) => {   //  登录传递过来的数据
        console.log('notify ' + JSON.stringify(notifyData));
        
        //  登录
        switch (notifyData.type) {
            case 'login':
                let uniqueID = notifyData.data.uniqueID;
                
                let callBackIndex = notifyData.callBackIndex;


                client.lrange('user:' +uniqueID+':data',0,-1,function(err,val){
                    if(err){
                        console.log(err);
                    } else{
                        if(val.length !== 0 ) {
                            let redisData = JSON.parse(val[0]);
                            console.log( val)
                            console.log('用户ID = '+ redisData)
                            console.log('用户ID = '+ redisData.unique_id)
          
                           
                            if(redisData.unique_id === uniqueID){
                                console.log('创建玩家');
                                gameController.createPlayer(redisData, socket, callBackIndex);
                            }
                        }else{
                              myDB.getPlayerInfoWithUniqueID(uniqueID, (err, data) => {
                   
                                if (err) {
                                    console.log('err =  ' + err);
                                } else {
                                    
                                    client.rpush('user:' +uniqueID+':data', JSON.stringify(data[0]));
                                    //  存在这个人，创建玩家
                                    if(data.length ===0){
                                        console.log('没有这个人')
                                    }
                                    console.log('data = ' + JSON.stringify(data));
                                    gameController.createPlayer(data[0], socket, callBackIndex);
                                
                                }
                            });
                        }
                       
                        
                        
                    }
                 });

                
                // myDB.getPlayerInfoWithUniqueID(uniqueID, (err, data) => {
                   
                //     if (err) {
                //         console.log('err =  ' + err);
                //     } else {
                        
                //         client.rpush('user:' +uniqueID+':data', JSON.stringify(data));

                      

                //         //  存在这个人，创建玩家
                //         console.log('data = ' + JSON.stringify(data));
                //         gameController.createPlayer(data[0], socket, callBackIndex);
                      
                //     }
                // });
                break;
            default:
                break;
        }

        

    });
});

server.listen(3000);