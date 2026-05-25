import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div>
      <h1>ParkEase 🅿️</h1>
      <p>Find and book parking spots instantly</p>
      <Link to="/login">Get Started</Link>
    </div>
  )
}