import React, { PureComponent } from "react";
import InputToggle from "./input/InputToggle";
import { TwitterPicker } from 'react-color';


export default class SettingsWindow extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      theme: 'system',
      analytics: false,
      threads: "auto",
      updates: true,
      autoThreads: "?",
      backgroundColor: "#FFFFFF"
    }
    this.lastLevels = []
  }

  componentDidMount() {
    window.addEventListener("settingsUpdated", this.recievedSettings)
  }

  settingChanged = (setting, value) => {
    window.sendSettings({[setting]: value})
  }

  // Update settings
  recievedSettings = (e) => {
    const settings = e.detail

    this.setState({
      ...settings
    })
  }



  render() {
    return (
      <div className="window-base">
        <Titlebar title="Crushee Preferences" />
        <div id="page">
          <div className="pageSection">
            <div className="sectionTitle">General</div>

            <div className="row">
              <label>App theme</label>
              <div className="sublabel">You're probably just here to turn on Dark Mode.</div>
              <select value={window.settings.theme} onChange={(e) => {this.settingChanged("theme", event.target.value)}}>
                <option value="system">System Preference (Default)</option>
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
              </select>
            </div>

            <InputToggle
              label="Check for updates"
              description="Look for updates at startup."
              value={this.state.updates}
              onChange={(e, val, elem) => {this.settingChanged("updates", val)}}
            />

            <InputToggle
              label="Collect usage analytics"
              description={(<span>Send usage data to help understand how people are using Crushee. <a onClick={() => { window.openURL("https://crushee.app/privacy-policy.html") }}>More info.</a></span>)}
              value={this.state.analytics}
              onChange={(e, val, elem) => {this.settingChanged("analytics", val)}}
            />

            <div class="color-option">
              <div class="color-block"></div><div class="color-text">


              <label>Default background color</label>
              <div className="sublabel">Color for backgrounds when converting from a transparent image to a JPEG. Also used for thumbnails.</div>

              </div>
              <TwitterPicker
              colors={['#000000', '#888888', '#FFFFFF']}
              triangle={'hide'}
              width={'280px'}
              color={ this.state.backgroundColor }
              onChange={ (color) => {
                this.settingChanged("backgroundColor", color.hex)
              } }
              />
            </div>

          </div>

          <div className="pageSection">
            <div className="sectionTitle">Advanced</div>
            <label>Concurrent files</label>
            <div className="sublabel">How many files can be analyzed/crushed/saved at once. More does not necessarily mean faster. Faster CPUs and SSDs can handle more files at once.</div>
            <select value={this.state.threads} onChange={(e) => {this.settingChanged("threads", event.target.value)}}>
              <option value="auto">Automatic ({ this.state.autoThreads })</option>
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
        <div className="window-icon-bg" onClick={() => { window.setWindowState('minimize') }} style={{ display: "none" }}>
          <div className="window-icon window-minimize"></div>
        </div>
        <div className="window-icon-bg" onClick={() => { window.setWindowState('maximize') }} style={{ display: "none" }}>
          <div className="window-icon window-max-restore window-maximize"></div>
        </div>
        <div className="window-icon-bg window-close-bg" onClick={() => { window.setWindowState('close') }}>
          <div className="window-icon window-close"></div>
        </div>
      </div>
    </div>
  );
}