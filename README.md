# Setup project
1. Get google cloud service account, move in project and change name to 'gcs-key.json'
```
more infomation:
https://cloud.google.com/iam/docs/creating-managing-service-account-keys

ps. add Admin Google cloud storage role to service account

```

2. Set env GOOGLE_APPLICATION_CREDENTIALS=/path/to/gcs-key.json

3. Create bucket (also create on front-end)
```
 POST /bucket
 body {
     "bucketName" : <name>  
 }
```

4. Add cors to bucket (optinal, if cannot upload image)
```
 POST /bucket/<bucketName>
 body {
     "origin" : https://<host>  
 }
```
### ---- done ----
### backend ready to use