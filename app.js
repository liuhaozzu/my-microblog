/**
 * Created by Administrator on 2017/2/18 0018 11:19.
 */
var express=require('express');
var app=express();
var router=require('./router/router');
var session=require('express-session');

app.set('view engine','ejs');
app.use(express.static('./public'));
app.use('/avatar',express.static('./avatar'));
app.use(session({
    secret:'keyboard cat',
    resave:false,
    saveUninitialized:true
}));

//路由表
app.get('/',router.showIndex);
app.get('/regist',router.showRegist);
app.post('/doRegist',router.doRegist);
app.get('/login',router.showLogin);
app.post('/doLogin',router.doLogin);
app.get('/showSetAvatar',router.showSetAvatar);
app.post('/doSetAvatar',router.doSetAvatar);
app.get('/logout',router.logout);
app.get('/showCut',router.showCut);
app.get('/doCut',router.doCut);
app.post('/postShuoshuo',router.doPostShuoShuo);
app.get('/getAllShuoshuo',router.getAllShuoshuo);//列出所有说说
app.get('/getUserInfo',router.getUserInfo);//列出所有说说
app.get('/getshuoshuoamount',router.getshuoshuoamount);//获取说说总数
app.get('/user/:user',router.showUser);
app.get('/userlist',router.showUserlist);

app.listen(3000);