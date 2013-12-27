var locomotive = require('locomotive'),
    Controller = locomotive.Controller,
    self = LogController = new Controller(),
    LogModel = require('../../models/modelHelper')['v1']['log'],
    IsNullOrEmpty = require('../../models/modelHelper').IsNullOrEmpty,
    winston = require('winston');

LogController.getListLog = function() {
    var _this = this;
    var req = _this.req,
        res = _this.res;

    LogModel.GetListLog(req.params.beatsession_guid, function(err, data) {
        if (err)
            res.status(500).send(err);
        else
            res.status(200).send(data);
    });
}

LogController.insertLog = function() {
    var _this = this;
    var req = _this.req,
        res = _this.res;

    LogModel.insertLog(req.body, function(err, data) {
        if (err)
            res.status(500).send(err);
        else
            res.status(200).send(data);
    });
}

module.exports = LogController;
