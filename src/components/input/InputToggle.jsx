// <input onChange={this.startupChanged} checked={window.settings.openAtLogin || false} data-checked={window.settings.openAtLogin || false} type="checkbox" id="theme" />






<div className="row">
    <div className="col">
        <label>Crop</label>
        <div className="sublabel">Width and height required</div>
    </div>
    <div className="col">
        <div className="input--toggle" data-for="resizeCrop" tabIndex="0" data-linked="resize.crop" onClick={ (e) => {
            
        }}>
            <div></div>
            <input type="hidden" name="resize.crop" id="resizeCrop" data-linked="resize.crop" />
        </div>
    </div>
</div>