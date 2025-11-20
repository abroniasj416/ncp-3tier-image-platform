import { useEffect, useState } from 'react'
import './App.css'

const API_BASE = '' // 로컬: Vite proxy, NCP 배포: /api 를 WAS로 프록시

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
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setBackendStatus(data.status || 'OK')
        setHealthError('')
      } catch (e) {
        console.error(e)
        setBackendStatus('연결 실패')
        setHealthError('백엔드와 통신할 수 없습니다. (ACG, 포트, URL 확인 필요)')
      }
    }

    checkHealth()
  }, [])

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] ?? null
    setFile(selected)
    setUploadResult(null)
    setUploadError('')
  }

  const handleUpload = async (event) => {
    event.preventDefault()

    if (!file) {
      setUploadError('먼저 증명사진 파일을 선택해주세요.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploadError('')
      setUploadResult(null)

      const res = await fetch(`${API_BASE}/api/images/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()
      console.log('uploadResult from backend:', data)
      // 기대 형태: { objectUrl: string, objectKey: string, optimizedUrl: string }
      setUploadResult(data)
    } catch (e) {
      console.error(e)
      setUploadError('업로드에 실패했습니다. (백엔드 로그 및 NCP 설정을 확인해주세요)')
    }
  }

  const originalUrl = uploadResult?.objectUrl || ''
  const optimizedUrl = uploadResult?.optimizedUrl || ''
  const objectKey = uploadResult?.objectKey || ''

  return (
    <div style={styles.page}>
      {/* 상단 헤더 */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.headerLeft}>
            <p style={styles.headerSubTitle}>국가자격시험센터 (모의)</p>
            <h1 style={styles.title}>수험표 증명사진 규격 검사 · 변환 서비스</h1>
            <p style={styles.subtitle}>
              업로드한 사진을 자격증 제출용 규격(413×531px, 3×4 비율)으로 자동 변환합니다.
            </p>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.statusCard}>
              <span style={styles.statusLabel}>백엔드 연결 상태</span>
              <div style={styles.statusRow}>
                <span
                  style={{
                    ...styles.statusDot,
                    backgroundColor: backendStatus === 'OK' ? '#2ecc71' : '#e74c3c',
                  }}
                />
                <span style={styles.statusText}>{backendStatus}</span>
              </div>
              {healthError && <p style={styles.statusError}>{healthError}</p>}
            </div>
          </div>
        </div>
      </header>

      {/* 본문: 업로드 & 미리보기 */}
      <main style={styles.main}>
        <section style={styles.cardRow}>
          {/* 1. 수험표 사진 업로드 */}
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>1. 수험표 사진 업로드</h2>
            <p style={styles.cardDesc}>
              아래 안내를 확인 후, 수험표에 사용할 증명사진 파일을 업로드해주세요.
            </p>

            <ul style={styles.bulletList}>
              <li>색상 사진, 정면 상반신, 모자·선글라스 착용 불가</li>
              <li>해상도 300dpi 이상 권장, JPG/PNG 파일 사용</li>
              <li>업로드 시 자동으로 413×531px 크기로 변환됩니다.</li>
            </ul>

            <form onSubmit={handleUpload} style={styles.uploadForm}>
              <label style={styles.fileLabel}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                사진 선택
              </label>
              <button type="submit" style={styles.primaryButton}>
                업로드 및 규격 변환
              </button>
            </form>

            <p style={styles.selectedFileText}>
              선택된 파일:{' '}
              <strong>{file ? file.name : '선택된 파일이 없습니다.'}</strong>
            </p>

            {uploadError && <p style={styles.errorText}>{uploadError}</p>}
          </section>

          {/* 2. 규격 사진 미리보기 */}
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>2. 규격 사진 미리보기</h2>

            <div style={styles.previewGrid}>
              {/* 원본 이미지 */}
              <div>
                <div style={styles.previewLabel}>원본 이미지</div>
                <div style={styles.previewFrame}>
                  {originalUrl ? (
                    <img
                      src={originalUrl}
                      alt="원본 업로드 이미지"
                      style={styles.previewImage}
                    />
                  ) : (
                    <p style={styles.previewPlaceholder}>업로드 후 원본 이미지가 표시됩니다.</p>
                  )}
                </div>
              </div>

              {/* 규격(증명사진) 이미지 */}
              <div>
                <div style={styles.previewLabel}>규격(증명사진) 이미지</div>
                <div style={styles.previewFrame}>
                  {optimizedUrl ? (
                    <img
                      src={optimizedUrl}
                      alt="규격 변환 이미지"
                      style={styles.previewImage}
                      onError={() => {
                        console.warn('Failed to load optimizedUrl image:', optimizedUrl)
                      }}
                    />
                  ) : (
                    <p style={styles.previewPlaceholder}>
                      업로드 후 규격 변환 이미지가 표시됩니다.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </section>

        {/* 3. 변환 결과 정보 */}
        <section style={styles.resultCard}>
          <h2 style={styles.cardTitle}>3. 변환 결과 정보</h2>

          {uploadResult ? (
            <>
              <table style={styles.resultTable}>
                <tbody>
                  <tr>
                    <th style={styles.resultTh}>원본 이미지 URL</th>
                    <td style={styles.resultTd}>
                      {originalUrl ? (
                        <a
                          href={originalUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.link}
                        >
                          {originalUrl}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th style={styles.resultTh}>규격 이미지 URL</th>
                    <td style={styles.resultTd}>
                      {optimizedUrl ? (
                        <a
                          href={optimizedUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.link}
                        >
                          {optimizedUrl}
                        </a>
                      ) : (
                        '- (백엔드에서 optimizedUrl이 넘어오지 않았습니다)'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th style={styles.resultTh}>Object Storage Key</th>
                    <td style={styles.resultTd}>
                      <code>{objectKey || '-'}</code>
                    </td>
                  </tr>
                </tbody>
              </table>

              <p style={styles.noticeText}>
                ※ 상기 이미지는 연습용 &amp; NCP 인프라에서 제공되며, 실제 접수 시스템과는 무관한
                모의 서비스입니다.
              </p>
            </>
          ) : (
            <p style={styles.noticeText}>
              아직 업로드된 결과가 없습니다. 상단에서 증명사진을 업로드하면 결과 정보가
              표시됩니다.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}

const styles = {
  page: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    backgroundColor: '#f5f7fb',
    minHeight: '100vh',
    padding: '32px 16px',
  },
  header: {
    maxWidth: '1120px',
    margin: '0 auto 24px',
  },
  headerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '24px',
    alignItems: 'stretch',
  },
  headerLeft: {
    flex: 1,
    padding: '20px 24px',
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 14px rgba(15, 35, 95, 0.08)',
  },
  headerRight: {
    width: '260px',
    display: 'flex',
  },
  headerSubTitle: {
    fontSize: '13px',
    color: '#4b6cb7',
    fontWeight: 600,
    margin: '0 0 4px',
  },
  title: {
    fontSize: '22px',
    margin: '0 0 8px',
    color: '#1a2b4c',
  },
  subtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#6b7280',
  },
  statusCard: {
    flex: 1,
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    padding: '16px 18px',
    boxShadow: '0 4px 14px rgba(15, 35, 95, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: '13px',
    color: '#6b7280',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '8px',
    gap: '8px',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '999px',
  },
  statusText: {
    fontWeight: 600,
    fontSize: '14px',
  },
  statusError: {
    marginTop: '10px',
    fontSize: '12px',
    color: '#e74c3c',
  },
  main: {
    maxWidth: '1120px',
    margin: '0 auto',
  },
  cardRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1.1fr)',
    gap: '20px',
    marginBottom: '24px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px 24px 22px',
    boxShadow: '0 4px 14px rgba(15, 35, 95, 0.05)',
  },
  cardTitle: {
    margin: '0 0 6px',
    fontSize: '18px',
    color: '#111827',
  },
  cardDesc: {
    margin: '0 0 10px',
    fontSize: '13px',
    color: '#6b7280',
  },
  bulletList: {
    margin: '8px 0 14px',
    paddingLeft: '18px',
    fontSize: '13px',
    color: '#4b5563',
    lineHeight: 1.5,
  },
  uploadForm: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '8px',
  },
  fileLabel: {
    padding: '8px 16px',
    borderRadius: '999px',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
  },
  primaryButton: {
    padding: '9px 20px',
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    color: '#ffffff',
    background:
      'linear-gradient(135deg, #2563eb, #1d4ed8)',
  },
  selectedFileText: {
    fontSize: '12px',
    color: '#6b7280',
  },
  errorText: {
    marginTop: '6px',
    fontSize: '12px',
    color: '#e11d48',
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginTop: '8px',
  },
  previewLabel: {
    fontSize: '13px',
    marginBottom: '6px',
    color: '#4b5563',
    fontWeight: 600,
  },
  previewFrame: {
    borderRadius: '14px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    height: '220px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'cover',
  },
  previewPlaceholder: {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center',
    padding: '0 12px',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px 24px 24px',
    boxShadow: '0 4px 14px rgba(15, 35, 95, 0.05)',
  },
  resultTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
    fontSize: '13px',
  },
  resultTh: {
    width: '140px',
    textAlign: 'left',
    padding: '8px 10px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    color: '#4b5563',
    verticalAlign: 'top',
  },
  resultTd: {
    padding: '8px 10px',
    borderBottom: '1px solid #e5e7eb',
    color: '#111827',
    wordBreak: 'break-all',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'underline',
  },
  noticeText: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '10px',
  },
}

export default App
