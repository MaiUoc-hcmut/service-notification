import { Socket, Server } from "socket.io";
const cron = require('node-cron');
const RoomSocket = require('./db/model/room');
const NotificationModel = require('./db/model/notification');

const axios = require('axios');

export class SOCKETIO {
    private io: Server;
    private clientConnected: {
        user: string,
        socket: string,
    }[];

    constructor(server: any) {
        this.clientConnected = [];
        this.io = new Server(server, { 
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            }
        });

        this.setupSocketEvents();
        this.scheduleNotification();
        this.reAssignCourseTimeLandMark();
    }

    private setupSocketEvents() {
        this.io.on("connection", (socket: Socket) => {
            console.log(`New user connected: ${socket.id}`)
            
            socket.on("new_user_online", async (userId) => {
                this.clientConnected.push({
                    user: userId,
                    socket: socket.id
                });

                // Join room when user online
                const userInRooms = await RoomSocket.findAll({
                    where: { id_user: userId }
                });

                for (const record of userInRooms) {
                    socket.join(`${record.room}`);
                }

            });

            socket.on("user_join_room", async (data) => {
                socket.join(`${data.room}`);

                const userInRoom = await RoomSocket.findOne({
                    where: { id_user: data.userId, room: data.room }
                });

                if (!userInRoom) {
                    await RoomSocket.create({
                        id_user: data.userId,
                        room: data.room
                    });
                }
            });

            socket.on("disconnect", () => {
                console.log(`User disconnected: ${socket.id}`);
                this.clientConnected = this.clientConnected.filter(obj => obj.socket !== socket.id);
            });
        });
    }

    private scheduleNotification() {
        cron.schedule('0 20 * * 1,5', async () => {
            const usersBuyCourses = await axios.get(`${process.env.BASE_URL_COURSE_LOCAL}/courses/student-course`);

            let usersOwnCourse: {
                userId: string,
                coursesInfor: {
                    boughtDate: Date,
                    courseId: string
                }[]
            }[] = [];

            let notificationTosend: {
                userId: string,
                coursesId: string[]
            }[] = []

            // Group data called from course service by userId
            for (const record of usersBuyCourses.data) {
                const foundObject = usersOwnCourse.find(o => o.userId === record.id_student);
                if (!foundObject) {
                    usersOwnCourse.push({
                        userId: record.id_student,
                        coursesInfor: [{ boughtDate: record.createdAt, courseId: record.id_course }]
                    });
                } else {
                    foundObject.coursesInfor.push({ boughtDate: record.createdAt, courseId: record.id_course });
                }
            }

            // Check that what course does not completed on schedule
            for (const user of usersOwnCourse) {
                for (const courseInfor of user.coursesInfor) {
                    const course = await axios.get(`${process.env.BASE_URL_COURSE_LOCAL}/courses/${courseInfor.courseId}`);
                    const progress = await axios.get(`${process.env.BASE_URL_COURSE_LOCAL}/progresses/${user.userId}/${courseInfor.courseId}`);

                    const [
                        start_time, 
                        end_time, 
                        total_topic
                    ] = [
                        new Date(course.data.start_time), 
                        new Date(course.data.end_time), 
                        course.data.total_lecture + course.data.total_exam
                    ];
                    const durationToLearn: number = (end_time.getTime() - start_time.getTime()) / (1000 * 60 * 60 * 24);
                    const today = new Date();
                    // If today is greater than end time of course or user just bought course less than 7 day then continue
                    if (
                        today.getTime() > end_time.getTime() || 
                        (today.getTime() - courseInfor.boughtDate.getTime()) / (1000 * 60 * 60 * 24) < 7 ||
                        today.getTime() < start_time.getTime()
                    ) {
                        continue;
                    }

                    // Rate that number of topic each day user should learn
                    const targetRate: number = total_topic / durationToLearn;

                    const restTopicToLearn: number = total_topic - progress.data.length;
                    const restDayToLearn: number = (end_time.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

                    // Each topic user should learn each day to complete the course on schedule
                    const restToLearnRate = restTopicToLearn / restDayToLearn;

                    // If user need to learn more topic than schdedule, add to array
                    if (restToLearnRate > targetRate) {
                        const foundObject = notificationTosend.find(o => o.userId === user.userId);

                        if (!foundObject) {
                            notificationTosend.push({
                                userId: user.userId,
                                coursesId: [courseInfor.courseId]
                            });
                        } else {
                            foundObject.coursesId.push(courseInfor.courseId);
                        }
                    }
                }
            }

            // Send notification to user
            for (const user of notificationTosend) {
                const foundUser = this.clientConnected.find(o => o.user === user.userId);
                if (foundUser) {
                    this.io.to(`${foundUser.socket}`).emit("system_send_notification", {
                        message: `Bạn có ${user.coursesId.length} khóa học chưa đúng tiến độ. Tăng tốc lên nào!!!`,
                        courses: user.coursesId
                    });
                }

                await NotificationModel.create({
                    id_user: user.userId,
                    content: `Bạn có ${user.coursesId.length} khóa học chưa đúng tiến độ. Tăng tốc lên nào!!!`
                });
            }
        });
    }

    private reAssignCourseTimeLandMark() {
        
    }

    getIoInstance() {
        return this.io;
    }

    getClientConnected() {
        return this.clientConnected;
    }
}

