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


router.get('/:id', function(req, res, next) {
	var id = req.params.id; 
	connection.query('select * from people where fuserid=?;', [id], function(err, cursor){
		if(err == null && cursor.length == 0){
			res.status(200).json({result : true});
		}else if(cursor.length == 1){
			res.status(201).json({result : true});
		}else{
			console.log("err : "+err);
			res.status(503).json({result : false});
		}
	});
});
/*
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
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files){
	var fid = fields.id;
	var name = fields.name;
	var profile = fields.profile;
	connection.query('insert into people(name, fuserid, profile) values (?, ?, ?);',[ name, fid, profile], function (error, info){
		if(error == null){
			console.log("enroll succ");
			res.json({result : true});
		}else{
			console.log("register err:"+err);
			res.status(503).json(err);
		}
	});
    });
    
});

module.exports = router;
