const router = require('express').Router();
const path = require("path");

function getParentPath(dir) {
    // get parent absolute path
    n_dir = "";
    dir = dir.split("");
    while (dir.pop() != '/') {
	// pass
    }
    for (let i = 0;i < dir.length;i++) {
	n_dir += dir[i];
    }
    return n_dir;
}


router.get('/', function(req, res) {
    try {
	res.sendFile(getParentPath(__dirname) + "/templates/index.html");
    }
    catch (e) { 
        console.log(e);
    }
    return;
});

router.get('/index.js', function(req, res) {
    res.sendFile(getParentPath(__dirname) + '/js/index.js');
    return;
});

module.exports = router;
