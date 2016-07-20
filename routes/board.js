var express = require('express');
var mysql =require('mysql');
var multiparty = require('multiparty');
var router = express.Router();

var connection =mysql.createConnection({
    'host' : 'aws-rds.cfrqhteukm94.us-west-2.rds.amazonaws.com',
    'user' : 'user', 
    'password' : '1q2w3e4r', 
    'database' :'maestro',
});

// show list
router.get('/', function(req, res, next) { 
	connection.query('select id, title, timestamp from board '+'order by timestamp desc;', function (error, cursor){
		res.json(cursor);
	});
});

// show detail
router.get('/:content_id', function(req, res, next) {
    var id = req.params.content_id;
    connection.query('select * from board where id=?;',[id], function (error, cursor){
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

// insert 
router.post('/', function(req, res, next){
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files){
        var title = fields.title;
        var content = fields.content;
        var len = Object.keys(fields).length;

        if(len>2){

        }else{
            connection.query('insert into board(writerid, title, content, photoid) values (?, ?, ?, ?);', [1, title, content, null], function (error, info){
                if (error == null){
                    connection.query('select * from board where id=?;', [info.insertId], function (error, cursor){
                        if (cursor.length > 0) { 
                            res.json({
                                result : true, id : cursor[0].id, title : cursor[0].title, timestamp :cursor[0].timestamp,
                            });
                        }
                        else
                            res.status(503).json({ result : false, reason : "Cannot post article"});
                    });
                }
                else{
    		        console.log(error);
                    res.status(503).json(error);
    	        }
            });
        }
    });
});

module.exports = router;
