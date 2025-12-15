import * as React from 'react';

interface EmailTemplateProps {
    message: string;
    senderEmail?: string;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
    message,
    senderEmail,
}) => (
    <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        backgroundColor: '#050505',
        color: '#ffffff',
        padding: '40px 20px',
        borderRadius: '10px',
    }}>
        <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            border: '1px solid #333',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#0a0a0a',
            boxShadow: '0 0 40px rgba(0, 240, 255, 0.1)',
        }}>
            {/* Header */}
            <div style={{
                backgroundColor: '#111',
                borderBottom: '1px solid #333',
                padding: '20px',
                textAlign: 'center',
            }}>
                <h2 style={{
                    margin: 0,
                    color: '#00F0FF',
                    letterSpacing: '2px',
                    fontSize: '20px',
                    textTransform: 'uppercase',
                }}>
                    {"// NEW TRANSMISSION"}
                </h2>
            </div>

            {/* Body */}
            <div style={{ padding: '30px' }}>
                <p style={{ color: '#888', fontSize: '12px', margin: '0 0 20px 0' }}>
                    FROM: <span style={{ color: '#fff' }}>{senderEmail || 'Anonymous User'}</span>
                </p>

                <div style={{
                    borderLeft: '2px solid #00F0FF',
                    paddingLeft: '20px',
                    margin: '20px 0',
                }}>
                    <p style={{
                        fontSize: '16px',
                        lineHeight: '1.6',
                        color: '#e0e0e0',
                        whiteSpace: 'pre-wrap',
                    }}>
                        {message}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                backgroundColor: '#111',
                borderTop: '1px solid #333',
                padding: '15px',
                textAlign: 'center',
                fontSize: '10px',
                color: '#555',
            }}>
                <p style={{ margin: 0 }}>SECURE CONNECTION ESTABLISHED</p>
                <p style={{ margin: '5px 0 0 0' }}>TIMESTAMP: {new Date().toLocaleString()}</p>
            </div>
        </div>
    </div>
);
