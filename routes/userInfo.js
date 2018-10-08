
var express = require('express');
var router = express.Router();


const {UserInfoModel} = require('../db/db_test')


router.get('/getUserInfo',function (req,res) {
    const {userId}=req.query;

    UserInfoModel.findOne({userId},function (err,userInfo) {
        if(userInfo){
            console.log("用户信息存在");
            res.send({code:0,userInfo:userInfo})
        }else{
            res.send({code:1,msg:'用户信息不存在'})
        }
    })
})

router.post('/updateUserInfo',function (req,res) {


    const {userId,lessonId}=req.body;

    console.log("lessonId");
    console.log(lessonId)
    UserInfoModel.findOne({userId},function (error,userInfo) {
        if(userInfo){
            if(userInfo.isBuy[lessonId].lessonIsBuy){
                res.send({code:1,msg:"该用户已经购买了此课程"});
                console.log("该用户已经购买了此课程")
            }else{
                var isBuy=userInfo.isBuy;
                for(var i=0;i<4;i++){

                    if(i==lessonId.valueOf()){

                        isBuy[i].lessonIsBuy=true;
                    }
                }
                console.log(isBuy)
                UserInfoModel.update({userId},{$set:{isBuy:isBuy}},function (err,userInfoUpdate) {
                    if(userInfoUpdate.ok==1){
                        console.log("更新成功")
                        UserInfoModel.findOne({userId},function (error,userInfo) {
                            res.send({code:0,userInfo:userInfo})
                        })
                    }else{
                        res.send({code:1,msg:"用户购买信息更新失败"})
                    }


                })
            }
        }else{
            res.send({code:0,msg:"用户不存在"})

            console.log("用户不存在")
        }
    })
})

module.exports = router;
