const mysql = require('mysql');
let client = undefined;

const query = function (sql, cb) {
   
    client.getConnection((err, connection) => {
        if (err) {
            console.log('get connection = ' + err);
            if (cb){
                cb(err); 
            }
        } else {
            connection.query(sql, (connErr, result) => {
                if (connErr) {
                    console.log(sql + connErr);
                    if (cb){
                        cb(connErr);
                    }
                } else {
                    if (cb){
                        
                        cb(null, result);
                    }
                }
                connection.release();
            })
        }
    });
};

exports.getPlayerInfoWithAccountID = function (key, cb) {
    let sql = 'select * from t_account where account_id = ' + key + ';';
    query(sql, cb);
};
exports.getPlayerInfoWithUniqueID = function (key, cb) {
    
    let sql = 'select * from t_account where unique_id = "' + key + '";';
    query(sql, cb);
};
exports.getPlayerInfoWithopenID = function (key, cb) {
   
    let sql = 'select * from t_account where openId = "' + key + '";';
    query(sql, cb);
};


exports.getPlayerInfoWithIsRobot = function (key, cb) {  //  查找机器人
   
    let sql = 'select * from t_account where isrobot = "' + key + '" ;';
    query(sql, cb);
};





exports.updataPlayerInfo = function (key, cb) {
    let sql = 'update t_account set nick_Name = '+"'"+key.nickName +"'"+ 
    ', gold_count='+ "'" + key.gold + "'" +
    ', avatar_url='+ "'" +key.avatarUrl + "' " +
    'where account_id =' + key.accountID + ';';
    query(sql, cb);
};

exports.updataAIInfo = function (key, cb) {
    let sql = 'update t_account set isoccupy=1 where account_id =' + key.account_id + ';';
    query(sql, cb);
};




exports.createPlayerInfo = function (uniqueID, accountID, nickName, goldCount, avatarUrl, openId, sex) {
    let sql = 'insert into t_account(unique_id, account_id, nick_name,gold_count, avatar_url ,openId, sex) values('
        + "'" +uniqueID
        + "'" + ','
        + "'" + accountID
        + "'" + ','
        + "'" +nickName
        + "'" + ','
        + "'" + goldCount
        + "'" +','
        + "'" + avatarUrl
        + "'" + ','
        + "'" + openId
        + "'" + ','
        + "'" + sex
        + "'" +  ');' ;

    query(sql, (err, data)=>{
        if (err){
            console.log('create player info = ' + err);
        }else
        {
            
            // console.log('create player info = ' + JSON.stringify(data));
        }
    });
};
exports.connect = function (config) {
    client = mysql.createPool(config);
};