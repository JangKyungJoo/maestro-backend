var express = require('express');
var mysql =require('mysql');
var router = express.Router();

var connection =mysql.createConnection({
    'host' : 'aws-rds.cfrqhteukm94.us-west-2.rds.amazonaws.com',
    'user' : 'user', 
    'password' : '1q2w3e4r', 
    'database' :'maestro',
});

// people[id, name, seatno, type, password]. type default = 0(페북연동 x)
/*
router.get('/', function(req, res, next) { 
	connection.query('select id, title, timestamp from anomy_board '+'order by timestamp desc;', function (error, cursor){
		res.json(cursor);
	});
});

// show detail
router.get('/:content_id', function(req, res, next) {
    var id = req.params.content_id;
    connection.query('select * from anomy_board where id=?;',[id], function (error, cursor){
        if(error == null){    
            if (cursor.length > 0) 
                res.json(cursor[0]);
            else
                res.status(503).json({ 
                    result : false, reason : "Cannot find selected article"
                });
        }else{
            console.log("err : "+error);
        }
    });
});
*/

// register 
router.post('/', function(req, res, next){ 
    connection.query('insert into people(name, seatno, type, password) values (?, ?, ?, ?);', [req.body.name, req.body.seatno, 0, req.body.password], function (error, info){
        if (error == null){
        	res.status(200).json(info);
        }
        else
            res.status(503).json(error);
    });
    
});

module.exports = router;
