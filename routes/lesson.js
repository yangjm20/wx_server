var express = require('express');
var router = express.Router();


const {LessonModel, LessonDetailModel} = require('../db/db_test')

const lessonDe = require('../data/high_math1.js')


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

router.post('/saveLesson', function (req, res) {
    const {lujing, title, subtitle, flag, file_name} = req.body
    LessonModel.findOne({title}, function (err, lesson) {
        if (lesson) {
            res.send({code: 1, msg: '此课程已经存在'})
        } else {
            new LessonModel({lujing, title, subtitle, flag, file_name}).save(function (err, lesson) {
                res.send({code: 0, data: {lesson: lesson}})
            })
        }
    })
})

router.get('/getLesson', function (req, res) {
    LessonModel.find(function (err, lessons) {
        return res.json({code: 0, data: lessons})
    })
})

router.post('/saveLessonDetail', function (req, res) {
    const {lessonName} = req.body
    const array = lessonDe.high_math;


    LessonDetailModel.findOne({lessonName}, function (err, lessonDetail) {

        if (lessonDetail) {
            console.log(lessonDetail)
            res.send({code: 1, msg: '此课程详情已经存在'})
        } else {

            new LessonDetailModel({lessonName, lesson: array}).save(function (err, lesson) {
                res.send({code: 0, data: {lessonDetail: lesson}})
            })
        }
    })
})

router.get('/getLessonDetail', function (req, res) {
    console.log("ff")
    LessonDetailModel.find(function (err, lessonsDetail) {
        return res.json({code: 0, data: lessonsDetail})
    })
})

router.get('/getLessonDetailById', function (req, res) {
    const {lessonId} = req.query
    console.log(lessonId)

    LessonDetailModel.find(function (err, lessonsDetail) {
        return res.json({code: 0, data: lessonsDetail[lessonId]})
    })
})

module.exports = router;