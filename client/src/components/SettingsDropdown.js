import React, { useRef } from "react";

// SettingsDropdown component handles user settings and image preview within a dropdown menu
const SettingsDropdown = ({
  name,
  previewImage,
  showDropdown,
  handleNameChange,
  handleImageClick,
  handleImageChange,
  previewImageCallback,
  startOAuthFlow,
  saveSettings,
  clearSettings,
  clearPreviewImage,
  refreshToken,
}) => {
  // Reference to the hidden file input for image upload
  const fileInputRef = useRef(null);

  return (
    // Render the dropdown menu only if showDropdown is true
    showDropdown && (
      <div className="dropdown">
        <ul>
          {/* Input field for changing the user's name */}
          <li>
            Name:
            <input
              className="name-input"
              type="text"
              value={name}
              onChange={handleNameChange} // Handler for name changes
              placeholder="Enter your name"
            />
          </li>
          
          {/* Button to trigger file input click for image upload */}
          <li onClick={() => fileInputRef.current.click()} style={{ cursor: "pointer" }}>
            <button className="setting-dropdown-button">Upload Image</button>
          </li>
          
          {/* Display the preview image if available */}
          {previewImage && (
            <li>
              <img
                src={previewImage}
                alt="Preview"
                style={{ maxWidth: "200px", maxHeight: "200px" }}
              />
            </li>
          )}
          
          {/* Display preview and clear buttons if a preview image is set */}
          {previewImage && (
            <ul>
              <li>
                <button className="setting-dropdown-button image-button-preview" onClick={previewImageCallback}>Preview</button>
                <button className="setting-dropdown-button image-button-clear" onClick={clearPreviewImage}>Clear</button>
              </li>
            </ul>
          )}
          
          {/* Button to start OAuth flow with Twitch */}
          <li>
            {!localStorage.getItem("accessToken") && <button className="setting-dropdown-button" onClick={startOAuthFlow}>Authorize with Twitch</button>}
            {localStorage.getItem("accessToken") && <button className="setting-dropdown-button" onClick={refreshToken}>Refresh Twitch Token</button>}
          </li>
          
          {/* Button to save settings */}
          <button className="setting-dropdown-button save-button" onClick={saveSettings}>Save</button>
          
          {/* Display clear button if name or background image is stored in local storage */}
          {(localStorage.getItem("name") || localStorage.getItem("backgroundImage")) && (
            <button className="setting-dropdown-button clear-button" onClick={clearSettings}>Clear</button>
          )}
        </ul>
        
        {/* Hidden file input for image selection */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageChange} // Handler for image file selection
        />
      </div>
    )
  );
};

export default SettingsDropdown;
