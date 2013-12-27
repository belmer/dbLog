var glob = require('glob'),
    winston = require('winston'),
    ConnectionPool = require('tedious-connection-pool');

module.exports = function(done) {
    var nconf = this.nconf;
	var _this = this;
    var dbLog = nconf.get('db_logger');
	//this.db = require('dirty')()
    var sqlConn = require('tedious').Connection;
    //Setup Database configurations
    var sqlConfig = {
        userName: nconf.get('db_username'),
        password: nconf.get('db_password'),
        server: nconf.get('db_server'),
        options:
        {
            database: nconf.get('db_name')
        }
    };

    var poolConfig = {
        min: nconf.get('db_pool_min'),
        max: nconf.get('db_pool_max'),
        idleTimeoutMillis: nconf.get('db_pool_idle_timeout')
    }

    //instantiate connection pool
    winston.info('DB - Starting Connection Pool with min: ' + poolConfig.min + ' max: ' + poolConfig.max + ' idle timeout: ' + poolConfig.idleTimeoutMillis + ' logging: ' + dbLog);
    var pool = new ConnectionPool(poolConfig, sqlConfig);

    //Create fake sqlConn object to mimic old interface for sake using existing code
    var db = {};
    var counter = 0;
    db.callProcedure = function(sqlReq) {
        var procedureName = sqlReq.sqlTextOrProcedure,
            callback = sqlReq.userCallback;
        counter++;
        var request_id = parseInt('' + counter);
        if(dbLog) winston.info('[ ID ' + request_id + ' ] DB Stored Procedure Call [ ' + procedureName + ' ] - Request Begin');
        if(dbLog)  winston.info('[ ID ' + request_id + ' ] DB Stored Procedure Call [ ' + procedureName + ' ] - Requesting Connection from Pool...');
        pool.requestConnection(function (err, connection) {

            if(err) {
                var errorMsg = '[ ID ' + request_id + ' ] DB Stored Procedure Call [ ' + procedureName + ' ] - Connection Request Error: ' + err;
                if(dbLog) winston.error(errorMsg);
                callback(errorMsg, null);
            }
            else
            {
                connection.on('connect', function(err) {
                    if(err) {
                        var errorMsg = '[ ID ' + request_id + ' ] DB Stored Procedure Call [ ' + procedureName + ' ] - Connection Request Error: ' + err;
                        if(dbLog)  winston.error(errorMsg);
                        callback(errorMsg, null);
                    }
                    else
                    {
                        if(dbLog) winston.info('[ ID ' + request_id + ' ] DB Stored Procedure Call [ ' + procedureName + ' ] - Successfully Connected, Invoking Stored Procedure...')
                        var newCallback = function(err, data) {
                            if(!err)
                            {
                                if(dbLog) winston.info('[ ID ' + request_id + ' ] DB Stored Procedure Call [ ' + procedureName + ' ] - Stored Procedure Successfully Invoked, Closing Connection and Initiating Callback...')
                            }
                            else
                            {
                                if(dbLog) winston.info('[ ID ' + request_id + ' ] DB Stored Procedure Call [ ' + procedureName + ' ] - Stored Procedure Failure, Closing Connection and Initiating Callback...')
                            }
                            connection.close();
                            callback(err,data)

                        }
                        sqlReq.userCallback = newCallback;
                        connection.callProcedure(sqlReq)
                    }
                })
            }
        });
    }
    _this.db = db;
    done();
    //var sqlConn = new sqlConn(sqlConfig);
    //winston.info('Connecting to SQL Database')
    /*sqlConn.on('connect', function(err) {
        if(err)
        {
<<<<<<< HEAD
            winston.info("ERROR " + err);
            //throw err;
=======
            winston.info(err);
            throw err;
>>>>>>> development
        }
        else
        {
            _this.db = sqlConn;
            winston.info('SQL Database Connected')
            done();
        }
<<<<<<< HEAD
    });
=======
    });  */
}