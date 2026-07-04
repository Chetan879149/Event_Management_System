# EventFlow

EventFlow is a simple event management website. People can sign up, log in, create events, send contact messages, mark favorites, and book events. The website now uses a SQLite database, so the data is saved on the computer instead of disappearing when the page closes.

## What the project stores in the database

The database saves:

- User accounts
- Event details
- Contact form messages
- Event bookings
- Favorite events
- Login sessions

## Project files

- `index.html` - The main webpage
- `style.css` - All custom CSS styles
- `script.js` - Frontend JavaScript for buttons, forms, preview, and API calls
- `server.js` - Node.js server that runs the website and talks to the database
- `database.sql` - SQL script to create the database tables
- `admin.html` - Admin dashboard to view saved data
- `admin.js` - JavaScript for the admin dashboard
- `package.json` - Project settings and install commands

## Requirements

You need:

- Node.js installed on your computer
- npm installed with Node.js
- A browser such as Chrome, Edge, or Firefox

## How to run the website

### 1. Open the project folder

Open the `Event_Management` folder in VS Code or File Explorer.

### 2. Install the packages

Open a terminal in the project folder and run:

```bash
npm install
```

This installs Express and SQLite support.

### 3. Start the server

Run this command:

```bash
npm start
```

The server will start at:

```bash
http://localhost:3000
```

### 4. Open the website

Open your browser and go to:

```bash
http://localhost:3000
```

## Database setup

The database file is created automatically the first time you run the server.

If you want to see the SQL commands manually, open `database.sql`.

If you want to rebuild the tables by hand, you can run the SQL in any SQLite tool.

## Demo login

A demo account is already created for testing:

- Email: `demo@eventflow.com`
- Password: `demo1234`

## How the website works

- The signup form sends data to `/api/auth/register`
- The login form sends data to `/api/auth/login`
- The contact form sends data to `/api/contact`
- The create event form sends data to `/api/events`
- Bookings are saved with `/api/bookings`
- Favorites are saved with `/api/favorites`
- The admin dashboard loads saved data from `/api/admin/stats` and `/api/admin/records`

## Admin dashboard

You can open the admin page in your browser at:

```bash
http://localhost:3000/admin.html
```

This page shows the data stored in the database in a simple table view.
You can also edit or delete many records from this page.

## Database tables

### users
Stores account details like first name, last name, email, and password hash.

### events
Stores the events created on the website.

### contacts
Stores messages from the contact form.

### bookings
Stores ticket bookings for events.

### favorites
Stores which events a user marked as favorite.

### sessions
Stores login sessions for signed-in users.

## Notes

- This project is a demo application, so login is handled with a simple local session token.
- Uploaded event images are previewed in the browser, and the file name is saved in the database.
- If you stop the server, the website will not accept form data until you start it again.
- The admin dashboard can edit and delete records for users, events, contacts, and bookings.
- Favorites and sessions can be deleted from the admin dashboard.

## If something does not work

- Make sure `npm install` finished without errors.
- Make sure nothing else is already using port `3000`.
- Make sure you open the site through `http://localhost:3000`, not by double-clicking the HTML file.
- If you edit the SQL manually, restart the server after saving the database changes.

## Simple flow

1. Start the server.
2. Open the website in the browser.
3. Create an account or use the demo login.
4. Create events, send messages, and book events.
5. Check the SQLite database file to see the saved data.
# Event_Management_System
