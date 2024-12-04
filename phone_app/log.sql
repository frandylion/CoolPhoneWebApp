BEGIN;

SELECT user_id, username, password FROM users WHERE username = mimimi;

COMMIT;



BEGIN;

SELECT * FROM users WHERE user_id = 2;

COMMIT;



BEGIN;


            SELECT 
                t.bill_id AS bill_id,
                b.cost AS cost,
                b.due_date AS due_date,
                t.date_paid AS date_paid
            FROM transaction t
            JOIN bill b ON b.bill_id = t.bill_id
            WHERE b.user_id = 2
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
            WHERE b.user_id = 2 
            GROUP BY b.bill_id
            ORDER BY b.bill_id DESC
            LIMIT 100
        ;

SELECT SUM(cost) AS total_due FROM bill WHERE user_id = 2 AND paid = false;

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
            WHERE cl.user_id = 2
            ORDER BY cl.call_date_time DESC
            LIMIT 100
        ;

COMMIT;



BEGIN;

SELECT * FROM users WHERE user_id = 2 AND admin = true;

COMMIT;



BEGIN;


            WITH
                user_minutes AS (
                    SELECT u.user_id, COALESCE(SUM(c.duration), 0) AS minutes 
                    FROM users u
                    LEFT JOIN call_log c ON c.user_id = u.user_id
                    GROUP BY u.user_id
                )
            SELECT
                u.user_id AS user_id,
                u.username AS username,
                u.password AS password,
                CONCAT(up.plan_type, ' ', up.payment_type) AS plan,
                um.minutes AS total_minutes
            FROM users u
            JOIN user_plan up ON up.user_id = u.user_id
            LEFT JOIN user_minutes um ON um.user_id = u.user_id
            ORDER BY u.user_id
            LIMIT 100
        ;

COMMIT;



BEGIN;

SELECT SUM(cost) AS total_revenue FROM bill WHERE paid = true;


            WITH
                revenue_per_user AS (
                    SELECT user_id, SUM(cost) AS revenue
                    FROM bill
                    WHERE paid = true
                    GROUP BY user_id
                )
            SELECT AVG(revenue) AS avg_revenue
            FROM revenue_per_user
        ;

SELECT SUM(cost) AS outstanding_bills FROM bill WHERE paid = false;

COMMIT;



BEGIN;

SELECT SUM(duration) AS minutes FROM call_log;


            WITH
                total_minutes AS (
                    SELECT SUM(duration) AS minutes FROM call_log
                ),
                local_minutes AS (
                    SELECT SUM(duration) AS minutes FROM call_log WHERE call_type = 'Local'
                )
            SELECT (l.minutes / t.minutes * 100) AS percent
            FROM total_minutes t, local_minutes l
        ;


            WITH
                total_minutes AS (
                    SELECT SUM(duration) AS minutes FROM call_log
                ),
                national_minutes AS (
                    SELECT SUM(duration) AS minutes FROM call_log WHERE call_type = 'National'
                )
            SELECT (n.minutes / t.minutes * 100) AS percent
            FROM total_minutes t, national_minutes n
        ;

SELECT AVG(duration) AS avg_duration FROM call_log;

COMMIT;



BEGIN;


            WITH
                user_minutes AS (
                    SELECT u.user_id, COALESCE(SUM(c.duration), 0) AS minutes 
                    FROM users u
                    LEFT JOIN call_log c ON c.user_id = u.user_id
                    GROUP BY u.user_id
                )
            SELECT
                u.user_id AS user_id,
                u.username AS username,
                u.password AS password,
                CONCAT(up.plan_type, ' ', up.payment_type) AS plan,
                um.minutes AS total_minutes
            FROM users u
            JOIN user_plan up ON up.user_id = u.user_id
            LEFT JOIN user_minutes um ON um.user_id = u.user_id
            WHERE u.username LIKE %j%
            ORDER BY u.user_id
            LIMIT 100
        ;

COMMIT;



BEGIN;


            WITH
                user_minutes AS (
                    SELECT u.user_id, COALESCE(SUM(c.duration), 0) AS minutes 
                    FROM users u
                    LEFT JOIN call_log c ON c.user_id = u.user_id
                    GROUP BY u.user_id
                )
            SELECT
                u.user_id AS user_id,
                u.username AS username,
                u.password AS password,
                CONCAT(up.plan_type, ' ', up.payment_type) AS plan,
                um.minutes AS total_minutes
            FROM users u
            JOIN user_plan up ON up.user_id = u.user_id
            LEFT JOIN user_minutes um ON um.user_id = u.user_id
            ORDER BY u.user_id
            LIMIT 100
        ;

COMMIT;



BEGIN;


            WITH
                user_minutes AS (
                    SELECT u.user_id, COALESCE(SUM(c.duration), 0) AS minutes 
                    FROM users u
                    LEFT JOIN call_log c ON c.user_id = u.user_id
                    GROUP BY u.user_id
                )
            SELECT
                u.user_id AS user_id,
                u.username AS username,
                u.password AS password,
                CONCAT(up.plan_type, ' ', up.payment_type) AS plan,
                um.minutes AS total_minutes
            FROM users u
            JOIN user_plan up ON up.user_id = u.user_id
            LEFT JOIN user_minutes um ON um.user_id = u.user_id
            WHERE u.username LIKE %j%
            ORDER BY u.user_id
            LIMIT 100
        ;

COMMIT;



BEGIN;


            WITH
                user_minutes AS (
                    SELECT u.user_id, COALESCE(SUM(c.duration), 0) AS minutes 
                    FROM users u
                    LEFT JOIN call_log c ON c.user_id = u.user_id
                    GROUP BY u.user_id
                )
            SELECT
                u.user_id AS user_id,
                u.username AS username,
                u.password AS password,
                CONCAT(up.plan_type, ' ', up.payment_type) AS plan,
                um.minutes AS total_minutes
            FROM users u
            JOIN user_plan up ON up.user_id = u.user_id
            LEFT JOIN user_minutes um ON um.user_id = u.user_id
            WHERE u.username LIKE %y%
            ORDER BY u.user_id
            LIMIT 100
        ;

COMMIT;



BEGIN;


            WITH
                user_minutes AS (
                    SELECT u.user_id, COALESCE(SUM(c.duration), 0) AS minutes 
                    FROM users u
                    LEFT JOIN call_log c ON c.user_id = u.user_id
                    GROUP BY u.user_id
                )
            SELECT
                u.user_id AS user_id,
                u.username AS username,
                u.password AS password,
                CONCAT(up.plan_type, ' ', up.payment_type) AS plan,
                um.minutes AS total_minutes
            FROM users u
            JOIN user_plan up ON up.user_id = u.user_id
            LEFT JOIN user_minutes um ON um.user_id = u.user_id
            ORDER BY u.user_id
            LIMIT 100
        ;

COMMIT;



BEGIN;


            WITH
                user_minutes AS (
                    SELECT u.user_id, COALESCE(SUM(c.duration), 0) AS minutes 
                    FROM users u
                    LEFT JOIN call_log c ON c.user_id = u.user_id
                    GROUP BY u.user_id
                )
            SELECT
                u.user_id AS user_id,
                u.username AS username,
                u.password AS password,
                CONCAT(up.plan_type, ' ', up.payment_type) AS plan,
                um.minutes AS total_minutes
            FROM users u
            JOIN user_plan up ON up.user_id = u.user_id
            LEFT JOIN user_minutes um ON um.user_id = u.user_id
            ORDER BY u.user_id
            LIMIT 100
        ;

COMMIT;



BEGIN;

SELECT SUM(cost) AS total_revenue FROM bill WHERE paid = true;


            WITH
                revenue_per_user AS (
                    SELECT user_id, SUM(cost) AS revenue
                    FROM bill
                    WHERE paid = true
                    GROUP BY user_id
                )
            SELECT AVG(revenue) AS avg_revenue
            FROM revenue_per_user
        ;

SELECT SUM(cost) AS outstanding_bills FROM bill WHERE paid = false;

COMMIT;



BEGIN;

SELECT SUM(duration) AS minutes FROM call_log;


            WITH
                total_minutes AS (
                    SELECT SUM(duration) AS minutes FROM call_log
                ),
                local_minutes AS (
                    SELECT SUM(duration) AS minutes FROM call_log WHERE call_type = 'Local'
                )
            SELECT (l.minutes / t.minutes * 100) AS percent
            FROM total_minutes t, local_minutes l
        ;


            WITH
                total_minutes AS (
                    SELECT SUM(duration) AS minutes FROM call_log
                ),
                national_minutes AS (
                    SELECT SUM(duration) AS minutes FROM call_log WHERE call_type = 'National'
                )
            SELECT (n.minutes / t.minutes * 100) AS percent
            FROM total_minutes t, national_minutes n
        ;

SELECT AVG(duration) AS avg_duration FROM call_log;

COMMIT;



BEGIN;


            WITH
                user_minutes AS (
                    SELECT u.user_id, COALESCE(SUM(c.duration), 0) AS minutes 
                    FROM users u
                    LEFT JOIN call_log c ON c.user_id = u.user_id
                    GROUP BY u.user_id
                )
            SELECT
                u.user_id AS user_id,
                u.username AS username,
                u.password AS password,
                CONCAT(up.plan_type, ' ', up.payment_type) AS plan,
                um.minutes AS total_minutes
            FROM users u
            JOIN user_plan up ON up.user_id = u.user_id
            LEFT JOIN user_minutes um ON um.user_id = u.user_id
            WHERE u.username LIKE %mimi%
            ORDER BY u.user_id
            LIMIT 100
        ;

COMMIT;



BEGIN;


            WITH
                user_minutes AS (
                    SELECT u.user_id, COALESCE(SUM(c.duration), 0) AS minutes 
                    FROM users u
                    LEFT JOIN call_log c ON c.user_id = u.user_id
                    GROUP BY u.user_id
                )
            SELECT
                u.user_id AS user_id,
                u.username AS username,
                u.password AS password,
                CONCAT(up.plan_type, ' ', up.payment_type) AS plan,
                um.minutes AS total_minutes
            FROM users u
            JOIN user_plan up ON up.user_id = u.user_id
            LEFT JOIN user_minutes um ON um.user_id = u.user_id
            ORDER BY u.user_id
            LIMIT 100
        ;

COMMIT;



