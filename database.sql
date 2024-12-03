-- Initialization script for the phone database.
CREATE ROLE dbs05 WITH CREATEDB LOGIN PASSWORD 'pizza party';
CREATE DATABASE phone WITH OWNER dbs05;
