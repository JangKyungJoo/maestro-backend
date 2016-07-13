var express = require('express');
var mysql =require('mysql');
var router = express.Router();

var connection =mysql.createConnection({
    'host' : 'aws-rds.cfrqhteukm94.us-west-2.rds.amazonaws.com',
    'user' : 'user', 
    'password' : '1q2w3e4r', 
    'database' :'maestro',
});

router.get('/', function(req, res, next) { 
	connection.query('select id, title, timestamp from anomy_board '+'order by timestamp desc;', function (error, cursor){
		res.json(cursor);
	});
});

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

router.post('/', function(req, res, next){ 
    connection.query('insert into anomy_board(title, content) values (?, ?);', [req.body.title, req.body.content], function (error, info){
        if (error == null){
            connection.query('select * from anomy_board where id=?;', [info.insertId], function (error, cursor){
                if (cursor.length > 0) { 
                    res.json({
                        result : true, id : cursor[0].id, title : cursor[0].title, timestamp :cursor[0].timestamp,
                    });
                }
                else
                    res.status(503).json({ result : false, reason : "Cannot post article"});
            });
        }
        else
            res.status(503).json(error);
    });
});
module.exports = router;
