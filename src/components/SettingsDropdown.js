import React, { useRef } from "react";

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
  clearPreviewImage
}) => {
  const fileInputRef = useRef(null);

  return (
    showDropdown && (
      <div className="dropdown">
        <ul>
          <li>
            Name:
            <input
             className="name-input"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter your name"
            />
          </li>
          <li onClick={() => fileInputRef.current.click()} style={{ cursor: "pointer" }}>
            <button className="setting-dropdown-button">Upload Image</button>
          </li>
          {previewImage && (
            <li>
              <img
                src={previewImage}
                alt="Preview"
                style={{ maxWidth: "200px", maxHeight: "200px" }}
              />
            </li>
          )}
          {previewImage && (
            <ul>
            <li>
              <button className="setting-dropdown-button" onClick={previewImageCallback}>Preview</button>
            </li>
            <li>
              <button className="setting-dropdown-button" onClick={clearPreviewImage}>Clear</button>
            </li>
            </ul>
          )}
          <li>
            <button className="setting-dropdown-button" onClick={startOAuthFlow}>Authorize with Twitch</button>
          </li>
            <button className="setting-dropdown-button save-button" onClick={saveSettings}>Save</button>
            {(localStorage.getItem("name") || localStorage.getItem("backgroundImage")) && (
            <button className="setting-dropdown-button clear-button" onClick={clearSettings}>Clear</button>
            )}
        </ul>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageChange}
        />
      </div>
    )
  );
};

export default SettingsDropdown;
