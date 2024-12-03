**Instructions for setup:**

Setup the database:  
  1. Starting in the base directory (the one that contains this file), open the postgreSQL cli.
  2. Initialize the `phone` database using the provided `database.sql` script:
      `\i database.sql`
  3. Connect to the `phone` database as user `dbs05`:
      `\c phone dbs05`
  4. Initialiaze the database tables using the `phone.sql` script:
      `\i phone.sql`
  5. Optionally, use the `\dt` command to ensure the tables were created.
  6. You can now exit the postgreSQL cli.

### FIXME - possibly delete 3,4,5 once there is a gui button to run phone.sql. possibly just make 

Setup the server:
  1. Enter the `phone_app/` directory.
  2. Install Node.js dependencies using `npm`:
      `npm install`
  3. Start the server:
      `node server.js`


**Instructions for use:**
1. Open the webapp in a browser with the address `localhost:3000`.
2. Login with the username and password of one of the users in the database:
      e.g. username: `bisniz` and password: `shodleo098`
3. You can now view the tables and balance. You can also submit payments to the transaction table.


**Important files:**
- README.md
- er_model.png
- phone_app/server.js
- phone_app/public/login.html
- phone_app/public/home.html


***REMOVED***
