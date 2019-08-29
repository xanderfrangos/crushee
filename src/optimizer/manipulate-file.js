const sharp = require("sharp")

const slash = require('slash');

const appDataPath = require('appdata-path')

const imagemin = require('imagemin');
const imageminGIFSicle = require('imagemin-gifsicle');
const imageminJPEGRecompress = require('imagemin-jpeg-recompress');
const imageminMozJPEG = require('imagemin-mozjpeg');
const imageminSVGO = require('imagemin-svgo');
const imageminAdvpng = require('imagemin-advpng');
const imageminPngquant = require('imagemin-pngquant');


const fs = require("fs")
const path = require("path")
const uuidv1 = require('uuid/v1')
const del = require('del')

const basePath = appDataPath("crushee-desktop")

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
    gif: {
        colors: 128
    },
    webp: {
        quality: 80,
        alphaQuality: 100,
        make: false,
        only: false
    }
}

// Default engine settings for compressor
const jpgEngine = { engine: 'mozjpeg', command: ['-quality', '85'] }
const pngEngine = { engine: 'pngquant', command: ['--quality=50-80', '--speed=2'] }
const svgEngine = { engine: 'svgo', command: '--multipass' }
const gifEngine = { engine: 'gifsicle', command: ['--colors', '128', '--use-col=web'] }
const webEngine = { engine: 'webp', command: false }
const noEngine = { engine: false, command: false }





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
        sendGenericMessage("Detected format:" + metadata.format)

        if(parseBool(settings.jpg.make) === false && parseBool(settings.webp.make) === false) {
            switch(metadata.format) {
                case "jpeg":
                    ext = ".jpg"
                    break
                default:
                    ext = "." + metadata.format
                    break;
            }
        }
        

        if(settings.resize.width || settings.resize.height) {
            image.resize(
                (settings.resize.width && parseInt(settings.resize.width) > 0 ? parseInt(settings.resize.width) : null), 
                (settings.resize.height && parseInt(settings.resize.height) > 0 ? parseInt(settings.resize.height) : null), 
                {fit: (settings.resize.crop == "true" ? "cover" : "inside")}
                )
        }

        if(parseBool(settings.jpg.make)) {
            ext = ".jpg"
        }

        if(parseBool(settings.webp.make)) {
            ext = ".webp"
        }
        
        if (ext === ".jpg" || ext === ".jpeg") {
            ext = ".jpg" // Force .jpg because it's objectively correct
            image.flatten({
                background: {r:255, g:255, b:255}
            })
            image.jpeg({
                quality: quality,
                chromaSubsampling: '4:4:4'
            })
            
        } else if (ext === ".png") {
            image.png()
        } else if (ext === ".gif" || ext === ".svg") {
            return file
        } else if(ext === ".webp") {
            image.webp({
                quality: parseInt(settings.webp.quality)
            })
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
    if(!(inExt == ".png" || inExt == ".jpg" || inExt == ".jpeg" || inExt == ".svg" || inExt == ".gif"))
        return file

    jpgOptions = Object.assign(jpgEngine)
    jpgOptions.command[1] = settings.jpg.quality + ""

    let jpgPlugin = imageminMozJPEG({ quality: settings.jpg.quality })

    if(jpgEngineName == "mozjpeg") {
        if(parseInt(settings.jpg.subsampling) <= 1) {
            sendGenericMessage("4:4:4 Chroma")
            jpgPlugin = imageminMozJPEG({
                quality: settings.jpg.quality,
                sample: ["1x1", "1x1"],
                progressive: true
            })
        } else {
            sendGenericMessage("4:2:0 (or lower) Chroma")
            jpgPlugin = imageminMozJPEG({
                quality: settings.jpg.quality,
                sample: [settings.jpg.subsampling + "x" + settings.jpg.subsampling, settings.jpg.subsampling + "x" + settings.jpg.subsampling],
                progressive: true
            })
        }
    } else {
        if(parseInt(settings.jpg.subsampling) <= 1) {
            jpgPlugin = imageminJPEGRecompress({
                quality: "high",
                accurate: true,
                method: "ssim",
                min: (parseInt(settings.jpg.quality) * 0.8),
                subsample: "disable"
            })
        } else {
            jpgPlugin = imageminJPEGRecompress({
                quality: "high",
                accurate: true,
                method: "smallfry",
                min: (parseInt(settings.jpg.quality) * 0.8)
            })
        }
    }

    pngOptions = Object.assign(pngEngine)
    if(settings.png.qualityMin > settings.png.qualityMax)
        settings.png.qualityMax = settings.png.qualityMin;
    pngOptions.command[0] = `--quality=${settings.png.qualityMin}-${settings.png.qualityMax}`

    return new Promise((resolve, reject) => {
        imagemin([slash(file)], {
            destination: slash(path.join(outFolder, "min")),
            plugins: [
                jpgPlugin,
                imageminGIFSicle({
                    optimizationLevel: 3,
                    colors: 256
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
            if(a.length === 0) {
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
    const outPath = path.join(outFolder , "preview.jpg")
    try {
        let image = sharp(file)
        image.resize(200, 200, { fit: "cover" })
        image.flatten({
            background: {r:255, g:255, b:255}
        })
        image.jpeg({
            quality: 95,
            chromaSubsampling: '4:4:4'
        })
        let promise = image.toFile(outPath)
            .then(() => {
                // Preview made!
                return outPath
            }).catch((e) => {
                // Preview failed to write
                throw e
                return false
            })
        return promise
    } catch (e) {
        // Preview super failed
        consoleLog(e)
    }
}

//
//   Process queued image
//
async function job(uuid, fn, f, o, options = {}) {

    let original = f

    let uuidDir = o + uuid + "/"

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
    if(canUseOriginalImage) {
        sendGenericMessage("Original JPEG image can be used.")
    } else {
        
    }

    const results = { }

    if(!(options.resize.width || options.resize.height)) {
        results["original"] = original
    }

    // Use MozJPEG to adjust overall quality
    // We'll use this on JPEGs that have been processed by sharp
    let tmpResize
    let mozJPEG
    if(path.extname(resized) == ".jpg") {
        sendGenericMessage("MozCompressing...")
        mozJPEG = await compressFile(resized, path.join(uuidDir, "moz"), options, "mozjpeg")
        if(mozJPEG) {
            results["mozJPEG"] = mozJPEG
        }
    }

    let mozOriginal
    if(path.extname(resized) == ".jpg" && canUseOriginalImage) {
        sendGenericMessage("MozCompressing original...")
        mozOriginal = await compressFile(f, path.join(uuidDir, "mozO"), options, "mozjpeg")
        if(mozOriginal) {
            results["mozOriginal"] = mozOriginal
        }
    }

    // Compress processed file
    sendGenericMessage("Compressing...")
    // Use original if possible, else resized
    let compressed = await compressFile((canUseOriginalImage ? f : resized), path.join(uuidDir, "compressed"), options)
    if(compressed) {
        results["compressed"] = compressed
    }

    const smallest = {
        name: "original",
        size: (canUseOriginalImage ? fs.statSync(f).size : -1)
    }
    consoleLog("===== RESULTS =====")
    for(let result in results) {
        let size = fs.statSync(results[result]).size
        consoleLog(`${result}: ${size / 1000}kb`)
        if(result != "original" && size > 0 && (size < smallest.size || smallest.size == -1)) {
            smallest.name = result
            smallest.size = size
        }
    }
    consoleLog("===================")
    consoleLog(`\x1b[36mSmallest size is ${smallest.name} at ${smallest.size / 1000}kb!\x1b[0m`)
    consoleLog("===================")

    // Collect sizes to send back
    let sourceSize = fs.statSync(f).size
    let finalSize = smallest.size

    sendGenericMessage("Preparing final file...")
    // Copy finished file to final location
    fs.mkdirSync(uuidDir + "crushed/")
    let finalFile = uuidDir + "crushed/" + path.basename(fn, path.extname(fn)) + path.extname(resized)

    fs.copyFileSync(results[smallest.name], finalFile)
    
    sendGenericMessage("Making previews...")
    // Make thumbnails
    fs.mkdirSync(uuidDir + "preview/")
    let preview = ""
    try {
        preview = await makePreview(finalFile, uuidDir + "preview/")
    } catch(e) {
        sendGenericMessage("ERROR: Creating preview failed")
    }

    sendGenericMessage("Writing timestamp...")
    // Write timestamp for cleanup
    fs.writeFileSync(uuidDir + "ts", Date.now())

    sendGenericMessage("Clearing temp files...")

    // Build and send results
    let result = {
        uuid: uuid,
        filename: path.basename(finalFile, path.extname(finalFile)) + path.extname(finalFile),
        name: path.basename(finalFile, path.extname(finalFile)) + path.extname(finalFile),
        startSize: sourceSize,
        endSize: finalSize,
        url: "file://" + path.join(uuidDir, '/crushed/' + path.basename(finalFile)),
        preview: "file://" + path.join(uuidDir, '/preview/' + path.basename(preview)),
        originalURL: "file://" + path.join(uuidDir, '/source' + path.extname(f))
    }

    sendGenericMessage("Done!")
    // Congrats, job well done!
    return result
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
process.on('message', (data) => {
    if (data.type == "job") {
        processQueue.push(data)
        sendGenericMessage(`Recieved job ${data.uuid} | Current queue: ${processQueue.length}`)
        sendQueueUpdate()
        checkCanDoJob()
    } else if (data.type == 'setThreadNum') {
        threadNum = data.result
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

        if(processQueue.length === 0) {
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







var deleteFolderRecursive = function(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function(file, index){
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