import React from "react";
import { PureComponent } from "react";
import { Titlebar } from "./Titlebar";
import { Sidebar } from "./Sidebar";
import { Empty } from "./views/Empty";
import FileList from "./views/FileList";
import { SingleFile } from "./views/SingleFile";
const Utilities = require("../Utilities")

const getTotalFiles = (stats) => {
    const total = stats.processing + stats.analyzed + stats.crushing + stats.done + stats.error
    return `${total} Files`
}

const getTotalFileSize = (inSize = 0, outSize = 0) => {
    return `${Utilities.getFormattedSize(inSize - outSize)}`
}

const getPercentSaved = (inSize = 0, outSize = 0) => {
    return `${Utilities.getFormattedPercent(inSize, outSize)}`
}

const getStatusBar = (stats) => {
    return (<div>{getTotalFiles(stats)} &middot; Total saved: {getTotalFileSize(stats.inSize, stats.outSize)} &middot; <b>{getPercentSaved(stats.inSize, stats.outSize)}</b></div>)
}

export default class App extends PureComponent {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        window.addEventListener('filesUpdated', () => {
            this.forceUpdate()
        })
    }

    render() {
        const files = window.files
        const stats = {
            total: 0,
            processing: 0,
            analyzed: 0,
            crushing: 0,
            done: 0,
            error: 0,
            inSize: 0,
            outSize: 0
        }
    
        for (let UUID in files) {
            const file = files[UUID]
            switch (file.Status) {
                case "processing":
                    stats.total++;
                    stats.processing++;
                    break;
                case "analyzed":
                    stats.total++;
                    stats.analyzed++;
                    break;
                case "crushing":
                    stats.total++;
                    stats.crushing++;
                    break;
                case "done":
                    stats.total++;
                    stats.done++;
                    stats.inSize += file.In.FileSize;
                    stats.outSize += file.Out.FileSize;
                    break;
                case "error":
                    stats.total++;
                    stats.error++;
                    break;
            }
        }
        window.stats = stats

        return (
            <div id="app-base" data-any={window.stats.total > 0} data-crushed={(window.stats.done > 0)}>
                <Titlebar />
                <Sidebar />
                <div className="base" id="app">
                    <div className="base--inner">
                        <Empty />
                        <FileList data-counts={window.fileCounts} />
                        <SingleFile />
                        <div className="floating-buttons" id="file-list-actions" data-any={window.stats.total > 0} data-crushed={(window.stats.done > 0)}>
                            <div className="text">
                                { getStatusBar(stats) }
                            </div>
                            <div className="buttons">
                                <div className="button big action--download-all" onClick={(e) => {
                                    window.saveAllFiles(stats)
                                }}>
                                    <span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                            <path id="Path_37" data-name="Path 37" d="M0,0H24V24H0Z" fill="none" />
                                            <path id="Path_38" data-name="Path 38" d="M17.59,3.59A2.006,2.006,0,0,0,16.17,3H5A2,2,0,0,0,3,5V19a2.006,2.006,0,0,0,2,2H19a2.006,2.006,0,0,0,2-2V7.83a1.966,1.966,0,0,0-.59-1.41L17.59,3.59ZM12,19a3,3,0,1,1,3-3A3,3,0,0,1,12,19ZM13,9H7A2,2,0,0,1,7,5h6a2,2,0,0,1,0,4Z" fill="#fff" />
                                        </svg>

                                    </span>
                                    <span>Save All</span></div>

                                <div className="button big transparent action--add-file" onClick={(e) => {
                                    window.openDialog(false)
                                }}>
                                    <span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                            <path fill="none" d="M0 0h24v24H0V0z" />
                                            <path
                                                d="M12 7c-.55 0-1 .45-1 1v3H8c-.55 0-1 .45-1 1s.45 1 1 1h3v3c0 .55.45 1 1 1s1-.45 1-1v-3h3c.55 0 1-.45 1-1s-.45-1-1-1h-3V8c0-.55-.45-1-1-1zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                        </svg>
                                    </span>
                                    <span>Add file(s)</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="page--menu-layer">
                        <div className="elem--menu single-file">
                            <div className="elem--menu--inner">
                                <div className="item download">
                                    <span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                            <path fill="none" d="M0 0h24v24H0V0z" />
                                            <path
                                                d="M16.59 9H15V4c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v5H7.41c-.89 0-1.34 1.08-.71 1.71l4.59 4.59c.39.39 1.02.39 1.41 0l4.59-4.59c.63-.63.19-1.71-.7-1.71zM5 19c0 .55.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1 .45-1 1z" />
                                        </svg>
                                    </span>
                                    <span>Save</span>
                                </div>
                                <div className="item recrush">
                                    <span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                            <path
                                                d="M12 5V2.21c0-.45-.54-.67-.85-.35l-3.8 3.79c-.2.2-.2.51 0 .71l3.79 3.79c.32.31.86.09.86-.36V7c3.73 0 6.68 3.42 5.86 7.29-.47 2.27-2.31 4.1-4.57 4.57-3.57.75-6.75-1.7-7.23-5.01-.07-.48-.49-.85-.98-.85-.6 0-1.08.53-1 1.13.62 4.39 4.8 7.64 9.53 6.72 3.12-.61 5.63-3.12 6.24-6.24C20.84 9.48 16.94 5 12 5z" />
                                        </svg>
                                    </span>
                                    <span>Recrush</span>
                                </div>
                                <div className="item remove">
                                    <span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                            <path fill="none" d="M0 0h24v24H0V0z" />
                                            <path
                                                d="M7 12c0 .55.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1zm5-10C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                        </svg>
                                    </span>
                                    <span>Remove</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg"></div>
                    </div>
                </div>
            </div>
        )
    }
}

