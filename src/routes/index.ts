const testRouter = require('./test');
const notifyRouter = require('./notification');
const roomRouter = require('./room');

function route(app: any) {
    app.use('/api/v1/test', testRouter);
    app.use('/api/v1/notification', notifyRouter);
    app.use('/api/v1/room', roomRouter);
}

module.exports = route;