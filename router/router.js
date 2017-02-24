/**
 * Created by Administrator on 2017/2/18 0018 11:21.
 */

var formidable=require('formidable');
var db=require('../models/db');
var md5=require('../models/md5');
var path=require('path');
var fs=require('fs');
var gm=require('gm');
exports.showIndex=function(req,res,next){
    //检索数据库，查找用户头像
    var username='';
    var login=false;
    if(req.session.login=='1'){
        username=req.session.username;
        login=true;
    }
    db.find('user',{
        'username':username
    },function (err, result) {
        var avatar='default.jpg'
        if(result.length!=0){
            avatar=result[0].avatar||'default.jpg';
        }
        res.render('index',{
            'login':login,
            'username':username,
            'active':'index',
            'avatar':avatar //登陆人的头像
        });
    });
};
exports.showRegist=function(req,res,next){
    res.render('regist',{
        'login':req.session.login=='1'?true:false,
        'username':req.session.login=='1'?req.session.username:'',
        'active':'regist'
    });
};
exports.doRegist=function(req,res,next){
    var form=new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        var username=fields.username;
        var password=fields.password;
        console.log('fiels'+username+':::'+password);
        db.find('user',{
            'username':username
        },function (err,result) {
            if(err){
                //服务器错误
                res.send(-3);
                return;
            }
            if(result.length!=0){
                res.send('-1');//用户名被占用
                console.log(result.length);
                return;
            }
            console.log(result.length);
            //用户名没有被占用
            password=jiami(password);
            db.insertOne('user',{
                'username':username,
                'password':password,
                'avatar':'default.jpg'
            },function (err, result) {
                if(err){
                    console.log(err);
                    return;
                }
                req.session.login='1';
                req.session.username=username;
                res.send('1');//注册成功，写入session
            });
        });
    });
};

exports.showLogin=function (req, res, next) {
    res.render('login',{
        'login':req.session.login=='1'?true:false,
        'username':req.session.login=='1'?req.session.username:'',
        'active':'login'
    });
};
exports.doLogin=function (req, res, next) {
    var form=new formidable.IncomingForm();
    form.parse(req,function (err, fields, files) {
        //得到表单
        var username=fields.username;
        var password=fields.password;
        console.log(username+password);
        //query db
        db.find('user',{
            'username':username
        },function (err, result) {
            if(err){
                res.send('-5');
                return;
            }
            if(result.length==0){
                res.send('-1');
                return;
            }
            var jiamihou=jiami(password);
            if(jiamihou==result[0].password){
                req.session.login='1';
                req.session.username=username;
                res.send('1');
                return;
            }else {
                res.send('-1');
                return;
            }
        });
    })
};
exports.doPostShuoShuo=function (req, res, next) {
    //需要用户登陆
    var form=new formidable.IncomingForm();
    var username=req.session.username;
    form.parse(req,function (err, fields, files) {
        //得到表单
        var content=fields.content;

        console.log(content);
        db.insertOne('post',{
            'username':username,
            'datetime':new Date(),
            'content':content
        },function (err, result) {
            if(err){
                console.log(err);
                res.send('-3')
                return;
            }

            res.send('1');
        });
    })
};
exports.logout=function (req, res, next) {
    req.session.login='-1';
    req.session.username=null;
    res.redirect('/');
};
//必须保证此时是登陆状态
exports.showSetAvatar=function (req, res, next) {
    if(req.session.login!='1'){
        //res.write('您尚未登陆，请登陆');
        res.redirect('/login');
        return;
    }
    res.render('setAvatar',{
        'login':true,
        'username':req.session.login=='1'?req.session.username:'',
        'active':'showSetAvatar',
        'avatar':'default.jpg'
    });
};
exports.doSetAvatar=function (req, res, next) {
    console.log('upload start');
    var form=new formidable.IncomingForm();
    form.uploadDir=path.normalize(__dirname+'/../avatar');
    form.parse(req,function (err, fields, files) {
        console.log(files);
        var oldPath=files.touxiang.path;
        var newPath=path.normalize(__dirname+'/../avatar')+'/'+req.session.username+'.jpg';
        console.log('newPath:'+newPath);
        fs.rename(oldPath,newPath,function (err) {
            if(err){
                res.send('失败');
                return;
            }
            //跳转到切图业务
            req.session.avatar=req.session.username+'.jpg';
            res.redirect('/showCut');
        });
    });
    console.log('upload end');
};
exports.showCut=function (req, res, next) {
    res.render('cut',{
        'login':true,
        'username':req.session.login=='1'?req.session.username:'',
        'active':'showSetAvatar',
        'avatar':req.session.avatar
    });
};
exports.doCut=function(req,res,next){
    //这个页面接收几个GET请求参数
    //w、h、x、y
    var filename = req.session.avatar;
    var w = req.query.w;
    var h = req.query.h;
    var x = req.query.x;
    var y = req.query.y;

    gm('./avatar/'+filename)
        .crop(w,h,x,y)
        .resize(100,100,'!')
        .write('./avatar/'+filename,function(err){
            if(err){
                console.log(err);
                res.send('-1');
                return;
            }
            //更新数据库当前用户的avatar
            db.updateMany('user',{'username':req.session.username},
                {
                    $set:{'avatar':req.session.avatar}
                },function (err, results) {
                    console.log(results);
                    //res.redirect('/');
                    res.send('1');
                });


        });
};

//列出所有说说
exports.getAllShuoshuo=function (req, res, next) {
    var page=req.query.page;
    db.find('post',{},{'pageamount':10,'page':page,'sort':{'datetime':-1}},function (err, result) {
        res.json({'r':result});
    });
};
//列出用户信息
exports.getUserInfo=function (req, res, next) {
    var username=req.query.username;
    db.find('user',{'username':username},function (err, result) {
        var obj={
            'username':result[0].username,
            'avatar':result[0].avatar,
            '_id':result[0]._id
        }
        res.json({'r':obj});
    });
};
exports.getshuoshuoamount=function (req, res, next) {
    db.getAllCount('post',function (count) {
        res.send(count.toString());
    });
};
exports.showUser=function (req, res, next) {
    var user=req.params['user'];

    db.find('post',{'username':user},function (err, result) {
        console.log(result);
        db.find('user',{'username':user},function (err, result2) {
            res.render('user',{
                'login':req.session.login=='1'?true:false,
                'username':req.session.login=='1'?req.session.username:'',
                'user':user,
                'active':'gerenzhuye',
                'cirenshuoshuo':result,
                'cirentouxiang':result2[0].avatar
            });
        });

    });
};
exports.showUserlist=function (req, res, next) {
    var user=req.params['user'];

    db.find('user',{},function (err, result) {
        res.render('userlist',{
            'login':req.session.login=='1'?true:false,
            'username':req.session.login=='1'?req.session.username:'',
            'active':'suoyouchengyuan',
            'suoyouchengyuan':result
        });
    });
};
function jiami(mingwen) {
    return md5(md5(mingwen)+'kaola');
}