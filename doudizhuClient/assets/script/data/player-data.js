const getRandomStr = function (count) {
    let str = '';
    for (let i = 0 ; i < count ; i ++){
        str += Math.floor(Math.random() * 10);
    }
    return str;
};
const PlayerData = function () {
    let that = {};
    that.uniqueID = '1' + getRandomStr(6);
    // that.uniqueID = '100000';
    that.accountID = '2' + getRandomStr(6);
    that.nickName = '小明' + getRandomStr(2);
    that.avatarUrl = 'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=1665110666,1033370706&fm=27&gp=0.jpg';
    that.goldCount = 0;
    return that;
};
export default  PlayerData;