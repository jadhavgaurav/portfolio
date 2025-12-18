
import * as React from 'react';

interface CreativeEmailTemplateProps {
    type: 'admin' | 'user';
    name: string;
    email: string;
    message: string;
}

export const CreativeEmailTemplate: React.FC<CreativeEmailTemplateProps> = ({
    type,
    name,
    email,
    message
}) => {
    const isDark = true;
    const bgColor = isDark ? '#050505' : '#ffffff';
    const textColor = isDark ? '#e0e0e0' : '#1a1a1a';
    const accentColor = '#00F0FF';
    const secondaryColor = '#D946EF';

    if (type === 'admin') {
        return (
            <div style={{
                fontFamily: '"Courier New", Courier, monospace',
                backgroundColor: bgColor,
                color: textColor,
                padding: '40px',
                borderRadius: '8px',
                border: `1px solid ${accentColor}`
            }}>
                <h1 style={{ color: accentColor, borderBottom: `1px dashed ${accentColor}`, paddingBottom: '10px' }}>
                    [NEW_TRANSMISSION_DETECTED]
                </h1>
                <div style={{ marginTop: '20px' }}>
                    <p><strong>// SOURCE_ID:</strong> {name}</p>
                    <p><strong>// FREQUENCY:</strong> {email}</p>
                    <p><strong>// TIMESTAMP:</strong> {new Date().toISOString()}</p>
                </div>
                <div style={{
                    marginTop: '30px',
                    padding: '20px',
                    backgroundColor: 'rgba(0, 240, 255, 0.05)',
                    borderLeft: `3px solid ${secondaryColor}`
                }}>
                    <h3 style={{ marginTop: 0, color: secondaryColor }}>// DECODED_PAYLOAD:</h3>
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{message}</p>
                </div>
                <div style={{ marginTop: '40px', fontSize: '12px', opacity: 0.6 }}>
                    END_OF_TRANSMISSION // ACT_ACCORDINGLY
                </div>
            </div>
        );
    }

    // User / Guest Template
    return (
        <div style={{
            fontFamily: '"Courier New", Courier, monospace',
            backgroundColor: bgColor,
            color: textColor,
            padding: '40px',
            borderRadius: '8px',
            border: `1px solid ${secondaryColor}`
        }}>
            <h1 style={{ color: secondaryColor, borderBottom: `1px dashed ${secondaryColor}`, paddingBottom: '10px' }}>
                [TRANSMISSION_ACKNOWLEDGED]
            </h1>
            <div style={{ marginTop: '20px' }}>
                <p>Hello <strong>{name}</strong>,</p>
                <p>This automated response confirms that your signal has been successfully intercepted by my neural network.</p>
            </div>

            <div style={{
                marginTop: '30px',
                padding: '20px',
                backgroundColor: 'rgba(217, 70, 239, 0.05)',
                border: `1px solid ${accentColor}`,
                borderRadius: '4px'
            }}>
                <p style={{ margin: 0, color: accentColor }}><strong>// LOGGED_MESSAGE:</strong></p>
                <p style={{ fontStyle: 'italic', opacity: 0.8 }}>"{message}"</p>
            </div>

            <p style={{ marginTop: '30px' }}>
                I am currently processing incoming data streams. Expect a response on this frequency ({email}) shortly.
            </p>

            <div style={{ marginTop: '40px', borderTop: `1px solid ${textColor}`, paddingTop: '20px', textAlign: 'center' }}>
                <p style={{ margin: 0, color: accentColor, fontWeight: 'bold' }}>GAURAV VIJAY JADHAV</p>
                <p style={{ margin: '5px 0', fontSize: '12px' }}>AI ENGINEER | DATA SCIENTIST</p>
                <a href="https://yourportal.com" style={{ color: secondaryColor, textDecoration: 'none', fontSize: '12px' }}>
                    View Portfolio //
                </a>
            </div>
        </div>
    );
};
