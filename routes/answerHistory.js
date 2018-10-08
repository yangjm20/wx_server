var express = require('express');
var router = express.Router();


const {AnswerHistoryModel} = require('../db/db_test')


router.get('/getAnswerHistory', function (req, res) {
    const {id} = req.query;
    console.log(id)
    AnswerHistoryModel.findOne({id}, function (err, ansHis) {
        if (ansHis) {
            res.send({code: 1, msg: '已做'})
        } else {
            res.send({code: 0, msg: '未做'})
        }
    })
})

module.exports = router;