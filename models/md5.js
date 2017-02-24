/**
 * Created by Administrator on 2017/2/17 0017 21:57.
 */
var crypto=require('crypto');

module.exports=function md5(mingwen) {
    var md5=crypto.createHash('md5');
    var password=md5.update(mingwen).digest('base64');
    return password;
};