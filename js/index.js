var player_id;
var had_login = false;
var total_player;
var lock_back_ball = false; // 球隨機回到一個位置的鎖
document.addEventListener("DOMContentLoaded", () => { // load message into browser
    socket.on("msg", function (chat_msg) {
        if (chat_msg.ball_owner != undefined) { // 交換球權
            ball_owner = chat_msg.ball_owner;
            console.log("ball_owner " + ball_owner);
            return;
        }
        if (chat_msg.shoot) { // 射門
            const now_time = chat_msg.shoot[2];
            shoot_duration = now_time - chat_msg.shoot[0];
            console.log("射門時間 " + shoot_duration + ", 現在時間 " + now_time + ", 起始時間" + chat_msg.shoot[0]);
            if (chat_msg.shoot[3]) {
                shoot(shoot_duration, chat_msg.shoot[1]);
            }
            else {
                shoot(shoot_duration*-1, chat_msg.shoot[1]);
            }
            lock_until_up = false;
            ball_owner = 0; // 射門後交出球權
            return
        }
        if (chat_msg.animate_shoot) { // 射門動畫
            if (chat_msg.animate_shoot_para) {
                animateShoot(chat_msg.user_id, true);
            }
            else {
                animateShoot(chat_msg.user_id, false);
            }
            return;
        }
        if (chat_msg.animate_shoot_rm) { // 射門動畫
            if (chat_msg.animate_shoot_para) {
                animateShootRm(chat_msg.user_id, true);
            }
            else {
                animateShootRm(chat_msg.user_id, false);
            }
            return;
        }
        if (chat_msg.mkRushroom) { // 製作香菇
            mkRushroom(chat_msg.random[0], chat_msg.random[1]);
            return;
        }
        if (chat_msg.touch_rushroom) { // 有玩家碰到香菇
            // 加速此玩家
            window["pos_player"+chat_msg.user_id][2] = 10;
            // 5 秒後解除加速
            const clear_speed = setInterval(function () {
                window["pos_player"+chat_msg.user_id][2] = 3;
                clearInterval(clear_speed);
            }, 5000);
            rmRushroom(chat_msg.rushroom_id); // 移除香菇
            return;
        }
        // 同步玩家位置
        pos_player1 = chat_msg[4];
        pos_player2 = chat_msg[5];
        pos_player3 = chat_msg[6];
        pos_player4 = chat_msg[7];
        moveKey(chat_msg[0], chat_msg[1], false);
    })
    
    socket.on("login_msg", function (chat_msg) { // load user id
        if (!had_login) { // 還沒登入過
            console.log("My player id = " + chat_msg.total_player);
            player_id = chat_msg.total_player;
            total_player = chat_msg.total_player;
            getId('header').innerHTML += "user " + chat_msg.total_player;
            had_login = true;
            mkPlayer(chat_msg.total_player); // 製作所有玩家
            // 還原現在比分
            left_point = chat_msg.left_point;
            right_point = chat_msg.right_point;
        }
        else { // 已經登入過，代表有新的玩家加入
            total_player = chat_msg.total_player;
            alert('有新玩家登入，重新開始！');
            restart(); // 重置物件
            // 製作新玩家
            if (chat_msg.total_player > player_id) {
                mkPlayer(chat_msg.total_player);
            }
        }
    })
    
    socket.on("logout_msg", function (chat_msg) { // show which user logout
        total_player -= 1; // 總玩家 -1
        console.log("player id " + chat_msg + " logout.")
    })
    
    socket.on("is_goal", function (chat_msg) { // load user id
        // 球回到隨機點
        const back_random = setInterval(function () {
            if (!lock_back_ball && chat_msg.ball_random[0] == 800) { // bug prevent
                getId('ball').style.marginLeft = chat_msg.ball_random[0];
                getId('ball').style.marginTop = chat_msg.ball_random[1];
                lock_back_ball = true; // 上鎖
            }
            console.log("隨機 " +chat_msg.ball_random);
            clearInterval(back_random);
        }, 300);
        lock_back_ball = false; // 解鎖
    })
    
    socket.on("change_point", function (msg) { // 更新比數
        left_point = msg[0];
        right_point = msg[1];
    })
})

function restart() { // 重新開始，重置物件
    // 球回到原點
    getId('ball').style.marginLeft = "800px";
    getId('ball').style.marginTop = "200px";
    // 重置玩家位置
    pos_player1 = [808,67,3];
    pos_player2 = [808,67,3];
    pos_player3 = [808,67,3];
    pos_player4 = [808,67,3];
    /*for (let i = 0;i < total_player;i++) {
        moveKey(total_player+1, 39, true);
    }*/
    rmAllRushroom(); // 重新製作香菇
    total_rushroom = 0;
}

function rmAllRushroom() { // 移除所有香菇
    for (let i = 0;i < total_rushroom;i++) {
        if (getId('rushroom_'+i) != null) {
            document.body.removeChild(getId('rushroom_'+i)); 
        }
    }
}

function rmRushroom(rushroom_id) { // 移除香菇
    if (getId(rushroom_id) != null) {
        document.body.removeChild(getId(rushroom_id)); 
    }
    else {
        console.log("not found " + rushroom_id)
    }
}

function mkPlayer(player_num) {
    for (let i = 0;i < player_num;i++) {
        drawAdidas(i+1);
    }
}

function getId(id) {
    return document.getElementById(id);
}

function userLogin() {
    socket.emit("loginMsg", 1);
}
userLogin();

var shoot_duration; // 射門時間
var lock_until_up = false; // 防止計算射門時間算到重新計算的開始時間
function getKey(e) { // 得到輸入鍵            
    socket.emit("docMsg", [player_id, e.keyCode, getId('ball').style.marginTop, getId('ball').style.marginLeft, pos_player1, pos_player2, pos_player3, pos_player4]);
    if (e.keyCode == "68") { // d = 抄球
        if (player_touch_ball.includes(player_id)) { // 有觸碰到球，交換球權
            ball_owner = player_id;
            socket.emit("docMsg", {ball_owner : ball_owner});
            console.log('球權 ' + player_id);
        }
        return;
    }
    else if (e.keyCode == "69") { // e = 右射門
        if (!lock_until_up) { // 沒有被鎖住
            shoot_duration = Date.now(); // 按下 e 的起始時間，不要重複計算
            lock_until_up = true;
        }
        socket.emit("docMsg", {animate_shoot : true, animate_shoot_para : false, user_id : player_id});
        //animateShoot(false);
    }
    else if (e.keyCode == "87") { // w = 左射門
        if (!lock_until_up) { // 沒有被鎖住
            shoot_duration = Date.now(); // 按下 w 的起始時間，不要重複計算
            lock_until_up = true;
        }
        socket.emit("docMsg", {animate_shoot : true, animate_shoot_para : true, user_id : player_id});
        //animateShoot(true);
    }
}
getId('body').addEventListener('keydown', getKey ,false) //偵測按鍵
getId('body').addEventListener('keyup', getKeyUp ,false) //偵測按鍵

function animateShoot(user_id, is_right) { // 射門動畫
    if (is_right) { // 是右腳的動作
        drawRightFoot(user_id, true);
    }
    else { // 是左腳的動作
        drawLeftFoot(user_id, true);
    }
}

function animateShootRm(user_id, is_right) { // 射門動畫後，還原腳
    if (is_right) { // 是右腳的動作
        drawRightFoot(user_id, false);
    }
    else { // 是左腳的動作
        drawLeftFoot(user_id, false);
    }
}

function getKeyUp(e) {
    if (e.keyCode == "69") {
        if (ball_owner == player_id) { // 有球權，可以射門
            var random_top = (getRandomInt(5) * 0.1); // 隨機往下偏移
            // 廣播射門
            socket.emit("docMsg", {shoot : [shoot_duration, random_top, Date.now(), true]});
        }
        // 把射完門的腳還原
        socket.emit("docMsg", {animate_shoot_rm : true, animate_shoot_para : false, user_id : player_id});
    }
    else if (e.keyCode == "87") {
        if (ball_owner == player_id) { // 有球權，可以射門
            var random_top = (getRandomInt(5) * 0.1); // 隨機往下偏移
            // 廣播射門
            socket.emit("docMsg", {shoot : [shoot_duration, random_top*-1, Date.now(), false]});
        }
        // 把射完門的腳還原
        socket.emit("docMsg", {animate_shoot_rm : true, animate_shoot_para : true, user_id : player_id});
    }
}

var left_point = 0;
var right_point = 0;
function shoot(shoot_duration, random_top) { // 射門
    console.log(shoot_duration);
    console.log("現在時間 " + Date.now());
    var all_shoot = [];
    now_ball = parseInt(outPx(getId('ball').style.marginLeft)); // 球原本位置，去掉 px
    now_ball_top = parseInt(outPx(getId('ball').style.marginTop)); // 球原本位置，去掉 px
    shoot_duration = shoot_duration/5;
    random_top = (shoot_duration * random_top); // 隨機偏移公式，射的越遠偏移越多
    var start_time = 100;
    var each_shoot = setInterval(function () {
        now_ball += shoot_duration; // 橫向的移動幅度
        now_ball_top += random_top; // 縱向的移動
        // 邊界
        if (now_ball < 0) {
            now_ball = 0;
        }
        else if (now_ball > 1300) {
            now_ball = 1300;
        }
        if (now_ball_top < 0) {
            now_ball_top = 0;
        }
        else if (now_ball_top > 500) {
            now_ball_top = 500;
        }
        console.log(now_ball);
        console.log(now_ball_top);
        // 射門移動球
        getId('ball').style.marginLeft = now_ball + 'px';
        getId('ball').style.marginTop = now_ball_top + 'px';
        //console.log(getId('ball').style.marginLeft);
        all_shoot.push(each_shoot);
        delShot(all_shoot);
    }, start_time);
    start_time += 100; // 間隔時間
    var each_shoot1 = setInterval(function () {
        now_ball += shoot_duration; // 橫向的移動幅度
        now_ball_top += random_top; // 
            // 邊界
        if (now_ball < 0) {
            now_ball = 0;
        }
        else if (now_ball > 1300) {
            now_ball = 1300;
        }
        if (now_ball_top < 0) {
            now_ball_top = 0;
        }
        else if (now_ball_top > 500) {
            now_ball_top = 500;
        }
        //console.log(getId('ball').style.marginLeft);
        getId('ball').style.marginLeft = now_ball + 'px';
        getId('ball').style.marginTop = now_ball_top + 'px';
        //console.log(getId('ball').style.marginLeft);
        all_shoot.push(each_shoot1);
        delShot(all_shoot);
    }, start_time);
    start_time += 100; // 間隔時間
    var new_ball_pos = ball_pos;
    console.log()
    new_ball_pos.x += shoot_duration*2;
    new_ball_pos.y += random_top*2;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function delShot(all_shoot) {
    console.log(all_shoot);
    for (let i = 0;i < all_shoot.length;i++) {
        clearInterval(all_shoot[i]);
    }
}

function outPx(pos) { // 不要後面的 px
    if (pos == "") { // 一開始球還沒有位置
        return '250px'; // 球的起始位置
    }
    only_num = ''
    for (let i = 0;i < pos.length-2;i++) {
        only_num += pos[i];
    }
    return only_num;
}

now_top = 0;
now_left = 0;
// player start position and speed
pos_player1 = [808,67,3];
pos_player2 = [808,67,3];
pos_player3 = [808,67,3];
pos_player4 = [808,67,3];
function moveKey(user_id, key, restart) { // 移動該玩家
    const pos = getPosition(getId('myCanvas'));
    var move_speed;
    if (restart) { // 是重置位置
        move_speed = 0; //
    }
    else {
        move_speed = window["pos_player"+user_id][2]; // 移動速度
    }
    if (key == 39) { // 右
        animate(user_id, true);
        window["pos_player"+user_id][0] += move_speed;
        getId('myCanvas'+user_id).style.marginLeft = (window["pos_player"+user_id][0] + 'px');
        getId('right_foot'+user_id).style.marginLeft = (window["pos_player"+user_id][0] + 'px');
        getId('right_hand'+user_id).style.marginLeft = (window["pos_player"+user_id][0] + 'px');
        getId('left_foot'+user_id).style.marginLeft = (window["pos_player"+user_id][0] + 'px');
        getId('left_hand'+user_id).style.marginLeft = (window["pos_player"+user_id][0] + 'px');
        if (ball_owner == user_id) { // 如果球權在此玩家上，就讓球跟著此玩家跑
            getId('ball').style.marginLeft = (window["pos_player"+user_id][0] + 'px');
        }
    }
    else if (key == 37) { // 左
        animate(user_id, true);
        window["pos_player"+user_id][0] -= move_speed;
        getId('myCanvas'+user_id).style.marginLeft = (window["pos_player"+user_id][0] + 'px');
        getId('right_foot'+user_id).style.marginLeft = (window["pos_player"+user_id][0] + 'px');
        getId('right_hand'+user_id).style.marginLeft = (window["pos_player"+user_id][0] + 'px');
        getId('left_foot'+user_id).style.marginLeft = (window["pos_player"+user_id][0] + 'px');
        getId('left_hand'+user_id).style.marginLeft = (window["pos_player"+user_id][0] + 'px');
        if (ball_owner == user_id) { // 如果球權在此玩家上，就讓球跟著此玩家跑
            getId('ball').style.marginLeft = (window["pos_player"+user_id][0] + 'px');
        }
    }
    else if (key == 38) { // 上
        animate(user_id, false);
        window["pos_player"+user_id][1] -= move_speed;
        getId('myCanvas'+user_id).style.marginTop = (window["pos_player"+user_id][1] + 'px');
        getId('right_foot'+user_id).style.marginTop = (window["pos_player"+user_id][1] + 'px');
        getId('right_hand'+user_id).style.marginTop = (window["pos_player"+user_id][1] + 'px');
        getId('left_foot'+user_id).style.marginTop = (window["pos_player"+user_id][1] + 'px');
        getId('left_hand'+user_id).style.marginTop = (window["pos_player"+user_id][1] + 'px');
        if (ball_owner == user_id) { // 如果球權在此玩家上，就讓球跟著此玩家跑
            getId('ball').style.marginTop = (window["pos_player"+user_id][1]+20 + 'px');
        }
    }
    else if (key == 40) { // 下
        animate(user_id, false);
        window["pos_player"+user_id][1] += move_speed;
        getId('myCanvas'+user_id).style.marginTop = (window["pos_player"+user_id][1] + 'px');
        getId('right_foot'+user_id).style.marginTop = (window["pos_player"+user_id][1] + 'px');
        getId('right_hand'+user_id).style.marginTop = (window["pos_player"+user_id][1] + 'px');
        getId('left_foot'+user_id).style.marginTop = (window["pos_player"+user_id][1] + 'px');
        getId('left_hand'+user_id).style.marginTop = (window["pos_player"+user_id][1] + 'px');
        if (ball_owner == user_id) { // 如果球權在此玩家上，就讓球跟著此玩家跑
            getId('ball').style.marginTop = (window["pos_player"+user_id][1]+20 + 'px');
        }
    }
}

var all_move = []; // all animation move
var angle = 0; // move angle
function animate(user_id, foot) { // make player's animation when moving
    var start_time = 100;
    var each_ani = setInterval(function () {
        if (angle >= 2) { // angle never > 3
            angle = -2; // back
        }
        else {
            angle += 1;
        }
        // move foot
        if (foot) {
            getId('right_foot'+user_id).style.transform = 'rotate(' + angle + 'deg)';
            getId('left_foot'+user_id).style.transform = 'rotate(' + angle + 'deg)';
        }
        else {
            getId('right_hand'+user_id).style.transform = 'rotate(' + angle + 'deg)';
            getId('left_hand'+user_id).style.transform = 'rotate(' + angle + 'deg)';
        }
        all_move.push(each_ani);
        stopAnimate(); // stop move
    }, start_time);
    start_time += 100; // 間隔時間
}

function stopAnimate() { // stop animation move
    for (let i = 0;i < all_move.length;i++) {
        clearInterval(all_move[i]);
    }
}

function getPosition (element) {
    var x = 0;
    var y = 0;
    // 搭配上面的示意圖可比較輕鬆理解為何要這麼計算
    while ( element ) {
        x += element.offsetLeft - element.scrollLeft + element.clientLeft;
        y += element.offsetTop - element.scrollLeft + element.clientTop;
        element = element.offsetParent;
    }
    return { x: x, y: y };
}

function drawAdidas(user_id){
    console.log('myCanvas'+user_id);
    var c=document.getElementById('myCanvas'+user_id);
        var cxt=c.getContext('2d');
        cxt.save();
        // 整張臉
        cxt.beginPath();
        cxt.arc(15,15,10,0,Math.PI*2,true);
        cxt.fillStyle = "rgb(255," + user_id*50 + ",0)";
        cxt.fill();
        cxt.stroke();
        // body
        // 軀幹
        cxt.moveTo(15,20);
        cxt.lineTo(15,40);
        // 左邊的手
        drawLeftHand(user_id);
        // 右邊的手
        drawRightHand(user_id);
        // 左邊的腳
        drawLeftFoot(user_id, false);
        // 右邊的腳
        drawRightFoot(user_id, false);
        cxt.stroke(); // 劃出
        // 足球
        drawBall();
    // right foot
}

function drawRightFoot(user_id, is_shoot) { // 右邊的腳
    if (!is_shoot) {
        var obj=document.getElementById('right_foot'+user_id);
        var cxt=obj.getContext('2d');
        cxt.clearRect(0, 0, obj.width, obj.height); // 先清空原有的線條
        cxt.strokeStyle = 'black';
        cxt.save();
        cxt.beginPath();
        cxt.moveTo(15,40);
        cxt.lineTo(25,45);
        cxt.stroke(); // 
    }
    else {
        var obj=document.getElementById('right_foot'+user_id);
        var cxt=obj.getContext('2d');
        cxt.clearRect(0, 0, obj.width, obj.height); // 先清空原有的線條
        cxt.save();
        cxt.beginPath();
        cxt.moveTo(15,40);
        cxt.lineTo(45,65);
        cxt.strokeStyle = 'yellow';
        cxt.stroke(); // 
    }
}

function drawLeftFoot(user_id, is_shoot) { // 左邊的腳
    if (!is_shoot) {
        var obj=document.getElementById('left_foot'+user_id);
        var cxt=obj.getContext('2d');
        cxt.clearRect(0, 0, obj.width, obj.height); // 先清空原有的線條
        cxt.strokeStyle = 'black';
        cxt.save();
        cxt.beginPath();
        cxt.moveTo(15,40);
        cxt.lineTo(5,45);
        cxt.stroke(); // 劃出
    }
    else {
        var obj=document.getElementById('left_foot'+user_id);
        var cxt=obj.getContext('2d');
        cxt.clearRect(0, 0, obj.width, obj.height); // 先清空原有的線條
        cxt.save();
        cxt.beginPath();
        cxt.moveTo(15,40);
        cxt.lineTo(0,75);
        cxt.strokeStyle = 'yellow';
        cxt.stroke(); // 劃出
        console.log(123);
    }
}

function drawRightHand(user_id) { // 右手
    var obj=document.getElementById('right_hand'+user_id);
    var cxt=obj.getContext('2d');
    cxt.save();
    cxt.beginPath();
    cxt.moveTo(15,30);
    cxt.lineTo(25,35);
    cxt.stroke(); // 劃出
}

function drawLeftHand(user_id) { // 右手
    var obj=document.getElementById('left_hand'+user_id);
    var cxt=obj.getContext('2d');
    cxt.save();
    cxt.beginPath();
    cxt.moveTo(15,30);
    cxt.lineTo(5,35);
    cxt.stroke(); // 劃出
}

function drawBall() {
    var obj = document.getElementById('ball');
    var cxt= obj.getContext('2d');
    cxt.save();
    // 整張臉
    cxt.beginPath();
    cxt.arc(15,15,10,0,Math.PI*2,true);
    cxt.fillStyle = "orange"; // ball color
    cxt.fill();
    cxt.stroke(); // 劃出
}
//window.addEventListener("load",drawAdidas,true);


player_touch_ball = [];
ball_owner = 0; // ball owner's id
goal_lock = false; // 防止有兩個射球動作可能同時進兩次
setInterval(function () {
    // detect players touch the ball
    for (let i = 0;i < total_player;i++) {
        ball_pos = getPosition(getId('ball'));
        player_pos = getPosition(getId('myCanvas'+(i+1)));
        x_dis = player_pos.x - ball_pos.x;
        y_dis = player_pos.y - ball_pos.y;
        distance = (Math.abs(x_dis) + Math.abs(y_dis))/2;
        //console.log(distance);
        if (distance <= 25) {
            if (!player_touch_ball.includes(i+1)) {
                player_touch_ball.push(i+1);
            }
        }
        else {
            delTouchPlayer(i+1);
        }
    }
    // 檢查左球門是否進球
    if (isCollide(getId("goal"), getId("ball"))) {
        if (!goal_lock) { // 不是鎖住的
            clearInterval(setInterval(function () {}, 100));
            getId('goal_info').innerHTML = 'goal！\n左邊球門被攻破！'; // 顯示進球
            var clear_info = setInterval(function () { // 把進球資訊清空
                getId('goal_info').innerHTML = '';
                clearInterval(clear_info);
            }, 3000);
            // 進球後，讓球回到地圖中間，上下是隨機的位置
            const top = getRandomInt(600);
            socket.emit("isGoal", {goal : [left_point, right_point, false], ball_random : [800, top]});
        }
        ball_owner = 0;
        goal_lock = true;
    }
    // 檢查右球門是否進球
    else if (isCollideRight(getId("goal_right"), getId("ball"))) {
        if (!goal_lock) { // 不是鎖住的
            var lock_goal = setInterval(function () {
                clearInterval(lock_goal);
            }, 500);
            getId('goal_info').innerHTML = 'goal！\n右邊球門被攻破！'; // 顯示進球
            var clear_info = setInterval(function () { // 把進球資訊清空
                getId('goal_info').innerHTML = '';
                clearInterval(clear_info);
            }, 3000);
            // 進球後，讓球回到地圖中間，上下是隨機的位置
            const top = getRandomInt(600);
            socket.emit("isGoal", {goal : [left_point, right_point, true], ball_random : [800, top]});
        }
        ball_owner = 0;
        goal_lock = true;
    }
    // 更新得分資訊
    getId('show_left_point').innerHTML = "左邊進球數：" + left_point + "。右邊進球數：" + right_point;
    // 檢查是否碰到香菇
    for (let i = 0;i < total_rushroom;i++) {
        if (getId("rushroom_" + i) != null) {
            if (isCollideRushroom(getId("rushroom_" + i), getId('myCanvas' + player_id))) { // 碰到香菇，廣播加速
                socket.emit("docMsg", {touch_rushroom : true, user_id : player_id, rushroom_id : "rushroom_" + i});
            }
        }
    }
}, 500);

const rushroom_refresh_time = 10; // 香菇重生時間
var count_time = rushroom_refresh_time; // 計算過了幾秒，一開始先放一顆香菇
var total_rushroom = 0;
setInterval(function () { // 每一秒就解除不能進球的限制
    goal_lock = false;
    if (player_id == 1 && count_time == rushroom_refresh_time) {
        const left = getRandomInt(800);
        const top = getRandomInt(300);
        socket.emit("docMsg", {mkRushroom : true, random : [left, top]});
        count_time = 0;
    }
    count_time += 1;
}, 1000);

function mkRushroom(left, top) { // 做香菇
    var img = new Image();
    img.id = "rushroom_" + total_rushroom;
    img.src = "/images/rushroom.png";
    img.style.position = "absolute";
    img.style.left = left;
    img.style.top = top;
    img.style.width = "30px";
    img.style.height = "30px";
    document.body.appendChild(img);
    total_rushroom += 1;
}

function delTouchPlayer(del_user) { // delete user not touch the ball
    var new_touch_ball = []
    for (let i = 0;i < player_touch_ball.length;i++) {
        if (player_touch_ball[i] != del_user) {
            new_touch_ball.push(player_touch_ball[i]);
        }
    }
    player_touch_ball = new_touch_ball;
}

function isCollide(a, b) { // 偵測左邊球門是不是進球
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();
    return !(
        ((aRect.top + aRect.height) < (bRect.top)) ||
        (aRect.top > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width-100) < bRect.left) ||
        (aRect.left > (bRect.left + bRect.width))
    );
}

function isCollideRight(a, b) { // 偵測右邊球門是不是進球
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();
    return !(
        ((aRect.top + aRect.height) < (bRect.top)) ||
        (aRect.top > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width) < bRect.left) ||
        (aRect.left > (bRect.left + bRect.width - 120))
    );
}

function isCollideRushroom(a, b) { // 偵測是否碰到香菇
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();
    return !(
        ((aRect.top + aRect.height) < (bRect.top)) ||
        (aRect.top > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width) < bRect.left) ||
        (aRect.left > (bRect.left + bRect.width))
    );
}