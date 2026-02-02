import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { api } from './services/api';
import { AuthModal } from './components/AuthModal';
import { GenerateForm } from './components/GenerateForm';
import { Gallery } from './components/Gallery';

function App() {
  const { isAuthenticated, login, register, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadResources();
    } else {
      setResources([]);
    }
  }, [isAuthenticated]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await api.listResources();
      setResources(data);
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (positivePrompt, negativePrompt) => {
    await api.generateImage(positivePrompt, negativePrompt);
    await loadResources(); // Refresh gallery
  };

  const handleDelete = async (resourceId) => {
    await api.deleteResource(resourceId);
    await loadResources(); // Refresh gallery
  };

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.logo}>Image Generator</h1>
        
        <div style={styles.authButtons}>
          {isAuthenticated ? (
            <button onClick={logout} style={styles.button}>
              Logout
            </button>
          ) : (
            <button onClick={() => setShowAuthModal(true)} style={styles.button}>
              Login / Register
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {isAuthenticated ? (
          <>
            <GenerateForm onGenerate={handleGenerate} />
            {loading ? (
              <p style={styles.loading}>Loading gallery...</p>
            ) : (
              <Gallery resources={resources} onDelete={handleDelete} />
            )}
          </>
        ) : (
          <div style={styles.welcome}>
            <h2>Welcome!</h2>
            <p>Please login or register to start generating images.</p>
            <button onClick={() => setShowAuthModal(true)} style={styles.welcomeButton}>
              Get Started
            </button>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={login}
          onRegister={register}
        />
      )}
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: '1rem 2rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '600',
  },
  authButtons: {
    display: 'flex',
    gap: '1rem',
  },
  button: {
    padding: '0.5rem 1.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '500',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  welcome: {
    backgroundColor: 'white',
    padding: '4rem 2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  welcomeButton: {
    marginTop: '2rem',
    padding: '0.75rem 2rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1.125rem',
    cursor: 'pointer',
    fontWeight: '500',
  },
  loading: {
    textAlign: 'center',
    color: '#666',
    padding: '2rem',
  },
};

export default App;
