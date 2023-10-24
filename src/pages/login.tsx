import React, { useState } from "react";
import Link from "next/link";

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
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <p className="text-gray-600 mb-1">WELCOME BACK</p>
        <h1 className="text-2xl font-bold mb-4">Log In to your Account</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <input
            className="mb-2 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <input
            className="mb-4 p-2 w-full border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />

          <div className="flex justify-between items-center mb-4">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-gray-600">Remember me</span>
            </label>
            <span className="text-blue-500 cursor-pointer underline">
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded focus:outline-none hover:bg-gray-700 mb-4"
          >
            CONTINUE
          </button>

          <div className="text-center">
            <span className="text-gray-600 mb-4">Or</span>
            <p className="text-blue-500 cursor-pointer underline">
              New User? <Link href="/signup">SIGN UP HERE</Link>
            </p>
          </div>

          {errorMessage && <p className="mt-4 text-red-500">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
