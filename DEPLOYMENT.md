# Deployment Guide: Mac Mini Server

This guide explains how to host VizCoach on a Mac Mini so it is accessible to everyone on your organization's private Wi-Fi network.

## Prerequisities

On the Mac Mini, ensure you have the following installed:

1.  **Node.js** (for building the frontend)
2.  **Go** (for compiling the backend)
3.  **Git** (to pull the code)

## Step 1: Network Setup

1.  **Connect** the Mac Mini to the organization's Wi-Fi or (preferably) Ethernet.
2.  **Find the IP Address**:
    Run `ipconfig getifaddr en0` (Wi-Fi) or `ipconfig getifaddr en1` (Ethernet) in the terminal.
    _Example IP: `10.10.1.50`_
3.  **(Optional but Recommended)** Set a **Static IP** in System Settings -> Network so the address doesn't change after a reboot.

## Step 2: Configure Environment

1.  Clone/Copy the project to the Mac Mini (e.g., to `/Users/admin/viz-coach`).
2.  Create/Edit the `.env` file in the project root:
    ```bash
    nano .env
    ```
3.  Set the URL to the Mac Mini's IP address:
    ```ini
    REACT_APP_POCKETBASE_URL=http://<YOUR_MAC_MINI_IP>:8090
    ```
    _Example: `REACT_APP_POCKETBASE_URL=http://10.10.1.50:8090`_

## Step 3: Automated Build

We have included a script to automate the build process.

1.  Make the script executable:
    ```bash
    chmod +x deployment/deploy.sh
    ```
2.  Run the deployment script:
    ```bash
    ./deployment/deploy.sh
    ```

This will:

- Install dependencies.
- Build the React frontend with your IP configuration.
- Copy the frontend files to the backend.
- Compile the PocketBase backend binary.

## Step 4: Run as a Background Service (Auto-start)

To ensure the server runs automatically when the Mac Mini turns on and restarts if it crashes, use `launchd`.

1.  **Edit the plist file**:
    Open `deployment/com.vizcoach.server.plist` and update the paths to match where you put the project on the Mac Mini.
    _Replace `/Users/YOUR_USER/Desktop/viz-coach` with the actual path._

2.  **Install the Service**:
    Copy the plist file to the LaunchAgents folder:

    ```bash
    cp deployment/com.vizcoach.server.plist ~/Library/LaunchAgents/
    ```

3.  **Load the Service**:
    ```bash
    launchctl load ~/Library/LaunchAgents/com.vizcoach.server.plist
    ```

The server is now running! You can access it at `http://<YOUR_MAC_MINI_IP>:8090`.

## Maintenance Commands

- **Stop Server**: `launchctl unload ~/Library/LaunchAgents/com.vizcoach.server.plist`
- **Start Server**: `launchctl load ~/Library/LaunchAgents/com.vizcoach.server.plist`
- **View Logs**:
  - stdout: `/tmp/viz-coach.out`
  - stderr: `/tmp/viz-coach.err`
