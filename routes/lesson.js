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
        if(lessons) {
            console.log("查找成功")
            return res.json({code: 0, data: lessons})
        }else{
            res.send({code:1,msg:"无课程信息，建议添加相关课程"})
        }

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
                if(lesson){
                    console.log("新建成功")
                    res.send({code: 0, data: {lessonDetail: lesson}})
                }else{
                    console.log("新建失败")
                    res.send({code: 2, msg:"新建课程信息失败"})
                }

            })
        }
    })
})

router.get('/getLessonDetail', function (req, res) {

    LessonDetailModel.find(function (err, lessonsDetail) {
        if(lessonsDetail){
            console.log("查找到相关的信息")
            return res.json({code: 0, data: lessonsDetail})
        }else{
            console.log("没有查找到课程详细信息")
            return res.json({code: 1, msg:"没有查找的课程详情记录，请先添加课程详细信息"})
        }

    })
})

router.get('/getLessonDetailById', function (req, res) {
    const {lessonId} = req.query
    console.log(lessonId)

    LessonDetailModel.find(function (err, lessonsDetail) {
        if(lessonsDetail[lessonId]){
            console.log("课程信息查找成功")
            return res.json({code: 0, data: lessonsDetail[lessonId]})
        }else{
            console.log("课程信息查找失败")
            res.send({code: 1, msg:"课程信息查找失败"})
        }
    })
})

module.exports = router;