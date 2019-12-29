import React from "react";
import { PureComponent } from "react";
import { Empty } from "./Empty";
import { Scanning } from "./Scanning";
const Utilities = require("../../Utilities")

const rightClickFilter = (event) => {
    const file = window.files[event.currentTarget.dataset.uuid]
    if(file.Status === "done" || file.Status === "analyzed") {
        window.rightClickTarget = file.UUID;
        window.popupMenu("RightClickFile", null, null, (file.Status !== "done"))
    }
}

const moreMenuButton = (event) => {
    const file = window.files[event.currentTarget.parentElement.parentElement.parentElement.dataset.uuid]
    console.log(event.currentTarget.parentElement.parentElement.parentElement)
    if(file.Status === "done" || file.Status === "analyzed") {
        window.rightClickTarget = file.UUID;
        window.popupMenu("RightClickFile", null, null, (file.Status !== "done"))
    }
}

const makeFileItemImage = function (file) {
    if (file.In.Format) {
        return (<img src={"file://" + file.Path + "/preview/preview.jpg"} />)
    } else {
        return (<div></div>)
    }
}

const makeFormatTag = (file) => {
    const ext1 = file.In.Extension.substr(1).toUpperCase()
    if(file.Out.Extension && file.Out.Extension != file.In.Extension) {
        const ext2 = file.Out.Extension.substr(1).toUpperCase()
        return (<span className={"format " + ext1 + "-to-" + ext2}>{ext1} &rarr; {ext2}</span>)
    } else {
        return (<span className={"format " + ext1}>{ext1}</span>)
    }
}

const makeFileItemInfoRow = function (file) {
    switch (file.Status) {
        case "done":
            return (<div className="subtitle">{makeFormatTag(file)}<span>{Utilities.getFormattedSize(file.In.FileSize)}</span><span className="dot">&middot;</span><span className="bold">{Utilities.getFormattedPercent(file.In.FileSize, file.Out.FileSize)}</span></div>);
        case "crushing":
            return (<div className="subtitle">{makeFormatTag(file)}<span>{Utilities.getFormattedSize(file.In.FileSize)}</span><span className="dot">&middot;</span><span className="bold">Crushing...</span></div>);
        case "analyzed":
            return (<div className="subtitle">{makeFormatTag(file)}<span>{Utilities.getFormattedSize(file.In.FileSize)}</span><span className="dot">&middot;</span><span className="bold">Ready to crush</span></div>);
        case "error":
            return (<div className="subtitle"><span className="error">File not compatible.</span></div>);
    }
}

export default class FileList extends PureComponent {

    constructor(props) {
        super(props)
    }


    componentDidMount() {
        window.addEventListener('filesUpdated', () => {
            this.forceUpdate()
        })
    }


    makeFileItem = function (file, idx) {
        if (file.Status !== "deleted") {
            return (<div className="elem--file" key={file.UUID} data-uuid={file.UUID} data-status={file.Status} onContextMenu={rightClickFilter} onClick={rightClickFilter}>
                <div className="inner">

                    <div className="preview" onClick={ (e) => { e.preventDefault(); e.stopPropagation(); window.showComparison(file); return false; } }>
                        <div className="inner">
                            <div className="overlay">
                                <div className="progress-bar" style={{ width: "100%" }}></div>
                                <div className="compare-hover">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"></path><path d="M10 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5v2h2V1h-2v2zm0 15H5l5-6v6zm9-15h-5v2h5v13l-5-6v9h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path></svg>
                                </div>
                            </div>
                            {makeFileItemImage(file)}
                        </div>
                    </div>

                    <div className="details">
                        <div className="title">{file.In.FileName + file.In.Extension}</div>
                        {makeFileItemInfoRow(file)}
                    </div>

                </div>
            </div>)
        }

    }

    render() {
        if(this.props.scans > 0) {
            return (<Scanning title="Scanning..." description={`${this.props.scans} folders`} />)
        } else {
            if (this.props.stats.processing > 0) {
                return (<Scanning title="Analyzing..." description={`${this.props.stats.processing} files`} />)
            } else if(this.props.stats.crushing > 0) {
                return (<Scanning title="Crushing..." description={ `${this.props.stats.crushing} files` } />)
            }  else if(this.props.stats.saving > 0) {
                return (<Scanning title="Saving..." description={ `${this.props.stats.saving} files` } />)
            } else {
                if (window.fileCounts.total > 0) {
                    return (
                        <div className="page page--files show">
                            <div className="page--files--list">
                                {Object.values(window.files).slice(0).reverse().map(this.makeFileItem)}
                            </div>
                        </div>
                    )
                }
                else {
                    return (<Empty />)
                }
            }
            
        }

    }

}