"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import './page.css';
import {router} from "next/client";

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        await router.push('/home');
        // Handle successful login (e.g., redirect to another page)
      } else {
        console.error('Login failed');
        // Handle login failure
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1>Welcome to Optidrive</h1>
        <p>Your Secure Local Image and Media Storage Solution</p>
      </header>

      <main className="landing-main">
        <section className="landing-intro">
          <h2>About Optidrive</h2>
          <p>Optidrive offers a secure and efficient way to store your images and media locally. Enjoy fast access and complete privacy with our user-friendly interface.</p>
        </section>

        <section className="login-form">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Login</button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;