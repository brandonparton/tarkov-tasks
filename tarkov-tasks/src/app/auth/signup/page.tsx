"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push("/auth/signin");
    } else {
      alert("Signup failed");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto mt-20 p-6 bg-gray-800 rounded"
    >
      <h1 className="text-2xl mb-4">Sign Up</h1>
      <label className="block mb-2">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 mt-1 bg-gray-700 rounded"
        />
      </label>
      <label className="block mb-4">
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 mt-1 bg-gray-700 rounded"
        />
      </label>
      <button
        type="submit"
        className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded"
      >
        Sign Up
      </button>
      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <a href="/auth/signin" className="underline">
          Sign In
        </a>
      </p>
    </form>
  );
}
