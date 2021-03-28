const { Storage } = require('@google-cloud/storage')
const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config()

const app = express()
app.use(bodyParser.json())
const port = 3000

const storage = new Storage()
// const bucketName = 'portfolio-upload-image'
// contentType and objectPath values should be sent from front-end
// const contentType = "image/jpeg"
// const objectPath = "Screen Shot 2564-03-11 at 12.00.38.png"

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'POST, GET')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return next()
})




app.post('/bucket/:bucketName/signed-url/download', async (req, res) => {
    let body = req.body
    if (!('fileName' in body)) {
        res.status(400)
        return res.send({
            status: 400,
            message: 'fileName missing.'
        })
    }

    const url = await getDownloadSignedURL(body.fileName, req.params.bucketName)
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

app.post('/bucket/:bucketName/signed-url/upload', async (req, res) => {
    let body = req.body
    if (!('fileName' in body)) {
        res.status(400)
        return res.send({
            status: 400,
            message: 'fileName missing.'
        })
    }

    if (!('fileType' in body)) {
        res.status(400)
        return res.send({
            status: 400,
            message: 'fileType missing.'
        })
    }


    const url = await getUploadSignedURL(body.fileName, body.fileType, req.params.bucketName)
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

app.get('/bucket/:bucketName/images', async (req, res) => {
    let files = await getListImages(req.params.bucketName)
    let filesList = []
    for (let i = 0; i < files.length; i++) {
        let signedUrl = await getDownloadSignedURL(files[i].metadata.name, req.params.bucketName)
        filesList.push({
            name: files[i].metadata.name,
            updated: files[i].metadata.updated,
            size: files[i].metadata.size,
            url: signedUrl
        })
    }

    return res.send({
        status: 200,
        data: filesList
    })
})

app.post('/bucket/:bucketName/cors', async (req, res) => {
    if (!('origin' in req.body)) {
        res.status(400)
        return res.send({
            status: 400,
            message: 'origin missing.'
        })
    }

    await configureBucketCors(req.params.bucketName, req.body.origin).catch(error => {
        res.status(500)
        return res.send({
            status: 400,
            message: error
        })
    })
    return res.send({
        status: 200,
        message: 'done'
    })

})

app.post('/bucket', async (req, res) => {
    if (!('bucketName' in req.body)) {
        res.status(400)
        return res.send({
            status: 400,
            message: 'bucketName missing'
        })
    }

    const [bucket] = await storage.createBucket(req.body.bucketName, {
        location: 'ASIA'
    });

    return res.send({
        status: 200,
        data: bucket
    })
})


async function getDownloadSignedURL(fileName, bucketName) {
    // These options will allow temporary read access to the file
    const options = {
        version: 'v4',
        action: 'read',
        expires: Date.now() + 1 * 60 * 1000, // 1 minutes
    };

    // Get a v4 signed URL for reading the file
    const [url] = await storage
        .bucket(bucketName)
        .file(fileName)
        .getSignedUrl(options);
    // console.log(`curl '${url}'`);
    return url
}


async function getUploadSignedURL(fileName, fileType, bucketName) {
    const options = {
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 30 minutes
        contentType: fileType,
    };
    const [url] = await storage
        .bucket(bucketName)
        .file(fileName)
        .getSignedUrl(options);

    // console.log(
    //     "curl -X PUT -H 'Content-Type: image/jpeg' " +
    //     `--upload-file ${fileName} '${url}'`
    // );

    return url
}

async function configureBucketCors(bucketName, origin) {
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

async function getListImages(bucketName) {
    const [files] = await storage.bucket(bucketName).getFiles();
    return files
}


app.get('/', (req, res) => {
    return res.send({
        message: 'server running...'
    })
})

app.listen(port, () => {
    console.log(`running on port ${port}`)
})
