# Setup project
1. Get google cloud service account, move in project and change name to 'gcs-key.json'
```
more infomation:
https://cloud.google.com/iam/docs/creating-managing-service-account-keys

ps. add Admin Google cloud storage role to service account

```

2. Create bucket
```
 POST /bucket
 body {
     "bucketName" : <name>  
 }
```

3. Add cors to bucket
```
 POST /bucket/<bucketName>
 body {
     "origin" : https://<host>  
 }
```
### ---- done ----
### backend ready to use