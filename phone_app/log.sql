-- Initialization script for the phone data tables.
BEGIN;

DROP TABLE IF EXISTS users CASCADE;

DROP TABLE IF EXISTS user_plan CASCADE;

DROP TABLE IF EXISTS call_log CASCADE;

DROP TABLE IF EXISTS data_log CASCADE;

DROP TABLE IF EXISTS call_type CASCADE;

DROP TABLE IF EXISTS plan CASCADE;

DROP TABLE IF EXISTS bank CASCADE;

DROP TABLE IF EXISTS transaction CASCADE;

DROP TABLE IF EXISTS bill CASCADE;

DROP TABLE IF EXISTS phone CASCADE;

-- users
CREATE TABLE users (
user_id SERIAL,
username VARCHAR (32),
password VARCHAR (32),
last_name VARCHAR (32),
first_name VARCHAR (32),
phone_number BIGINT,
phone_model VARCHAR (32),
admin BOOL,
PRIMARY KEY (user_id));

-- data
INSERT INTO users VALUES (default, 'jboyyy1', 'yassid099', 'johnson', 'tony', 2818293287, 'Iphone 11', false);

INSERT INTO users VALUES (default, 'mimimi', 'beepbepp028', 'hawk', 'mike', 8322220000, 'Barbie Phone', true);

INSERT INTO users VALUES (default, 'bignets99', 'stinksopp29', 'philip', 'farg', 8325693016, 'Iphone 13 Max', false);

INSERT INTO users VALUES (default, 'bisniz', 'shodleo098', 'bis', 'bob', 8322769301, 'Galaxy S24+', true);

INSERT INTO users VALUES (default, 'asstrid123', 'foutyfiv2566', 'erin', 'assterd', 8322229301, 'Iphone 12', false);

INSERT INTO users VALUES (default, 'techguru42', 'securepass123', 'wilson', 'alex', 2819876543, 'Galaxy S23', false);

INSERT INTO users VALUES (default, 'mobileninja', 'cryptokey456', 'chen', 'emily', 8323334444, 'Iphone 13', false);

INSERT INTO users VALUES (default, 'netwarrior', 'firewall789', 'rodriguez', 'maria', 8324445555, 'Galaxy S24', true);

INSERT INTO users VALUES (default, 'connectpro', 'cloudlock101', 'thompson', 'ryan', 2817778888, 'Iphone 12 mini', false);

INSERT INTO users VALUES (default, 'smartcell', 'networkpro202', 'patel', 'dev', 8325559999, 'Nokia 110', false);

-- user_plan
CREATE TABLE user_plan (
user_id INT,
plan_type VARCHAR (32),
payment_type VARCHAR (32),
PRIMARY KEY (user_id));

-- data
INSERT INTO user_plan VALUES (1, 'Basic', 'Postpaid');

INSERT INTO user_plan VALUES (2, 'Basic', 'Prepaid');

INSERT INTO user_plan VALUES (3, 'Premium', 'Postpaid');

INSERT INTO user_plan VALUES (4, 'Basic', 'Postpaid');

INSERT INTO user_plan VALUES (5, 'Unlimited', 'Prepaid');

INSERT INTO user_plan VALUES (6, 'Premium', 'Prepaid');

INSERT INTO user_plan VALUES (7, 'Basic', 'Postpaid');

INSERT INTO user_plan VALUES (8, 'Unlimited', 'Prepaid');

INSERT INTO user_plan VALUES (9, 'Premium', 'Postpaid');

INSERT INTO user_plan VALUES (10, 'Basic', 'Postpaid');

-- plan
CREATE TABLE plan (
plan_type VARCHAR (32),
payment_type VARCHAR (32),
call_limit_min INT,
data_limit_mib INT,
data_cost DECIMAL (10, 2),
PRIMARY KEY (plan_type, payment_type));

-- data
INSERT INTO plan VALUES ('Basic', 'Prepaid', 500, 1024, 20.00);

INSERT INTO plan VALUES ('Basic', 'Postpaid', NULL, 1024, 10.00);

INSERT INTO plan VALUES ('Premium', 'Prepaid', 1000, 4096, 30.00);

INSERT INTO plan VALUES ('Premium', 'Postpaid', NULL, 4096, 15.00);

INSERT INTO plan VALUES ('Unlimited', 'Prepaid', NULL, NULL, 45.00);

-- phone
CREATE TABLE phone (
	model VARCHAR (32),
	brand VARCHAR (32),
	PRIMARY KEY (model));

-- data
INSERT INTO phone VALUES ('Iphone 11', 'Apple');

INSERT INTO phone VALUES ('Iphone 12', 'Apple');

INSERT INTO phone VALUES ('Iphone 12 Mini', 'Apple');

INSERT INTO phone VALUES ('Iphone 13', 'Apple');

INSERT INTO phone VALUES ('Iphone 13 Max', 'Apple');

INSERT INTO phone VALUES ('Iphone 14', 'Apple');

INSERT INTO phone VALUES ('Galaxy S22', 'Samsung');

INSERT INTO phone VALUES ('Galaxy S23', 'Samsung');

INSERT INTO phone VALUES ('Galaxy S24', 'Samsung');

INSERT INTO phone VALUES ('Galaxy S24+', 'Samsung');

INSERT INTO phone VALUES ('Barbie Phone', 'Nokia');

INSERT INTO phone VALUES ('HMD 110', 'Nokia');

INSERT INTO phone VALUES ('HMD 3210', 'Nokia');

-- call_log
CREATE TABLE call_log (
call_id SERIAL,
user_id INT,
duration DECIMAL (10, 2),
call_date_time TIMESTAMP,
call_type VARCHAR (32),
num_called BIGINT,
PRIMARY KEY (call_id));

-- data
-- calls for October 2024
INSERT INTO call_log VALUES (default, 1, 12.70, '2024-10-04 14:30:00', 'Local', 5551234567);

INSERT INTO call_log VALUES (default, 1, 45.55, '2024-10-17 09:15:45', 'Local', 7778889999);

INSERT INTO call_log VALUES (default, 1, 89.40, '2024-10-29 16:20:10', 'National', 3334445555);

INSERT INTO call_log VALUES (default, 1, 22.35, '2024-10-11 10:15:45', 'Local', 6543217890);

INSERT INTO call_log VALUES (default, 1, 56.80, '2024-10-23 15:40:20', 'Local', 9876543210);

INSERT INTO call_log VALUES (default, 2, 7.25, '2024-10-02 11:45:30', 'Local', 6667778888);

INSERT INTO call_log VALUES (default, 2, 23.15, '2024-10-14 13:10:22', 'Local', 9990001111);

INSERT INTO call_log VALUES (default, 2, 62.80, '2024-10-25 10:05:55', 'National', 4445556666);

INSERT INTO call_log VALUES (default, 2, 33.45, '2024-10-07 16:20:30', 'Local', 2345678901);

INSERT INTO call_log VALUES (default, 2, 71.25, '2024-10-28 11:55:10', 'National', 8901234567);

INSERT INTO call_log VALUES (default, 3, 15.90, '2024-10-06 15:35:40', 'Local', 2223334444);

INSERT INTO call_log VALUES (default, 3, 37.45, '2024-10-19 08:50:15', 'Local', 7776665555);

INSERT INTO call_log VALUES (default, 3, 76.55, '2024-10-30 14:40:30', 'National', 5554443333);

INSERT INTO call_log VALUES (default, 3, 18.90, '2024-10-12 09:45:15', 'Local', 3456789012);

INSERT INTO call_log VALUES (default, 3, 64.70, '2024-10-26 14:10:35', 'National', 7890123456);

INSERT INTO call_log VALUES (default, 4, 8.60, '2024-10-03 16:45:30', 'Local', 8887776666);

INSERT INTO call_log VALUES (default, 4, 19.75, '2024-10-16 12:10:05', 'Local', 3332221111);

INSERT INTO call_log VALUES (default, 4, 53.20, '2024-10-27 17:15:20', 'National', 9998887777);

INSERT INTO call_log VALUES (default, 4, 26.55, '2024-10-09 13:30:25', 'Local', 4567890123);

INSERT INTO call_log VALUES (default, 4, 82.40, '2024-10-20 16:55:50', 'Local', 0123456789);

INSERT INTO call_log VALUES (default, 5, 14.30, '2024-10-08 09:55:45', 'Local', 6665554444);

INSERT INTO call_log VALUES (default, 5, 32.40, '2024-10-21 10:20:15', 'Local', 1112223333);

INSERT INTO call_log VALUES (default, 5, 95.75, '2024-10-31 10:40:05', 'National', 7776665555);

INSERT INTO call_log VALUES (default, 5, 11.75, '2024-10-15 11:20:40', 'Local', 5678901234);

INSERT INTO call_log VALUES (default, 5, 47.30, '2024-10-24 09:05:15', 'National', 9012345678);

INSERT INTO call_log VALUES (default, 6, 6.75, '2024-10-01 13:40:10', 'Local', 4445556666);

INSERT INTO call_log VALUES (default, 6, 28.60, '2024-10-15 16:05:30', 'Local', 9990001111);

INSERT INTO call_log VALUES (default, 6, 67.30, '2024-10-26 09:20:40', 'National', 2223334444);

INSERT INTO call_log VALUES (default, 6, 39.60, '2024-10-10 15:45:30', 'Local', 6789012345);

INSERT INTO call_log VALUES (default, 6, 58.95, '2024-10-22 10:30:45', 'Local', 2345678901);

INSERT INTO call_log VALUES (default, 7, 18.45, '2024-10-09 14:55:20', 'Local', 5551234567);

INSERT INTO call_log VALUES (default, 7, 41.95, '2024-10-22 11:30:55', 'Local', 7778889999);

INSERT INTO call_log VALUES (default, 7, 89.40, '2024-10-28 16:20:10', 'National', 3334445555);

INSERT INTO call_log VALUES (default, 7, 16.40, '2024-10-13 14:10:20', 'Local', 7890123456);

INSERT INTO call_log VALUES (default, 7, 68.25, '2024-10-30 16:40:55', 'National', 3456789012);

INSERT INTO call_log VALUES (default, 8, 12.70, '2024-10-05 14:30:00', 'Local', 6667778888);

INSERT INTO call_log VALUES (default, 8, 45.55, '2024-10-18 09:15:45', 'Local', 9990001111);

INSERT INTO call_log VALUES (default, 8, 62.80, '2024-10-24 10:05:55', 'National', 4445556666);

INSERT INTO call_log VALUES (default, 8, 29.85, '2024-10-08 11:55:40', 'Local', 8901234567);

INSERT INTO call_log VALUES (default, 8, 52.70, '2024-10-19 15:20:10', 'Local', 4567890123);

INSERT INTO call_log VALUES (default, 9, 7.25, '2024-10-02 11:45:30', 'Local', 2223334444);

INSERT INTO call_log VALUES (default, 9, 23.15, '2024-10-13 13:10:22', 'Local', 7776665555);

INSERT INTO call_log VALUES (default, 9, 76.55, '2024-10-27 14:40:30', 'National', 5554443333);

INSERT INTO call_log VALUES (default, 9, 20.60, '2024-10-16 10:40:15', 'Local', 0123456789);

INSERT INTO call_log VALUES (default, 9, 75.45, '2024-10-25 13:30:25', 'National', 5678901234);

INSERT INTO call_log VALUES (default, 10, 15.90, '2024-10-06 15:35:40', 'Local', 8887776666);

INSERT INTO call_log VALUES (default, 10, 37.45, '2024-10-20 08:50:15', 'Local', 3332221111);

INSERT INTO call_log VALUES (default, 10, 95.75, '2024-10-31 10:40:05', 'National', 9998887777);

INSERT INTO call_log VALUES (default, 10, 35.20, '2024-10-14 16:15:50', 'Local', 9012345678);

INSERT INTO call_log VALUES (default, 10, 88.75, '2024-10-27 11:45:30', 'Local', 6789012345);

-- calls for November 2024
INSERT INTO call_log VALUES (default, 1, 37.25, '2024-11-04 14:30:00', 'Local', 5551234567);

INSERT INTO call_log VALUES (default, 1, 82.40, '2024-11-17 09:15:45', 'Local', 7778889999);

INSERT INTO call_log VALUES (default, 1, 104.75, '2024-11-29 16:20:10', 'National', 3334445555);

INSERT INTO call_log VALUES (default, 1, 56.30, '2024-11-11 10:15:45', 'Local', 6543217890);

INSERT INTO call_log VALUES (default, 1, 93.60, '2024-11-23 15:40:20', 'Local', 9876543210);

INSERT INTO call_log VALUES (default, 2, 24.85, '2024-11-02 11:45:30', 'Local', 6667778888);

INSERT INTO call_log VALUES (default, 2, 47.50, '2024-11-14 13:10:22', 'Local', 9990001111);

INSERT INTO call_log VALUES (default, 2, 115.30, '2024-11-25 10:05:55', 'National', 4445556666);

INSERT INTO call_log VALUES (default, 2, 68.95, '2024-11-07 16:20:30', 'Local', 2345678901);

INSERT INTO call_log VALUES (default, 2, 89.40, '2024-11-28 11:55:10', 'National', 8901234567);

INSERT INTO call_log VALUES (default, 3, 42.75, '2024-11-06 15:35:40', 'Local', 2223334444);

INSERT INTO call_log VALUES (default, 3, 61.20, '2024-11-19 08:50:15', 'Local', 7776665555);

INSERT INTO call_log VALUES (default, 3, 102.45, '2024-11-30 14:40:30', 'National', 5554443333);

INSERT INTO call_log VALUES (default, 3, 35.60, '2024-11-12 09:45:15', 'Local', 3456789012);

INSERT INTO call_log VALUES (default, 3, 77.90, '2024-11-26 14:10:35', 'National', 7890123456);

INSERT INTO call_log VALUES (default, 4, 19.45, '2024-11-03 16:45:30', 'Local', 8887776666);

INSERT INTO call_log VALUES (default, 4, 53.80, '2024-11-16 12:10:05', 'Local', 3332221111);

INSERT INTO call_log VALUES (default, 4, 106.55, '2024-11-27 17:15:20', 'National', 9998887777);

INSERT INTO call_log VALUES (default, 4, 44.30, '2024-11-09 13:30:25', 'Local', 4567890123);

INSERT INTO call_log VALUES (default, 4, 91.75, '2024-11-20 16:55:50', 'Local', 0123456789);

INSERT INTO call_log VALUES (default, 5, 32.60, '2024-11-08 09:55:45', 'Local', 6665554444);

INSERT INTO call_log VALUES (default, 5, 57.40, '2024-11-21 10:20:15', 'Local', 1112223333);

INSERT INTO call_log VALUES (default, 5, 118.90, '2024-11-30 10:40:05', 'National', 7776665555);

INSERT INTO call_log VALUES (default, 5, 26.75, '2024-11-15 11:20:40', 'Local', 5678901234);

INSERT INTO call_log VALUES (default, 5, 72.50, '2024-11-24 09:05:15', 'National', 9012345678);

INSERT INTO call_log VALUES (default, 6, 14.30, '2024-11-01 13:40:10', 'Local', 4445556666);

INSERT INTO call_log VALUES (default, 6, 49.85, '2024-11-15 16:05:30', 'Local', 9990001111);

INSERT INTO call_log VALUES (default, 6, 95.60, '2024-11-26 09:20:40', 'National', 2223334444);

INSERT INTO call_log VALUES (default, 6, 63.40, '2024-11-10 15:45:30', 'Local', 6789012345);

INSERT INTO call_log VALUES (default, 6, 86.25, '2024-11-22 10:30:45', 'Local', 2345678901);

INSERT INTO call_log VALUES (default, 7, 39.75, '2024-11-09 14:55:20', 'Local', 5551234567);

INSERT INTO call_log VALUES (default, 7, 66.30, '2024-11-22 11:30:55', 'Local', 7778889999);

INSERT INTO call_log VALUES (default, 7, 112.80, '2024-11-28 16:20:10', 'National', 3334445555);

INSERT INTO call_log VALUES (default, 7, 41.60, '2024-11-13 14:10:20', 'Local', 7890123456);

INSERT INTO call_log VALUES (default, 7, 92.45, '2024-11-30 16:40:55', 'National', 3456789012);

INSERT INTO call_log VALUES (default, 8, 28.95, '2024-11-05 14:30:00', 'Local', 6667778888);

INSERT INTO call_log VALUES (default, 8, 71.25, '2024-11-18 09:15:45', 'Local', 9990001111);

INSERT INTO call_log VALUES (default, 8, 98.40, '2024-11-24 10:05:55', 'National', 4445556666);

INSERT INTO call_log VALUES (default, 8, 52.70, '2024-11-08 11:55:40', 'Local', 8901234567);

INSERT INTO call_log VALUES (default, 8, 79.60, '2024-11-19 15:20:10', 'Local', 4567890123);

INSERT INTO call_log VALUES (default, 9, 22.50, '2024-11-02 11:45:30', 'Local', 2223334444);

INSERT INTO call_log VALUES (default, 9, 46.80, '2024-11-13 13:10:22', 'Local', 7776665555);

INSERT INTO call_log VALUES (default, 9, 109.25, '2024-11-27 14:40:30', 'National', 5554443333);

INSERT INTO call_log VALUES (default, 9, 38.95, '2024-11-16 10:40:15', 'Local', 0123456789);

INSERT INTO call_log VALUES (default, 9, 88.30, '2024-11-25 13:30:25', 'National', 5678901234);

INSERT INTO call_log VALUES (default, 10, 33.60, '2024-11-06 15:35:40', 'Local', 8887776666);

INSERT INTO call_log VALUES (default, 10, 59.75, '2024-11-20 08:50:15', 'Local', 3332221111);

INSERT INTO call_log VALUES (default, 10, 120.40, '2024-11-30 10:40:05', 'National', 9998887777);

INSERT INTO call_log VALUES (default, 10, 51.30, '2024-11-14 16:15:50', 'Local', 9012345678);

INSERT INTO call_log VALUES (default, 10, 96.85, '2024-11-27 11:45:30', 'Local', 6789012345);

-- data_log
CREATE TABLE data_log (
user_id INT,
month DATE,
monthly_data_mib INT,
data_used_mib INT,
PRIMARY KEY (user_id, month));

-- data
INSERT INTO data_log VALUES (1, '2024-10-01', 1024, 1024);

INSERT INTO data_log VALUES (1, '2024-11-01', 1024, 856);

INSERT INTO data_log VALUES (2, '2024-10-01', 1024, 1024);

INSERT INTO data_log VALUES (2, '2024-11-01', 1024, 687);

INSERT INTO data_log VALUES (3, '2024-10-01', 4096, 2345);

INSERT INTO data_log VALUES (3, '2024-11-01', 4096, 3012);

INSERT INTO data_log VALUES (4, '2024-10-01', 1024, 612);

INSERT INTO data_log VALUES (4, '2024-11-01', 1024, 789);

INSERT INTO data_log VALUES (5, '2024-10-01', NULL, 5305);

INSERT INTO data_log VALUES (5, '2024-11-01', NULL, 1435);

INSERT INTO data_log VALUES (6, '2024-10-01', 4096, 2789);

INSERT INTO data_log VALUES (6, '2024-11-01', 4096, 3456);

INSERT INTO data_log VALUES (7, '2024-10-01', 1024, 1024);

INSERT INTO data_log VALUES (7, '2024-11-01', 1024, 1024);

INSERT INTO data_log VALUES (8, '2024-10-01', NULL, 9001);

INSERT INTO data_log VALUES (8, '2024-11-01', NULL, 4880);

INSERT INTO data_log VALUES (9, '2024-10-01', 4096, 4096);

INSERT INTO data_log VALUES (9, '2024-11-01', 4096, 3678);

INSERT INTO data_log VALUES (10, '2024-10-01', 1024, 789);

INSERT INTO data_log VALUES (10, '2024-11-01', 1024, 912);

-- call_type
CREATE TABLE call_type (
type_name VARCHAR (32),
cost_per_minute DECIMAL (10, 2),
PRIMARY KEY (type_name));

-- data
INSERT INTO call_type VALUES ('Local', 0.01);

INSERT INTO call_type VALUES ('National', 0.06);

-- bank
CREATE TABLE bank (
user_id INT,
bank_account_num INT,
card_num BIGINT,
bank_name VARCHAR (32),
PRIMARY KEY (user_id));

-- data
INSERT INTO bank VALUES (1, 3456789, 9876543214860270, 'Wells Fargo');

INSERT INTO bank VALUES (2, 9876543, 2468101214161820, 'Bank of America');

INSERT INTO bank VALUES (3, 5432109, 1357924680246802, 'Wells Fargo');

INSERT INTO bank VALUES (4, 7654321, 9876543210246810, 'Chase');

INSERT INTO bank VALUES (5, 2109876, 4680135790246810, 'Citibank');

INSERT INTO bank VALUES (6, 2345678, 1234567890123456, 'Chase');

INSERT INTO bank VALUES (7, 4567890, 9876543210987654, 'Bank of America');

INSERT INTO bank VALUES (8, 6789012, 5432109876543210, 'Wells Fargo');

INSERT INTO bank VALUES (9, 8901234, 6543210987654321, 'Citibank');

INSERT INTO bank VALUES (10, 0123456, 4321098765432109, 'US Bank');

-- transaction
CREATE TABLE transaction (
	bill_id INT,
	date_paid DATE,
	PRIMARY KEY (bill_id));

-- data
INSERT INTO transaction VALUES (1, '2024-11-02');

INSERT INTO transaction VALUES (2, '2024-11-03');

INSERT INTO transaction VALUES (3, '2024-11-01');

INSERT INTO transaction VALUES (4, '2024-11-04');

INSERT INTO transaction VALUES (5, '2024-11-05');

INSERT INTO transaction VALUES (6, '2024-11-02');

INSERT INTO transaction VALUES (7, '2024-11-03');

INSERT INTO transaction VALUES (8, '2024-11-01');

INSERT INTO transaction VALUES (9, '2024-11-04');

INSERT INTO transaction VALUES (10, '2024-11-05');

-- INSERT INTO transaction VALUES (11, '2024-12-02');

-- INSERT INTO transaction VALUES (12, '2024-12-03');

-- INSERT INTO transaction VALUES (13, '2024-12-01');

-- INSERT INTO transaction VALUES (14, '2024-12-04');

-- INSERT INTO transaction VALUES (15, '2024-12-05');

-- INSERT INTO transaction VALUES (16, '2024-12-02');

-- INSERT INTO transaction VALUES (17, '2024-12-03');

-- INSERT INTO transaction VALUES (18, '2024-12-01');

-- INSERT INTO transaction VALUES (19, '2024-12-04');

-- INSERT INTO transaction VALUES (20, '2024-12-05');

-- bill
CREATE TABLE bill (
	bill_id SERIAL,
	user_id INT,
	cost DECIMAL (10, 2),
	due_date DATE,
	paid BOOL,
	PRIMARY KEY (bill_id));

-- data
INSERT INTO bill VALUES (default, 1, 16.74, '2024-11-05', true);

INSERT INTO bill VALUES (default, 2, 20.00, '2024-11-05', true);

INSERT INTO bill VALUES (default, 3, 24.20, '2024-11-05', true);

INSERT INTO bill VALUES (default, 4, 14.57, '2024-11-05', true);

INSERT INTO bill VALUES (default, 5, 45.00, '2024-11-05', true);

INSERT INTO bill VALUES (default, 6, 30.00, '2024-11-05', true);

INSERT INTO bill VALUES (default, 7, 20.23, '2024-11-05', true);

INSERT INTO bill VALUES (default, 8, 45.00, '2024-11-05', true);

INSERT INTO bill VALUES (default, 9, 24.63, '2024-11-05', true);

INSERT INTO bill VALUES (default, 10, 17.52, '2024-11-05', true);

INSERT INTO bill VALUES (default, 1, 18.98, '2024-12-05', false);

INSERT INTO bill VALUES (default, 2, 20.00, '2024-12-05', false);

INSERT INTO bill VALUES (default, 3, 27.22, '2024-12-05', false);

INSERT INTO bill VALUES (default, 4, 18.49, '2024-12-05', false);

INSERT INTO bill VALUES (default, 5, 45.00, '2024-12-05', false);

INSERT INTO bill VALUES (default, 6, 30.00, '2024-12-05', false);

INSERT INTO bill VALUES (default, 7, 23.79, '2024-12-05', false);

INSERT INTO bill VALUES (default, 8, 45.00, '2024-12-05', false);

INSERT INTO bill VALUES (default, 9, 27.94, '2024-12-05', false);

INSERT INTO bill VALUES (default, 10, 19.64, '2024-12-05', false);

COMMIT;

;



BEGIN;

SELECT user_id, username, password FROM users WHERE username = jboyyy1;

COMMIT;



BEGIN;

SELECT * FROM users WHERE user_id = 1;

COMMIT;



BEGIN;


            SELECT 
                cl.call_id AS call_id,
                cl.call_date_time AS date,
                cl.duration AS duration,
                cl.call_type AS call_type,
                (cl.duration * ct.cost_per_minute) AS cost
            FROM call_log cl
            JOIN call_type ct ON ct.type_name = cl.call_type
            WHERE cl.user_id = 1
            ORDER BY cl.call_date_time DESC
            LIMIT 100
        ;

COMMIT;



BEGIN;


            SELECT 
                t.bill_id AS bill_id,
                b.cost AS cost,
                b.due_date AS due_date,
                t.date_paid AS date_paid
            FROM transaction t
            JOIN bill b ON b.bill_id = t.bill_id
            WHERE b.user_id = 1
            ORDER BY t.bill_id DESC
            LIMIT 100
        ;

COMMIT;



BEGIN;


            SELECT 
                b.bill_id AS bill_id, 
                b.cost AS cost, 
                b.due_date AS due_date, 
                b.paid AS paid,
                COALESCE(SUM(c.duration), 0) AS total_minutes,
                COALESCE(SUM(d.data_used_mib), 0) AS data_used_mib
            FROM bill b
            LEFT JOIN call_log c ON c.user_id = b.user_id 
                AND EXTRACT(YEAR FROM c.call_date_time) = EXTRACT(YEAR FROM (b.due_date - INTERVAL '1 month'))
                AND EXTRACT(MONTH FROM c.call_date_time) = EXTRACT(MONTH FROM (b.due_date - INTERVAL '1 month'))
            LEFT JOIN data_log d ON d.user_id = b.user_id
                AND EXTRACT(YEAR FROM d.month) = EXTRACT(YEAR FROM (b.due_date - INTERVAL '1 month'))
                AND EXTRACT(MONTH FROM d.month) = EXTRACT(MONTH FROM (b.due_date - INTERVAL '1 month'))
            WHERE b.user_id = 1 
            GROUP BY b.bill_id
            ORDER BY b.bill_id DESC
            LIMIT 100
        ;

SELECT SUM(cost) AS total_due FROM bill WHERE user_id = 1 AND paid = false;

COMMIT;



BEGIN;


            INSERT INTO transaction (bill_id, date_paid)
            SELECT bill_id, CURRENT_DATE
            FROM bill
            WHERE user_id = 1 AND paid = false
        ;


            UPDATE bill
            SET paid = true
            WHERE user_id = 1 AND paid = false
        ;

COMMIT;



BEGIN;


            SELECT 
                t.bill_id AS bill_id,
                b.cost AS cost,
                b.due_date AS due_date,
                t.date_paid AS date_paid
            FROM transaction t
            JOIN bill b ON b.bill_id = t.bill_id
            WHERE b.user_id = 1
            ORDER BY t.bill_id DESC
            LIMIT 100
        ;

COMMIT;



BEGIN;


            SELECT 
                b.bill_id AS bill_id, 
                b.cost AS cost, 
                b.due_date AS due_date, 
                b.paid AS paid,
                COALESCE(SUM(c.duration), 0) AS total_minutes,
                COALESCE(SUM(d.data_used_mib), 0) AS data_used_mib
            FROM bill b
            LEFT JOIN call_log c ON c.user_id = b.user_id 
                AND EXTRACT(YEAR FROM c.call_date_time) = EXTRACT(YEAR FROM (b.due_date - INTERVAL '1 month'))
                AND EXTRACT(MONTH FROM c.call_date_time) = EXTRACT(MONTH FROM (b.due_date - INTERVAL '1 month'))
            LEFT JOIN data_log d ON d.user_id = b.user_id
                AND EXTRACT(YEAR FROM d.month) = EXTRACT(YEAR FROM (b.due_date - INTERVAL '1 month'))
                AND EXTRACT(MONTH FROM d.month) = EXTRACT(MONTH FROM (b.due_date - INTERVAL '1 month'))
            WHERE b.user_id = 1 
            GROUP BY b.bill_id
            ORDER BY b.bill_id DESC
            LIMIT 100
        ;

SELECT SUM(cost) AS total_due FROM bill WHERE user_id = 1 AND paid = false;

COMMIT;



BEGIN;

SELECT * FROM users WHERE user_id = 1 AND admin = true;

COMMIT;



BEGIN;

SELECT * FROM users WHERE user_id = 1;

COMMIT;



BEGIN;


            SELECT 
                t.bill_id AS bill_id,
                b.cost AS cost,
                b.due_date AS due_date,
                t.date_paid AS date_paid
            FROM transaction t
            JOIN bill b ON b.bill_id = t.bill_id
            WHERE b.user_id = 1
            ORDER BY t.bill_id DESC
            LIMIT 100
        ;

COMMIT;



BEGIN;


            SELECT 
                b.bill_id AS bill_id, 
                b.cost AS cost, 
                b.due_date AS due_date, 
                b.paid AS paid,
                COALESCE(SUM(c.duration), 0) AS total_minutes,
                COALESCE(SUM(d.data_used_mib), 0) AS data_used_mib
            FROM bill b
            LEFT JOIN call_log c ON c.user_id = b.user_id 
                AND EXTRACT(YEAR FROM c.call_date_time) = EXTRACT(YEAR FROM (b.due_date - INTERVAL '1 month'))
                AND EXTRACT(MONTH FROM c.call_date_time) = EXTRACT(MONTH FROM (b.due_date - INTERVAL '1 month'))
            LEFT JOIN data_log d ON d.user_id = b.user_id
                AND EXTRACT(YEAR FROM d.month) = EXTRACT(YEAR FROM (b.due_date - INTERVAL '1 month'))
                AND EXTRACT(MONTH FROM d.month) = EXTRACT(MONTH FROM (b.due_date - INTERVAL '1 month'))
            WHERE b.user_id = 1 
            GROUP BY b.bill_id
            ORDER BY b.bill_id DESC
            LIMIT 100
        ;

SELECT SUM(cost) AS total_due FROM bill WHERE user_id = 1 AND paid = false;

COMMIT;



BEGIN;


            SELECT 
                cl.call_id AS call_id,
                cl.call_date_time AS date,
                cl.duration AS duration,
                cl.call_type AS call_type,
                (cl.duration * ct.cost_per_minute) AS cost
            FROM call_log cl
            JOIN call_type ct ON ct.type_name = cl.call_type
            WHERE cl.user_id = 1
            ORDER BY cl.call_date_time DESC
            LIMIT 100
        ;

COMMIT;



