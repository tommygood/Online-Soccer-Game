var express = require('express');
var session = require('express-session');
var app = express();
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');
var config = require("config");
const router = require('express').Router();
const server = require('http').Server(app);
const io = require('socket.io')(server);
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
app.use(session({secret : 'secret', saveUninitialized: false, resave: true}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.set("view engine", "jade");
app.set("views", "jade");
app.use('/', require('./api/main'));
app.use(express.static('public')); 
app.use('/images', express.static('images'));
const db = require("mariadb");
const pool = db.createPool({
    trace : true,
    host : 'localhost',
    user : 'wang',
    password : 'wang313',
    database : 'soccer'
});


var html_home = config.get("server.root")+"templates/";
    
// total player number
total_player = 0;
left_point = 0;
right_point = 0;
io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        if (total_player > 0) {
            total_player -= 1;
        }
        console.log("有玩家登出，剩餘玩家 " + total_player);
        io.emit("logout_msg", total_player);
    });
    
    socket.on("docMsg", (msg) => {
        //console.log(msg);
        io.emit("msg", msg);
    });
    
    socket.on("isGoal", (msg) => {
        //console.log(msg);
        left_point = msg.goal[0];
        right_point = msg.goal[1];
        io.emit("is_goal", msg);
    });
    
    socket.on("loginMsg", (msg) => {
        total_player += 1;
        //console.log(total_player);
        io.emit("login_msg", {total_player : total_player, left_point : left_point, right_point : right_point});
    });
    
    socket.on("saveKeepMsg", (msg) => {
        // save keep message to db
        var kmId = keepDb(msg); 
        kmId.then(function(kmId) {
            // return message and kmId
            io.emit("keepMsg", msg, kmId.toString());
        })
    });
});

server.listen(5000, function () {
    console.log('Node server is running..');
});
