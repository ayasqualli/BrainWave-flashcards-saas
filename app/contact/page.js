'use client'; // Client Component

import React from 'react';

export default function ContactPage() {
  return (
    <>
      <meta charSet="utf-8" />
      <title>Contact Us - BrainWave</title>
      <meta name="description" content="Get in touch with BrainWave for any inquiries or support." />
      <link href="/styles/webflow-style.css" rel="stylesheet" type="text/css" />
      <div 
        className="page-wrapper" 
        style={{ 
          backgroundImage: 'url(/bg3.jpg)', // Replace with your image path
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh' // Ensures the background covers the full height
        }}
      >
        <main className="main-wrapper">
          <section className="section_contact">
            <div className="w-layout-blockcontainer padding-global padding-section-medium w-container">
              <div style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent background
                borderRadius: '10px', // Rounded corners
                padding: '20px', // Padding for spacing
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)', // Shadow for depth
                color: '#ffffff' // Text color
              }}>
                <h2 className="text-color-invert">Contact Us</h2>
                <p className="text-size-medium">We'd love to hear from you!</p>
                <div className="contact_info">
                  <div className="contact_item">
                    <strong>Phone:</strong>
                    <p>+1 (234) 567-8901</p>
                  </div>
                  <div className="contact_item">
                    <strong>Email:</strong>
                    <p><a href="mailto:info@brainwave.com" style={{ color: '#00ccff' }}>info@brainwave.com</a></p>
                  </div>
                  <div className="contact_item">
                    <strong>Instagram:</strong>
                    <p><a href="https://instagram.com/brainwave" target="_blank" rel="noopener noreferrer" style={{ color: '#00ccff' }}>@brainwave</a></p>
                  </div>
                </div>
                <div className="button-group align-center">
                  <a href="/signup" className="button is-primary w-button">Sign Up Now</a>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}