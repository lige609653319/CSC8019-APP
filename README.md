# UserClient - Hybrid Expo (WebView) & React Demo

This project uses a **Hybrid Approach**:
1.  **Web App**: Built with React (Vite) and `antd-mobile` for a rich web UI.
2.  **Native Shell**: Built with Expo and `react-native-webview` to embed the web app.

## Prerequisites
- **Node.js**: v18 or higher (v20+ recommended).
- **Expo Go**: Installed on your mobile device.

## Getting Started

You need to run **two** servers: one for the web content and one for the Expo app.

### 1. Start the React Web Server
Open a new terminal and run:
```bash
cd web-app
npm install
npm run dev
```
By default, this runs on `http://localhost:5175`.

### 2. Configure Local IP (Important!)
To see the app on your physical phone, the WebView must point to your computer's **Local IP address**, not `localhost`.

1. Find your IP address (e.g., `10.90.72.99`).
2. Open `App.js` in the root directory.
3. Update the `WEB_APP_URL` constant:
   ```javascript
   const WEB_APP_URL = 'http://10.90.72.99:5175/'; 
   ```

### 3. Start the Expo App
In the root directory, run:
```bash
npx expo start --tunnel
```
*(Tunnel mode is recommended to bypass network/firewall issues.)*

Scan the QR code with **Expo Go**.

## Why this approach?
- **Faster UI development**: Using `antd-mobile` (web) provides a more mature and easier-to-style library.
- **True Cross-Platform**: The web app can also be used in a browser or as a PWA.
- **Easier Debugging**: Use Chrome/Safari DevTools for the UI, and Expo logs for native features.
