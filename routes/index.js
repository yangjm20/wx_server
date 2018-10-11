
var express = require('express');
var router = express.Router();
var WXBizDataCrypt = require('./WXBizDataCrypt')

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
    const {userId}=req.body;
    IsExercisedModel.findOne({userId},function (err,isExercised) {
        if(isExercised){
            console.log("查找用户是否答题记录成功");
            res.send({code:0,isExercised:isExercised})
        }else{
            res.send({code:1,msg:"不存在用户是否答题记录"})
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

    var errorIndex=[];
    var userAnswers=[];


    AnswerModel.findOne({exerciseId}, function (err, exercises) {
        if (exercises) {
            console.log("答案存在")

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

                                    if(errorIndex.length!=0){
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
                                                                console.log("更新答题记录成功但未能找到更新的错题历史记录")
                                                                res.send({code:1,msg:"更新答题记录成功但未能找到更新的错题历史记录"})
                                                            }
                                                        })
                                                    }else{
                                                        console.log("更新答题记录成功但错题历史记录更新失败")
                                                        res.send({code:2,msg:"更新答题记录成功但错题历史记录更新失败"})
                                                    }
                                                })
                                            }else{
                                                console.log("更新答题记录成功但无错题历史记录，需要创建新的错题记录")
                                                new ErrorsModel({id, userId, lessonId, sessionId, vodieId, time, errorIndex}).save(function (err, errors) {
                                                    if(errors){
                                                        console.log("更新答题记录成功并且创建新的错题记录成功")
                                                        res.send({
                                                            code: 3,
                                                            score: sumScore,
                                                            answers: exercises.answers,
                                                            answerhistory: answerhis,
                                                            error: errors
                                                        })
                                                    }else{
                                                        res.send({code:4,msg:"更新答题记录成功但创建新的错题记录失败"})
                                                    }

                                                })
                                            }
                                        })
                                    }else{
                                        console.log("更新答题记录成功但这次没有做错的题目，查看之前有无记录，有删除")
                                        ErrorsModel.findOne({id},function (error,errs) {
                                            if(errs){
                                                ErrorsModel.deleteOne({id},function (err,removeError) {

                                                    if(removeError.ok==1){
                                                        console.log("更新答题记录成功，已经删除之前的错题记录")
                                                        res.send({code:5,score: sumScore,
                                                            answers: exercises.answers,
                                                            answerhistory: answerhis})
                                                    }else{
                                                        console.log("更新答题记录成功，已经删除之前的错题记录")
                                                        res.send({code:6,msg:"更新答题记录成功但删除错题记录失败"})
                                                    }

                                                })
                                            }else{
                                                console.log("更新答题记录成功,但之前也未做错")
                                                res.send({code:7,score: sumScore,
                                                    answers: exercises.answers,
                                                    answerhistory: answerhis})
                                            }
                                        })

                                    }
                                }else{
                                    console.log("未找到更新的答题历史记录")
                                    res.send({code:8,msg:"未找到更新答题历史记录"});
                                }
                            })


                        }else{
                            console.log("更新答题历史记录失败")
                            res.send({code:9,msg:"更新答题历史记录失败"})
                        }
                    })


                }else{
                    console.log("无答题历史记录，需要重新创建")
                    new AnswerHistoryModel({id, userId, time, lessonId, sessionId, vodieId, sumScore}).save(function (err, answerhis) {

                        if(answerhis){
                            console.log("创建答题历史记录成功");
                            if (errorIndex) {
                                console.log("当前有做错题的题目")
                                ErrorsModel.findOne({id},function (err,errorhis) {
                                    if(errorhis){
                                        console.log("创建答题历史记录成功,有错题历史记录，需要覆盖旧的记录")
                                        ErrorsModel.update({id},{$set:{userId,lessonId,sessionId,vodieId,time,errorIndex}},function (err,updateErrosHis) {
                                            if(updateErrosHis.ok==1){

                                                ErrorsModel.findOne({id},function (error,errorHis) {
                                                    console.log("创建答题历史记录成功,更新错题记录成功")
                                                    res.send({code:10,score:sumScore,answers:exercises.answers,answerhistory: answerhis,error:errorHis})
                                                })
                                            }else{
                                                console.log("创建答题历史记录成功,更新错题记录失败")
                                                res.send({code:11,msg:"创建答题历史记录成功,更新错题记录失败"})
                                            }
                                        })

                                    }else{
                                        console.log("创建答题历史记录成功，无错题历史记录，需要创建新的错题记录")
                                        new ErrorsModel({id, userId, lessonId, sessionId, vodieId, time, errorIndex}).save(function (err, errors) {
                                            if(errors){
                                                console.log("创建答题历史记录成功，创建错题记录成功")
                                                res.send({
                                                    code: 12,
                                                    score: sumScore,
                                                    answers: exercises.answers,
                                                    answerhistory: answerhis,
                                                    error: errors
                                                })
                                            }else{
                                                console.log("创建答题历史记录成功，创建错题记录失败")
                                                res.send({
                                                    code: 13,
                                                    msg:"创建答题历史记录成功，创建错题记录失败"
                                                })
                                            }

                                        })

                                    }
                                })
                            } else {
                                console.log("创建答题历史记录成功,当前没有做错的题目")
                                res.send({code: 14, score: sumScore, answers: exercises.answers, answerhistory: answerhis})
                            }
                        }else{
                            console.log("创建答题历史记录失败");
                            res.send({code:15,msg:"创建答题历史记录失败"})
                        }


                    })

                }
            })

        } else {
            console.log('还未上传答案')
            res.send({code: 16, msg: '答案不存在'})
        }

    })
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

router.post('/getPhone',function (req,res) {

    const {userId,session_key,encryptedData,iv}=req.body;

    var appId = 'wxa372f08bd326c566'
    console.log("--------------")

    console.log(userId+"----"+appId+"----"+session_key+"---"+encryptedData+"---"+iv);

    var pc = new WXBizDataCrypt(appId, session_key)

    var data = pc.decryptData(encryptedData , iv)

    console.log('解密后 data: ', data)
    console.log(data.phoneNumber);
    var phone=data.phoneNumber;
    UserInfoModel.update({userId},{$set:{phone:phone}},function (error,userInfoUpdate) {
        if(userInfoUpdate.ok==1){
            console.log("手机号更新成功")
            UserInfoModel.findOne({userId},function (error,userInfo) {
                console.log(userInfo);
                res.send({code:0,userInfo:userInfo,data:data})
            })
        }else{
            res.send({code:1,msg:"用户手机号更新失败"})
        }
    })

})
module.exports = router;

