export function getFormattedSize(size) {
    let absSize = Math.abs(size);
    let outSize = size;
    if (absSize < 1000) {
        // bytes
        outSize = size + " bytes"
    } else if (absSize < 1000 * 1000) {
        // KB
        outSize = (size / 1000).toFixed(1) + "KB"
    } else if (absSize < 1000 * 1000 * 1000) {
        // MB
        outSize = (size / (1000 * 1000)).toFixed(1) + "MB"
    }
    return outSize
}

export function getFormattedPercent(start, end) {
    if (start == 0 || end == 0)
        return "No change"
    if (start == end) {
        return "No change"
    }
    else if (start < end) {
        return ((100 + ((end / start) * 100)).toFixed(0) + "% larger")
    } else {
        return (Math.floor(100 - ((end / start) * 100)) + "% smaller")
    }

}