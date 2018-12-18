var
    redisCli,
    redis = require('redis'),
    bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);


Object.keys(C.dir).map((key) => {
    C.dir[key] = C.root + C.dir[key]
})

if(C.cache && C.cache.host!=''){
	redisCli = redis.createClient(C.cache);
	redisCli.instance = () => {
	    return redis.createClient(C.cache)
	};	
}


module.exports = redisCli;