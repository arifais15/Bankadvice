# Preview Project Workflow

This workflow details the commands required to run the development server, start the local Firebase emulators, and test the web application locally.

## Steps

### 1. Start Firebase Local Emulators
Start the local Firebase Emulator Suite (Auth and Firestore) to enable database and authentication services without requiring a production Firebase project:
```powershell
npx.cmd firebase emulators:start --project demo-app
```
*(On macOS/Linux, run `npx firebase emulators:start --project demo-app`)*

Leave this terminal window running. You can access the Firebase Emulator Suite UI at `http://localhost:4000`.

### 2. Run Development Server
In a new terminal window, start the Next.js development server:
```powershell
npm.cmd run dev
```
*(On macOS/Linux, run `npm run dev`)*

The server will start on port `9002` (e.g., `http://localhost:9002`).

### 3. Verify Application
1. Open `http://localhost:9002` in your browser. You will be redirected to `/login`.
2. To log in:
   * Open the Firebase Emulator UI at `http://localhost:4000/auth`.
   * Click **Add user** and create a user account with email `admin@example.com` and password `password`.
   * Log in to the web application at `http://localhost:9002/login` using those credentials.
3. Once logged in, you should see the dashboard correctly loaded.
