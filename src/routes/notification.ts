const express = require('express');
const router = express.Router();

const NotificationController = require('../app/controllers/NotifyController');
const Authorize = require('../app/middleware/authorize');

router.route('/create-course')
    .get(NotificationController.notifyCreateCourse);

router.route('/create-exam')
    .get(NotificationController.notifyCreateExam);

router.route('/create-topic')
    .post(NotificationController.notifyCreateTopic);

router.route('/report-error')
    .post(NotificationController.notifyReportErrorOfQuestion);

router.route('/upload-video')
    .get(NotificationController.notifyUploadVideo);

router.route('/student-buy-course')
    .post(NotificationController.notifyStudentBuyCourse);

router.route('/read-noti')
    .put(NotificationController.readNotification);

router.route('/get-noti/:userId/page/:page')
    .get(NotificationController.getNotificationOfUser);

router.route('/teacher-send')
    .post(Authorize.authorizeTeacher, NotificationController.teacherSendNotification);

router.route('/payment')
    .get(NotificationController.notifyPayment);

router.route('/comment-on-assignment')
    .post(NotificationController.notifyTeacherCommentOnAssignment);

router.route('/comment-on-lecture')
    .post(NotificationController.notificationStudentCommentOnLecture);

router.route('/teacher/:teacherId/page/:page')
    .get(NotificationController.getNotifyTeacherSent);

router.route('/list-student/:notificationId')
    .get(NotificationController.getListStudentOfNotiTeacherSent);

module.exports = router;

export {}