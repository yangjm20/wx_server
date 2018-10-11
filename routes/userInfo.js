
var express = require('express');
var router = express.Router();


const {UserInfoModel,IsExercisedModel} = require('../db/db_test')


router.post('/getOpenId', async (req, res) => {
    const Ut = require('../common/utils');
    const lessons=isExercised.isExercised[0];

    try {
        const {code} = req.body;

        /*个人的微信id
        let appId = "wxd2eceb6c21234981";
        let secret = "abe92e02ac154a8a79b89a319e030675";*/

        let appId = "wxa372f08bd326c566";
        let secret = "948bf486f197ebd3f1090ba447308435"

        let opts = {
            url: `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${code}&grant_type=authorization_code`
        }
        let r1 = await Ut.promiseReq(opts);
        r1 = JSON.parse(r1);
        console.log(r1);
        console.log(r1.openid);


//判断用户是否注册
        UserInfoModel.findOne({userId:r1.openid},function (errors,userInfos) {
            if(!userInfos){
                new UserInfoModel({userId:r1.openid,isBuy:[{lessonIsBuy:false},{lessonIsBuy:false},{lessonIsBuy:false},{lessonIsBuy:false}]}).save(function (err,userInfo) {

                    if (userInfo) {
                        console.log("创建用户信息成功")
                        IsExercisedModel.findOne({userId:r1.openid},function (err,isExercise) {
                            if(!isExercise){

                                new IsExercisedModel({userId:r1.openid,lessons:lessons['lessons']}).save(function (err,saveIsExe) {
                                    if(saveIsExe){
                                        res.send({code: 0,session_key:r1.session_key, userInfo:userInfo})
                                        console.log("初始化用户是否答题表")
                                    }else{
                                        res.send({code: 3, session_key:r1.session_key,msg:"新建用户信息成功但初始化用户是否答题失败"})
                                        console.log("保存是否练习失败")
                                    }
                                })
                            }
                        })

                    } else {
                        res.send({code: 1, session_key:r1.session_key,msg:"新建新用户信息失败"})
                        console.log("新建用户信息失败")
                    }
                })
            }else{
                res.send({code: 2, session_key:r1.session_key,userInfo:userInfos})
                console.log("用户存在")
            }
        })
        //res.json(r1);
    } catch (e) {
        console.log(e)
        res.json(e)
    }

})

router.get('/getUserInfo',function (req,res) {
    const {userId}=req.query;

    UserInfoModel.findOne({userId},function (err,userInfo) {
        if(userInfo){
            console.log("查找用户信息成功")
            res.send({code:0,userInfo:userInfo})
        }else{
            res.send({code:1,msg:'用户信息不存在'})
        }
    })
})

router.post('/updateUserInfo',function (req,res) {


    const {userId,lessonId}=req.body;

    UserInfoModel.findOne({userId},function (error,userInfo) {
        if(userInfo){
            console.log("用户信息存在")
            if(userInfo.isBuy[lessonId].lessonIsBuy){
                console.log("用户已经购买了该课程")
                res.send({code:1,msg:"该用户已经购买了此课程"});
                console.log("该用户已经购买了此课程")
            }else{
                var isBuy=userInfo.isBuy;
                for(var i=0;i<4;i++){

                    if(i==lessonId.valueOf()){

                        isBuy[i].lessonIsBuy=true;
                    }
                }
                UserInfoModel.update({userId},{$set:{isBuy:isBuy}},function (err,userInfoUpdate) {
                    if(userInfoUpdate.ok==1){
                        console.log("更新成功")
                        UserInfoModel.findOne({userId},function (error,userInfo) {
                            res.send({code:0,userInfo:userInfo})
                        })
                    }else{
                        res.send({code:2,msg:"用户购买信息更新失败"})
                    }


                })
            }
        }else{
            res.send({code:3,msg:"用户不存在"})

            console.log("用户不存在")
        }
    })
})


module.exports = router;
