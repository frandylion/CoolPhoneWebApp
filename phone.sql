-- Creation script for the phone database.

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
PRIMARY KEY (user_id));

-- data
INSERT INTO users VALUES (default, 'jboyyy1', 'yassid099', 'johnson', 'tony', 2818293287);
INSERT INTO users VALUES (default, 'mimimi', 'beepbepp028', 'mike', 'hawk', 8322220000);
INSERT INTO users VALUES (default, 'bignets99', 'stinksopp29', 'philip', 'farg', 8325693016);
INSERT INTO users VALUES (default, 'bisniz', 'shodleo098', 'bis', 'boy', 8322769301);
INSERT INTO users VALUES (default, 'asstrid123', 'foutyfiv2566', 'erin', 'assterd', 8322229301);


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
INSERT INTO plan VALUES ('Basic', 'Postpaid', 500, 1024, 8.00);
INSERT INTO plan VALUES ('Premium', 'Prepaid', 1000, 4096, 15.00);
INSERT INTO plan VALUES ('Premium', 'Postpaid', 1000, 4096, 12.00);
INSERT INTO plan VALUES ('Unlimited', 'Prepaid', NULL, NULL, 30.00);


-- bank
CREATE TABLE bank (
user_id INT,
bank_account_num INT,
card_num INT,
balance DECIMAL (10, 2),
PRIMARY KEY (user_id));

-- data
INSERT INTO bank VALUES (1, 123456789, 987654321, 500.00);
INSERT INTO bank VALUES (2, 234567890, 876543210, 1200.00);
INSERT INTO bank VALUES (3, 345678901, 765432109, 300.00);
INSERT INTO bank VALUES (4, 456789012, 654321098, 700.00);
INSERT INTO bank VALUES (5, 567890123, 543210987, 950.00);


-- transaction
CREATE TABLE transaction (
	transaction_id SERIAL,
    user_id INT,
	transaction_date DATE,
	transaction_type VARCHAR (10),
	amount DECIMAL (10, 2),
	PRIMARY KEY (transaction_id));

-- data
INSERT INTO transaction VALUES (default, 1, '2024-11-01', 'deposit', 200.00);
INSERT INTO transaction VALUES (default, 2, '2024-11-02', 'charge', -50.00);
INSERT INTO transaction VALUES (default, 1, '2024-11-03', 'charge', -25.50);
INSERT INTO transaction VALUES (default, 3, '2024-11-04', 'deposit', 150.00);
INSERT INTO transaction VALUES (default, 2, '2024-11-05', 'deposit', 75.00);
