winston-postgresql
==================

A Winston transport for PostgreSQL.


## Installation

`npm install winston-postgresql`


## Usage

Example usage:

```javascript
var winston = require("winston");
require("winston-postgresql").PostgreSQL;

var logger = new (winston.Logger)();

logger.add("PostgreSQL", {
    // A connection string or connection object, passed through to `pg.js` module
    "connString": "user:pw@localhost:5432/db",
    
    // A logging level, optional, defaults to "info"
    "level": "error",

    // Required: the name of a table with the following columns:
    // create table winston_logs(
    //   level varchar null,
    //   msg varchar null,
    //   meta varchar null
    // )
    "tableName": "winston_logs"
    
    // or optionally, a custom SQL statement that takes 3 parameters:
    // $1: level
    // $2: message
    // $3: metadata
    // "customSQL": "select custom_logging_function($1, $2, $3)",
});
```

## LICENSE

&copy; Jeffrey Yang, MIT

