Instructions for setup
  Setup the database:  
  1. Starting in the base directory (the one that contains this file), open the postgreSQL cli.
  2. Initialiaze the `phone` database using the provided `database.sql` script:
      `\i database.sql`
  5. Connect to the `phone` database as user `dbs05`:
      `\c phone dbs05`
  6. Initialiaze the database tables using the `phone.sql` script:
      `\i phone.sql`
  7. Optionally, use the `\dt` command to ensure the tables were created.
  8. You can now exit the postgreSQL cli.

  Setup the server:
  1. Enter the `phone_app/` directory.
  2. Install Node.js dependencies using `npm`:
      `npm install`
  3. Start the server:
      `node server.js`

Instructions for use:



















***REMOVED***

Server files can be found in phone_app/server.js, and each web page file can be found in the phone_app/public directory. The server accesses a database called 'phone' on localhost and the code for generating the tables in that database can be found in phone.sql. The ER model is described in er_model.png which is generated using the mermaid script er_model_mermaid.mmd.

