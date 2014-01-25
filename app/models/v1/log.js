var sqlConn,
    sqlReq = require('tedious').Request,
    sqlTypes = require('tedious').TYPES,
    storeRowAsJSON = require('../modelHelper').storeRowAsJSON,
    responseCallback = require('../modelHelper').responseCallback,
    responseCallbackParam = require('../modelHelper').responseCallbackParam,
    IsNullOrEmpty = require('../modelHelper').IsNullOrEmpty,
    winston = require('winston'),
    fs = require('fs');
    util = require('util'),
    nconf = require('nconf'),
    counter = 0;

//Initialize Model
var LogModel = function(_db, _rabbit) {
    sqlConn = _db;
    hare=_rabbit;
    return LogModel;
}

//Model Public Methods:

LogModel.insertLog = function(logData, callback) {
    winston.info('LogModel : Inserting Log --Params: ' + util.inspect(logData));
    var responseJSON = { 'response':'false' };
    var errorJSON = 
    {
        'success':false,
        'error':
        {
            'code':0,
            'message':''
        }
    };

    function processLog(err, data){
        if(err)
        { 
            winston.error('LogModel : Inserting Log [ProcessLog] --DB Error: ' + util.inspect(err));
            errorJSON.error.code = 10;
            errorJSON.error.message = err;  
            callback(errorJSON,null);
        }
        else
        {
            if (data[0] > 0) 
                responseJSON.response = 'true'                                

            winston.info('LogModel : Successful in Inserting Log');
            callback(null,responseJSON);
        }
    }

    var responseData = [];
    var sqlreq = new sqlReq("usp_BeatSessionLog_Insert", responseCallback(responseData, processLog));
    sqlreq.addParameter('beatsession_guid', sqlTypes.VarChar, logData.beatsession_guid)
    sqlreq.addParameter('message', sqlTypes.VarChar, logData.message);
    sqlreq.addParameter('event', sqlTypes.VarChar, logData.event_name);
    sqlreq.addParameter('origin', sqlTypes.VarChar, logData.event_origin);
    sqlreq.addParameter('data_id', sqlTypes.VarChar, logData.event_dataid);
    sqlConn.callProcedure(sqlreq);
    sqlreq.on("doneProc", function(rowCount, more, returnStatus, rows) {
        responseData.push(returnStatus);
    });
}

LogModel.GetListLog = function(beatsession_guid, callback) {
    winston.info('LogModel : Getting List Log [beatsession_guid: %s ]', beatsession_guid); 
    var errorJSON =  
    {
        'success':false,
        'error':
        {
            'code':0,
            'message':''
        }
    };

    function processLog(err, data) {
        if (err) 
        {
            winston.error('LogModel : Getting List Log [ProcessQueueAgent] --DB Error: ' + util.inspect(err));
            errorJSON.error.code = 10;
            errorJSON.error.message = err;  
            callback(errorJSON,null);
        } 
        else
        {
            if (data.length > 0) 
            {
                winston.info('LogModel : Successful in Getting List Log');
                callback(null,data);                
            } 
            else
            {
                winston.error('LogModel : Getting List Log [ Response is Empty ]');
                errorJSON.error.code = 15;
                errorJSON.error.message = 'Response is Empty';  
                callback(errorJSON,null);
            }
        };
    }

    var responseData = [];
    var sqlreq = new sqlReq("usp_BeatSessionLog_Get_List", responseCallback(responseData, processLog));
    //Stored Procedure Paramaters
    sqlreq.addParameter('beatsession_guid', sqlTypes.VarChar,beatsession_guid);
    sqlConn.callProcedure(sqlreq);
    sqlreq.on('row', storeRowAsJSON(responseData))
}

module.exports = LogModel;