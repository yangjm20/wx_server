var express = require('express');
var router = express.Router();


const { ExercisesModel,LessonDetailModel} = require('../db/db_test')

const exercises = require('../data/exercises/e0021.js')


router.post('/saveExercise', function (req, res) {


    const {lessonId, sectionId, voideId,lessonName} = req.body
    const exercises1 = exercises.examination
    var exerciseId = lessonId + sectionId + voideId;
    ExercisesModel.findOne({exerciseId}, function (err, exercises) {
        if (exercises) {
            res.send({code: 1, msg: '此练习题已经存在'});
        } else {
            new ExercisesModel({exerciseId, examinations: exercises1}).save(function (err, exercise) {
                if(exercise){
                   console.log("练习题上传成功")
                    LessonDetailModel.findOne({lessonName},function(error,lesson){
                        if(lesson){
                            console.log(lessonName+"存在")
                            var less=lesson.lesson;
                            less[sectionId].section[voideId].isUploadExercise=true;
                            LessonDetailModel.update({lessonName},{$set:{lesson:less}},function (err,updateLessionDetail) {
                                if(updateLessionDetail.ok==1){
                                    console.log("上传习题记录更新成功")
                                    res.send({code: 0, data: {exercise: exercise}})
                                }else{
                                    console.log("上传习题记录更新失败")
                                }
                            })
                        }
                    })


                }else{
                    console.log("练习题上传失败");

                    res.send({code:1,msg:"上传练习题失败"})
                }
            })
        }
    })
})

router.get("/getExercise", function (req, res) {
    const {exerciseId} = req.query
    console.log(exerciseId)
    ExercisesModel.findOne({exerciseId}, function (err, exercises) {
        res.send({code: 0, data: exercises})
    })
})

module.exports = router;