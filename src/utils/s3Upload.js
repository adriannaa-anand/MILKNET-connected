/**
 * s3Upload.js — Real AWS S3 upload via backend presigned URLs
 */
import api from './api'

/**
 * Upload a file to S3.
 * 1. Gets presigned URL from backend (/api/upload/presign)
 * 2. PUTs file directly to S3 (no server bandwidth)
 * 3. Calls /api/upload/confirm to save doc reference in DB
 *
 * @param {File}     file       - File object
 * @param {string}   folder     - S3 folder  e.g. 'milkmen'
 * @param {string}   docName    - Human label e.g. 'Aadhaar Card'
 * @param {Function} onProgress - Callback(percent: 0-100)
 * @returns {{ fileUrl, s3Key }}
 */
export async function uploadToS3(file, folder = 'milkmen', docName = '', onProgress = () => {}) {
  // Step 1 — get presigned URL from backend
  const { data } = await api.post('/upload/presign', {
    fileName: file.name,
    fileType: file.type,
    folder,
  })
  const { presignedUrl, fileUrl, s3Key } = data

  // Step 2 — upload directly to S3
  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    })
    xhr.addEventListener('load',  () => xhr.status === 200 ? resolve() : reject(new Error('S3 upload failed')))
    xhr.addEventListener('error', () => reject(new Error('Network error during S3 upload')))
    xhr.open('PUT', presignedUrl)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.send(file)
  })

  // Step 3 — confirm upload to backend (saves to milkman.documents[])
  await api.post('/upload/confirm', {
    s3Key,
    fileUrl,
    fileName: file.name,
    fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    docName:  docName || file.name,
  })

  return { fileUrl, s3Key }
}

/** Simulated upload for dev without real AWS keys */
export async function simulateS3Upload(file, onProgress = () => {}) {
  for (let i = 1; i <= 20; i++) {
    await new Promise((r) => setTimeout(r, 100))
    onProgress(i * 5)
  }
  const bucket = import.meta.env.VITE_AWS_S3_BUCKET || 'milknet-docs'
  const region = import.meta.env.VITE_AWS_REGION    || 'ap-south-1'
  return {
    fileUrl: `https://${bucket}.s3.${region}.amazonaws.com/milkmen/${Date.now()}-${file.name}`,
    s3Key:   `milkmen/${Date.now()}-${file.name}`,
  }
}
