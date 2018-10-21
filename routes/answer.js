var express = require('express');
var router = express.Router();


const {AnswerModel,LessonDetailModel} = require('../db/db_test')

const answers = require('../data/answer/a0021.js')

router.post('/saveAnswer', function (req, res) {
    const {lessonId, sectionId, voideId,lessonName} = req.body
    var exerciseId = lessonId + sectionId + voideId;
    const answ = answers.answers
    AnswerModel.findOne({exerciseId}, function (err, answer) {
        if (answer) {
            res.send({conde: 1, msg: '此答案已经存在'})
        } else {
            new AnswerModel({exerciseId, answers: answ}).save(function (err, answers) {

                if(answers){
                    console.log("习题答案上传成功")
                    LessonDetailModel.findOne({lessonName},function(error,lesson){
                        if(lesson){
                            console.log(lessonName+"存在")
                            var less=lesson.lesson;
                            less[sectionId].section[voideId].isUploadAnswer=true;
                            LessonDetailModel.update({lessonName},{$set:{lesson:less}},function (err,updateLessionDetail) {
                                if(updateLessionDetail.ok==1){
                                    console.log("上传习题答案记录更新成功")
                                    res.send({code: 0, data: {answers: answers}})
                                }else{
                                    console.log("上传习题答案记录更新失败")
                                }
                            })
                        }
                    })
                }else{
                    console.log("习题答案上传失败");

                    res.send({code:1,msg:"上传习题答案失败"})
                }





            })
        }
    })
})

router.get('/getAnswer', function (req, res) {

    const {lessonId, sectionId, voideId} = req.query
    var exerciseId = lessonId + sectionId + voideId;

    console.log(exerciseId)

    AnswerModel.findOne({exerciseId}, function (err, answer) {
        console.log("answer11")
        console.log(answer)
        if (answer) {
            res.send({code: 0, answer: answer})
        } else {
            res.send({code: 1, msg: '答案未上传'})
        }
    })
})

module.exports = router;