// const request = require('request');
// const http = require('http');

// http.createServer(function(req,res){
//     res.writeHead(200,{
//         'Access-Control-Allow-Origin' : '*'
//     });
//     request('https://www.layui.com/test/table/demo1.json',function(error,response,body){
//             res.end(body);
//     });
// }).listen(3008,function(){
//     console.log('服务器已在3008端口起飞')
// });

const express = require('express');
const mongodb = require('mongodb');
const bodyParser = require('body-parser');

// 获取Mongo客户端
const MongoClient = mongodb.MongoClient;

let app = express();
//解决跨域
app.all('*', function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
   res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
   // 跨域请求CORS中的预请求
   if(req.method=="OPTIONS") {
     res.send(200);/*让options请求快速返回*/
   } else{
     next();  //next()   跑完这里还会继续走该走的路由
   }
});


// 静态资源服务器
app.use(express.static('../'));

//路由
// let urlencodedParser = bodyParser.urlencoded({ extended: false })
// 商品分类
app.get('/goodscategory',function(req,res){
    MongoClient.connect('mongodb://localhost:27017',function(err,database){
        if(err) throw err;
        let db = database.db('win');
        let user = db.collection('goodscategory');
        let count = 0;

        let page = req.query.page;
        let limit = req.query.limit;
        user.find().toArray(function(err2,result2){
            sum = result2.length;
            return sum;
        });
        // user.find({},{_id:0,class:1}).limit(12).toArray(function(err,result){
        //     res.send({
        //         code:0,
        //         data:result,
        //         msg:'商品列表',
        //         count:sum
        //     });
        // });

        user.find().skip((page-1)*limit*1).limit(limit*1).toArray((err,result)=>{
            // console.log(result);
            let data;
            if(err){
                // console.log(666);
                data={
                    'code':1,
                    'data':[],
                    'msg':'没有商品',
                    'count':pages
                }
            }else{
                data = {
                    'code':0,
                    'data':result,
                    'msg':'商品列表',
                    'count':sum
                }
                
            }

            res.send(data);
        });
        
        


        database.close();
    })

})

//编辑
app.get('/_edit',function(req,res){
    let edit_id = req.query.id*1;
    let edit_name = req.query.name;
    let edit_time = req.query.time;
    MongoClient.connect('mongodb://localhost:27017',function(err,database){
        if(err) throw err;
        let db = database.db('win');
        let user = db.collection('goodscategory');
        // console.log(edit_id,edit_name,edit_time);

        user.update({
            id:edit_id
        },{$set:{name:edit_name,time:edit_time}},(err,result)=>{
            console.log(result);
        })

    });
});

//删除
app.get('/_del',function(req,res){
    let del_id = req.query.id*1;
    MongoClient.connect('mongodb://localhost:27017',function(err,database){
        if(err) throw err;
        let db = database.db('win');
        let user = db.collection('goodscategory');
        // console.log(edit_id,edit_name,edit_time);

        user.deleteOne({id:del_id},function(err,result){
            console.log(result);
        })

    });
});

//商品列表
app.get('/goodslist',function(req,res){
    MongoClient.connect('mongodb://localhost:27017',function(err,database){
        if(err) throw err;
        let db = database.db('win');
        let user = db.collection('goodslist');
        let count = 0;

        let page = req.query.page;
        let limit = req.query.limit;
        user.find().toArray(function(err2,result2){
            sum = result2.length;
            return sum;
        });
        // user.find({},{_id:0,class:1}).limit(12).toArray(function(err,result){
        //     res.send({
        //         code:0,
        //         data:result,
        //         msg:'商品列表',
        //         count:sum
        //     });
        // });

        user.find().skip((page-1)*limit*1).limit(limit*1).toArray((err,result)=>{
            // console.log(result);
            let data;
            if(err){
                // console.log(666);
                data={
                    'code':1,
                    'data':[],
                    'msg':'没有商品',
                    'count':pages
                }
            }else{
                data = {
                    'code':0,
                    'data':result,
                    'msg':'商品列表',
                    'count':sum
                }
                
            }

            res.send(data);
        });
        
        


        database.close();
    })

})

app.listen(3008,function(){
    console.log('服务器已在3008端口起飞')
});