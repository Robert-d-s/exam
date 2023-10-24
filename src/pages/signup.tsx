import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const Signup: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) {
        console.log("Signup successful. Redirecting to login...");
        router.push("/login");
      } else {
        console.error("Signup failed:", await response.text());
      }
    } catch (error) {
      console.error("Error during signup:", error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
      <div className="p-10 bg-white shadow-xl rounded-xl w-96">
        <h1 className="text-center text-xl font-semibold mb-6">
          LET&apos;S GET YOU STARTED
        </h1>
        <h2 className="text-center text-lg mb-8">Create an Account</h2>
        <form onSubmit={handleSignup}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="mb-4 w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="mb-4 w-full p-3 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            className="w-full p-3 bg-black text-white rounded-md mb-4"
          >
            GET STARTED
          </button>
        </form>
        <div className="flex justify-center">
          <span>
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 underline">
              LOGIN HERE
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
