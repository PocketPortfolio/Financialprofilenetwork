# Large File Upload Options (286MB GIF)

## The Problem
- **File Size:** 286MB
- **Cloudinary Free Tier:** 10MB upload limit ❌
- **Vercel Blob:** Requires token (not easily accessible) ⚠️
- **Need:** A CDN that supports large files

## Recommended Solutions

### Option 1: AWS S3 + CloudFront (Best for Production)

**Pros:**
- ✅ No file size limits
- ✅ Global CDN (CloudFront)
- ✅ Reliable and scalable
- ✅ Free tier: 5GB storage, 20,000 GET requests/month

**Setup:**
1. Create AWS account
2. Create S3 bucket
3. Create IAM user with S3 permissions
4. Add credentials to `.env.local`:
   ```bash
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket-name
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   ```
5. Run: `npm run upload-gif-s3`
6. Set up CloudFront distribution (optional, for better performance)

**Cost:** ~$0.023/GB storage + $0.085/GB transfer (first 10TB free)

---

### Option 2: Backblaze B2 + Cloudflare (Free Tier Friendly)

**Pros:**
- ✅ 10GB free storage
- ✅ 1GB/day free download
- ✅ No upload limits
- ✅ Works with Cloudflare (free CDN)

**Setup:**
1. Sign up at https://www.backblaze.com/b2/sign-up.html
2. Create bucket
3. Get Application Key
4. Upload via B2 API or CLI
5. Use Cloudflare CDN in front

**Cost:** Free for 10GB storage + 1GB/day download

---

### Option 3: BunnyCDN (Simple & Cheap)

**Pros:**
- ✅ $0.01/GB storage
- ✅ $0.005/GB bandwidth
- ✅ No file size limits
- ✅ Easy setup

**Setup:**
1. Sign up at https://bunny.net
2. Create storage zone
3. Upload via FTP or API
4. Get CDN URL

**Cost:** ~$2.86/month for storage + bandwidth

---

### Option 4: Compress GIF to MP4 (Recommended for Performance)

**Best Solution:** Convert the 286MB GIF to a looping MP4/WebM video.

**Pros:**
- ✅ Same visual quality
- ✅ ~20MB file size (vs 286MB)
- ✅ Instant load time
- ✅ Works with any CDN
- ✅ Better user experience

**Command:**
```bash
ffmpeg -i dashboard-demo-4k.gif -vf "fps=20,scale=3840:-1" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart dashboard-demo-4k.mp4
```

Then upload the MP4 instead (works with Cloudinary, S3, or any CDN).

---

## Quick Decision Matrix

| Solution | Setup Time | Cost | File Size Limit | Performance |
|----------|-----------|------|----------------|-------------|
| AWS S3 | 15 min | Low | None | Excellent |
| Backblaze B2 | 10 min | Free | None | Good |
| BunnyCDN | 5 min | Very Low | None | Excellent |
| **MP4 Conversion** | **2 min** | **Free** | **None** | **Best** |

## Recommendation

**For immediate deployment:** Use **BunnyCDN** (easiest setup, low cost)

**For best performance:** Convert to **MP4** and use any CDN (Cloudinary works for 20MB files)

**For enterprise:** Use **AWS S3 + CloudFront**

