var moment = require('moment'),
	winston = require('winston');

// var day = moment("Wed May 29 2011 02:12:08 GMT-0700 (Pacific Daylight Time)");
// day = moment().utc().add('days', 3);
// console.log(day.fromNow());


var json = {"notification_answertime": null,"notification_endtime": "2013-05-29T08:12:40.946Z"};

for(var item in json)
{	
	console.log(item + ' - ' + json[item]);
}