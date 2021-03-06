var express = require('express');
var bodyParser = require('body-parser');
const { Tracer, ExplicitContext, BatchRecorder } = require('zipkin');
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
const { HttpLogger } = require('zipkin-transport-http');
const CLSContext = require('zipkin-context-cls');
const axios = require('axios');
const wrapAxios = require('zipkin-instrumentation-axios');

/******************************************************
 *  1. Read config from ENV
 ******************************************************/
const config = {
  zipkinUrl: process.env.ZIPKIN_URL || 'http://192.168.99.100:9411', // Your url here...
  serviceName: process.env.SERVICE_NAME || 'frontend',
  port: process.env.PORT || 3000
};

/******************************************************
 *  2. Setup Zipkin Tracer
 ******************************************************/
// Note the use of CLSContext instead of ExplicitContext
const ctxImpl = new CLSContext();
// Send spans to Zipkin asynchronously over HTTP
const recorder = new BatchRecorder({
  logger: new HttpLogger({
    endpoint: `${config.zipkinUrl}/api/v1/spans`
  })
});
// Create the tracer
const tracer = new Tracer({ctxImpl, recorder});

/******************************************************
 *  3. Setup express
 ******************************************************/
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Add the Zipkin middleware
app.use(zipkinMiddleware({
 tracer,
 serviceName: config.serviceName
}));

/******************************************************
 *  4. Instrument axios using zipkin-instrumentation-axios
 ******************************************************/
// Use the client to make subsequent requests
const client = wrapAxios(axios, {tracer, serviceName: config.serviceName});

app.get('/sequence', (req, res) => {
  let fullname = '';
  tracer.writeIdToConsole();
  tracer.scoped(() => {
    client.get('http://localhost:3001/firstname')
    .then(result => {
      fullname += result.data;
      client.get('http://localhost:3002/lastname')
      .then((result) => {
        fullname += ' ' + result.data;
        res.send(`Hello ${fullname}`);
      })
      .catch(err => {
        console.log(err)

      });
    })
    .catch(err => {
      console.log(err)
    });
  });
});

app.get('/chain', (req, res) => {
  tracer.writeIdToConsole();
  tracer.scoped(() => {
    client.get('http://localhost:3001/fullname')
    .then(result => {
      res.send(`hello ${result.data}`);
    });
  });

});

// start express server
app.listen(config.port, function () {
  console.log(`Frontend listening on port ${config.port}!`);
});
