
import React from 'react';
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
                            <input type="numeric" name="resize.width" />
                    </div>
                        <div className="col">
                            <label>Max Height</label>
                            <input type="numeric" name="resize.height" />
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
                                <select>
                                    <option>Do not convert</option>
                                    <option>JPEG</option>
                                    <option>PNG</option>
                                    <option>WebP</option>
                                    <option>GIF</option>
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


                    <div className="group quality-basic">
                        <div className="row">
                            <div className="col flex-1">
                                <label>Quality Level</label>
                                <div className="input--range">
                                    <input type="range" min="0" max="3" name="app.qualityPreset" className="range"
                                        data-linked="app.qualityPreset" data-action="changePreset" />
                                    <input type="number" min="0" max="3" name="app.qualityPreset" className="val"
                                        data-linked="app.qualityPreset" data-action="changePreset" />
                                </div>
                            </div>
                        </div>
                    </div>

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


                    <div className="group quality-advanced">
                        <div className="row">
                            <div className="col flex-1">
                                <label>JPEG Quality</label>
                                <div className="input--range">
                                    <input type="range" min="1" max="99" name="jpg.quality" className="range"
                                        data-linked="jpg.quality" />
                                    <input type="number" min="1" max="99" name="jpg.quality" className="val"
                                        data-linked="jpg.quality" />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col flex-1">
                                <label>PNG Min Quality</label>
                                <div className="input--range">
                                    <input type="range" min="1" max="99" name="png.qualityMin" className="range"
                                        data-linked="png.qualityMin" />
                                    <input type="number" min="1" max="99" name="png.qualityMin" className="val"
                                        data-linked="png.qualityMin" />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col flex-1">
                                <label>PNG Max Quality</label>
                                <div className="input--range">
                                    <input type="range" min="1" max="99" name="png.qualityMax" className="range"
                                        data-linked="png.qualityMax" />
                                    <input type="number" min="1" max="99" name="png.qualityMax" className="val"
                                        data-linked="png.qualityMax" />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col flex-1">
                                <label>WebP Quality</label>
                                <div className="input--range">
                                    <input type="range" min="1" max="99" name="webp.quality" className="range"
                                        data-linked="webp.quality" />
                                    <input type="number" min="1" max="99" name="webp.quality" className="val"
                                        data-linked="webp.quality" />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col flex-1">
                                <label>Chroma Subsampling Level</label>
                                <div className="sublabel">Increase chrome subsampling to reduce file size.</div>
                                <div className="input--range">
                                    <input type="range" min="1" max="3" name="jpg.subsampling" className="range"
                                        data-linked="jpg.subsampling" />
                                    <input type="number" min="1" max="3" name="jpg.subsampling" className="val"
                                        data-linked="jpg.subsampling" />
                                </div>
                            </div>

                        </div>
                        <div className="row">
                            <div className="col">
                                <label>Prefer Original JPEG</label>
                                <div className="sublabel">If possible, do not resave JPEG. Increases file size.</div>
                            </div>
                            <div className="col">
                                <div className="input--toggle" data-for="resizeCrop" tabIndex="0" data-linked="jpg.useOriginal">
                                    <div></div>
                                    <input type="hidden" name="jpg.useOriginal" id="resizeCrop" data-linked="jpg.useOriginal" />
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    )
}