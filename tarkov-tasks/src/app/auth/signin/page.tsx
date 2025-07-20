"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.ok) {
      router.push("/test"); // or home
    } else {
      alert("Invalid credentials");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto mt-20 p-6 bg-gray-800 rounded"
    >
      <h1 className="text-2xl mb-4">Sign In</h1>
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
        className="w-full py-2 bg-green-600 hover:bg-green-500 rounded"
      >
        Sign In
      </button>
      <p className="mt-4 text-sm">
        Don’t have an account?{" "}
        <a href="/auth/signup" className="underline">
          Sign Up
        </a>
      </p>
    </form>
  );
}
