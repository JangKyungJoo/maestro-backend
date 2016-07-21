var express = require('express');
var mysql =require('mysql');
var multiparty = require('multiparty');
var fs = require('fs');
var multer = require('multer');
var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './uploads');
	},
	filename: function(req, file, callback) {
		var filename = Date.now();
		callback(null, filename);
	}
});
var upload = multer({
	storage : storage
}).single('photo');
var router = express.Router();

var connection =mysql.createConnection({
    'host' : 'aws-rds.cfrqhteukm94.us-west-2.rds.amazonaws.com',
    'user' : 'user', 
    'password' : '1q2w3e4r', 
    'database' :'maestro',
});

// return img
router.get('/tmp/:path', function(req, res){
    var img = req.params.path;
    console.log("path : "+img);
    res.sendFile("/tmp/"+img);
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
            if (cursor.length > 0){
		if(cursor[0].photoid == 1){
			connection.query('select path from photo where postid=?;', [id], function(error, cur){
				if(error==null){
					res.json({
						result : true, writerid : cursor[0].writerid, title : cursor[0].title, content : cursor[0].content, photopath : cur[0].path, timestamp : cursor[0].timestamp});
				}else{			
					res.status(503).json({result : false, reason : "Cannot find selected article"});
				}
			});
		}else
                    res.json(cursor[0]);
            }else{
                res.status(503).json({ 
                    result : false, reason : "Cannot find selected article"
                });
	    }
        }else{
            console.log("err : "+error);
        }
    });
});

// insert 
router.post('/:id', function(req, res, next){
    var fid = req.params.id;
    connection.query('select id from people where fuserid=?;', [fid], function(err, cursor){
	if(err == null){
		fid = cursor[0].id;
    		var form = new multiparty.Form();
   		form.parse(req, function(err, fields, files){
       		var title = fields.title;
        	var content = fields.content;
		if(files.photo != undefined)
            		var file = files.photo[0];
        	if(file == null){
	    		connection.query('insert into board(writerid, title, content) values (?, ?, ?);', [fid, title, content], function(err, info){
				if(err==null){
					connection.query('select * from board where id=?;', [info.insertId], function(err, cursor){
						if(cursor.length > 0){
					res.json({
						result : true, id : cursor[0].id, title : cursor[0].title, timestamp : cursor[0].timestamp
					});
						}else{
					res.status(503).json({  result: false, reason : "Cannot post article"});
						}
					});
				}else{
					console.log(err);
					res.status(503).json(err);
				}
	    		});
        	}else{
  	    		upload(req, res, function(err){
				if(err)
					console.log("upload err : "+err);
	    		});
	    		console.log("file :  "+file.name+", "+file.path+", "+file.size);
	    		connection.query('insert into board(writerid, title, content, photoid) values (?, ?, ?, ?);', [1, title, content, 1], function(err, info){
				if(err==null){
					connection.query('insert into photo(postid, path) values (?, ?);', [info.insertId, file.path], function(err, info){
					if(err==null){
						connection.query('select * from board where id=?;', [info.insertId], function(err, cursor){
						if(cursor.length > 0){
							res.json({
								result : true, id : cursor[0].id, title : cursor[0].title, timestamp : cursor[0].timestamp, photoid : cursor[0].photoid
							});
						}else{
							res.status(503).json({result : false, reason : "Cannot post article"});
						}
						});
					}else{
						console.log(err);
						res.status(503).json(err);
					}
					});
				}else{
				console.log(err);
				res.status(503).json(err);
				}
	    		});
		}
   	 });
});

module.exports = router;
