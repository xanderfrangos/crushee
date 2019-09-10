
import React from 'react';
export const Sidebar = () => {
    return (
        <div class="sidebar">
            <div class="inner">
                <div class="sidebar--section">
                    <div class="row center">
                        <div class="col">
                            <div class="sidebar--header">Resize</div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <label>Width</label>
                            <input type="numeric" name="resize.width" />>
                    </div>
                        <div class="col">
                            <label>Height</label>
                            <input type="numeric" name="resize.height" />>
                    </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <label>Crop</label>
                            <div class="sublabel">Width and height required</div>
                        </div>
                        <div class="col">
                            <div class="input--toggle" data-for="resizeCrop" tabindex="0" data-linked="resize.crop">
                                <div></div>
                                <input type="hidden" name="resize.crop" id="resizeCrop" data-linked="resize.crop" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="sidebar--section">
                    <div class="row center">
                        <div class="col">
                            <div class="sidebar--header">Convert</div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <label>Convert to WebP</label>
                        </div>
                        <div class="col">
                            <div class="input--toggle" data-for="resizeCrop" tabindex="0" data-linked="webp.make">
                                <div></div>
                                <input type="hidden" name="webp.make" id="resizeCrop" data-linked="webp.make" />
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <label>Convert to JPEG</label>
                        </div>
                        <div class="col">
                            <div class="input--toggle" data-for="resizeCrop" tabindex="0" data-linked="jpg.make">
                                <div></div>
                                <input type="hidden" name="jpg.make" id="resizeCrop" data-linked="jpg.make" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="sidebar--section">
                    <div class="row center">
                        <div class="col">
                            <div class="sidebar--header">Quality</div>
                        </div>
                    </div>


                    <div class="group quality-basic">
                        <div class="row">
                            <div class="col flex-1">
                                <label>Quality Level</label>
                                <div class="input--range">
                                    <input type="range" min="0" max="3" name="app.qualityPreset" class="range"
                                        data-linked="app.qualityPreset" data-action="changePreset" />
                                    <input type="number" min="0" max="3" name="app.qualityPreset" class="val"
                                        data-linked="app.qualityPreset" data-action="changePreset" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col">
                            <label>Advanced Options</label>
                        </div>
                        <div class="col">
                            <div class="input--toggle" data-for="resizeCrop" tabindex="0" data-linked="app.advancedQuality"
                                data-action="toggleAdvancedQuality">
                                <div></div>
                                <input type="hidden" name="app.advancedQuality" id="resizeCrop"
                                    data-linked="app.advancedQuality" />
                            </div>
                        </div>
                    </div>


                    <div class="group quality-advanced">
                        <div class="row">
                            <div class="col flex-1">
                                <label>JPEG Quality</label>
                                <div class="input--range">
                                    <input type="range" min="1" max="99" name="jpg.quality" class="range"
                                        data-linked="jpg.quality" />
                                    <input type="number" min="1" max="99" name="jpg.quality" class="val"
                                        data-linked="jpg.quality" />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col flex-1">
                                <label>PNG Min Quality</label>
                                <div class="input--range">
                                    <input type="range" min="1" max="99" name="png.qualityMin" class="range"
                                        data-linked="png.qualityMin" />
                                    <input type="number" min="1" max="99" name="png.qualityMin" class="val"
                                        data-linked="png.qualityMin" />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col flex-1">
                                <label>PNG Max Quality</label>
                                <div class="input--range">
                                    <input type="range" min="1" max="99" name="png.qualityMax" class="range"
                                        data-linked="png.qualityMax" />
                                    <input type="number" min="1" max="99" name="png.qualityMax" class="val"
                                        data-linked="png.qualityMax" />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col flex-1">
                                <label>WebP Quality</label>
                                <div class="input--range">
                                    <input type="range" min="1" max="99" name="webp.quality" class="range"
                                        data-linked="webp.quality" />
                                    <input type="number" min="1" max="99" name="webp.quality" class="val"
                                        data-linked="webp.quality" />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col flex-1">
                                <label>Chroma Subsampling Level</label>
                                <div class="sublabel">Increase chrome subsampling to reduce file size.</div>
                                <div class="input--range">
                                    <input type="range" min="1" max="3" name="jpg.subsampling" class="range"
                                        data-linked="jpg.subsampling" />
                                    <input type="number" min="1" max="3" name="jpg.subsampling" class="val"
                                        data-linked="jpg.subsampling" />
                                </div>
                            </div>

                        </div>
                        <div class="row">
                            <div class="col">
                                <label>Prefer Original JPEG</label>
                                <div class="sublabel">If possible, do not resave JPEG. Increases file size.</div>
                            </div>
                            <div class="col">
                                <div class="input--toggle" data-for="resizeCrop" tabindex="0" data-linked="jpg.useOriginal">
                                    <div></div>
                                    <input type="hidden" name="jpg.useOriginal" id="resizeCrop" data-linked="jpg.useOriginal" />
                                </div>
                            </div>
                        </div>
                    </div>









                    <div class="sidebar--section">
                        <div class="row center">
                            <div class="col">
                                <div class="sidebar--header">App</div>
                            </div>
                        </div>
                        <div class="row app-only">
                            <div class="col">
                                <label>Overwrite Originals</label>
                                <div class="sublabel">Automatically replace local files when saving.</div>
                            </div>
                            <div class="col">
                                <div class="input--toggle" data-for="resizeCrop" tabindex="0" data-linked="app.overwrite">
                                    <div></div>
                                    <input type="hidden" name="app.overwrite" id="resizeCrop" data-linked="app.overwrite" />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <label>Dark Mode</label>
                                <div class="sublabel">Dark as the night.</div>
                            </div>
                            <div class="col">
                                <div class="input--toggle" data-for="resizeCrop" tabindex="0" data-action="toggleDarkMode"
                                    data-linked="app.darkMode">
                                    <div></div>
                                    <input type="hidden" name="app.darkMode" id="resizeCrop" data-linked="app.darkMode" />
                                </div>
                            </div>
                        </div>

                    </div>
                    <div class="sidebar--section">
                        <div class="row center not-app-only">
                            <div class="col">
                                <div class="action--reset-settings button primary">Reset Settings</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}