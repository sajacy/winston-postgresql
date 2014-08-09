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
    // Required: A connection string or connection object, passed through to `pg.js` module
    "connString": "user:pw@localhost:5432/db",

    // Required: Specify either `customSQL` or a `tableName`
    //
    // `customSQL`: A custom SQL statement that takes 3 parameters:
    // $1: level
    // $2: message
    // $3: metadata
    "customSQL": "select custom_logging_function($1, $2, $3)",
    
    // `tableName`: the name of a table with the following columns: level, message, metadata
    // - See the winston_logs.sql script for an example table definition.
    // - Specifying `tableName` will override `customSQL`.
    "tableName": "winston_logs",

    // Optional: A logging level, defaults to "info"
    "level": "error"
});
```

## LICENSE

&copy; Jeffrey Yang, MIT

