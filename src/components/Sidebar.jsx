
import React from 'react';
import InputSlider from "./input/InputSlider";
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
                            }} />
                        </div>
                        <div className="col">
                            <label>Max Height</label>
                            <input type="numeric" name="resize.height" onChange={ (e) => {
                                window.GlobalSettings.Quality.resize.height = e.target.value
                            }} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <label>Crop</label>
                            <div className="sublabel">Width and height required</div>
                        </div>
                        <div className="col">
                            <div className="input--toggle" data-for="resizeCrop" tabIndex="0" data-linked="resize.crop">
                                <div></div>
                                <input type="hidden" name="resize.crop" id="resizeCrop" data-linked="resize.crop" />
                            </div>
                        </div>
                    </div>
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
                                }}>
                                    <option value="none">Do not convert</option>
                                    <option value="jpg">JPEG</option>
                                    <option value="png">PNG</option>
                                    <option value="webp">WebP</option>
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

                    
                    <FormattedSlider name="Quality Level" path="app.qualityPreset" min="0" max="3" />



                    <div className="row">
                        <div className="col">
                            <label>Advanced Options</label>
                        </div>
                        <div className="col">
                            <div className="input--toggle" data-for="resizeCrop" tabIndex="0" data-linked="app.advancedQuality"
                                data-action="toggleAdvancedQuality">
                                <div></div>
                                <input type="hidden" name="app.advancedQuality" id="resizeCrop"
                                    data-linked="app.advancedQuality" />
                            </div>
                        </div>
                    </div>

                    
                    <FormattedSlider name="Advanced Options" path="app.advancedQuality" min="0" max="1" />


                    <div className="group quality-advanced">
                        <FormattedSlider name="JPEG Quality" path="jpg.quality" min="0" max="99" />
                        <FormattedSlider name="PNG Min Quality" path="png.qualityMin" min="0" max="99" />
                        <FormattedSlider name="PNG Max Quality" path="png.qualityMax" min="0" max="99" />
                        <FormattedSlider name="WebP Quality" path="webp.quality" min="0" max="99" />
                        <FormattedSlider name="Chroma Subsampling Level" path="jpg.subsampling" min="1" max="3" />
                        <FormattedSlider name="Prefer Original JPEG" path="jpg.useOriginal" min="0" max="1" />
                    </div>


                </div>
            </div>
        </div>
    )
}