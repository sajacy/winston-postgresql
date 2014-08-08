create table winston_logs (
    ts timestamp default current_timestamp,
    level varchar,
    msg varchar,
    meta json
);
