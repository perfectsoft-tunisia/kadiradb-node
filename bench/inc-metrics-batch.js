var Client = require('../');

var BATCH_SIZE = 100;
var ADDRESS = 'kdb://localhost:19000';
var RANDOMIZE = true;
var CONCURRENCY = 5;

var counter = 0;
setInterval(function () {
  console.log(counter*BATCH_SIZE+"/s");
  counter = 0;
}, 1000);

var batch = [];
for(var i=0; i<BATCH_SIZE; ++i) {
  batch[i] = {
    database: 'test',
    fields: ['a', 'b', 'c', 'd'],
    value: 100,
    count: 10,
  };
}

var client = new Client(ADDRESS);
client.on('connect', start);
client.connect(function (err) {
  if(err) {
    console.error(err);
    process.exit(1);
  }

  start();
});

function start () {
  for(var i=0; i<CONCURRENCY; ++i) {
    send();
  }
}

function send () {
  var now = Math.floor(Date.now() / 1000);

  for(var i=0; i<BATCH_SIZE; ++i) {
    var req = batch[i];
    req.timestamp = now;
    if(RANDOMIZE) {
      req.fields[0] = "a" + Math.floor(1000 * Math.random());
      req.fields[1] = "b" + Math.floor(20 * Math.random());
      req.fields[2] = "c" + Math.floor(5 * Math.random());
      req.fields[3] = "d" + Math.floor(10 * Math.random());
    }
  }

  client.incBatch(batch, function (err, res) {
    if(err) {
      console.error(err);
    } else {
      counter++;
      send();
    }
  });
}
