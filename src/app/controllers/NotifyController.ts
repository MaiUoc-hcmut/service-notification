const NotificationModel = require('../../db/model/notification');
const RoomSocket = require('../../db/model/room');
const StudentNotification = require('../../db/model/student-noti');

import { Request, Response, NextFunction } from "express";
import { socketInstance } from "../..";


const { sequelize } = require('../../config/db/index');

const axios = require('axios');

declare global {
    namespace Express {
        interface Request {
            teacher?: any;
            student?: any;
            admin?: any;
            user?: USER;
            getAll?: boolean;
            authority?: number;
        }
        type USER = {
            user?: any,
            role?: string,
        }
    }

}

class NotificationController {
    // Add name of course, exam and related information when create notification

    // [GET] /notification/create-course
    notifyCreateCourse = async (req: Request, res: Response, _next: NextFunction) => {
        const t = await sequelize.transaction();
        try {
            const { id_user, id_course, id_forum, name } = req.body;

            const io = socketInstance.getIoInstance();
            const clientConnected = socketInstance.getClientConnected();

            const findUser = clientConnected.find(obj => obj.user === id_user);
            if (findUser) {
                io.to(`${findUser.socket}`).emit("created_course", {
                    message: "Course has been created!",
                    course: id_course,
                    name
                });
            }

            const newNoti = await NotificationModel.create({
                id_user,
                content: "Khóa học được tạo thành công",
                type: "course",
                name
            }, {
                transaction: t
            });

            const userInRoom = await RoomSocket.findOne({
                where: { id_user, room: id_forum }
            });

            if (!userInRoom) {
                await RoomSocket.create({
                    id_user,
                    room: id_forum
                });
            }

            await t.commit();

            res.status(200).json({
                message: "Notification has been sent to user!",
                newNoti
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ message: error.message, error });

            await t.rollback();
        }
    }

    // [GET] /notification/create-exam
    notifyCreateExam = async (req: Request, res: Response, _next: NextFunction) => {
        const t = await sequelize.transaction();
        try {
            const { id_user, id_exam, name } = req.body;

            const io = socketInstance.getIoInstance();
            const clientConnected = socketInstance.getClientConnected();

            const findUser = clientConnected.find(obj => obj.user === id_user);
            if (findUser) {
                io.to(findUser.socket).emit("created_exam", {
                    message: "Exam has been created!",
                    exam: id_exam,
                    name
                });
            }

            const newNoti = await NotificationModel.create({
                id_user,
                content: "Đề thi được tạo thành công",
                type: "exam",
                name
            }, {
                transaction: t
            });

            await t.commit();

            res.status(200).json({
                message: "Notification has been sent to user!",
                newNoti
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ message: error.message, error });

            await t.rollback();
        }
    }

    // [POST] /notification/report-error
    notifyReportErrorOfQuestion = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const { id_user, id_question, id_exam } = req.body;

            const io = socketInstance.getIoInstance();
            const clientConnected = socketInstance.getClientConnected();

            const findUser = clientConnected.find(obj => obj.user === id_user);
            if (findUser) {
                io.to(findUser.socket).emit("reported_error", {
                    message: "You have a report about the question!",
                    question: id_question,
                    exam: id_exam
                });
            }

            const newNoti = await NotificationModel.create({
                id_user,
                content: "Student has reported about the question",
                type: "report",
                id_exam
            });

            res.status(200).json({
                message: "Notification has been sent to user!",
                notification: newNoti
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ message: error.message, error });
        }
    }

    // [POST] /notification/create-topic
    notifyCreateTopic = async (req: Request, res: Response, _next: NextFunction) => {
        const t = await sequelize.transaction();
        try {
            const { id_forum, id_course, name, id_topic, course_name, author } = req.body.data;

            const io = socketInstance.getIoInstance();

            io.to(`${id_forum}`).emit("created_topic", {
                message: "A user had have created a topic in forum",
                forum: id_forum,
                author
            });

            const usersInRoom = await RoomSocket.findAll({
                where: { room: id_forum }
            });

            const dataToCreate = usersInRoom
                .filter((user: any) => user.id_user !== author)
                .map((user: any) => ({
                    id_user: user.id_user,
                    content: "Có người vừa tạo topic mới ở trong forum",
                    type: "topic",
                    name,
                    id_topic,
                    id_forum,
                    id_course,
                    course_name
                }));

            const notifications = await NotificationModel.bulkCreate(dataToCreate);

            await t.commit();

            res.status(200).json({
                message: "Notification has been sent to user!",
                notifications
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ message: error.message, error });

            await t.rollback();
        }
    }

    // [POST] /notification/student-buy-course
    notifyStudentBuyCourse = async (req: Request, res: Response, _next: NextFunction) => {
        const t = await sequelize.transaction();
        try {
            const { course, name, id_teacher, id_student, id_forum } = req.body.data;

            const io = socketInstance.getIoInstance();
            const clientConnected = socketInstance.getClientConnected();

            const findUser = clientConnected.find(obj => obj.user === id_teacher);
            if (findUser) {
                io.to(findUser.socket).emit("student_buy_course", {
                    message: "Một học sinh đã mua khóa học",
                    course,
                    name
                });
            }

            const newNoti = await NotificationModel.create({
                id_user: id_teacher,
                content: "Một học sinh đã mua khóa học",
                type: "course",
                name
            });

            const userInRoom = await RoomSocket.findOne({
                where: { id_user: id_student, room: id_forum }
            });

            if (!userInRoom) {
                await RoomSocket.create({
                    id_user: id_student,
                    room: id_forum
                });
            }

            await t.commit();

            res.status(201).json(newNoti);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ message: error.message, error });

            await t.rollback();
        }
    }

    // [GET] /notification/upload-video
    notifyUploadVideo = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const { url, name, id_user } = req.body;

            const io = socketInstance.getIoInstance();
            const clientConnected = socketInstance.getClientConnected();

            const findUser = clientConnected.find(obj => obj.user === id_user);
            if (findUser) {
                io.to(findUser.socket).emit("uploaded_video", {
                    message: "Video has been uploaded to cloud!",
                    url,
                    name
                });
            }

            res.status(200).json({
                message: "Notification has been sent to user!",
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ message: error.message, error });
        }
    }

    // [PUT] /notification/read-noti
    readNotification = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const notifications = req.body.data;

            await NotificationModel.update({ read: true }, {
                where: {
                    id: notifications
                }
            });

            res.status(200).json({
                message: "All notification have read",
                notifications
            });

        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ message: error.message, error });
        }
    }

    // [GET] /notification/get-noti/:userId/page/:page
    getNotificationOfUser = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const currentPage: number = +req.params.page;
            const pageSize: number = parseInt(process.env.SIZE_OF_PAGE || '10');

            const id_user = req.params.userId;

            const count = await NotificationModel.count({
                where: { id_user },
                distinct: true
            })

            const notifications = await NotificationModel.findAll({
                where: { id_user },
                order: [['createdAt', 'DESC']],
                limit: pageSize,
                offset: pageSize * (currentPage - 1)
            });

            res.status(200).json({
                count,
                notifications
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ message: error.message, error });
        }
    }

    // [POST] /notification/create-answer/:topicId
    notifyCreateAnswer = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const id_topic = req.params.topicId;

            
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ message: error.message, error });
        }
    }

    // [POST] /notification/teacher-send
    teacherSendNotification = async (req: Request, res: Response, _next: NextFunction) => {
        const t = await sequelize.transaction();
        try {
            let body = req.body.data;
            if (typeof body === "string") {
                body = JSON.parse(body);
            }

            const teacher_name = req.teacher?.data.name;
            const id_teacher = req.teacher?.data.id;

            let { users, ...message } = body;

            const io = socketInstance.getIoInstance();
            const clientConnected = socketInstance.getClientConnected();

            users = Array.from(new Set(users));
            let onlineClientInRoom = clientConnected.filter(client => users.includes(client.user));
            let sockets = onlineClientInRoom.map(client => client.socket);

            sockets.forEach(socket => {
                io.to(socket).emit("teacher_send_notification", {
                    ...message,
                    name: teacher_name
                });
            });

            const dataToCreate = users.map((id_user: string) => ({
                id_user,
                content: message.message,
                name: teacher_name,
                type: "teacher"
            }));

            const notifications = await NotificationModel.bulkCreate(dataToCreate, { transaction: t });
            const teacherNoti = await NotificationModel.create({
                id_user: id_teacher,
                content: message.message,
                type: "send"
            }, {
                transaction: t
            });

            const studentRecords = users.map((id_user: string) => ({
                id_student: id_user,
                id_notification: teacherNoti.id
            }));

            const students = await StudentNotification.bulkCreate(studentRecords, { transaction: t });

            teacherNoti.dataValues.students = students;

            await t.commit();

            res.status(201).json(teacherNoti);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ message: error.message, error });

            await t.rollback();
        }
    }

    // [GET] /notification/payment
    notifyPayment = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const body = req.body;

            console.log(body);

            const io = socketInstance.getIoInstance();

            io.to(body.user).emit("payment_done", {
                body
            });

            res.status(200).json({
                mesasge: "Notification has been sent to user!"
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ message: error.message, error });
        }
    }

    // [POST] /notification/comment-on-assignment
    notifyTeacherCommentOnAssignment = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const { id_assignment, id_course, exam_name, teacher_name, id_student } = req.body.data;

            const io = socketInstance.getIoInstance();
            const clientConnected = socketInstance.getClientConnected();
            
            const findUser = clientConnected.find(obj => obj.user === id_student);
            if (findUser) {
                io.to(findUser.socket).emit("teacher_review_assignment", {
                    message: "Giáo viên đã nhận xét bài làm của bạn",
                    exam: exam_name,
                    teacher: teacher_name,
                    id_course
                });
            }

            const newNoti = await NotificationModel.create({
                id_user: id_student,
                content: "Giáo viên đã nhận xét bài làm",
                type: "assignment",
                exam_name,
                id_assignment,
                id_course,
                name: teacher_name
            });

            res.status(201).json(newNoti);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ message: error.message, error });
        }
    }

    // [POST] /notification/comment-on-lecture
    notificationStudentCommentOnLecture = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const {
                id_teacher,
                id_topic,
                id_course,
                course_name,
                student_name
            } = req.body.data;

            const io = socketInstance.getIoInstance();
            const clientConnected = socketInstance.getClientConnected();
            
            const findUser = clientConnected.find(obj => obj.user === id_teacher);
            if (findUser) {
                io.to(findUser.socket).emit("student_comment_on_topic", {
                    message: "Học sinh đã bình luận trong một bài giảng",
                    student_name,
                    course_name,
                    id_course
                });
            }

            const newNoti = await NotificationModel.create({
                id_user: id_teacher,
                id_topic,
                course_name,
                id_course,
                name: student_name,
                content: "Học sinh đã bình luận trong một bài giảng",
                type: "comment"
            });

            res.status(201).json(newNoti);

        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ message: error.message, error });
        }
    }

    // [GET] /notification/teacher/:teacherId/page/:page
    getNotifyTeacherSent = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const id_user = req.params.teacherId;

            const pageSize = 10;
            const currentPage: number = +req.params.page;

            const count = await NotificationModel.count({
                where: {
                    id_user,
                    type: "send"
                }
            });
            
            const notifications = await NotificationModel.findAll({
                where: {
                    id_user,
                    type: "send"
                },
                limit: pageSize,
                offset: pageSize * (currentPage - 1)
            });

            res.status(200).json({
                count,
                notifications
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ message: error.message, error });
        }
    }

    // [GET] /notification/list-student/:notificationId
    getListStudentOfNotiTeacherSent = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const id_notification = req.params.notificationId;
            const students = await StudentNotification.findAll({
                where: {
                    id_notification
                }
            });

            let studentList: {
                name: string,
                avatar: string,
                id: string,
                email: string
            }[] = [];

            for (const student of students) {
                try {
                    const s = await axios.get(`${process.env.BASE_URL_USER_LOCAL}/student/${student.id_student}`);
                    studentList.push({
                        name: s.data.name,
                        avatar: s.data.avatar,
                        id: s.data.id,
                        email: s.data.email
                    });
                } catch (error) {
                    studentList.push({
                        id: student.id_student,
                        avatar: "error",
                        name: "error",
                        email: "error"
                    });
                }
            }

            res.status(200).json(studentList);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({ message: error.message, error });
        }
    }
}

module.exports = new NotificationController();