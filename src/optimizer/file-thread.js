const sharp = require("sharp")

const slash = require('slash');

const imagemin = require('imagemin');
const imageminGIFSicle = require('@xanderfrangos/imagemin-gifsicle');
const imageminJPEGRecompress = require('imagemin-jpeg-recompress');
const imageminMozJPEG = require('imagemin-mozjpeg');
const imageminSVGO = require('imagemin-svgo');
const imageminAdvpng = require('imagemin-advpng');
const imageminPngquant = require('imagemin-pngquant');

const fs = require("fs")
const path = require("path")

const consoleLog = console.log
//console.log = () => {}

// Default image settings
let imgSettings = {
    resize: {
        width: "",
        height: "",
        crop: false
    },
    jpg: {
        quality: 95,
        subsampling: 1,
        useOriginal: false
    },
    png: {
        qualityMin: 50,
        qualityMax: 99
    },
    webp: {
        quality: 80,
        alphaQuality: 100,
        make: false,
        only: false
    },
    gif: {
        colors: 128,
        quality: 95
    },
    heif: {
        quality: 95,
        compression: "hevc",
        lossless: false,
        speed: 5,
        chromaSubsampling: "4:2:0"
    },
    avif: {
        quality: 95,
        lossless: false,
        speed: 5,
        chromaSubsampling: "4:2:0"
    }
}



parseBool = (value) => {
    const str = String(value)
    return (str.toLowerCase() === "true" || str.toLowerCase() === "yes" || str.toLowerCase() === "1" || value === 1 || value === true ? true : false)
}


/*
//
//
//   IMAGE PROCESSING
//
//
*/

var debug = false;
//
//   Manipulate images
//
async function processImage(file, outFolder, options = {}, quality = 100) {

    // Merge and santize options
    let settings = Object.assign(imgSettings, options)
    settings.resize.width = (parseInt(settings.resize.width) > 5400 ? 5400 : settings.resize.width)
    settings.resize.height = (parseInt(settings.resize.height) > 5400 ? 5400 : settings.resize.height)

    let ext = path.extname(file).toLowerCase()

    try {
        let image = sharp(file, {
            density: 300
        })

        let metadata = await image.metadata()

        // Fix AVIF being detected as HEIF
        if(metadata.format === "heif" && ext === ".avif") {
            metadata.format = "avif"
        }

        sendGenericMessage("Detected format:" + metadata.format)
        sendGenericMessage("Requested output:" + (settings.app.convert === "none" || !settings.app.convert ? metadata.format : settings.app.convert))

        if (parseBool(settings.jpg.make) === false && parseBool(settings.webp.make) === false) {
            switch (metadata.format) {
                case "jpeg":
                    ext = ".jpg"
                    break
                default:
                    ext = "." + metadata.format
                    break;
            }
        }
        
        // Fix orientation from EXIF data, if available
        image.rotate()

        let resized = false
        if (settings.resize.width || settings.resize.height) {
            resized = true

            let width = (settings.resize.width && parseInt(settings.resize.width) > 0 ? parseInt(settings.resize.width) : null)
            let height = (settings.resize.height && parseInt(settings.resize.height) > 0 ? parseInt(settings.resize.height) : null)

            // Check if percentages
            if(settings.resize.width && parseInt(settings.resize.width) != 0 && settings.resize.width.substr(-1) === "%") {
                width = Math.ceil(metadata.width * (parseInt(settings.resize.width) / 100))
            }
            if(settings.resize.height && parseInt(settings.resize.height) != 0 && settings.resize.height.substr(-1) === "%") {
                height = Math.ceil(metadata.height * (parseInt(settings.resize.height) / 100))
            }

            image.resize(
                width,
                height,
                { fit: (parseBool(settings.resize.crop) === true ? "cover" : "inside") }
            )
        }

        if (settings.app.convert === "jpg" || settings.app.convert === "png" || settings.app.convert === "webp" || settings.app.convert === "heif" || settings.app.convert === "avif") {
            ext = "." + settings.app.convert
        }

        if (ext === ".jpg" || ext === ".jpeg") {
            ext = ".jpg" // Force .jpg because it's objectively correct
            image.flatten({
                background: { r: 255, g: 255, b: 255 }
            })

            image.jpeg({
                quality: 100,
                chromaSubsampling: '4:4:4'
            })

        } else if (ext === ".png") {
            image.png()
        } else if (ext === ".gif" || ext === ".svg") {
            return file
        } else if (ext === ".webp") {
            image.webp({
                quality: parseInt(settings.webp.quality)
            })
        } else if (ext === ".avif") {
            let avif = {
                quality: parseInt(settings.avif.quality),
                speed: 0
            }
            if(settings.avif.subsampling) {
                switch(parseInt(settings.avif.subsampling)) {
                    case 1: avif.chromaSubsampling = '4:4:4'; break;
                    case 2: avif.chromaSubsampling = '4:2:2'; break;
                    case 3: avif.chromaSubsampling = '4:2:0'; break;
                }
            }
            if(avif.quality === 100) {
                avif.lossless = true
            }
            image.avif(avif)
        } else {
            return false
        }

        const outPath = outFolder + "manipulated" + ext
        let promise = image.toFile(outPath)
            .then(() => {
                return outPath
            }).catch((e) => {
                return false
            })
        return promise
    } catch (e) {
        consoleLog(e)
    }

}

//
//    Compress images after manipulation
//
async function compressFile(file, outFolder, options = {}, jpgEngineName = "jpegRecompress") {
    const settings = Object.assign(imgSettings, options)

    const inExt = path.extname(file).toLowerCase()

    // Abort unsupported file types
    // ...mostly webp
    if (!(inExt == ".png" || inExt == ".jpg" || inExt == ".jpeg" || inExt == ".svg" || inExt == ".gif"))
        return file

    let jpgPlugin = imageminMozJPEG({ quality: settings.jpg.quality })

    if (jpgEngineName == "mozjpeg") {

        let sample = ["1x1"]
        if (settings.jpg.subsampling == 2) {
            sample = ["2x2"]
        } else if (settings.jpg.subsampling == 3) {
            sample = ["3x3"]
        }

        sendGenericMessage("Subsampling at " + sample)

        jpgPlugin = imageminMozJPEG({
            quality: 31 + (settings.jpg.quality / 1.5),
            sample,
            progressive: true,
            tune: "hvs-psnr"
        })

    } else {
        const quality = parseInt(settings.jpg.quality)
        const min = quality * Math.pow(0.95, (100 - quality) * 1.5)
        const method = (parseInt(settings.jpg.subsampling) <= 1 ? "ssim" : "smallfry")
        if (parseInt(settings.jpg.subsampling) <= 1) {
            jpgPlugin = imageminJPEGRecompress({
                quality: "high",
                method,
                min,
                subsample: "disable"
            })
        } else {
            jpgPlugin = imageminJPEGRecompress({
                quality: "high",
                method,
                min
            })
        }
    }

    if (settings.png.qualityMin > settings.png.qualityMax)
        settings.png.qualityMax = settings.png.qualityMin;

    return new Promise((resolve, reject) => {
        imagemin([slash(file)], {
            destination: slash(outFolder),
            plugins: [
                jpgPlugin,
                imageminGIFSicle({
                    optimizationLevel: 3,
                    colors: settings.gif.colors,
                    lossy: (settings.gif.quality - 100) * -2,
                }),
                imageminSVGO(),
                imageminPngquant({
                    quality: [parseInt(settings.png.qualityMin) * 0.01, parseInt(settings.png.qualityMax) * 0.01],
                    strip: true,
                    speed: 3
                }),
                imageminAdvpng({
                    number: 4,
                    iterations: 2
                })
            ]
        }).then((a) => {
            if (a.length === 0) {
                resolve(false)
            } else {
                resolve(a[0].destinationPath)
            }
        }).catch((e) => {
            // Compression didn't go so well
            consoleLog(e)
            resolve(false)
        })
    })
}


//
//   Builds thumbnail previews
//
async function makePreview(file, outFolder) {
    const outPath = path.join(outFolder, "preview.jpg")
    try {
        let image = sharp(file)
        const metadata = await image.metadata()
        let stats = fs.statSync(file)
        image.rotate() // Fix orientation from EXIF data, if available
        image.resize(200, 200, { fit: "cover" })
        image.flatten({
            background: { r: 255, g: 255, b: 255 }
        })
        image.jpeg({
            quality: 75,
            chromaSubsampling: '4:2:0',
            trellisQuantisation: true
        })
        let promise = image.toFile(outPath)
            .then(() => {
                // Preview made!
                return {
                    Format: metadata.format,
                    FileSize: stats["size"],
                    X: metadata.width,
                    Y: metadata.height
                }
            }).catch((e) => {
                // Preview failed to write
                console.log(e)
                return false
            })
        return promise
    } catch (e) {
        // Preview super failed
        return false
    }
}

//
//   Process queued image
//
async function job(uuid, fn, f, o, options = {}, mode = "compress") {

    let original = f
    let uuidDir = o + uuid + "/"

    if (mode === "preview") {
        sendGenericMessage("Making previews...")
        // Make thumbnails
        fs.mkdirSync(slash(uuidDir + "preview/"), { recursive: true })
        try {
            return await makePreview(f, uuidDir + "preview/")
        } catch (e) {
            sendGenericMessage("ERROR: Creating preview failed. " + e)
            process.send({
                type: 'failed',
                uuid,
                threadNum
            })
            return false;
        }
    } else {
        const quality = parseInt(options.jpg.quality)
        // Process with sharp
        sendGenericMessage("Processing...")
        let resized = await processImage(f, uuidDir, options)
        if (!resized) {
            consoleLog("Failed processing! Returning original file :(")
            resized = f;
        }

        // Determine if the original file is OK to use as-is. Must have been a JPEG and hasn't been resized.
        let canUseOriginalImage = (path.extname(resized) == path.extname(f) && path.extname(resized) == ".jpg" && !(options.resize.width || options.resize.height) ? true : false)

        // Use original file if wanted/able.
        if (canUseOriginalImage) {
            //sendGenericMessage("Original JPEG image can be used.")
        } else {

        }

        const results = {}

        if (!(options.resize.width || options.resize.height)) {
            results["original"] = original
        }

        // Use MozJPEG to adjust overall quality
        // We'll use this on JPEGs that have been processed by sharp
        let mozJPEG
        if (path.extname(resized) == ".jpg" && quality < 95) {
            sendGenericMessage("MozJPEG compressing...")
            mozJPEG = compressFile(resized, path.join(uuidDir, "moz"), options, "mozjpeg").then(result => {
                if (result) {
                    results["mozJPEG"] = result
                }
            })
        }

        let mozOriginal
        if (path.extname(resized) == ".jpg" && canUseOriginalImage && quality < 95) {
            sendGenericMessage("MozJPEG compressing original...")
            mozOriginal = compressFile(f, path.join(uuidDir, "mozO"), options, "mozjpeg").then(result => {
                if (result) {
                    results["mozOriginal"] = result
                }
            })
        }

        // Compress processed file
        sendGenericMessage("Compressing...")

        // Use original if possible, else resized
        let compressed = compressFile(resized, path.join(uuidDir, "compressed"), options).then(result => {
            if (result) {
                results["compressed"] = result
            }
        })

        // Compress original, if possible
        if (canUseOriginalImage) {
            compressedOriginal = compressFile(f, path.join(uuidDir, "compressedOriginal"), options).then(result => {
                if (result) {
                    results["compressedOriginal"] = result
                }
            })
        }


        let mozCompressed
        if (await mozJPEG && quality < 95 && !(canUseOriginalImage && options.jpg.useOriginal === true)) {
            // Compress processed file
            sendGenericMessage("Compressing mozJPEG...")

            // Use original if possible, else resized
            let optionsCopy = Object.assign(options, {})
            optionsCopy.jpg.subsampling = 3
            mozCompressed = compressFile(await mozJPEG, path.join(uuidDir, "mozCompressed"), options).then(result => {
                if (result) {
                    results["mozCompressed"] = result
                }
            })
        }

        mozJPEG = await mozJPEG
        compressed = await compressed
        compressedOriginal = await compressedOriginal
        mozCompressed = await mozCompressed

        const smallest = {
            name: "original",
            size: (canUseOriginalImage ? fs.statSync(f).size : -1)
        }
        consoleLog("===== RESULTS =====")
        for (let result in results) {
            let size = fs.statSync(results[result]).size
            consoleLog(`\x1b[36m${result}:\x1b[0m ${size / 1000}kb`)
            if (result != "original" && size > 0 && (size < smallest.size || smallest.size == -1)) {
                smallest.name = result
                smallest.size = size
            }
        }
        consoleLog("===================")
        consoleLog(`\x1b[36mSmallest size is\x1b[0m ${smallest.name} \x1b[36mat\x1b[0m ${smallest.size / 1000} kb\x1b[36m!\x1b[0m`)
        consoleLog("===================")

        // Collect sizes to send back
        let finalSize = smallest.size

        sendGenericMessage("Preparing final file...")
        // Copy finished file to final location
        if(!fs.existsSync(uuidDir + "crushed/")) {
            fs.mkdirSync(uuidDir + "crushed/")
        }
        
        let finalFile = uuidDir + "crushed/" + path.basename(fn, path.extname(fn)) + path.extname(resized)

        if(fs.existsSync(finalFile)) {
            fs.unlinkSync(finalFile)
        }

        fs.copyFileSync(results[smallest.name], finalFile)



        sendGenericMessage("Writing timestamp...")
        // Write timestamp for cleanup
        fs.writeFileSync(uuidDir + "ts", Date.now())

        sendGenericMessage("Clearing temp files...")

        // Build and send results
        const metadata = await sharp(finalFile).metadata()
        const result = {
            Crushed: path.basename(finalFile),
            Extension: path.extname(path.basename(finalFile)),
            FileSize: finalSize,
            X: metadata.width,
            Y: metadata.height
        }

        sendGenericMessage("Done!")
        // Congrats, job well done!
        return result
    }





}




/*
//
//
//   QUEUE/JOB MANAGEMENT
//
//
*/

let processQueue = []
let processBusy = false
let threadNum = -1
let shouldDie = false
process.on('message', (data) => {
    if (data.type == "job") {
        processQueue.push(data)
        sendGenericMessage(`Recieved job ${data.uuid} | Current queue: ${processQueue.length}`)
        sendQueueUpdate()
        checkCanDoJob()
    } else if (data.type == 'setThreadNum') {
        threadNum = data.result
        sendGenericMessage("Thread ready!")
    } else if (data.type == 'quit') {
        sendGenericMessage("Shutting down...")
        process.exit(0)
    } else if(data.type == 'softKill') {
        shouldDie = true
    }
})

// Send queue updates after events and every so often
setInterval(sendQueueUpdate, 1000)
function sendQueueUpdate() {
    process.send({
        type: 'queueLength',
        result: processQueue.length,
        threadNum: threadNum
    })
}

function sendGenericMessage(message) {
    process.send({
        type: 'generic',
        message: message,
        threadNum: threadNum
    })
}

// Try to run a job, if able
setInterval(checkCanDoJob, 100)
async function checkCanDoJob() {
    if (processBusy == false) {

        if(shouldDie) {
            process.exit(0)
            return false;
        }

        if (processQueue.length === 0) {
            // No jobs, request another

            process.send({
                type: 'jobRequest',
                threadNum: threadNum
            })

        } else {
            processBusy = true
            let data = processQueue[0]
            job(...data.payload).then((result) => {

                // Send response that the job was finished
                process.send({
                    type: 'finished',
                    result: result,
                    uuid: data.uuid,
                    threadNum: threadNum
                })

                // Remove old job and make not busy
                processQueue.splice(0, 1)
                processBusy = false

                sendGenericMessage(`Finished job ${data.uuid} | Current queue: ${processQueue.length}`)

                // Finished job, start another
                checkCanDoJob()

            }).catch((e) => {


                // Something went wrong :(
                // Tell someone
                sendGenericMessage(e)
                process.send(false)
                process.send({
                    type: 'finished',
                    result: false,
                    uuid: processQueue[0].uuid,
                    threadNum: threadNum
                })

                // Remove old, errored-out job
                processQueue.splice(0, 1)
                processBusy = false

                // Try next job
                checkCanDoJob()
            })
        }

    }
}


setInterval(sendStillAliveMessage, 1000)

function sendStillAliveMessage() {
    process.send({
        type: 'alive',
        message: "Thread active",
        threadNum: threadNum
    })
}





var deleteFolderRecursive = function (path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};