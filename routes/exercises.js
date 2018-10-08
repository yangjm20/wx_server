var express = require('express');
var router = express.Router();


const { ExercisesModel} = require('../db/db_test')

const exercises = require('../data/e001.js')


router.post('/saveExercise', function (req, res) {


    const {lessonId, sectionId, voideId} = req.body
    const exercises1 = exercises.examination
    var exerciseId = lessonId + sectionId + voideId;
    ExercisesModel.findOne({exerciseId}, function (err, exercises) {
        if (exercises) {
            res.send({code: 1, msg: '此练习题已经存在'});
        } else {
            new ExercisesModel({exerciseId, examinations: exercises1}).save(function (err, exercise) {
                res.send({code: 0, data: {exercise: exercise}})
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