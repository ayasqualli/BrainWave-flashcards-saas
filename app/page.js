'use client' // Client Component

import React from 'react';
import getStripe from "../utils/get-stripe";
import { useAuth } from "@clerk/nextjs"; // Import useAuth

export default function HomePage() {
  const { isSignedIn } = useAuth(); // Get the authentication status
  const handleSubmit = async (plan) => {
    const checkoutSession = await fetch('/api/checkout_sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const checkoutSessionJson = await checkoutSession.json()
  
    const stripe = await getStripe();
    const {error} = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    })
  
    if (error) {
      console.warn(error.message)
    }
  }

  return (
    <>
      <meta charSet="utf-8" />
      <title>BrainWave - AI Flashcards Generator</title>
      <meta
        content="BrainWave helps you generate flashcards effortlessly using AI, allowing you to study smart, not hard."
        name="description"
      />
      <meta content="BrainWave - AI Flashcards Generator" property="og:title" />
      <meta
        content="BrainWave helps you generate flashcards effortlessly using AI, allowing you to study smart, not hard."
        property="og:description"
      />
      <meta content="images/og.png" property="og:image" />
      <meta content="BrainWave - AI Flashcards Generator" property="twitter:title" />
      <meta
        content="BrainWave helps you generate flashcards effortlessly using AI, allowing you to study smart, not hard."
        property="twitter:description"
      />
      <meta content="images/og.png" property="twitter:image" />
      <meta property="og:type" content="website" />
      <meta content="summary_large_image" name="twitter:card" />
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <meta content="Webflow" name="generator" />
      <link href="/styles/webflow-style.css" rel="stylesheet" type="text/css" />
      <link href="https://fonts.googleapis.com" rel="preconnect" />
      <link
        href="https://fonts.gstatic.com"
        rel="preconnect"
        crossOrigin="anonymous"
      />
      <link href="../favicon.ico" rel="shortcut icon" type="image/x-icon" />
      <link href="../favicon.ico" rel="apple-touch-icon" />
      {/* Please keep this css code to improve the font quality*/}
      <style
        dangerouslySetInnerHTML={{
          __html:
            "\n  * {\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n"
        }}
      />
      <div className="page-wrapper">
        <div className="global-styles w-embed">
          <style
            dangerouslySetInnerHTML={{
              __html:
                '\n\n/* Custom global styles for BrainWave */\n\n'
            }}
          />
        </div>
        <div
          data-animation="default"
          className="navbar_component w-nav"
          data-easing2="ease"
          fs-scrolldisable-element="smart-nav"
          data-easing="ease"
          data-collapse="medium"
          role="banner"
          data-duration={400}
        >
          <div className="w-layout-blockcontainer padding-global w-container">
            <div className="navbar_container">
              <a
                href="/"
                aria-current="page"
                className="navbar_logo-link w-nav-brand w--current"
              >
                <img
                  src="images/logo.png"
                  loading="lazy"
                  height={20}
                  width={300}
                  alt="BrainWave Logo"
                  className="navbar_logo"
                />
              </a>
              <nav role="navigation" className="navbar_menu w-nav-menu">
                <div className="navbar_menu-left">
                  <a href="/signin" className="navbar_link w-nav-link">
                    Sign-in
                  </a>
                  <a href="/signup" className="navbar_link w-nav-link">
                    Sign-up
                  </a>
                  {isSignedIn && ( // Conditionally render the button if signed in
                    <a href="/flashcards" className="navbar_link w-nav-link">
                      Go to Flashcards
                    </a>
                  )}
                </div>
                <div className="navbar_menu-right" />
              </nav>
              <div className="navbar_menu-button w-nav-button">
                <div className="menu-icon">
                  <div className="menu-icon_line-top" />
                  <div className="menu-icon_line-middle">
                    <div className="menu-icon_line-middle-inner" />
                  </div>
                  <div className="menu-icon_line-bottom" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <main className="main-wrapper">
          <section className="section_hero">
            <div className="w-layout-blockcontainer padding-global padding-section-hero w-container">
              <div className="hero_wrapper">
                <div className="hero_column-wrapper">
                  <div className="hero_text">
                    <h1>
                      Study smart, not hard with{" "}
                      <span className="text-color-highlighted">BrainWave.</span>
                    </h1>
                    <div className="hero_text-paragraph">
                      <p>Generate flashcards effortlessly using our AI-powered tool.</p>
                    </div>
                  </div>
                  <div className="button-group">
                    <a href="/signup" className="button is-icon w-inline-block">
                      <div className="text-weight-semibold text-size-regular">
                        Get started
                      </div>
                      <div className="icon-embed-xsmall w-embed">
                        <svg
                          id="Layer_1"
                          data-name="Layer 1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 16 16"
                        >
                          <defs>
                            <style
                              dangerouslySetInnerHTML={{
                                __html:
                                  "\n      .cls-1 {\n        fill: currentcolor;\n        stroke-width: 0px;\n      }\n    "
                              }}
                            />
                          </defs>
                          <polygon
                            className="cls-1"
                            points="8.35 15.35 7.65 14.65 14.29 8 7.65 1.35 8.35 .65 15.71 8 8.35 15.35"
                          />
                          <rect
                            className="cls-1"
                            x={1}
                            y="7.5"
                            width={14}
                            height={1}
                          />
                        </svg>
                      </div>
                    </a>
                  </div>
                </div>
                <div className="hero_image-wrapper">
                  <img
                    className="img_hero-mobile"
                    src="images/hero_img.webp"
                    alt="BrainWave AI Flashcards"
                    loading="lazy"
                    srcSet="images/hero_img-p-500.webp 500w, images/hero_img-p-800.webp 800w, images/hero_img.webp 1000w"
                  />
                </div>
              </div>
            </div>
          </section>
          <section className="section_features">
            <div className="w-layout-blockcontainer padding-global padding-section-medium w-container">
              <div className="features_wrapper">
                <h2 className="heading-style-h6">BrainWave features</h2>
                <h3>Enhance your learning experience with smart flashcards.</h3>
                <div className="mainfeatures_component">
                  <div className="mainfeatures_tabs w-tabs">
                    <div className="mainfeatures_tabs-menu w-tab-menu">
                      <a
                        data-w-tab="Tab 1"
                        className="mainfeatures_tabs-link w-inline-block w-tab-link"
                      />
                      <a
                        data-w-tab="Tab 2"
                        className="mainfeatures_tabs-link w-inline-block w-tab-link"
                      />
                      <a
                        data-w-tab="Tab 3"
                        className="mainfeatures_tabs-link w-inline-block w-tab-link w--current"
                      />
                    </div>
                    <div className="mainfeatures_tabs-content w-tab-content">
                      <div
                        data-w-tab="Tab 1"
                        className="mainfeatures_tabs-pane w-tab-pane"
                      >
                        <div className="w-layout-grid mainfeatures_pane-content">
                          <div className="mainfeatures_image-wrapper">
                            <img
                              sizes="(max-width: 479px) 77vw, (max-width: 767px) 82vw, (max-width: 991px) 42vw, 45vw"
                              srcSet="images/blobs3-p-500.webp 500w, images/blobs3-p-800.webp 800w, images/blobs3-p-1080.webp 1080w, images/blobs3-p-1600.webp 1600w, images/blobs3.webp 2000w"
                              src="images/blobs3.webp"
                              loading="lazy"
                              alt="Smart Learning Features"
                              className="mainfeatures_image"
                            />
                          </div>
                          <div className="mainfeatures_content-wrapper">
                            <div className="mainfeatures_content">
                              <h3 className="heading-style-h3">
                                Smart Learning
                              </h3>
                              <p className="text-size-regular">
                                Generate tailored flashcards based on your study material.
                              </p>
                            </div>
                            <div className="button-group">
                              <a
                                href="/signup"
                                className="button is-secondary text-size-regular text-weight-semibold w-button"
                              >
                                Try out BrainWave
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        data-w-tab="Tab 2"
                        className="mainfeatures_tabs-pane w-tab-pane"
                      >
                        <div className="w-layout-grid mainfeatures_pane-content">
                          <div className="mainfeatures_image-wrapper">
                            <img
                              sizes="(max-width: 479px) 77vw, (max-width: 767px) 82vw, (max-width: 991px) 42vw, 45vw"
                              srcSet="images/blobs2-p-500.webp 500w, images/blobs2-p-800.webp 800w, images/blobs2-p-1080.webp 1080w, images/blobs2.webp 1500w"
                              src="images/blobs2.webp"
                              loading="lazy"
                              alt="Effortless Flashcard Generation"
                              className="mainfeatures_image"
                            />
                          </div>
                          <div className="mainfeatures_content-wrapper">
                            <div className="mainfeatures_content">
                              <h3 className="heading-style-h3">
                                Effortless Generation
                              </h3>
                              <p className="text-size-regular">
                                Simply upload your content and let our AI generate flashcards for you.
                              </p>
                            </div>
                            <div className="button-group">
                              <a
                                href="/signup"
                                className="button is-secondary text-size-regular text-weight-semibold w-button"
                              >
                                Try it for free
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        data-w-tab="Tab 3"
                        className="mainfeatures_tabs-pane w-tab-pane w--tab-active"
                      >
                        <div className="w-layout-grid mainfeatures_pane-content">
                          <div className="mainfeatures_image-wrapper">
                            <img
                              sizes="(max-width: 479px) 77vw, (max-width: 767px) 82vw, (max-width: 991px) 42vw, 45vw"
                              srcSet="images/blobs2-p-500.webp 500w, images/blobs2-p-800.webp 800w, images/blobs2-p-1080.webp 1080w, images/blobs2.webp 1500w"
                              src="images/blobs2.webp"
                              loading="lazy"
                              alt="Track Progress"
                              className="mainfeatures_image"
                            />
                          </div>
                          <div className="mainfeatures_content-wrapper">
                            <div className="mainfeatures_content">
                              <h3 className="heading-style-h3">
                                Track Your Progress
                              </h3>
                              <p>
                                Monitor how much you have learned and what needs more attention.
                              </p>
                            </div>
                            <div className="button-group">
                              <a
                                href="/signup"
                                className="button is-secondary text-size-regular text-weight-semibold w-button"
                              >
                                Get started
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="button-group align-center">
                  <a href="/signup" className="button is-secondary w-button">
                    Get started free
                  </a>
                </div>
              </div>
            </div>
          </section>
          <section className="section_pricing">
            <div className="w-layout-blockcontainer padding-global padding-section-medium w-container">
              <div className="pricing_wrapper">
                <h2 className="text-color-dark">Choose Your Plan</h2>
                <p className="text-size-medium">Flexible pricing options to suit your needs.</p>
                <div className="pricing_options grid">
                  <div className="pricing_option card">
                    <h3>Basic Plan</h3>
                    <p className="price">Free</p>
                    <p>Access to basic features.</p>
                    <div className="button-group">
                      <a href="/signup" className="button w-button">Get Started</a>
                    </div>
                  </div>
                  <div className="pricing_option card highlighted">
                    <h3>Pro Plan</h3>
                    <p className="price">$9.99/month</p>
                    <p>Access to all features and priority support.</p>
                    <div className="button-group">
                      <button className="button w-button" onClick={() => handleSubmit('pro')}>Get Started</button>
                    </div>
                  </div>
                  <div className="pricing_option card">
                    <h3>Enterprise Plan</h3>
                    <p className="price">Contact us for pricing</p>
                    <p>Custom solutions for your organization.</p>
                    <div className="button-group">
                      <button className="button w-button" onClick={() => handleSubmit('enterprise')}>Contact Us</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}