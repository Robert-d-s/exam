import React, { useState } from "react";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      if (data && data.access_token) {
        // Store the JWT token in local storage (or elsewhere if preferred)
        localStorage.setItem("token", data.access_token);
        alert("Logged in successfully!");
      } else if (data && data.error) {
        // Handle any error messages sent from the server
        setErrorMessage(data.error);
      }
    } catch (error) {
      // Handle fetch errors
      setErrorMessage("An error occurred while logging in. Please try again.");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleLogin}>Login</button>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default Login;
