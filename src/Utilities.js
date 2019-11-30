export default class Utilities {
    getFormattedSize(size) {
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

getFormattedPercent(start, end) {
    if (start == 0 || end == 0)
        return "0%"
    if (start < end) {
        return ((100 + ((end / start) * 100)).toFixed(0) + "% larger")
    } else {
        return ((100 - ((end / start) * 100)).toFixed(0) + "% smaller")
    }

}
}