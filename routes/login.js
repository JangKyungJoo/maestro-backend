var express = require('express');
var mysql =require('mysql');
var router = express.Router();

var connection =mysql.createConnection({
    'host' : 'aws-rds.cfrqhteukm94.us-west-2.rds.amazonaws.com',
    'user' : 'user', 
    'password' : '1q2w3e4r', 
    'database' :'maestro',
});

// login check
router.post('/', function(req, res, next){
	var user_name = req.body.name;
	var user_pw = req.body.password;
	console.log("req : "+user_name+", "+user_pw);
	connection.query('select password from people where name=?;', [user_name], function (error, cursor){ 
		if(error == null){
			if(cursor.length>0 && cursor[0].password==user_pw){
                res.status(200).json({result : true});			
			}else{
                res.status(503).json({ 
                    result : false, reason : "check name / password"
                });
			}
		}else{
			res.status(503).json(error);
		}
	});   
});

module.exports = router;
