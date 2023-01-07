const router = require('express').Router();
var bodyParser = require("body-parser");
var db = require('mariadb');
//var func = require('../module/func');
var jwt = require('jsonwebtoken');
const pool = db.createPool({
    host : 'localhost',
    user : 'wang',
    password : 'wang313',
    database : 'auction'
});
var config = require("config"); // 設定檔
var root = config.get('server.root'); // 根目錄位置

router.get('/', function(req, res) {
    res.sendFile(root + 'templates/index.html');  //回應靜態文件
        return;
});

module.exports = router;
