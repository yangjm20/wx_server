
var express = require('express');
var router = express.Router();

const {IsExercisedModel,UserInfoModel, AnswerModel, AnswerHistoryModel, ErrorsModel, UserAnswerAndAnswerModel} = require('../db/db_test')

const isExercised=require('../data/isExercised.js')
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

//注册一个路由：
/*
* a）path为：/register
* b)请求方式为：POST
* c）接收参数
* d）注册成功返回：{code:0,data:{_id:'abc',username:'xxx',password:'123'}}
* f)注册失败返回：{code:1,msg:'此用户存在'}
* */
//1.获取请求参数
//2.处理
//3.返回响应数据



router.post('/getIsExercised',function (req,res) {
    console.log("fdsfa")
    const {userId}=req.body;
    console.log(userId)
    IsExercisedModel.findOne({userId},function (err,isExercised) {
        if(isExercised){
            console.log(isExercised);
            res.send({code:0,isExercised:isExercised})
        }else{
            res.send({code:1,msg:"不存在已经做的记录"})
        }
    })
})

router.get('/getUserAnswer', function (req, res) {
    const {id} = req.query;

    UserAnswerModel.findOne({id}, function (err, userAnswer) {
        if (userAnswer) {
            res.send({code: 0, userAnswer: userAnswer})
        } else {
            res.send({code: 1, msg: '未找到该用户关于此题的答案'})
        }
    })
})

router.post('/getScoreDetail', function (req, res) {
    const {answerStudent, lessonId, sessionId, vodieId, userId} = req.body
    var sumScore = 0;
    var exerciseId = lessonId + sessionId + vodieId;
    var id = userId + exerciseId;
    var data = new Date();
    var time = data.getFullYear() + '-' + data.getMonth() + '-' + data.getDay();

    var errorIndex = [null];
    var userAnswers = [null];


    AnswerModel.findOne({exerciseId}, function (err, exercises) {
        if (exercises) {
            console.log("答案存在")
            console.log("-----------")
            console.log(exercises.answers)
            console.log(answerStudent)
            console.log("-----------")

            for (var i = 0, z = 0, j = 0; i < exercises.answers.length; i++, j += 2) {
                if (answerStudent[j].toString() == exercises.answers[i].answer) {
                    sumScore += 20
                    userAnswers[i] = {userAnswerId: i, userAnswer: answerStudent[j]}
                } else {
                    errorIndex[z++] = i;
                    userAnswers[i] = {userAnswerId: i, userAnswer: answerStudent[j]}
                }
            }

            AnswerHistoryModel.findOne({id},function (err,answerHis) {
                if(answerHis){
                    console.log("答题历史记录存在，覆盖旧的记录");
                    AnswerHistoryModel.update({id},{$set:{userId,time,lessonId,sessionId,vodieId,sumScore}},function (err,updateAnsHis) {
                        if(updateAnsHis.ok==1){
                            console.log("更新答题历史记录成功")
                            AnswerHistoryModel.findOne({id},function (err,answerhis) {
                                if(answerhis){
                                    console.log("找到更新的答题历史记录")

                                    if(errorIndex){
                                        console.log("当前有做错题的题目")
                                        ErrorsModel.findOne({id},function (err,errorsHis) {
                                            if(errorsHis){
                                                console.log("有错题历史记录，需要更新")

                                                ErrorsModel.update({id},{$set:{userId,lessonId,sessionId,vodieId,time,errorIndex}},function (err,updateErrosHis) {
                                                    if(updateErrosHis.ok==1){
                                                        console.log("错题历史记录更新成功")
                                                        ErrorsModel.findOne({id},function (err,errors) {
                                                            if(errors){
                                                                console.log("查找更新的错题历史记录成功")
                                                                res.send({code:0,score:sumScore,answers:exercises.answers,answerhistory:answerhis,error:errors})
                                                            }else{
                                                                console.log("未能找到更新的错题历史记录")
                                                            }
                                                        })
                                                    }else{
                                                        console.log("错题历史记录更新失败")
                                                        res.send({code:1,msg:错题历史记录更新失败})
                                                    }
                                                })
                                            }else{
                                                console.log("无错题历史记录，需要创建新的错题记录")
                                                new ErrorsModel({id, userId, lessonId, sessionId, vodieId, time, errorIndex}).save(function (err, errors) {
                                                    console.log("创建错题记录")
                                                    res.send({
                                                        code: 0,
                                                        score: sumScore,
                                                        answers: exercises.answers,
                                                        answerhistory: answerhis,
                                                        error: errors
                                                    })
                                                })
                                            }
                                        })
                                    }else{
                                       console.log("当前没有做错的题目，无需添加")
                                        res.send({code:1,msg:"当前没有做错的题目，无需添加"})
                                    }
                                }else{
                                    console.log("未找到更新的历史记录")
                                    res.send({code:1,msg:"未找到更新的历史记录"});
                                }
                            })


                        }else{
                            console.log("更新答题历史记录失败")
                            res.send({code:1,msg:"更新答题历史记录失败"})
                        }
                    })


                }else{
                    console.log("无答题历史记录，需要重新创建")
                    new AnswerHistoryModel({id, userId, time, lessonId, sessionId, vodieId, sumScore}).save(function (err, answerhis) {
                        console.log("创建答题历史记录");
                        console.log(answerhis)
                        if (errorIndex) {
                            console.log("当前有做错题的题目")
                            ErrorsModel.findOne({id},function (err,errorhis) {
                                if(errorhis){
                                    console.log("有错题历史记录，需要覆盖旧的记录")
                                    ErrorsModel.update({id},{$set:{userId,lessonId,sessionId,vodieId,time,errorIndex}},function (err,updateErrosHis) {
                                        if(updateErrosHis.ok==1){
                                            console.log("更新错题记录成功")
                                            ErrorsModel.findOne({id},function (error,errorHis) {
                                                res.send({code:0,score:sumScore,answers:exercises.answers,answerhistory: answerhis,error:errorHis})
                                            })
                                        }else{
                                            res.send({code:1,msg:"用户购买信息更新失败"})
                                        }
                                    })

                                }else{
                                    console.log("无错题历史记录，需要创建新的错题记录")
                                    new ErrorsModel({id, userId, lessonId, sessionId, vodieId, time, errorIndex}).save(function (err, errors) {
                                        console.log("创建错题记录")
                                        res.send({
                                            code: 0,
                                            score: sumScore,
                                            answers: exercises.answers,
                                            answerhistory: answerhis,
                                            error: errors
                                        })
                                    })

                                }
                            })
                        } else {
                            console.log("当前没有做错的题目")
                            res.send({code: 1, score: sumScore, answers: exercises.answers, answerhistory: answerhis})

                        }


                    })

                }
            })

        } else {
            console.log('还未上传答案')
            res.send({code: 2, msg: '答案不存在'})
        }

    })
})

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
        console.log(r1.openid);


//判断用户是否注册
        UserInfoModel.findOne({userId:r1.openid},function (errors,userInfos) {
            if(!userInfos){
                new UserInfoModel({userId:r1.openid,isBuy:[{lessonIsBuy:false},{lessonIsBuy:false},{lessonIsBuy:false},{lessonIsBuy:false}]}).save(function (err,userInfo) {

                    if (userInfo) {

                        IsExercisedModel.findOne({userId:r1.openid},function (err,isExercise) {
                            if(!isExercise){

                                new IsExercisedModel({userId:r1.openid,lessons:lessons['lessons']}).save(function (err,saveIsExe) {
                                    if(saveIsExe){
                                        res.send({code: 0, userInfo:userInfo})
                                        console.log("创建新用户成功")
                                    }else{
                                        res.send({code: 3, msg:"保存是否练习失败"})
                                        console.log("保存是否练习失败")
                                    }
                                })
                            }
                        })

                    } else {
                        res.send({code: 1, msg:"创建新用户失败"})
                        console.log("创建新用户失败")
                    }
                })
            }else{
                res.send({code: 2, userInfo:userInfos})
                console.log("用户存在")
            }
        })
        //res.json(r1);
    } catch (e) {
        console.log(e)
        res.json(e)
    }

})

router.get('/getHistory', function (req, res) {
    const {userId} = req.query;

    AnswerHistoryModel.find({userId}, function (err, answerHistory) {
        if (!answerHistory) {
            res.send({code: 1, msg: '无历史记录'})
        } else {
            res.send({code: 0, history: answerHistory})
        }

    })
})


router.post('/saveAnswerAndUserAnswerOps', function (req, res) {


    const {id,userId ,answerOptions, userAnswerOptions,lessonId,sessionId,vodieId} = req.body;

    console.log(lessonId+sessionId+vodieId);

    IsExercisedModel.findOne({userId},function (err,isExercised) {

        var lessons=isExercised.lessons;
        lessons[lessonId].sessions[sessionId].vodies[vodieId].isExercised=true;
        console.log(lessons[lessonId].sessions[sessionId].vodies[vodieId])
        IsExercisedModel.update({userId},{$set:{lessons}},function (err,updateIsexercise) {
            if(updateIsexercise.ok==1){
                console.log("是否答题更新成功")
            }else{
                console.log("是否答题更新失败")
            }

        })
    })


    var userAnswerAndAnswer = {userAnswerOptions, answerOptions}
    console.log(id)
    UserAnswerAndAnswerModel.findOne({id},function (err,findUserAndAns) {
        if(findUserAndAns){
            console.log("答案和用户答案已经存在，需要重新更新");
            UserAnswerAndAnswerModel.update({id},{$set:{userAnswerAndAnswer}},function (err,updateUserAndAns) {
                if(updateUserAndAns.ok==1){
                    UserAnswerAndAnswerModel.findOne({id},function (err,findUserAndAns) {
                        if(findUserAndAns){
                            console.log("查找答案和用户答案成功");
                            res.send({code:0,userAnswerAndAnswerOp:findUserAndAns})
                        }else{
                            console.log("未查找到更新的答案和用户答案记录");
                            res.send({code:1,msg:"未查找到更新的答案和用户答案记录"})
                        }
                    })
                }else{
                    console.log("答案和用户答案更新不成功");
                    res.send({code: 2, msg:"答案和用户答案更新不成功"})
                }
            })

        }else{
            console.log("答案和用户答案不存在，需要创建新的记录");

            new UserAnswerAndAnswerModel({id, userAnswerAndAnswer}).save(function (err, userAnswerAndAnswerOp) {
                if (userAnswerAndAnswerOp) {
                    console.log("hahahhah")
                    res.send({code: 0, userAnswerAndAnswerOp: userAnswerAndAnswerOp})
                } else {
                    res.send({code: 1, msg: '报存答案失败'})
                }

            })
        }
    })

})

router.get('/getAnswerAndUserAnswerOps', function (req, res) {
    const {id} = req.query;

    UserAnswerAndAnswerModel.find({id}, function (err, answerAnduserAnsOps) {
        if (answerAnduserAnsOps) {
            res.send({code: 0, answerAnduserAnsOps: answerAnduserAnsOps})
        } else {
            res.send({code: 1, msg: '无答案记录，用户可能还未作答'})
        }
    })
})
module.exports = router;







