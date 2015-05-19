var
  util = require('util'),
  winston = require('winston'),
  common = require('winston/lib/winston/common'),
  pg = require('pg.js');

//
// Export the constructor
//
var PostgreSQL = exports.PostgreSQL = winston.transports.PostgreSQL = function(options) {
  this.name = "PostgreSQL";

  options = options || {};

  this.level       = options.level       || "info";
  this.json        = options.json        || false;
  this.colorize    = options.colorize    || false;
  this.prettyPrint = options.prettyPrint || false;
  this.timestamp   = typeof options.timestamp !== 'undefined' ? options.timestamp : false;
  this.label       = options.label       || null;
  this.logstash    = options.logstash    || false;
  this.depth       = options.depth       || null;
  this.silent      = options.silent      || false;

  // connection string
  if(options.connString || "" != "") {
    this.connString = options.connString;
  } else {
    throw new Error("PostgreSQL transport requires \"connString\".");
  }

  // tablename or customSql
  if(options.tableName || options.customSql || "" != "") {
    if (options.tableName) {
      if (options.timestamp) {
        this.sql = "INSERT INTO " + options.tableName + " (timestamp, level, msg, meta) values ($1, $2, $3, $4)";
      } else {
        this.sql = "INSERT INTO " + options.tableName + " (level, msg, meta) values ($1, $2, $3)";
      }
    } else {
      this.sql = options.customSql;
    }
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
PostgreSQL.prototype.log = function(timestamp, level, msg, meta, callback) {
  // honor silent option
  if (this.silent) {
    return callback(null, true);
  }

  var self = this;

  if (timestamp == undefined) {
    timestamp = common.formatTimestamp(self.timestamp);
  }
  meta = common.formatMeta(meta, {
    raw: self.raw,
    json: self.json,
    logstash: self.logstash,
    prettyPrint: self.prettyPrint,
    depth: self.depth,
    colorize: self.colorize
  });
  msg = common.log({
    showLevel:    false,
    message:      msg,
    json:         self.json,
    colorize:     self.colorize,
    prettyPrint:  self.prettyPrint,
    label:        self.label,
    logstash:     self.logstash,
    depth:        self.depth
  });

  // use connection pool
  pg.connect(self.connString, function(err, client, done) {

    // fetching a connection from the pool, emit error if failed.
    if(err) {
      self.emit("error", err);
      return callback(err);
    }

    var sqlParams = [level, msg, meta];
    if (timestamp) {
      sqlParams.unshift(timestamp);
    }

    client.query(self.sql, sqlParams, function(err, result) {
      //call `done()` to release the client back to the pool
      done();

      // executing statement, emit error if failed.
      if(err) {
        self.emit("error", err);
        return callback(err);
      }

      // acknowledge successful logging event
      self.emit("logged");
      callback(null, true);
    });
  });
}
