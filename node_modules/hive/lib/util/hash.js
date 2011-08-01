var crypto = require('crypto');

// returns a md5 hash or compares an objects to an expected hash
exports = module.exports = function (object, expected) {
	if(typeof object === 'object')
		object = JSON.stringify(object.toJSON ? object.toJSON() : object);
	var result = crypto
	.createHash('md5')
	.update(object)
	.digest('hex');
	if(expected && expected !== result) return false;
	return result;
};