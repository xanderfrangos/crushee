import React from 'react';
export const LargeList = () => {
    return (
        <div class="page--files--list">
            <div class="elem--file" data-id="0" data-status="done">
                <div class="inner">

                    <div class="preview">
                        <div class="inner">
                            <div class="overlay">
                                <div class="progress-bar" style="width: 100%;"></div>
                                <div class="compare-hover">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"></path><path d="M10 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5v2h2V1h-2v2zm0 15H5l5-6v6zm9-15h-5v2h5v13l-5-6v9h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path></svg>
                                </div>
                            </div>
                            <img src="d/c50c4820-fe86-11e9-a073-a573cf7af1ae/preview/mozjpeg.preview.jpg" />
                        </div>
                    </div>

                    <div class="details">
                        <div class="title">IMG_20190925_144028-01_2.jpg</div>
                        <div class="subtitle"><span>971.9KB</span><span>&middot;</span><span class="bold">43% smaller</span></div>
                    </div>

                    <div class="actions">
                        <div class="more-button" data-id="0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"></path><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}