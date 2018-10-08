var express = require('express');
var router = express.Router();


const {AnswerModel} = require('../db/db_test')

const answers = require('../data/answers.js')

router.post('/saveAnswer', function (req, res) {
    const {lessonId, sectionId, voideId} = req.body
    var exerciseId = lessonId + sectionId + voideId;
    const answ = answers.answers
    AnswerModel.findOne({exerciseId}, function (err, answer) {
        if (answer) {
            res.send({conde: 1, msg: '此答案已经存在'})
        } else {
            new AnswerModel({exerciseId, answers: answ}).save(function (err, answers) {
                res.send({code: 0, data: {answers: answers}})

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