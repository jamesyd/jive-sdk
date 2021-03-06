/**
 * Created with IntelliJ IDEA.
 * User: charles
 * Date: 4/23/13
 * Time: 11:15 AM
 * To change this template use File | Settings | File Templates.
 */
var http = require('http');

exports.BaseServer = BaseServer;

function BaseServer(app, config) {
    this.app = app;
    this.config = config;
    this.setup();
}

BaseServer.prototype.setup = function() {

}

BaseServer.prototype.doOperation = function(operation) {
    var type = operation['type'];
    if (type == "setEndpoint") {
        var method = operation['method'];
        var path = operation['path'];
        var statusCode = operation['statusCode'];
        var body = operation['body'];
        var headers = operation['headers'];

        this.setEndpoint(method, path, statusCode, body, headers);
        return {}; //operation handled
    }
    else if (type == "setEnv") {
        var env = operation['env'];
        for (var key in env){
            process.env[key] = env[key];
        }
        return {};
    }

    return null;
}

BaseServer.prototype.setEndpoint = function(method, path, statusCode, body, headers) {
    var app = this.app;
    console.log('Server with config %s called setEndpoint',JSON.stringify(this.config));
    console.log('method=%s, path=%s, statusCode=%d, headers=%s',method,path,statusCode,JSON.stringify(headers));
    //Default header with json content type
    if (!headers || headers.length <= 0) {
        headers = {"Content-Type": "application/json"};
    }
    if (method.toUpperCase() == "GET") {
        delete app.routes.get;
        app.get( path, function( req, res ) {
            res.writeHead(statusCode, headers);
            res.end(body );
        } );
    }
    if (method.toUpperCase() == "POST") {
        delete app.routes.post;
        app.post( path, function( req, res ) {
            res.writeHead(statusCode, headers);
            res.end(body );
        } );
    }
    if (method.toUpperCase() == "PUT") {
        delete app.routes.put;
        app.put( path, function( req, res ) {
            res.writeHead(statusCode, headers);
            res.end(body );
        } );
    }
    if (method.toUpperCase() == "DELETE") {
        delete app.routes.delete;
        app.delete( path, function( req, res ) {
            res.writeHead(statusCode, headers);
            res.end(body );
        } );
    }
}

BaseServer.prototype.start = function() {
    var app = this.app;
    var server = http.createServer(app);
    this.server = server;
    var configuration = this.config;

    server.listen(configuration.port, function () {
        console.log("Test server '" + configuration['serverName'] + "' listening on port " + configuration.port);
        process.send( {serverStarted: true});
    } );

}

BaseServer.prototype.stop = function(messageID) {
    var self = this;
    this.server.on('close', function() {
        console.log("Server at port %d with name \"%s\" stopped", self.config.port, self.config.serverName);
        process.send({
            serverStopped: true,
            id: messageID
        });
        process.exit();
    });

    this.server.close();

}