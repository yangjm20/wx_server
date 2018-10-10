/*包含 n 个能操作 mongodb 数据库集合的 model 的模块
1. 连接数据库
1.1. 引入 mongoose
1.2. 连接指定数据库(URL 只有数据库是变化的)
1.3. 获取连接对象
1.4. 绑定连接完成的监听(用来提示连接成功)
2. 定义出对应特定集合的 Model 并向外暴露
2.1. 字义 Schema(描述文档结构)
2.2. 定义 Model(与集合对应, 可以操作集合)
2.3. 向外暴露 Model
*/

//1. 连接数据库
//1.1. 引入 mongoose
const mongoose = require('mongoose')
//1.2. 连接指定数据库(URL 只有数据库是变化的)
mongoose.connect('mongodb://localhost:27017/wx_db')

//1.3. 获取连接对象
const conn = mongoose.connection
//1.4. 绑定连接完成的监听(用来提示连接成功)
conn.on('connected', function () {//连接成功回调
    console.log("数据库连接成功，YES！！！")
})

//2. 定义出对应特定集合的 Model 并向外暴露
//2.1. 字义 Schema(描述文档结构)
const lessonSchema = mongoose.Schema({
    lujing: {type: String, required: true},
    title: {type: String, required: true},
    subtitle: {type: String, required: true},
    flag: {type: Boolean, required: true},
    file_name: {type: String, required: true}
})

const userInfoSchema = mongoose.Schema({
    userId:{type:String,require:true},
    phone:{type:String},
    isBuy:[{
        lessonIsBuy:{type:Boolean,require:true},
        buyDate:{type:String},
        memberTime:{type:String}
    }],
})

const lessonDetailSchema = mongoose.Schema({
    lessonName: {type: String, required: true},
    lesson: [{
        sectionName: {type: String, required: true},
        section: [{
            url: {type: String},
            math_name: {type: String, required: true},
            isUpload:{type:Boolean,required:true},
            isUploadExercise:{type:Boolean,required:true},
            isUploadAnswer:{type:Boolean,required:true},
            TD: {type: String}
        }]
    }]
})

const exercisesSchema = mongoose.Schema({
    //课程、章节和节数组成  （如高数上第一章第一节记为013）
    exerciseId: {type: String, required: true},
    examinations: [
        {
            examinationType: {type: String, required: true},
            questions: [
                {
                    question: {type: String, required: true},
                    options: [
                        {
                            op: {type: String},
                            option: {type: String}
                        }
                    ]
                }
            ]

        }
    ]
})

const answerSchema = mongoose.Schema({
    exerciseId: {type: String, required: true},
    answers: [{
        answerId: {type: String, require: true},
        answer: {type: String, required: true},
        analysis: {type: String, required: true}
    }
    ]
})



const isExercisedSchema=mongoose.Schema({
    userId:{type:String,required:true},
    lessons:[{
        sessions:[{
            vodies: [
                {
                    vodieId:{type:String,required:true},
                    isExercised:{type:Boolean,required:true},
                    isWatched:{type:Boolean,required:true},

                }
            ]
        }]
    }]

})



const userAnswerAndAnswerSchema=mongoose.Schema({
    id:{type:String,require:true},//openid+lessonId+sessionId+id;
    userAnswerAndAnswer:{
        userAnswerOptions:{type:Object,require:true},
        answerOptions:{type:Object,require:true}
    }
})

const answerHistorySchema = mongoose.Schema({
    id: {type: String, required: true},
    userId: {type: String, required: true},
    time: {type: String, required: true},
    lessonId: {type: String, required: true},
    sessionId: {type: String, required: true},
    vodieId: {type: String, required: true},
    sumScore: {type: String, required: true},
})

const errorsSchema = mongoose.Schema({
    id: {type: String, required: true},
    userId: {type: String, required: true},
    lessonId: {type: String, required: true},
    sessionId: {type: String, required: true},
    vodieId: {type: String, required: true},
    time: {type: String, required: true},
    errorIndex: {type: Object, required: true}
})
//2.2. 定义 Model(与集合对应, 可以操作集合)
const LessonModel = mongoose.model('lesson', lessonSchema)//集合名称为users
const LessonDetailModel = mongoose.model('lessonDetail', lessonDetailSchema)
const ExercisesModel = mongoose.model('exercises', exercisesSchema)
const AnswerModel = mongoose.model('answers', answerSchema)
const AnswerHistoryModel = mongoose.model('answerHistory', answerHistorySchema)
const ErrorsModel = mongoose.model('errorsHistory', errorsSchema)
const UserAnswerAndAnswerModel = mongoose.model('userAnswerAndAnswerOptions', userAnswerAndAnswerSchema)
const UserInfoModel = mongoose.model('userInfo', userInfoSchema)
const IsExercisedModel = mongoose.model('isExercised', isExercisedSchema)
//2.3. 向外暴露 Model

exports.LessonModel = LessonModel
exports.LessonDetailModel = LessonDetailModel
exports.ExercisesModel = ExercisesModel
exports.AnswerModel = AnswerModel
exports.AnswerHistoryModel = AnswerHistoryModel
exports.ErrorsModel = ErrorsModel
exports.UserAnswerAndAnswerModel = UserAnswerAndAnswerModel
exports.UserInfoModel = UserInfoModel
exports.IsExercisedModel = IsExercisedModel




