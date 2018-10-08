var express = require('express');
var router = express.Router();


const {AnswerModel, ErrorsModel, UserAnswerAndAnswerModel} = require('../db/db_test')


router.get('/getErrors', function (req, res) {
    const {userId} = req.query;
    ErrorsModel.find({userId}, function (err, errors) {
        if (errors.length == 0) {
            res.send({code: 1, msg: '无错题记录'})
        } else {
            res.send({code: 0, errors: errors})
        }
    })
})

router.get('/getErrorsById', function (req, res) {
    const {id, exerciseId} = req.query;
    console.log(id);

    ErrorsModel.findOne({id}, function (err, errors) {
        if (!errors) {
            res.send({code: 1, msg: '无错题记录'})
        } else {
            UserAnswerAndAnswerModel.find({id}, function (err, answersOps) {
                if (answersOps) {

                    AnswerModel.findOne({exerciseId}, function (err, answer) {
                        if (answer) {
                            res.send({code: 0, answerOps: answersOps, answer: answer, errors: errors})
                        } else {

                            res.send({code: 3, msg: '此题老师还未出答案'})
                        }
                    })
                } else {
                    res.send({code: 2, msg: '此用户还未作答此题'})
                }
            })
        }
    })
})


module.exports = router;
