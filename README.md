"""
# New tab homepage extension

This React application allows users to display a personalized greeting and view the live status of their followed Twitch channels after authorizing with their Twitch account. Users can also customize the app's background image and their display name.

## Features

- **Personalized Greeting**: The app greets the user based on the current time of day.
- **Twitch Integration**: Users can log in with their Twitch account to see a list of their followed channels and their live statuses.
- **Customization**: Users can customize their display name and set a background image.
- **Settings Management**: Settings are saved locally using `localStorage` so that they persist across sessions.
- **Live Channel Refresh**: Users can refresh the status of followed channels to check if they are live.

## Getting Started

### Prerequisites

Before running this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Twitch API Setup

To use this application, you need to create a Twitch app to obtain your `CLIENT_ID`, `CLIENT_SECRET`, and `REDIRECT_URI`.

1. Go to the [Twitch Developer Portal](https://dev.twitch.tv/console/apps) and create a new application.
2. Set the OAuth Redirect URLs to match where you will be hosting the app (for local development, use `http://localhost:3000`).
3. Copy the `Client ID` and `Client Secret` values, as you will need them in the next step.

### Environment Variables

Create a `.env` file in the root directory of your project with the following variables:

\`\`\`env
REACT_APP_CLIENT_ID=your_twitch_client_id
REACT_APP_CLIENT_SECRET=your_twitch_client_secret
REACT_APP_REDIRECT_URI=your_redirect_uri
\`\`\`

Replace `your_twitch_client_id`, `your_twitch_client_secret`, and `your_redirect_uri` with the values from your Twitch app.

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Lily-Harvey/New_Tab_extension_with_twitch_followed_live_status.git
    cd New_Tab_extension_with_twitch_followed_live_status
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Start the development server:**

    ```bash
    npm start
    ```

    The app will be available at `http://localhost:3000`.

## Usage

1. **Login with Twitch**: Click on the settings icon (⚙️) in the top right corner and start the OAuth flow to log in with your Twitch account.

2. **Customize Settings**: After logging in, you can customize your display name and set a background image. Click "Save Settings" to persist your changes.

3. **View Followed Channels**: The app will display a list of channels you follow on Twitch. Channels that are currently live will be highlighted.

4. **Refresh Channels**: Use the refresh button in the channels section to update the live status of your followed channels.

## Extension Setup

This project includes browser extensions that allow you to set this application as your new tab homepage.

### Extension Installation

#### General Instructions

1. **Edit the `index.html` file**:
    - Navigate to the appropriate folder (`chrome` or `firefox`).
    - Open the `index.html` file and locate the `<iframe>` element.
    - Update the `src` attribute of the `<iframe>` to point to where your React app is hosted (e.g., `https://your-hosted-site.com`).

2. **Update the Manifest File**:
    - Open the `manifest.json` file in the folder for your browser type.
    - Make the following changes:
        - **For Chrome**:
            - Ensure the `manifest_version` is set to `2` or `3`.
            - Check that `name`, `version`, and `description` accurately describe your extension.
            - The `chrome_url_overrides` field should have `"newtab": "index.html"`.
            - The `permissions` array includes any necessary permissions.
        - **For Firefox**:
            - Make sure to replace `<Enter UUID>` in `"applications.gecko.id"` with your unique extension ID.

3. **Zip the Extension Files**:
    - After editing the `index.html` and `manifest.json`, zip these files together.
    - Ensure the zip file contains only the `index.html` and `manifest.json` files.

#### For Firefox

1. **Load the Extension in Firefox**:

    Depending on the version of Firefox you are using, follow the relevant instructions below:

    ##### 1.1 Firefox Developer Edition

    Before installing an unsigned extension, you need to enable the ability to install them in Firefox Developer Edition.

    1. Open Firefox Developer Edition.
    2. Type `about:config` in the address bar and press Enter.
    3. Accept the risk and continue to the settings page.
    4. In the search bar at the top, type `xpinstall.signatures.required`.
    5. Double-click the setting to change its value to `false`. This will allow you to install unsigned extensions.

    After allowing unsigned extensions:

    1. Go to the menu and select **Add-ons and Themes**.
    2. Click on the gear icon ⚙️ and select **Install Add-on From File...**.
    3. Navigate to the zip file you just created and select it.
    4. Confirm the installation when prompted.

    ##### 1.2 Firefox Standard Edition

    1. Open Firefox.
    2. Type `about:debugging` in the address bar and press Enter.
    3. Select **This Firefox** (on the left panel).
    4. Click on **Load Temporary Add-on**.
    5. Navigate to the zip file you just created and select it.

2. **Using the Extension**: Once loaded, opening a new tab will display the React application.

#### For Chrome

1. **Ensure the Manifest File is Correct**:

    Before loading the extension, verify that your `manifest.json` file is correctly configured for Chrome:

    - **Manifest Version**: Ensure that the `manifest_version` is set to `2` or `3` (Chrome supports both, but `3` is recommended).
    - **Name and Version**: Provide a unique `name` and `version` for your extension.
    - **Description**: Add a brief `description` of what your extension does.
    - **Permissions**: Verify that the `permissions` field includes any necessary permissions (e.g., `"tabs"`, `"storage"`).
    - **Background Scripts**: If applicable, check that the `background` field is properly configured (for `manifest_version` 2, this is usually an array of script files; for `manifest_version` 3, it's a background service worker).
    - **Icons**: Make sure that the `icons` field includes paths to the icon images (if required).

2. **Load the Extension in Chrome**:

    1. Open Chrome.
    2. Type `chrome://extensions/` in the address bar and press Enter.
    3. Enable **Developer mode** by toggling the switch in the top right corner.
    4. Click on **Load unpacked**.
    5. Navigate to the folder containing the `index.html` and `manifest.json` files and select it.

3. **Using the Extension**: Once loaded, opening a new tab will display the React application.

---

Make sure to choose the correct folder and follow the instructions specific to your browser for a smooth setup experience.


## File Structure

Here is a brief overview of the project's file structure:

\`\`\`
Browser extension/
│
├── chrome/
│ ├── index.html // Displays the React app in an iframe as a new tab
│ ├── manifest.json // Defines the extension's metadata for Chrome
│
├── firefox/
│ ├── index.html // Displays the React app in an iframe as a new tab
│ ├── manifest.json // Defines the extension's metadata for Firefox
│
src/
│
├── components/
│ ├── Greeting.js // Displays a personalized greeting
│ ├── SettingsDropdown.js // Manages user settings and OAuth flow
│ └── FollowedChannels.js // Displays a list of followed Twitch channels
│
├── App.js // Main component where everything comes together
├── index.js // Entry point of the application
├── index.css // Style for the application
└── .env // Environment variables for Twitch API
\`\`\`

## Contributing

If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are welcome!

## License

This project is open source and available under the [MIT License](LICENSE).
"""