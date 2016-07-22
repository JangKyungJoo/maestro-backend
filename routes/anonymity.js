var express = require('express');
var mysql =require('mysql');
var router = express.Router();

var connection =mysql.createConnection({
    'host' : 'aws-rds.cfrqhteukm94.us-west-2.rds.amazonaws.com',
    'user' : 'user', 
    'password' : '1q2w3e4r', 
    'database' :'maestro',
});

// show list 
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

// insert 
router.post('/:id', function(req, res, next){ 
    connection.query('insert into anomy_board(title, content, writerid) values (?, ?, ?);', [req.body.title, req.body.content, req.params.id], function (error, info){
        if (error == null){
	    console.log("writer id : " + req.params.id);
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

//delete
router.delete('/:id', function(req, res){
    var uid = req.params.id;
    var pid = req.query.articleid;
    connection.query('select writerid from anomy_board where id=?;', [pid], function(err, cursor){
	if(err==null && cursor.length>0){
	    if(cursor[0].writerid == uid){
		connection.query('delete from anomy_board where id=?;', [pid], function(err, info){
		    if(err==null){
			connection.query('select * from anomy_board order by timestamp desc;', function(err, cursor){
			    if(err==null)
				res.json(cursor);
			    else
				res.status(500).json({result : false});
			});
		    }else{
			res.status(501).json({result : false});
		    }
		});
	    }else{
		res.status(503).json({result : false});
	    }
	}else{
	    res.status(502).json({result : false});
	}
    });
});
module.exports = router;
