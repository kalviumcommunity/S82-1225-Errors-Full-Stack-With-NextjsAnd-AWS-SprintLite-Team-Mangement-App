'use client';

/**
 * API Documentation UI Page
 * 
 * This page displays the interactive Swagger UI for the SprintLite API.
 * It provides a user-friendly interface for exploring endpoints and testing requests.
 * 
 * Route: /api-documentation
 * Access: Public (read-only)
 */

import React, { useEffect, useRef } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import styles from './page.module.css';

export default function ApiDocumentation() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>SprintLite API Documentation</h1>
          <p className={styles.version}>Version 1.0.0 • Last Updated: January 29, 2026</p>
          <p className={styles.description}>
            Comprehensive API documentation for the SprintLite team management application.
            Explore endpoints, schemas, and test requests directly from your browser.
          </p>
        </div>
      </div>

      <div className={styles.swaggerContainer}>
        <SwaggerUI url="/api/docs" />
      </div>

      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <h3>Quick Links</h3>
          <ul>
            <li>
              <a href="/docs/ARCHITECTURE.md" target="_blank" rel="noopener noreferrer">
                Architecture Guide
              </a>
            </li>
            <li>
              <a href="/docs/postman_collection.json" download>
                Postman Collection
              </a>
            </li>
            <li>
              <a href="https://github.com/kalviumcommunity/S82-1225" target="_blank" rel="noopener noreferrer">
                GitHub Repository
              </a>
            </li>
          </ul>

          <h3>Authentication</h3>
          <ul>
            <li><strong>Type:</strong> Bearer Token (JWT)</li>
            <li><strong>Header:</strong> Authorization: Bearer {'{token}'}</li>
            <li><strong>Cookie:</strong> authToken (HTTP-only, Secure)</li>
          </ul>

          <h3>Base URLs</h3>
          <ul>
            <li><strong>Production:</strong> https://app.sprintlite.com</li>
            <li><strong>Staging:</strong> https://staging.sprintlite.com</li>
            <li><strong>Development:</strong> http://localhost:3000</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
