import { useEffect, useState } from 'react'
import './App.css'

const API_BASE = '' // 로컬 개발 시 Vite proxy 사용, 배포 시에는 리버스 프록시로 /api만 백엔드로 전달

function App() {
  const [backendStatus, setBackendStatus] = useState('확인 중...')
  const [healthError, setHealthError] = useState('')
  const [file, setFile] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/health`)
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        const data = await res.json()
        setBackendStatus(data.status || 'OK')
      } catch (e) {
        console.error(e)
        setBackendStatus('연결 실패')
        setHealthError('백엔드와 통신할 수 없습니다. (ACG, 포트, URL 확인 필요)')
      }
    }

    checkHealth()
  }, [])

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] ?? null)
    setUploadResult(null)
    setUploadError('')
  }

  const handleUpload = async (event) => {
    event.preventDefault()

    if (!file) {
      setUploadError('먼저 이미지를 선택해주세요.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploadError('')
      setUploadResult(null)

      const res = await fetch(`${API_BASE}/api/images`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()
      setUploadResult(data)
    } catch (e) {
      console.error(e)
      setUploadError('업로드 실패. (백엔드 로그 및 NCP 설정을 확인해주세요)')
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>NCP 3-Tier 이미지 플랫폼 (연습용)</h1>
        <p style={styles.subtitle}>
          React 프론트엔드 + Spring Boot 백엔드 + NCP 인프라 배포 실습용 최소 예제
        </p>
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>1. 백엔드 연결 상태</h2>
        <p>
          상태: <strong>{backendStatus}</strong>
        </p>
        {healthError && <p style={styles.errorText}>{healthError}</p>}
        <p style={styles.tip}>
          ▶ 로컬 개발: Vite dev 서버에서 <code>/api</code> 를
          <code>http://localhost:8080</code>으로 proxy 설정하면 CORS 없이 테스트 가능
          <br />
          ▶ NCP 배포: Web 서버 / 로드밸런서에서 <code>/api</code> 경로를 WAS로 프록시
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>2. 이미지 업로드 테스트</h2>
        <form onSubmit={handleUpload} style={styles.form}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button type="submit" style={styles.button}>
            업로드
          </button>
        </form>

        {uploadError && <p style={styles.errorText}>{uploadError}</p>}

        {uploadResult && (
          <div style={styles.resultBox}>
            <p>업로드 결과:</p>
            <pre style={styles.pre}>{JSON.stringify(uploadResult, null, 2)}</pre>
            {uploadResult.previewUrl && (
              <img
                src={uploadResult.previewUrl}
                alt="업로드 미리보기"
                style={styles.preview}
              />
            )}
          </div>
        )}
      </section>
    </div>
  )
}

const styles = {
  page: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    maxWidth: '960px',
    margin: '0 auto',
    padding: '32px 16px',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    margin: '0 0 8px',
  },
  subtitle: {
    margin: 0,
    color: '#555',
  },
  section: {
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #eee',
    marginBottom: '24px',
    backgroundColor: '#fafafa',
  },
  sectionTitle: {
    margin: '0 0 12px',
    fontSize: '20px',
  },
  tip: {
    marginTop: '8px',
    fontSize: '13px',
    color: '#777',
  },
  form: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '12px',
  },
  button: {
    padding: '8px 16px',
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
  },
  errorText: {
    color: '#d00',
    fontSize: '14px',
  },
  resultBox: {
    marginTop: '12px',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    border: '1px solid '#eee',
  },
  pre: {
    backgroundColor: '#f5f5f5',
    padding: '8px',
    borderRadius: '6px',
    fontSize: '12px',
    overflowX: 'auto',
  },
  preview: {
    marginTop: '8px',
    maxWidth: '200px',
    borderRadius: '8px',
  },
}

export default App
