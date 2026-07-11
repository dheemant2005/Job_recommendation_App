type Props = {
  onNavigate?: (page: string) => void;
};

export default function Home({ onNavigate }: Props) {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      {/* Hero */}
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Welcome to TalentSpark</h1>
      <p style={{ fontSize: '1.2rem', opacity: 0.7, maxWidth: '520px', marginBottom: '2.5rem' }}>
        Your gateway to finding the perfect job or connecting with top talent.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}>
        <button
          onClick={() => onNavigate?.('login')}
          style={{ background: 'var(--accent-gradient)', color: 'white', border: 'none', padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          Candidate Login
        </button>
        <button
          onClick={() => onNavigate?.('admindashboard')}
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          Admin Portal
        </button>
      </div>

      {/* Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '780px' }}>
        <div className="card" style={{ margin: 0, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💼</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Find Jobs</h3>
          <p style={{ opacity: 0.7, margin: 0, fontSize: '0.9rem' }}>Browse and apply to jobs from top companies</p>
        </div>
        <div className="card" style={{ margin: 0, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📄</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Easy Applications</h3>
          <p style={{ opacity: 0.7, margin: 0, fontSize: '0.9rem' }}>Upload your resume and apply with one click</p>
        </div>
        <div className="card" style={{ margin: 0, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📊</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Track Progress</h3>
          <p style={{ opacity: 0.7, margin: 0, fontSize: '0.9rem' }}>Monitor your application status in real-time</p>
        </div>
      </div>
    </div>
  );
}
