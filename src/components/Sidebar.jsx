import React from 'react';
import InputToggle from "./input/InputToggle";
import { FormattedSlider } from "./input/FormattedSlider";
export const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="inner">
                <div className="sidebar--section">
                    <div className="row center">
                        <div className="col">
                            <div className="sidebar--header">Resize</div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label>Max Width</label>
                            <input type="numeric" name="resize.width" onChange={(e) => {
                                window.GlobalSettings.Quality.resize.width = e.target.value
                                window.changeEventState("crushing", 0, false)
                                window.changeEventState("saving", 0, false)
                                window.sendUpdate()
                            }} />
                        </div>
                        <div className="col">
                            <label>Max Height</label>
                            <input type="numeric" name="resize.height" onChange={(e) => {
                                window.GlobalSettings.Quality.resize.height = e.target.value
                                window.changeEventState("crushing", 0, false)
                                window.changeEventState("saving", 0, false)
                                window.sendUpdate()
                            }} />
                        </div>
                    </div>
                    <InputToggle
                        label="Crop"
                        description="Width and height required"
                        path="resize.crop"
                        value={window.GlobalSettings.Quality.resize.crop}
                    />
                </div>
                <div className="sidebar--section">
                    <div className="row center">
                        <div className="col">
                            <div className="sidebar--header">Convert</div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label>Convert to</label>
                        </div>
                        <div className="col">
                            <div className="input--dropdown" data-for="resizeCrop" tabIndex="0" data-linked="webp.make">
                                <select onChange={(e) => {
                                    window.GlobalSettings.Quality.app.convert = e.target.value
                                    window.changeEventState("crushing", 0, false)
                                    window.changeEventState("saving", 0, false)
                                    window.sendUpdate()
                                }}>
                                    <option value="none">Do not convert</option>
                                    <option value="jpg">JPEG</option>
                                    <option value="png">PNG</option>
                                    <option value="webp">WebP</option>
                                    <option value="avif">AVIF</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="sidebar--section">
                    <div className="row center">
                        <div className="col">
                            <div className="sidebar--header">Quality</div>
                        </div>
                    </div>


                    <FormattedSlider
                        name="Quality Level"
                        path="app.qualityPreset"
                        min="0"
                        max="3"
                        description="Use this if you don't want to fiddle with the options below."
                        onChange={window.changeQualityLevel}
                    />




                    <div className="row center">
                        <div className="col">
                            <div className="sidebar--header">JPEG Options</div>
                        </div>
                    </div>
                    <FormattedSlider name="JPEG Quality" path="jpg.quality" min="0" max="99" />
                    <FormattedSlider
                        name="Chroma Subsampling Level"
                        description="Sacrifice color accuracy for smaller files."
                        path="jpg.subsampling"
                        min="1"
                        max="3"
                    />
                    <InputToggle
                        label="High Quality Mode"
                        description="Prioritize quality over smaller file sizes."
                        path="jpg.useOriginal"
                        value={window.GlobalSettings.Quality.jpg.useOriginal}
                    />


                    <div className="row center">
                        <div className="col">
                            <div className="sidebar--header">PNG Options</div>
                        </div>
                    </div>
                    <FormattedSlider name="PNG Min Quality" path="png.qualityMin" min="0" max="99" />
                    <FormattedSlider name="PNG Max Quality" path="png.qualityMax" min="0" max="99" />

                    <div className="row center">
                        <div className="col">
                            <div className="sidebar--header">Other Options</div>
                        </div>
                    </div>
                    <FormattedSlider name="AVIF Quality" path="avif.quality" min="1" max="100" />
                    <FormattedSlider name="WebP Quality" path="webp.quality" min="0" max="99" />
                    <FormattedSlider name="GIF Colors" path="gif.colors" min="2" max="256" />
                    <FormattedSlider name="GIF Quality" path="gif.quality" min="1" max="100" />




                </div>
            </div>
            <div className="bottom">
                <div className="description">All files will use the above settings.</div>
                <div className="button primary" data-eventstate={window.eventState.crushing} onClick={(e) => {
                    window.recrushAll();
                }}>

                    <div className="inner">
                        <div className="row primary">
                            <span className="icon" style={ { marginLeft: "-8px" } }>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path id="Path_54" data-name="Path 54" d="M0,0H24V24H0Z" fill="none" />
                                    <path id="Path_55" data-name="Path 55" d="M11,6v4.59H8.71a.5.5,0,0,0-.35.85l3.29,3.29a.5.5,0,0,0,.71,0l3.29-3.29a.5.5,0,0,0-.35-.85H13V6a1,1,0,0,0-2,0ZM7.1,14a.99.99,0,0,0-.99,1.15,6,6,0,0,0,11.78,0A.99.99,0,0,0,16.9,14a1,1,0,0,0-.98.83,4,4,0,0,1-7.83,0A1.016,1.016,0,0,0,7.1,14Z" fill="#fff" />
                                </svg>
                            </span>
                            <span className="text">Crush All</span>
                        </div>

                        <div className="row secondary">
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="secondary"><path d="M0 0h24v24H0z" fill="none" /><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                            </span>
                            <span className="text">Crushed!</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}