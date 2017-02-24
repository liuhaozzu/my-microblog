/**
 * Created by Administrator on 2017/2/14 0014 21:34.
 */
//CRUD of mongodb
var MongoClient=require('mongodb').MongoClient;
var settings=require('../settings.js');
function _connectDB(url,callback) {
    
    var url=settings.dburl||'mongodb://localhost:27017/demo';
    MongoClient.connect(url,function (err, db) {
        if (err){
            console.log('connected failed:'+err);
            return;
        }
        console.log('connected successfully');
        callback(err,db);
        //db.close();//不能在此处关闭数据库，因为函数是异步执行的。
    });
}
exports.insertOne=function (collectionName, json, callback) {
    _connectDB(null,function (err, db) {
        db.collection(collectionName).insertOne(json,function (err, result) {
            callback(err,result);
            db.close();//close the db
        });
    });
};

/**
 * query data
 * @param collectionName
 * @param json
 * @param args is an Object:{'pageamount':10,'page':10}
 * @param callback
 */
exports.find=function (collectionName, json, args, callback) {
    var result=[];

    if(arguments.length==3){
        var callback=args;
        var skipnumber=0;
        var limit=0;
    }else if(arguments.length==4){
        var skipnumber=args.pageamount * args.page||0;
        var limit=args.pageamount||0;
        var sort=args.sort||{};
    }

    _connectDB(null,function (err, db) {
        var cursor=db.collection(collectionName).find(json).skip(skipnumber).limit(limit).sort(sort);
        cursor.each(function (err, doc) {
            if(err){
                callback(err,null);
                db.close();
                return;
            }
            if(doc!=null){
                result.push(doc);
            }else {
                //callback
                callback(null, result);
                db.close();
                return;
            }
        })
    })
};
exports.deleteMany=function (collectionName,json,callback) {
    _connectDB(null,function (err, db) {
        db.collection(collectionName).deleteMany(json,function (err, results) {
            callback(err, results);
        });
    });
};
exports.updateMany=function (collectionName, json1, json2, callback) {
    _connectDB(null, function (err, db) {
        db.collection(collectionName).updateMany(
            json1,
            json2,
            function (err, results) {
                console.log(results);
                callback(err,results);
            }
        );
    });
};
exports.getAllCount=function (collectionName, callback) {
    _connectDB(null,function (err, db) {
        if(err){
            console.log(err);
        }
        db.collection(collectionName).count({}).then(function (count) {
            //console.log(count);
            callback(count);
        });
    });
};
init();
function init(){
    _connectDB(null,function (err, db) {
       if(err){
           console.log(err);
       }
       db.collection('user').createIndex(
           {'username':1},
           null,
           function (err, results) {
                if(err){
                    console.log(err);
                    return;
                }
                console.log(results+':::索引建立成功')
           }
       );
    });
}