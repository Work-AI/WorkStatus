var Logstash = require('logstash-client');
var globals = require('globals');
var nexttick = require('next-tick');

if (typeof globals.logstashClient === 'undefined'){
    globals.logstashClient =  new Logstash({
        type: 'tcp',
        host: '50.233.239.115',
        port: 5000
    });
}
var reporter = {}

reporter.report = function(type,jsonString) {
    if (typeof type !== 'string' || typeof jsonString !== 'string') {
        throw new Error('report expects strings');
    }
    nexttick(function(){
        if(globals.logstashClient){
            globals.logstashClient.send({
                '@timestamp': new Date(),
                'type':type,
                'json': jsonString,
                'level': 'log'
            });
        }
    })
};

module.exports = reporter
