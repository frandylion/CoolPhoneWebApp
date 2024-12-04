BEGIN;

SELECT * FROM users WHERE user_id = $1;

COMMIT;



BEGIN;

SELECT bill_id, cost, due_date, paid FROM bill WHERE user_id = $1;

SELECT SUM(cost) AS total_due FROM bill WHERE user_id = $1 AND paid = false;

COMMIT;



BEGIN;

SELECT * FROM users WHERE user_id = $1;

COMMIT;



BEGIN;

SELECT bill_id, cost, due_date, paid FROM bill WHERE user_id = $1;

SELECT SUM(cost) AS total_due FROM bill WHERE user_id = $1 AND paid = false;

COMMIT;



BEGIN;

SELECT * FROM users WHERE user_id = $1;

COMMIT;



BEGIN;

SELECT bill_id, cost, due_date, paid FROM bill WHERE user_id = $1;

SELECT SUM(cost) AS total_due FROM bill WHERE user_id = $1 AND paid = false;

COMMIT;



BEGIN;

SELECT * FROM users WHERE user_id = $1;

COMMIT;



BEGIN;

SELECT bill_id, cost, due_date, paid FROM bill WHERE user_id = $1;

SELECT SUM(cost) AS total_due FROM bill WHERE user_id = $1 AND paid = false;

COMMIT;



BEGIN;

SELECT * FROM users WHERE user_id = $1;

COMMIT;



BEGIN;

SELECT bill_id, cost, due_date, paid FROM bill WHERE user_id = $1;

SELECT SUM(cost) AS total_due FROM bill WHERE user_id = $1 AND paid = false;

COMMIT;



BEGIN;

SELECT * FROM users WHERE user_id = $1;

COMMIT;



BEGIN;

SELECT bill_id, cost, due_date, paid FROM bill WHERE user_id = $1;

SELECT SUM(cost) AS total_due FROM bill WHERE user_id = $1 AND paid = false;

COMMIT;



