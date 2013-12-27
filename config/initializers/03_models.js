var glob = require('glob'),
	path = require('path')

module.exports = function(done) {
	var _this = this;

	_this.models = {};

	glob("app/models/**/*.js" , function (er, files) {
		for(i in files)
		{
			var filepath = '../../' + files[i];
			var patt = /modelHelper.js/;
			if(!patt.test(files[i]))
			{
				var model = require(filepath)(_this.db,_this.rabbit);
				//console.log(model)
				var temp = filepath.match(/[^/]*\/[^/]*.js/)[0];
				var namespace = temp.split('/')[0];
				var filename = temp.split('/')[1];
				var modelname = filename.substring(0, filename.length -3);
				//console.log('adding model: ' + modelname)
				require('../../app/models/modelHelper').addModel(modelname, namespace, model)
			}
		}
		done();
	})
}