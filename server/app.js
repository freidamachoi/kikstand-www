/**
 *  Created by Kikstand, Inc.
 *  Author: Bo Coughlin
 *  Project: Www
 *  File: app.js
 *  Date: 3/18/14
 *  Time: 11:53 AM
 */


var express = require ( 'express' ),
    path = require ( 'path' ),
    dist = path.resolve ( __dirname, '../dist' ),
    home = require ('./home' ),
    port = 3333,
    app = express();

app.set ( 'port', port  );
app.use ( express.json () );
app.use ( express.urlencoded () );

app.use ( '/static', express.static ( dist ) );
app.use ( app.router );
app.get ( '/*', home.index );

// Standard Http
var server = require ( 'http' ).createServer ( app );
app.use ( express.logger ( 'dev' ) );
//Start the app by listening on <port>
server.listen ( port, '0.0.0.0', 511, function () {
console.log (port);
} );