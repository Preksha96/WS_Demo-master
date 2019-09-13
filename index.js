const express = require('express')
const bodyParser = require('body-parser');
const chalk = require('chalk');
const chokidar = require('chokidar');

// Chokidar watches your src folder for changes and restarts server.
const watcher = chokidar.watch('./src');
const router = require('./src/router')

const app = express()
/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', 8090);
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.removeHeader('X-Powered-By');
    res.removeHeader('x-powered-by');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('X-Frame-Options', 'deny');
    res.header('X-Content-Type-Options', 'nosniff');
    next();
});

app.get('/', (req, res) => {
    res.send('<h1>Server is up!</h1>');
})
// Main app route loaded
app.use('/apis', router);

// Common error responder
app.use(function (error, req, res, next) {
    res.json({ status: 'ERROR', message: error.message });
});

watcher.on('ready', function () {
    watcher.on('all', function () {
        console.log("Clearing /src/ module cache from server");
        Object.keys(require.cache).forEach(function (id) {
            if (/[\/\\]src[\/\\]/.test(id)) {
                delete require.cache[id];
            }
        })
    })
})

/**
 * Start Express server.
 */
const server = app.listen(app.get('port'), () => {
    console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
});

process.on('SIGINT', function () {
    server.close();
});

module.exports = app;