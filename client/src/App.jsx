import { useState, useEffect } from "react";
import ImageGenerationForm from "./components/ImageGenerationForm";
import "./App.css";

function App() {
  const [authToken, setAuthToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // API base URL - adjust if different
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailAddress: email,
          plainTextPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save token and update state
      localStorage.setItem("authToken", data.signedAuthenticationToken);
      setAuthToken(data.signedAuthenticationToken);
      setIsLoggedIn(true);

      // Clear form
      setEmail("");
      setPassword("");
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setAuthToken(null);
    setIsLoggedIn(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎨 AI Image Generation</h1>
        {isLoggedIn && (
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        )}
      </header>

      <main className="app-main">
        {isLoggedIn ? (
          <ImageGenerationForm apiBaseUrl={apiBaseUrl} authToken={authToken} />
        ) : (
          <div className="login-container">
            <h2>Login to Generate Images</h2>
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {loginError && (
                <div className="alert alert-error">{loginError}</div>
              )}

              <button type="submit" className="login-btn">
                Login
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
