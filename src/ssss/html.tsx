import { encodePartToBase64, type Part } from './shamir.tsx';

export function partToHTMLEmbeddable(part: Part, color?: string): string {
  const metadata = part.metadata;
  const headerColor = color || '#f97316';
  const metadataColor = color || '#a855f7';

  return `
    <style>
      .part-container {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #333;
        padding: 8px;
      }
      
      .part-header {
        background: linear-gradient(135deg, ${headerColor} 0%, ${headerColor}dd 100%);
        color: white;
        padding: 12px 16px;
        text-align: center;
        margin-bottom: 8px;
        border-radius: 6px;
      }
      
      .part-header h1 {
        margin: 0;
        font-size: 16px;
        font-weight: bold;
      }
      
      .part-header h2 {
        margin: 4px 0 0 0;
        font-size: 11px;
        font-weight: normal;
        opacity: 0.9;
      }
      
      .part-metadata {
        background: #f8fafc;
        border: 2px solid ${metadataColor};
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 8px;
      }
      
      .part-metadata h3 {
        color: ${metadataColor};
        margin: 0 0 10px 0;
        font-size: 13px;
        display: flex;
        align-items: center;
      }
      
      .part-metadata-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      
      .part-metadata-item {
      }
      
      .part-metadata-label {
        font-weight: bold;
        color: #4b5563;
        margin-bottom: 2px;
      }
      
      .part-metadata-value {
        font-family: 'Courier New', monospace;
        font-size: 9px;
        color: #1f2937;
        word-break: break-all;
        background: white;
        padding: 6px;
        border-radius: 3px;
        border: 1px solid #e5e7eb;
      }
      
      .part-secret-data {
        background: #f0f9ff;
        border: 2px solid #0ea5e9;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 16px;
      }
      
      .part-secret-data h3 {
        color: #0ea5e9;
        margin: 0 0 10px 0;
        font-size: 13px;
        display: flex;
        align-items: center;
      }
      
      .part-secret-value {
        font-family: 'Courier New', monospace;
        font-size: 7px;
        line-height: 1.3;
        background: white;
        padding: 10px;
        border-radius: 3px;
        border: 1px solid #d1d5db;
        word-break: break-all;
        max-height: 250px;
        overflow-wrap: break-word;
      }
      
      .part-footer {
        text-align: center;
        margin-top: 12px;
        padding: 12px;
        background: #fee2e2;
        border-radius: 6px;
        border: 1px solid #fecaca;
      }
      
      .part-footer p {
        margin: 0;
        color: #dc2626;
        font-weight: bold;
        font-size: 10px;
      }
      
      .part-icon {
        margin-right: 8px;
        font-size: 13px;
      }
    </style>
    
    <div class="part-container">
      <div class="part-header">
        <h1>🔐 Password Split</h1>
        <h2>Part ${part.position} of ${part.metadata.totalParts}</h2>
      </div>
      
      <div class="part-metadata">
        <h3><span class="part-icon">📊</span>Metadata</h3>
        <div class="part-metadata-grid">
          <div class="part-metadata-item">
            <div class="part-metadata-label">Scheme ID:</div>
            <div class="part-metadata-value">${metadata.schemeId}</div>
          </div>
          <div class="part-metadata-item">
            <div class="part-metadata-label">Total Parts:</div>
            <div class="part-metadata-value">${metadata.totalParts}</div>
          </div>
          <div class="part-metadata-item">
            <div class="part-metadata-label">Threshold:</div>
            <div class="part-metadata-value">${metadata.threshold}</div>
          </div>
          <div class="part-metadata-item">
            <div class="part-metadata-label">Created:</div>
            <div class="part-metadata-value">${new Date(metadata.createdAt).toLocaleString('en-US', {
              timeZoneName: 'short',
              year: 'numeric',
              month: 'long',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}</div>
          </div>
          <div class="part-metadata-item">
            <div class="part-metadata-label">Version:</div>
            <div class="part-metadata-value">${metadata.version}</div>
          </div>
          ${
            metadata.description
              ? `
          <div class="part-metadata-item" style="grid-column: 1 / -1;">
            <div class="part-metadata-label">Description:</div>
            <div class="part-metadata-value">${metadata.description}</div>
          </div>
          `
              : ''
          }
        </div>
      </div>
      
      <div class="part-secret-data">
        <h3><span class="part-icon">🔗</span>Password Part</h3>
        <div class="part-secret-value">${encodePartToBase64(part)}</div>
      </div>
      
      <div class="part-footer">
        <p>⚠️ Keep this password part secure and private</p>
      </div>
    </div>
  `;
}

export function partToHTML(part: Part): string {
  const embeddableContent = partToHTMLEmbeddable(part);
  const sanitizedDescription = part.metadata.description
    ? part.metadata.description
        .slice(0, 50)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
    : '';
  const title = sanitizedDescription ? `${sanitizedDescription}_Part_${part.position}` : `Shamir Password Share - Part ${part.position}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        @page {
          margin: 25mm;
          size: A4;
        }
        
        body {
          margin: 0;
          padding: 0;
        }
        
        @media print {
          body { print-color-adjust: exact; }
          .part-container, .part-header, .part-metadata, .part-secret-data, .part-footer { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      ${embeddableContent}
    </body>
    </html>
  `;
}

export function partsToHTML(parts: Part[]): string {
  const metadata = parts[0]?.metadata;
  const colors = [
    '#f97316', // orange
    '#f56565', // red
    '#a855f7', // purple
    '#3b82f6', // blue
    '#10b981', // emerald
  ];
  const sanitizedDescription = metadata?.description
    ? metadata.description
        .slice(0, 50)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
    : '';
  const title = sanitizedDescription ? `${sanitizedDescription}_Password_Parts` : `Password Split - Secure Password Parts`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        @page {
          margin: 25mm;
          size: A4;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
          line-height: 1.6;
        }
        
        .cover-page {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
          color: white;
          text-align: center;
          page-break-after: always;
        }
        
        .cover-title {
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        
        .cover-subtitle {
          font-size: 20px;
          margin-bottom: 40px;
          opacity: 0.9;
        }
        
        .cover-info {
          font-size: 16px;
          margin: 10px 0;
        }
        
        .cover-scheme {
          font-size: 14px;
          margin-top: 30px;
          opacity: 0.8;
          font-family: 'Courier New', monospace;
        }
        
        .warning-box {
          background: rgba(220, 38, 127, 0.9);
          padding: 30px;
          border-radius: 12px;
          margin-top: 50px;
          max-width: 500px;
        }
        
        .warning-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        
        .warning-text {
          font-size: 14px;
          line-height: 1.8;
          margin: 5px 0;
        }
        
        .part-page {
          page-break-before: always;
          min-height: 100vh;
        }
        
        .page-number {
          text-align: center;
          margin-top: 20px;
          color: #6b7280;
          font-size: 12px;
        }
        
        @media print {
          body { print-color-adjust: exact; }
          .cover-page, .part-page { break-inside: avoid; }
          .part-container, .part-header, .part-metadata, .part-secret-data, .part-footer { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <!-- Cover Page -->
      <div class="cover-page">
        <div class="cover-title">🔐 Password Split</div>
        <div class="cover-subtitle">Secure Password Parts</div>
        
        <div class="cover-info">${parts.length} Parts Generated</div>
        <div class="cover-info">${metadata.threshold} Parts Required for Reconstruction</div>
        <div class="cover-info">Created: ${new Date(metadata.createdAt).toLocaleString('en-US', {
          timeZoneName: 'short',
          year: 'numeric',
          month: 'long',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}</div>
        
        <div class="cover-scheme">Scheme ID: ${metadata.schemeId}</div>
        <div class="cover-scheme">Generated with https://passwordsplit.com</div>
        
        <div class="warning-box">
          <div class="warning-title">⚠️ SECURITY NOTICE</div>
          <div class="warning-text">• Keep each part separate and secure</div>
          <div class="warning-text">• Do not store all parts together</div>
          <div class="warning-text">• Any ${metadata.threshold} parts can reconstruct the password</div>
          <div class="warning-text">• Treat each part as highly confidential</div>
        </div>
      </div>
      
      ${parts
        .map(
          (part, index) => `
      <div class="part-page">
        ${partToHTMLEmbeddable(part, colors[index % colors.length])}
      </div>`
        )
        .join('')}
    </body>
    </html>
  `;
}
