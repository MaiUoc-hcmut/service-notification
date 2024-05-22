const express = require('express');
const db = require('./config/db');
const cors = require('cors');
const createError = require('http-errors');
const bodyParser = require('body-parser');
const http = require('http');
const route = require('./routes');

import { SOCKETIO } from "./socket";

require('dotenv').config()

db.connect();

const app = express();
app.use(cors());
app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);
app.use(express.json());

route(app);

const server = http.createServer(app);
const socketInstance = new SOCKETIO(server);

server.listen(4003, () => {
    console.log("Server is running on port 4003");
});

export { socketInstance }