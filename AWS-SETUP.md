# ☁️ AWS Cloud Setup Guide — FBN XAI Project

## What's Been Set Up

| File | Purpose |
|---|---|
| `backend/config/aws.js` | S3 client, upload handler, connection tester |
| `backend/routes/awsRoutes.js` | REST API: upload, list, delete S3 files |
| `backend/test-aws.js` | Run to test your AWS connection |
| `src/hooks/useS3Upload.js` | React hook for frontend uploads |
| `.elasticbeanstalk/config.yml` | Backend deployment config for EB |
| `deploy-aws.js` | One-command full deployment script |

---

## Step 1 — Get Your AWS Access Keys

1. Go to → https://console.aws.amazon.com/iam/home#/security_credentials
2. Scroll to **"Access keys"** section
3. Click **"Create access key"**
4. Select **"Application running outside AWS"** → Next
5. Copy both values shown:
   - ✅ `Access Key ID`  (e.g. `AKIAIOSFODNN7EXAMPLE`)
   - ✅ `Secret Access Key` (shown ONCE — save it!)

---

## Step 2 — Update `.env` File

Open the `.env` file in the project root and replace:

```env
AWS_ACCESS_KEY_ID=PASTE_YOUR_ACCESS_KEY_ID_HERE
AWS_SECRET_ACCESS_KEY=PASTE_YOUR_SECRET_ACCESS_KEY_HERE
AWS_REGION=us-east-1
AWS_S3_BUCKET=fnb-xai-project-files
```

---

## Step 3 — Test Connection

```bash
node backend/test-aws.js
```

Expected output:
```
✅  AWS S3 — Connected!
📦  Your S3 Buckets (1): fnb-xai-project-files
✅  Bucket "fnb-xai-project-files" exists and is ready!
🎉  AWS Cloud connection is FULLY WORKING!
```

---

## Step 4 — Create S3 Bucket (if needed)

The test script auto-creates the bucket. Or manually:

1. Go to → https://s3.console.aws.amazon.com/s3/
2. Click **"Create bucket"**
3. Bucket name: `fnb-xai-project-files`
4. Region: `us-east-1`
5. Uncheck **"Block all public access"** (for file serving)
6. Click **"Create bucket"**

---

## Step 5 — Add IAM Permissions (if getting "Access Denied")

1. Go to → https://console.aws.amazon.com/iam/home#/users
2. Click your IAM user
3. Click **"Add permissions"** → **"Attach policies directly"**
4. Search and add: **`AmazonS3FullAccess`**
5. Click **"Add permissions"**

---

## API Endpoints Available

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/aws/status` | Check if AWS S3 is connected |
| `POST` | `/api/aws/upload` | Upload a file to S3 |
| `GET` | `/api/aws/files` | List all files in the bucket |
| `DELETE` | `/api/aws/files/:key` | Delete a file from S3 |
| `GET` | `/api/health` | Health check (includes AWS status) |

---

## Using the React Hook

```jsx
import useS3Upload from '../hooks/useS3Upload';

function UploadComponent() {
  const { upload, uploading, progress, error, url } = useS3Upload();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    const result = await upload(file);
    if (result) console.log('Uploaded to:', result.url);
  };

  return (
    <div>
      <input type="file" onChange={handleFile} disabled={uploading} />
      {uploading && <p>Uploading... {progress}%</p>}
      {error && <p style={{color:'red'}}>Error: {error}</p>}
      {url && <p>✅ File URL: <a href={url}>{url}</a></p>}
    </div>
  );
}
```

---

## Full Deployment to AWS

```bash
# Install EB CLI first (one-time)
pip install awsebcli

# Configure AWS credentials (one-time)
aws configure

# Full deploy: Frontend → S3, Backend → Elastic Beanstalk
node deploy-aws.js
```

---

## Check AWS Status (Live)

Once backend is running, open in browser:

```
http://localhost:5000/api/aws/status
http://localhost:5000/api/health
```
