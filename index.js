'use strict';
var ua, url, redis, visitor, visitors, rtg, GA_ID, http;

// Enable New Relic
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}

// HTTP server
http = require('http');

// Google Analytics
ua = require('universal-analytics');
GA_ID = 'UA-47963532-1';

// Connect to redis
url = require('url');
rtg = url.parse(process.env.REDIS_URL);
redis = require('redis').createClient(rtg.port, rtg.hostname);
redis.auth(rtg.auth.split(':')[1]);

// Store visitors
visitors = {};

// Cache visitors
visitor = function (id) {
  return visitors.hasOwnProperty(id) ?
    visitors[id] :
    visitors[id] = ua(GA_ID);
};

redis.on('subscribe', function (channel, count) {
  console.log('Listening to events on ' + channel);
});

redis.on('message', function (channel, message) {
  var id, category, event;

  console.log('message', channel, message);

  id = message.match(/^(\d+)\|/);
  id = id ? id[1] : undefined;

  message = message.match(/\|?(\w+)\.(\w+)$/);
  category = message[1];
  event = message[2];

  console.log({
    id: id,
    category: category,
    event: event
  });

  visitor(id).event(category, event, id).send();

});

redis.subscribe('analytics');

// Keep heroku happy
http.createServer(function (req, res) {
  res.end('hello world');
}).listen(process.env.PORT || 8000);

