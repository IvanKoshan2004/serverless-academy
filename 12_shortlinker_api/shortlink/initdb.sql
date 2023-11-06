-- Database init script. Use your DB name
CREATE DATABASE database_name_here;
USE database_name_here;
CREATE TABLE links (
	id serial not null primary key,
    tag varchar(100),
    link varchar(2048) not null,
	change_time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

