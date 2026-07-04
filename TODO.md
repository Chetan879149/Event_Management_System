# TODO - EventFlow website changes

- [x] Update navbar signed-in text on `index.html` auth status via `script.js`:
  - Replace `Signed in as ${displayName}` with initials + Title Case surname (e.g., `John Doe` -> `J Doe`).
  - Ensure both desktop and mobile auth status text updates.


- [x] Add admin auth UI to `admin.html` (Sign In / Get Started + Signed-in user area + Logout button) using existing DOM-id conventions.


- [x] Implement admin auth hide/show logic in `admin.js`:

  - If `localStorage.getItem('eventflow-user')` exists -> hide guest buttons and show signed-in area.
  - If not -> show guest buttons.
  - Add logout behavior that clears auth state (remove `eventflow-session` and `eventflow-user`).

- [x] Add “event handling” table view to admin:

  - Add new table selector option in `admin.html`.
  - Add table configuration in `admin.js` (`tableConfigs` + columns + actions if desired).
  - Add new SQL query in `server.js` under `adminTableQueries` for the new table.

- [x] Start server and verify:

  - `index.html` navbar text formatting after login.
  - `admin.html` shows/hides auth buttons correctly on login/logout.
  - New admin table loads rows without errors.

