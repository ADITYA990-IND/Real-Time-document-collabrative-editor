# Real-Time Collaborative Document Editor


*COMPANY*: CODTECH IT SOLUTIONS

*NAME*: ADITYA RAJ CHOURASIYA 

*INTERN ID*: CITS568

*DOMAIN*: FULL STACK WEB DEVELOPMENT

*DURATION*: 6 WEEKS

*MENTOR*: NEELA SANTOSH KUMAR

## Overview

This frontend provides a shared document editor with live synchronization across connected clients. Key behavior includes:

- dynamic room creation and joining
- live document updates across all active participants
- QR code generation for easy mobile access
- robust clipboard support for sharing links reliably

## What’s New

- `socketUrl` now supports dynamic network host resolution so mobile devices on the same Wi-Fi can connect to the backend.
- Clipboard sharing now uses `navigator.clipboard.writeText()` with a fallback to `document.execCommand('copy')` for broader browser compatibility.
- Improved connection status handling and WebSocket reconnection logic.

## Tech Stack

- React
- Vite
- ESLint
- `qrcode.react`
- WebSocket client integration

## Getting Started

1. Open a terminal in the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the local Vite URL shown in the terminal.

## Usage

- Create a new workspace to generate a room token.
- Share the workspace using the QR code or the copy link button.
- Other users can open the shared link or scan the QR code to join the same room.
- Edits are synchronized in real time across connected clients.

## Available Scripts

- `npm run dev` — start the Vite development server
- `npm run build` — create a production build
- `npm run preview` — serve the production build locally
- `npm run lint` — check source files with ESLint

## Local Network Access

For mobile access, the backend is expected to run on `port 5000` and bind to `0.0.0.0`.
This ensures devices on the same local network can connect using the host machine’s IP address.

## Project Structure

- `src/` — React application source code
- `public/` — static public assets
- `vite.config.js` — Vite configuration
- `eslint.config.js` — ESLint configuration
- `package.json` — frontend dependencies and scripts

## Backend Integration

This frontend is designed to work with the backend in the `backend/` folder.
The backend provides document persistence, real-time WebSocket messaging, and database syncing.

## Developed By 

Aditya Raj Chourasiya 