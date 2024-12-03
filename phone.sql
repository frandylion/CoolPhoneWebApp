-- Initialization script for the phone data tables.

DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_plan CASCADE;
DROP TABLE IF EXISTS call_log CASCADE;
DROP TABLE IF EXISTS data_log CASCADE;
DROP TABLE IF EXISTS call_type CASCADE;
DROP TABLE IF EXISTS plan CASCADE;
DROP TABLE IF EXISTS bank CASCADE;
DROP TABLE IF EXISTS transaction CASCADE;


-- users
CREATE TABLE users (
user_id SERIAL,
username VARCHAR (30),
password VARCHAR (30),
user_last_name VARCHAR (30),
user_first_name VARCHAR (30),
phone_number BIGINT,
admin BOOL,
PRIMARY KEY (user_id));

-- data
INSERT INTO users VALUES (default, 'jboyyy1', 'yassid099', 'johnson', 'tony', 2818293287, false);
INSERT INTO users VALUES (default, 'mimimi', 'beepbepp028', 'mike', 'hawk', 8322220000, false);
INSERT INTO users VALUES (default, 'bignets99', 'stinksopp29', 'philip', 'farg', 8325693016, false);
INSERT INTO users VALUES (default, 'bisniz', 'shodleo098', 'bis', 'bob', 8322769301, true);
INSERT INTO users VALUES (default, 'asstrid123', 'foutyfiv2566', 'erin', 'assterd', 8322229301, false);


-- user_plan
CREATE TABLE user_plan (
user_id INT,
plan_type VARCHAR (10),
payment_type VARCHAR (10),
PRIMARY KEY (user_id));

-- data
INSERT INTO user_plan VALUES (1, 'basic');
INSERT INTO user_plan VALUES (2, 'basic');
INSERT INTO user_plan VALUES (3, 'premium');
INSERT INTO user_plan VALUES (4, 'basic');
INSERT INTO user_plan VALUES (5, 'unlimited');


-- call_log
CREATE TABLE call_log (
call_id SERIAL,
user_id INT,
duration DECIMAL (6, 2),
call_date_time TIMESTAMP,
call_type VARCHAR (15),
num_called BIGINT,
PRIMARY KEY (call_id));

-- data
INSERT INTO call_log VALUES (default, 2, 100.50, '2024-11-04 14:30:00', 'local');
INSERT INTO call_log VALUES (default, 3, 55.6, '2024-10-02 15:31:00', 'national');
INSERT INTO call_log VALUES (default, 4, 6.5, '2024-05-03 05:23:12', 'local');
INSERT INTO call_log VALUES (default, 4, 44, '2024-08-01 10:30:12', 'local');
INSERT INTO call_log VALUES (default, 4, 6.5, '2024-09-03 09:23:12', 'national');
-- additional
INSERT INTO call_log VALUES (default, 1, 35.20, '2024-01-15 10:15:00', 'local', 8325551111);
INSERT INTO call_log VALUES (default, 1, 55.40, '2024-01-15 14:30:00', 'national', 8326662222);
INSERT INTO call_log VALUES (default, 2, 25.75, '2024-02-15 16:45:00', 'local', 8322223333);
INSERT INTO call_log VALUES (default, 2, 65.90, '2024-02-15 11:20:00', 'national', 8323334444);
INSERT INTO call_log VALUES (default, 3, 42.60, '2024-03-15 09:30:00', 'local', 8324445555);
INSERT INTO call_log VALUES (default, 3, 78.30, '2024-03-15 15:45:00', 'national', 8325556666);
INSERT INTO call_log VALUES (default, 4, 18.50, '2024-04-15 13:22:00', 'local', 8326667777);
INSERT INTO call_log VALUES (default, 4, 95.40, '2024-04-15 18:10:00', 'national', 8327778888);
INSERT INTO call_log VALUES (default, 5, 36.70, '2024-05-15 11:55:00', 'local', 8328889999);
INSERT INTO call_log VALUES (default, 5, 62.20, '2024-05-15 16:40:00', 'national', 8329990000);
INSERT INTO call_log VALUES (default, 1, 45.30, '2024-02-15 12:45:00', 'local', 8327773333);
INSERT INTO call_log VALUES (default, 1, 33.60, '2024-03-15 09:20:00', 'national', 8328884444);
INSERT INTO call_log VALUES (default, 2, 52.40, '2024-03-15 14:10:00', 'local', 8329995555);
INSERT INTO call_log VALUES (default, 2, 41.75, '2024-04-15 11:30:00', 'national', 8321116666);
INSERT INTO call_log VALUES (default, 3, 67.90, '2024-04-15 16:55:00', 'local', 8322227777);
INSERT INTO call_log VALUES (default, 3, 29.50, '2024-05-15 10:40:00', 'national', 8323338888);
INSERT INTO call_log VALUES (default, 4, 83.20, '2024-05-15 15:15:00', 'local', 8324449999);
INSERT INTO call_log VALUES (default, 4, 56.30, '2024-06-15 13:05:00', 'national', 8325550000);
INSERT INTO call_log VALUES (default, 5, 39.60, '2024-06-15 11:25:00', 'local', 8326661111);
INSERT INTO call_log VALUES (default, 5, 74.50, '2024-07-15 17:30:00', 'national', 8327772222);


-- data_log
CREATE TABLE data_log (
user_id INT,
start_date DATE,
end_date DATE,
monthly_data_mib INT,
data_used_mib INT,
PRIMARY KEY (user_id, start_date));

-- data
INSERT INTO data_log VALUES (1, '2024-01-01', '2024-01-31', 1024, 512);
INSERT INTO data_log VALUES (2, '2024-01-01', '2024-01-31', 2048, 1500);
INSERT INTO data_log VALUES (3, '2024-01-01', '2024-01-31', 4096, 3000);
INSERT INTO data_log VALUES (4, '2024-02-01', '2024-02-28', 1024, 800);
INSERT INTO data_log VALUES (5, '2024-02-01', '2024-02-28', 2048, 2000);
-- additional
INSERT INTO data_log VALUES (1, '2024-01-01', '2024-01-31', 1024, 768);
INSERT INTO data_log VALUES (2, '2024-02-01', '2024-02-29', 2048, 1800);
INSERT INTO data_log VALUES (3, '2024-03-01', '2024-03-31', 4096, 3500);
INSERT INTO data_log VALUES (4, '2024-04-01', '2024-04-30', 1024, 950);
INSERT INTO data_log VALUES (5, '2024-05-01', '2024-05-31', 2048, 2100);
INSERT INTO data_log VALUES (1, '2024-02-01', '2024-02-29', 1024, 900);
INSERT INTO data_log VALUES (2, '2024-03-01', '2024-03-31', 2048, 1950);
INSERT INTO data_log VALUES (3, '2024-04-01', '2024-04-30', 4096, 3750);
INSERT INTO data_log VALUES (4, '2024-05-01', '2024-05-31', 1024, 1100);
INSERT INTO data_log VALUES (5, '2024-06-01', '2024-06-30', 2048, 2250);


-- call_type
CREATE TABLE call_type (
type_name VARCHAR (15),
cost_per_minute DECIMAL (5, 2),
PRIMARY KEY (type_name));

-- data
INSERT INTO call_type VALUES ('local', 0.10);
INSERT INTO call_type VALUES ('national', 0.80);


-- plan
CREATE TABLE plan (
plan_type VARCHAR (10),
payment_type VARCHAR (10),
call_limit_min INT,
data_limit_mib INT,
data_cost DECIMAL (5, 2),
PRIMARY KEY (plan_type, payment_type));

-- data
INSERT INTO plan VALUES ('Basic', 'Prepaid', 500, 1024, 10.00);
INSERT INTO plan VALUES ('Basic', 'Postpaid', NULL, 1024, 8.00);
INSERT INTO plan VALUES ('Premium', 'Prepaid', 1000, 4096, 15.00);
INSERT INTO plan VALUES ('Premium', 'Postpaid', NULL, 4096, 12.00);
INSERT INTO plan VALUES ('Unlimited', 'Prepaid', NULL, NULL, 30.00);


-- bank
CREATE TABLE bank (
user_id INT,
bank_account_num INT,
bank_name VARCHAR (15),
card_num INT,
PRIMARY KEY (user_id));

-- data
INSERT INTO bank VALUES (1, 123456789, 987654321);
INSERT INTO bank VALUES (2, 234567890, 876543210);
INSERT INTO bank VALUES (3, 345678901, 765432109);
INSERT INTO bank VALUES (4, 456789012, 654321098);
INSERT INTO bank VALUES (5, 567890123, 543210987);


-- transaction
CREATE TABLE transaction (
	bill_id INT,
	transaction_date DATE,
	PRIMARY KEY (bill_id));

-- data
INSERT INTO transaction VALUES (default, 1, '2024-11-01', 'deposit', 200.00);
INSERT INTO transaction VALUES (default, 2, '2024-11-02', 'charge', -50.00);
INSERT INTO transaction VALUES (default, 1, '2024-11-03', 'charge', -25.50);
INSERT INTO transaction VALUES (default, 3, '2024-11-04', 'deposit', 150.00);
INSERT INTO transaction VALUES (default, 2, '2024-11-05', 'deposit', 75.00);
INSERT INTO transaction VALUES (default, 4, '2024-11-05', 'deposit', 115.00);
INSERT INTO transaction VALUES (default, 4, '2024-11-05', 'charge', -35.00);
-- Additional data
INSERT INTO transaction VALUES (default, 1, '2024-01-15', 'deposit', 180.00);
INSERT INTO transaction VALUES (default, 1, '2024-01-15', 'charge', -45.50);
INSERT INTO transaction VALUES (default, 2, '2024-02-15', 'deposit', 250.00);
INSERT INTO transaction VALUES (default, 2, '2024-02-15', 'charge', -75.25);
INSERT INTO transaction VALUES (default, 3, '2024-03-15', 'deposit', 300.00);
INSERT INTO transaction VALUES (default, 3, '2024-03-15', 'charge', -90.75);
INSERT INTO transaction VALUES (default, 4, '2024-04-15', 'deposit', 220.00);
INSERT INTO transaction VALUES (default, 4, '2024-04-15', 'charge', -60.50);
INSERT INTO transaction VALUES (default, 5, '2024-05-15', 'deposit', 400.00);
INSERT INTO transaction VALUES (default, 5, '2024-05-15', 'charge', -120.00);
INSERT INTO transaction VALUES (default, 1, '2024-02-15', 'deposit', 200.00);
INSERT INTO transaction VALUES (default, 1, '2024-02-15', 'charge', -55.75);
INSERT INTO transaction VALUES (default, 2, '2024-03-15', 'deposit', 275.00);
INSERT INTO transaction VALUES (default, 2, '2024-03-15', 'charge', -85.50);
INSERT INTO transaction VALUES (default, 3, '2024-04-15', 'deposit', 350.00);
INSERT INTO transaction VALUES (default, 3, '2024-04-15', 'charge', -105.25);
INSERT INTO transaction VALUES (default, 4, '2024-05-15', 'deposit', 240.00);
INSERT INTO transaction VALUES (default, 4, '2024-05-15', 'charge', -70.75);
INSERT INTO transaction VALUES (default, 5, '2024-06-15', 'deposit', 450.00);
INSERT INTO transaction VALUES (default, 5, '2024-06-15', 'charge', -135.00);


-- bill
CREATE TABLE bill ();
