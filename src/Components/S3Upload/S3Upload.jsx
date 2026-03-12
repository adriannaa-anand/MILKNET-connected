import { useState } from 'react'
import { uploadToS3 } from '../../utils/s3Upload'
import './S3Upload.css'

export default function S3Upload({ folder = 'milkmen', onUploaded }) {
  const [progress,  setProgress]  = useState(0)
  const [uploading, setUploading] = useState(false)
  const [file,      setFile]      = useState(null)
  const [result,    setResult]    = useState(null)
  const [error,     setError]     = useState('')
  const [docName,   setDocName]   = useState('')

  const handleChange = async e => {
    const f = e.target.files[0]; if (!f) return
    setUploading(true); setError(''); setFile(f)
    try {
      const res = await uploadToS3(f, folder, docName || f.name, setProgress)
      setResult(res)
      if (onUploaded) onUploaded({ file: f, ...res })
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.')
    } finally { setUploading(false) }
  }

  const reset = () => {
    setProgress(0); setUploading(false); setFile(null); setResult(null); setError(''); setDocName('')
  }

  return (
    <div className="s3upload">
      <div className="s3upload__head">
        <span style={{ fontSize: 28 }}>☁️</span>
        <div>
          <p className="s3upload__title">Upload to AWS S3</p>
          <p className="s3upload__sub">ID proof, FSSAI license, or farm photos — stored securely.</p>
        </div>
      </div>

      {!result ? (
        <>
          <input
            className="s3upload__name-input"
            placeholder="Document name (e.g. Aadhaar Card)"
            value={docName}
            onChange={e => setDocName(e.target.value)}
            disabled={uploading}
          />
          <label className={`s3upload__label ${uploading ? 's3upload__label--busy' : ''}`}>
            {uploading ? `⏳ Uploading… ${progress}%` : '📁 Choose File to Upload'}
            <input type="file" accept="image/*,.pdf" onChange={handleChange} disabled={uploading}
              className="s3upload__inp" />
          </label>

          {uploading && (
            <div className="s3upload__bar-wrap">
              <div className="s3upload__bar" style={{ width: `${progress}%` }} />
              <p className="s3upload__bar-txt">
                Uploading to s3://{import.meta.env.VITE_AWS_S3_BUCKET || 'milknet-docs'}/{folder}/{file?.name}
              </p>
            </div>
          )}
          {error && <p className="s3upload__error">⚠️ {error}</p>}
        </>
      ) : (
        <div className="s3upload__success">
          <p>✅ Successfully uploaded to AWS S3!</p>
          <code>{result.fileUrl}</code>
          <button onClick={reset}>Upload Another</button>
        </div>
      )}

      <div className="s3upload__badges">
        <span>🔒 AES-256 Encrypted</span>
        <span>⚡ AWS S3 Standard</span>
        <span>✅ FSSAI & ID accepted</span>
      </div>
    </div>
  )
}
