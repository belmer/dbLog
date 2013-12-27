var winston = require('winston'),
    twilio = require('twilio');

module.exports = {
    addModel : function(name, namespace, model) {
        if(!this[namespace])
    			this[namespace] = {};
    		this[namespace][name] = model;
    },
    
    storeRowAsJSON: function(responseArray) {
        return function(columns) {
    	    var row = {};
    	    columns.forEach(function(column) {
                row[column.metadata.colName.toLowerCase()] = column.value;
    	    });
    	    responseArray.push(row);
        }
    },

	responseCallback: function(responseArray,callback) {

        return function(err,rowCount){
            if(err) {
                callback(err, null);
            } else {
                //responseArray.row_count = rowCount.toString();
                callback(err, responseArray);
            }
        }
	},

    responseCallbackParam: function(responseArray,perData,callback) {

        return function(err, rowCount,eachData){
            if(err) {
                callback(err, null);
            } else {
                callback(err, responseArray, perData);
            }
        }
    },

    IsNullOrEmpty: function(data)
    {
        if (data == null || data == '' || data == undefined || data == 'undefined' || data == 'null') 
            return true;
        else
            return false;
    },

    normalizeParameter: function(params, item)
    {
        if(params[item] === 'undefined' || params[item] === null)
        {
            return null;
        }
            else
        {
            return params[item];
        }
    }
};