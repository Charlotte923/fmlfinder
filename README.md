# FML Finder

A tool to download FML files from Funda listings.

## Project Structure
- `index.html`: Frontend interface
- `index.js`: Frontend logic
- `server.js`: Express server that serves the frontend and handles proxy requests

## Deployment Instructions (Render.com)

1. Create an account on [Render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Use the following settings:
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment Variable: Add `PORT` if you want to use a specific port (optional)
5. Click "Create Web Service"
6. Wait for deployment to complete
7. Your app will be available at the URL provided by Render

## Local Development
1. Install dependencies: `npm install`
2. Start the server: `node server.js`
3. Open `http://localhost:3000` in your browser 
