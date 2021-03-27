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


app.get('/signed-url', async (req, res) => {
    console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    const url = await getSignedURL()
    return res.send({
        status: 200,
        data: url
    })

})



async function getSignedURL() {
    const options = {
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: contentType,
    };
    const url = await storage
        .bucket(bucketName)
        .file(objectPath)
        .getSignedUrl(options);
    console.log(
        "curl -X PUT -H 'Content-Type: image/jpeg' " +
        `--upload-file ${objectPath} '${url}'`
    );

    return url
}




async function createBucket() {
    const bucket = await storage.createBucket(bucketName)
    return bucket
}


app.get('/', (req, res) => {
    return res.send({
        message: 'server running...'
    })
})

app.listen(port, () => {
    console.log(`running on port ${port}`)
})
