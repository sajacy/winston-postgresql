var pgjs = require("pg.js");
var util = require("util");
var winston = require("winston");

//
// Export the constructor
// 
var PostgreSQL = exports.PostgreSQL = winston.transports.PostgreSQL = function(options) {
    
    this.name = "PostgreSQL";
    this.level = options.level || "info";

    options = options || {};

    if(options.connString || "" != "") {
        this.connString = options.connString;
    } else {
        throw new Error("PostgreSQL transport requires \"connString\".");
    }

    if(options.tableName || options.customSql || "" != "") {
        this.sql = options.tableName ? 
            "INSERT INTO " + options.tableName + " (level, msg, meta) values ($1, $2, $3)" :
            options.customSql;
    } else {
        throw new Error("PostgreSQL transport requires \"tableName\" or \"customSql\".");
    }
}

// 
// Inherit from Winston.Transport
//
util.inherits(PostgreSQL, winston.Transport);

// 
// Expose the log method
// This uses a connection pool and an assumed-valid SQL statement.
//
PostgreSQL.prototype.log = function(level, msg, meta, callback) {
    var self = this;
    
    // use connection pool
    pgjs.connect(self.connString, function(err, client, done) {

        // fetching a connection from the pool, emit error if failed.
        if(err) {
            self.emit("error", err);
            return callback(err);
        }

        client.query(self.sql, [level, msg, meta instanceof Array ? JSON.stringify(meta) : meta], function(err, result) {
            //call `done()` to release the client back to the pool
            done();

            // executing statement, emit error if failed.
            if(err) {
                self.emit("error", err);
                return callback(err);
            }

            // acknowledge successful logging event
            callback(null, true);
            self.emit("logged");
        });
    });
}
