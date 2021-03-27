const { Storage } = require('@google-cloud/storage')
const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config()

const app = express()
app.use(bodyParser.json())
const port = 3000

const storage = new Storage()
const bucketName = 'portfolio-upload-image'
// contentType and objectPath values should be sent from front-end
const contentType = "image/jpeg"
const objectPath = "test-image-1.jpeg"

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'POST, GET')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return next()
})

// app.get('/signed-url/test', async (req, res) => {
//     // await storage.bucket(bucketName).file(objectPath).makePrivate()
//     // configureBucketCors().catch(console.error)
//     let files = await getListImages()
//     return res.send({
//         status: 200,
//         data: files
//     })

// })

app.get('/signed-url/download', async (req, res) => {
    const url = await getDownloadSignedURL()
        .catch(error => {
            res.status(500)
            return res.send({
                status: 500,
                error: error
            })
        })
    return res.send({
        status: 200,
        url: url
    })

})

app.post('/signed-url/upload', async (req, res) => {
    let body = req.body
    if(!('filePath' in body)){
        res.status(400)
        return res.send({
            status: 400,
            message: 'filePath missing.'
        })
    }

    if(!('fileType' in body)){
        res.status(400)
        return res.send({
            status: 400,
            message: 'fileType missing.'
        })
    }

    const url = await getUploadSignedURL(body.filePath,body.fileType)
        .catch(error => {
            res.status(500)
            return res.send({
                status: 500,
                error: error
            })
        })
    return res.send({
        status: 200,
        url: url
    })

})

app.post('/bucket/cors', async (req, res) => {
    if(!('origin' in req.body)){
        res.status(400)
        return res.send({
            status: 400,
            message: 'origin missing.'
        })
    }

    await configureBucketCors(req.body.origin).catch(console.error)
    return res.send({
        status: 200,
        message: 'done'
    })

})


async function getDownloadSignedURL() {
    // These options will allow temporary read access to the file
    const options = {
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    };

    // Get a v4 signed URL for reading the file
    const [url] = await storage
        .bucket(bucketName)
        .file(objectPath)
        .getSignedUrl(options);
    console.log(`curl '${url}'`);
    return url
}


async function getUploadSignedURL(filePath, fileType) {
    const options = {
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 30 minutes
        contentType: fileType,
    };
    const [url] = await storage
        .bucket(bucketName)
        .file(filePath)
        .getSignedUrl(options);

    console.log(
        "curl -X PUT -H 'Content-Type: image/jpeg' " +
        `--upload-file ${filePath} '${url}'`
    );

    return url
}

async function configureBucketCors(origin) {
    await storage.bucket(bucketName).setCorsConfiguration([
        {
            maxAgeSeconds: 3600,
            method: ['GET', 'PUT'],
            origin: [origin],
            responseHeader: ['Content-Type'],
        },
    ]);

    console.log(`Bucket ${bucketName} was updated with a CORS config
        to allow ${['GET', 'PUT']} requests from ${origin} sharing 
        ${'Content-Type'} responses across origins`);
}

// async function getListImages() { 
//     const [files] = await storage.bucket(bucketName).getFiles();
//     return files
// }




// async function createBucket() {
//     const bucket = await storage.createBucket('test',)
//     return bucket
// }


app.get('/', (req, res) => {
    return res.send({
        message: 'server running...'
    })
})

app.listen(port, () => {
    console.log(`running on port ${port}`)
})
