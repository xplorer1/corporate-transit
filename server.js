// CALL THE PACKAGES --------------------
let express = require('express'); // call express
let app = express(); // define our app using express
let bodyParser = require('body-parser'); // get body-parser
let morgan = require('morgan'); // used to see requests
let mongoose = require('mongoose'); // for working w/ our database
let compression = require('compression');
let config = require('./config');
let path = require('path');

/*
let fs = require('fs');
let http = require('http');
let https = require('https');

const privateKey = fs.readFileSync('/etc/letsencrypt/live/corporatetransit.com.ng-0002/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/corporatetransit.com.ng-0002/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/corporatetransit.com.ng-0002/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};
*/

//Set up default mongoose connection
mongoose.Promise = global.Promise;
mongoose.connect(config.database, { useNewUrlParser: true });

let conn = mongoose.connection;
// conn.on('error', console.error.bind(console, 'connection error:'));
conn.on('error', function(err){
    console.log('mongoose connection error:', err.message);
});

// APP CONFIGURATION ---------------------
// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.raw({limit: '5mb'}) );

app.use(compression());
app.use(express.static(__dirname + '/public', { dotfiles: 'allow' }));

// configure our app to handle CORS requests
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'x-access-token,X-Requested-With,Content-Type,Authorization');
    res.setHeader('X-Powered-By', 'Lucky Lucciano');
    next();
});

// log all requests to the console
app.use(morgan('dev'));

// ROUTES FOR OUR API
// =============================
let apiRoutes = require('./app/routes/api')(app, express);
//let general = require('./app/routes/general')(app, express);

// REGISTER OUR ROUTES -------------------------------
app.use('/api', apiRoutes);                 // all of our routes will be prefixed with /api

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/views/index.html'));
});

app.use(express.static(__dirname + '/public'));

/*const httpServer = http.createServer(app, function(req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
});
const httpsServer = https.createServer(credentials, app);

httpServer.listen(80, () => {
    console.log('HTTP Server running on port 80');
    /!*res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();*!/
});

httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
});*/

// START THE SERVER
// ===============================
app.listen(config.port);

console.log('Magic happens on port ' + config.port);
