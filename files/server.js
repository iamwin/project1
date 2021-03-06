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
const multer = require('multer');
const http = require('http');
const querystring = require('querystring');

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

        //获取商品总数
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
                        'msg':err,
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
            // console.log(result);
        })

    });
});

//删除分类
app.get('/_del',function(req,res){
    let del_id = req.query.id*1;
    MongoClient.connect('mongodb://localhost:27017',function(err,database){
        if(err) throw err;
        let db = database.db('win');
        let user = db.collection('goodscategory');
        // console.log(edit_id,edit_name,edit_time);

        user.deleteOne({id:del_id},function(err,result){

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
        let key = req.query.key;
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
        
        //搜索功能
        if(key){
            user.find({id:(key.id)*1}).toArray((err,result)=>{
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
        }else{
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
        }
        
        database.close();
    })

})

// 上/下架
app.get('/_change',function(req,res){
    let change_id = req.query.id*1;
    let change_stage = req.query.stage;
    MongoClient.connect('mongodb://localhost:27017',function(err,database){
        if(err) throw err;
        let db = database.db('win');
        let user = db.collection('goodslist');
        user.update({
            id:change_id
        },{$set:{stage:change_stage}},(err,result)=>{

        });
    });
});

//渲染分类
app.get('/cate',function(req,res){
    MongoClient.connect('mongodb://localhost:27017',function(err,database){
        let db = database.db('win');
        let user = db.collection('goodscategory');
        user.find().toArray(function(err,result){
            var all_cate=[];
            for(var i=0;i<result.length;i++){
                all_cate.push(result[i].name);
            }
            res.send(all_cate);
        });
    });
})

// 上传图片
app.post('/addpic',function(req,res){
})

//添加商品
let urlencodedParser = bodyParser.urlencoded({ extended: false })//中间件，用于解析POST请求传来的数据
app.post('/addgoods',urlencodedParser,function(req,res){
    MongoClient.connect('mongodb://localhost:27017',function(err,database){
        // console.log(req.body);
        let db = database.db('win');
        let user = db.collection('goodslist');
        user.find({}).sort({id:-1}).limit(1).toArray((err,result)=>{
            var add_id=result[0].id;
            add_id++;
            Object.assign(req.body,{id:add_id});//将id对象添加到req.body对象中
            user.insert(req.body,(err2,result2)=>{
                res.send(result2);
            })
        })
    });
})

//判断添加的分类是否重复
app.get('/addcate_name',function(req,res){
    let addcate_name = req.query.name;
    // console.log(addcate_name);
    MongoClient.connect('mongodb://localhost:27017',function(err,database){
        //检测是否有同名
        let db = database.db('win');
        let user = db.collection('goodscategory');
        // console.log(addcate_name);
        user.findOne({'name':addcate_name},function(err,result){
            console.log(result);
            if(result){
                res.send('1');
            }else{
                res.send('0');
            }
        })
    })
})

//添加分类
app.get('/addcate',function(req,res){
    MongoClient.connect('mongodb://localhost:27017',function(err,database){
        // console.log(req.body);
        let db = database.db('win');
        let user = db.collection('goodscategory');
        let addcate_name = req.query.name;
        let addcate_time = req.query.time;
        user.find({}).sort({id:-1}).limit(1).toArray((err,result)=>{
            var add_id=result[0].id;
            add_id++;
            // console.log(add_id,addcate_name,addcate_time);
            user.insert({'id':add_id,'name':addcate_name,'time':addcate_time},function(err2,result2){
                res.send(result2);
            })

        })
    });
})

//用户列表
app.get('/user',function(req,res){
    MongoClient.connect('mongodb://localhost:27017',function(err,database){
        let db = database.db('win');
        let user = db.collection('user');
        let count = 0;
        let page = req.query.page;
        let limit = req.query.limit;

        user.find().toArray(function(err2,result2){
            sum = result2.length;
            return sum;
        });

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
    }); 
});

//删除用户
app.get('/user_del',function(req,res){
    let del_id = req.query.id*1;
    MongoClient.connect('mongodb://localhost:27017',function(err,database){
        if(err) throw err;
        let db = database.db('win');
        let user = db.collection('user');
        // console.log(edit_id,edit_name,edit_time);

        user.deleteOne({id:del_id},function(err,result){

        })

    });
});

//判断添加的用户是否重复
app.get('/adduser_name',function(req,res){
    let adduser_name = req.query.name;
    // console.log(addcate_name);
    MongoClient.connect('mongodb://localhost:27017',function(err,database){
        //检测是否有同名
        let db = database.db('win');
        let users = db.collection('user');
        // console.log(adduser_name);
        users.findOne({'name':adduser_name},function(err,result){
            // console.log(result);
            if(result){
                res.send('1');
            }else{
                res.send('0');
            }
        })
    })
})

//添加用户
app.get('/adduser',function(req,res){
    MongoClient.connect('mongodb://localhost:27017',function(err,database){
        // console.log(req.body);
        let db = database.db('win');
        let users = db.collection('user');
        let addcate_name = req.query.name;
        let addcate_time = req.query.time;
        let addcate_pass = req.query.pass;
        addcate_pass = addcate_pass*1;
        users.find({}).sort({id:-1}).limit(1).toArray((err,result)=>{
            var add_id=result[0].id;
            add_id++;
            console.log(add_id,addcate_name,addcate_time,addcate_pass);
            users.insert({'id':add_id,'name':addcate_name,'password':addcate_pass,'time':addcate_time},function(err2,result2){
                res.send(result2);
            })

        })
    });
})

//订单列表
app.get('/orderlist',function(req,res){
    MongoClient.connect('mongodb://localhost:27017',function(err,database){
        let db = database.db('win');
        let user = db.collection('orderlist');
        let count = 0;
        let page = req.query.page;
        let limit = req.query.limit;

        user.find().toArray(function(err2,result2){
            sum = result2.length;
            return sum;
        });

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
    }); 
});

//登录
let urlencodedParser2 = bodyParser.urlencoded({ extended: false })//中间件，用于解析POST请求传来的数据
app.post('/login',urlencodedParser2,function(req,res){
    MongoClient.connect('mongodb://localhost:27017',function(err,database){
        // console.log(req.body);
        let db = database.db('win');
        let user = db.collection('login');
        let username = req.body.username;
        let password = req.body.userpass;
        // console.log(username);
        // console.log(password);
        user.find({'username':username,'password':password}).toArray(function(err,result){
            if(result){
                res.send({'code':1})
            }else{
                res.send({'code':0})
            }
        })
    });
})

app.listen(3008,function(){
    console.log('服务器已在3008端口起飞')
});