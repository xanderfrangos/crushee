import React from "react";
import { PureComponent } from "react";
import { Titlebar } from "./Titlebar";
import { Sidebar } from "./Sidebar";
import { Empty } from "./views/Empty";
import { Scanning } from "./views/Scanning";
import FileList from "./views/FileList";
import SingleFile from "./views/SingleFile";
import MoreButton from "./input/MoreButton";
const Utilities = require("../Utilities")

const getTotalFiles = (stats) => {
    const total = stats.processing + stats.analyzed + stats.crushing + stats.done + stats.error
    return `${total} File${(total > 1 ? "s" : "")}`
}

const getTotalFileSize = (inSize = 0, outSize = 0) => {
    return `${Utilities.getFormattedSize(inSize - outSize)}`
}

const getPercentSaved = (inSize = 0, outSize = 0) => {
    return `${Utilities.getFormattedPercent(inSize, outSize)}`
}

const getStatusBar = (stats) => {
    return (<div>{getTotalFiles(stats)} <span className="dot">&middot;</span> Total saved: {getTotalFileSize(stats.inSize, stats.outSize)} <span className="dot">&middot;</span> <b>{getPercentSaved(stats.inSize, stats.outSize)}</b></div>)
}

export default class App extends PureComponent {

    constructor(props) {
        super(props)
        this.state = {
            activeScans: 0,
            comparisonShow: false,
            comparisonBefore: "",
            comparisonAfter: ""
        }
    }

    componentDidMount() {
        window.addEventListener('filesUpdated', () => {
            this.forceUpdate()
        })
        window.addEventListener('scanUpdated', (e) => {
            const count = e.detail.count
            this.setState({
                activeScans: count
            })
        })
        window.addEventListener('previewUpdated', (e) => {
            const detail = e.detail
            this.setState({
                comparisonShow: detail.show,
                comparisonBefore: (detail.before ? detail.before : this.state.comparisonBefore),
                comparisonAfter: (detail.after ? detail.after : this.state.comparisonAfter)
            })
        })
    }

    render() {
        const files = window.files
        const stats = {
            total: 0,
            processing: 0,
            analyzed: 0,
            crushing: 0,
            saving: 0,
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
                case "saving":
                    stats.total++;
                    stats.saving++;
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

        const badgeTotal = stats.processing + stats.crushing + stats.saving
        if(badgeTotal) {
            navigator.setAppBadge(stats.processing + stats.crushing + stats.saving)
        } else {
            navigator.clearAppBadge(stats.processing + stats.crushing + stats.saving)
        }
        
        window.updateTaskbarPercentage()

        if (stats.crushing > 0) {
            window.eventState.crushing = 1
        } else if (stats.crushing === 0 && window.eventState.crushing === 1) {
            window.eventState.crushing = 2
        }

        if (stats.saving > 0) {
            window.eventState.saving = 1
        } else if (stats.saving === 0 && window.eventState.saving === 1) {
            window.eventState.saving = 2
        }

        if (stats.analyzing > 0) {
            window.eventState.analyzing = 1
        } else if (stats.analyzing === 0 && window.eventState.analyzing === 1) {
            window.eventState.analyzing = 2
        }

        return (
            <div id="app-base" data-any={window.stats.total > 0} data-crushed={(window.stats.done > 0 || window.stats.crushing > 0 || window.stats.saving > 0)}>
                <Titlebar />
                <Sidebar />
                <div className="base" id="app">
                    <div className="base--inner" id="base--inner">
                        <SingleFile show={this.state.comparisonShow} before={this.state.comparisonBefore} after={this.state.comparisonAfter} />
                        <FileList data-counts={window.fileCounts} scans={this.state.activeScans} stats={stats} height={(document.getElementById("base--inner") ? document.getElementById("base--inner").clientHeight - 100 : 0)} placeholder={window.processingPlaceholder} />
                        <div className="floating-buttons" id="file-list-actions" data-any={window.stats.total > 0} data-crushed={(window.stats.done > 0 || window.stats.crushing > 0 || window.stats.saving > 0)}>
                            <div className="summary-text">
                                {getStatusBar(stats)}
                                <div className="clear-all" onClick={() => window.clearAllFiles()}>Clear all files</div>
                            </div>
                            <div className="buttons">
                                <div className="button big action--download-all hasMore" data-eventstate={window.eventState.saving}>



                                    <div className="inner" onClick={(e) => {
                                    window.saveAllFiles()
                                }}>
                                        <div className="row primary">
                                            <span className="icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                                    <path id="Path_37" data-name="Path 37" d="M0,0H24V24H0Z" fill="none" />
                                                    <path id="Path_38" data-name="Path 38" d="M17.59,3.59A2.006,2.006,0,0,0,16.17,3H5A2,2,0,0,0,3,5V19a2.006,2.006,0,0,0,2,2H19a2.006,2.006,0,0,0,2-2V7.83a1.966,1.966,0,0,0-.59-1.41L17.59,3.59ZM12,19a3,3,0,1,1,3-3A3,3,0,0,1,12,19ZM13,9H7A2,2,0,0,1,7,5h6a2,2,0,0,1,0,4Z" fill="#fff" />
                                                </svg>

                                            </span>
                                            <span className="text" style={ { marginRight: "-5px" } }>Save All</span>
                                        </div>

                                        <div className="row secondary">
                                            <span className="icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="secondary"><path d="M0 0h24v24H0z" fill="none" /><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                            </span>
                                            <span className="text">Saved!</span>
                                        </div>
                                    </div>

                                    <MoreButton>
                                        <li onClick={ () => window.saveDialog(true) }>Save to folder</li>
                                    </MoreButton>


                                </div>


                                <div className="button big action--clear-all hasMore">
                                    <div className="inner" onClick={(e) => { window.clearAllFiles() }}>
                                        <span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path d="M7 11v2h10v-2H7zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
                                        </span>
                                        <span style={ { marginRight: "-5px" } }>Remove all</span>
                                    </div>
                                    <MoreButton>
                                        <li onClick={ () => window.clearAllFiles("crushed") }>Crushed files</li>
                                        <li onClick={ () => window.clearAllFiles("uncrushed") }>Uncrushed files</li>
                                        <li onClick={ () => window.clearAllFiles("large-files") }>Larger files</li>
                                    </MoreButton>
                                </div>


                                <div className="button big action--add-file hasMore">
                                    <div className="inner" onClick={(e) => {
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
                                    <MoreButton>
                                        <li onClick={ () => window.openDialog(true) }>Add folder(s)</li>
                                    </MoreButton>
                                </div>
                                
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        )
    }
}

