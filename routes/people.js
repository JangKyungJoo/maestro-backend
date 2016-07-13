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
module.exports = router;
