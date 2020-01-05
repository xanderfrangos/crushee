import React, { PureComponent } from "react";
import InputToggle from "./input/InputToggle";


export default class SettingsWindow extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      theme: 'system',
      analytics: false,
      threads: "auto",
      updates: true
    }
    this.lastLevels = []
  }

  componentDidMount() {
    window.addEventListener("settingsUpdated", this.recievedSettings)
  }


  themeChanged = (event) => {
    this.setState({ theme: event.target.value })
    window.sendSettings({ theme: event.target.value })
  }

  startupChanged = (event) => {
    const openAtLogin = (this.state.openAtLogin ? false : true)
    this.setState({ openAtLogin })
    window.sendSettings({ openAtLogin })
  }


  // Update settings
  recievedSettings = (e) => {
    const settings = e.detail

    this.setState({

    }, () => {
      this.forceUpdate()
    })
  }



  render() {
    return (
      <div className="window-base" data-theme={window.settings.theme || "default"}>
        <Titlebar title="Crushee Preferences" />
        <div id="page">
          <div className="pageSection">
            <div className="sectionTitle">General</div>

            <div className="row">
              <label>App theme</label>
              <div className="sublabel">You're probably just here to turn on Dark Mode.</div>
              <select value={window.settings.theme} onChange={this.themeChanged}>
                <option value="system">System Preference (Default)</option>
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
              </select>
            </div>

            <InputToggle
              label="Check for updates"
              description="Look for updates at startup"
              path="app.CheckForUpdates"
              value={window.GlobalSettings.Quality.app.CheckForUpdates}
            />

            <InputToggle
              label="Collect usage analytics"
              description="Send usage data to help me understand how people are using Crushee"
              path="app.Analytics"
              value={window.GlobalSettings.Quality.app.Analytics}
            />

          </div>



          <div className="pageSection">
            <div className="sectionTitle">Advanced</div>

            <label>Concurrent files</label>
            <div className="sublabel">How many files can be analyzed/crushed/saved at once. Changing this probably won't do you much good, except under very specific circumstances.</div>
            <select value={this.state.updateInterval} onChange={this.updateIntervalChanged}>
              <option value="auto">Automatic</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
            </select>
          </div>

        </div>
      </div>

    );
  }
}




const Titlebar = (props) => {
  return (
    <div className="window-titlebar">
      <div className="titlebar-drag-region"></div>
      <div className="window-title">{props.title || ""}</div>
      <div className="window-controls-container">
        <div className="window-icon-bg" onClick={() => { window.thisWindow.minimize() }} style={{ display: "none" }}>
          <div className="window-icon window-minimize"></div>
        </div>
        <div className="window-icon-bg" onClick={() => { window.thisWindow.maximize() }} style={{ display: "none" }}>
          <div className="window-icon window-max-restore window-maximize"></div>
        </div>
        <div className="window-icon-bg window-close-bg" onClick={() => { window.thisWindow.close() }}>
          <div className="window-icon window-close"></div>
        </div>
      </div>
    </div>
  );
}