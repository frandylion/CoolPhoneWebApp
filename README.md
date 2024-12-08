**Instructions for setup:**

Setup the database:  
  1. Starting in the base directory (the one that contains this file), open the postgreSQL cli.
  2. Initialize the `phone` database and `dbs05` rolee using the provided `database.sql` script:
      `\i database.sql`
  3. You can now exit the postgreSQL cli.

Setup the server:
  1. Enter the `phone_app/` directory.
  2. Install Node.js dependencies using `npm`:
      `npm install`
  3. Start the server:
      `node server.js`


**Instructions for use:**
1. Open the webapp in a browser with the address `localhost:3000`.
2. Press the `Simulate` button to populate the initial tables.
2. Login with the username and password of one of the users in the database:
      e.g. username: `mimimi` and password: `beepbepp028`
3. You can now view the tables and balance. You can also pay the due balance.
4. If your user is an admin (`mimimi` is an admin) you can view the Admin Portal by clicking the `Access Admin Portal` button at the bottom of the page.
5. In the Admin Portal you can view overall reports and search users by username.
6. You can also access additional simulation options.
7. All SQL is saved in the phone_app/log.sql file (which is cleared at server start).


**Video Link:**
http://tiny.cc/dbs05


**Important files:**
- README.md
- er_model.png
- logical_er.png
- physicalDiagram.txt
- preliminary_er_model.png
- draft_er_model.png
- team 5 database report.pdf
- phone_app/server.js
- phone_app/sim_init.sql
- phone_app/log.sql
- phone_app/public/login.html
- phone_app/public/home.html
- phone_app/public/admin.html


Code created by Frances G. and Erin Bartels. 
