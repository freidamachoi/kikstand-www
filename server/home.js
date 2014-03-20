/**
 *  Created by Kikstand, Inc.
 *  Author: Bo Coughlin
 *  Project: Www
 *  File: home.js
 *  Date: 3/18/14
 *  Time: 11:53 AM
 */


var path = require ( 'path' );


exports.index = function ( req, res ) {
    var dist = path.resolve ( __dirname, '../dist' );
    res.sendfile ( 'index.html', { root : dist } );
};
