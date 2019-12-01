import React from "react";

export const Titlebar = (props) => {
    return (
      <div className="window-titlebar">
      <div className="titlebar-drag-region"></div>
        <div className="titlebar-menu">
          <div className="logo-icon">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1146 1148" width="16px" height="16px"><path d="M1046,328v720H326V328h720m10-100H316a90,90,0,0,0-90,90v740a90,90,0,0,0,90,90h740a90,90,0,0,0,90-90V318a90,90,0,0,0-90-90Z" fill="#eb358a"/><path d="M138.5,318c0-97.87,79.63-177.5,177.5-177.5H920V90A90,90,0,0,0,830,0H90A90,90,0,0,0,0,90V830a90,90,0,0,0,90,90h48.5Z" fill="#484848"/><path d="M413.5,415.5V920H830a90,90,0,0,0,90-90V415.5Zm401.92,402a44.36,44.36,0,0,1-31.47,13H739.16v-.06l-116.38-.17a44.5,44.5,0,0,1,.06-89h.07l53.46.08-152-152.05a44.5,44.5,0,0,1,62.93-62.93L739.38,678.49l.07-53.66A44.5,44.5,0,0,1,784,580.39H784A44.5,44.5,0,0,1,828.45,625l-.22,156.64A44.42,44.42,0,0,1,815.42,817.47Z" fill="#484848"/></svg>
            </div>
          <div className="menu">
            <div className="topLevel" onClick={() => {window.popupMenu("File")}}>File</div>
            <div className="topLevel" onClick={() => {window.popupMenu("Edit")}}>Edit</div>
            <div className="topLevel" onClick={() => {window.popupMenu("Help")}}>Help</div>
          </div>
        </div>
        <div className="window-title">{props.title || ""}</div>
        <div className="window-controls-container">
          <div className="window-icon-bg" onClick={() => { window.thisWindow.minimize() }}>
            <div className="window-icon window-minimize"></div>
          </div>
          <div className="window-icon-bg" onClick={() => { window.thisWindow.maximize() }}>
            <div className="window-icon window-max-restore window-maximize"></div>
          </div>
          <div className="window-icon-bg window-close-bg" onClick={() => { window.thisWindow.close() }}>
            <div className="window-icon window-close"></div>
          </div>
        </div>
      </div>
    );
}

