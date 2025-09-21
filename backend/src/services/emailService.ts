import { config } from '../config/environment.js';
import logger from '../utils/logger.js';

interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
  priority?: 'normal' | 'high' | 'emergency';
}

interface EmailContact {
  name: string;
  email: string;
  priority: number;
}

export class EmailService {
  private static isConfigured(): boolean {
    return !!(config.SENDGRID_API_KEY && config.FROM_EMAIL);
  }

  /**
   * Send emergency email to contact
   */
  static async sendEmergencyEmail(
    email: string,
    contactName: string,
    userLocation: { latitude: number; longitude: number },
    alertType: string = 'route_deviation',
    additionalInfo?: any
  ): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        logger.warn('Email service not configured - logging emergency message');
        logger.error(`Emergency email would be sent to ${contactName} (${email}): ${alertType} alert`);
        return false;
      }

      const locationUrl = `https://maps.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}`;
      
      const emailData = this.buildEmergencyEmail(
        contactName,
        alertType,
        userLocation,
        locationUrl,
        additionalInfo
      );

      return await this.sendEmail({
        to: email,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
        priority: 'emergency'
      });

    } catch (error) {
      logger.error('Error sending emergency email:', error);
      return false;
    }
  }

  /**
   * Send email using SendGrid
   */
  static async sendEmail(emailData: EmailMessage): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        logger.warn('Email service not configured - message not sent');
        logger.info(`Email would be sent to ${emailData.to}: ${emailData.subject}`);
        return false;
      }

      // Create SendGrid message
      const message = {
        to: emailData.to,
        from: {
          email: config.FROM_EMAIL,
          name: 'Traveal Safety System'
        },
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html || this.convertTextToHtml(emailData.text),
        priority: this.mapPriorityToSendGrid(emailData.priority)
      };

      // Send email via SendGrid
      const result = await this.sendViaSendGrid(message);
      
      if (result.success) {
        logger.info(`Email sent successfully to ${emailData.to}`);
        return true;
      } else {
        logger.error(`Failed to send email to ${emailData.to}:`, result.error);
        return false;
      }

    } catch (error: any) {
      logger.error('Error sending email:', {
        error: error.message,
        to: emailData.to,
        subject: emailData.subject
      });
      return false;
    }
  }

  /**
   * Send email to multiple emergency contacts
   */
  static async sendBulkEmergencyEmail(
    contacts: EmailContact[],
    userLocation: { latitude: number; longitude: number },
    alertType: string = 'emergency_alert',
    additionalInfo?: any
  ): Promise<{ sent: number; failed: number; results: Array<{ contact: string; success: boolean }> }> {
    const results = [];
    let sent = 0;
    let failed = 0;

    // Sort contacts by priority (lower number = higher priority)
    const sortedContacts = contacts
      .filter(contact => contact.email && this.isValidEmail(contact.email))
      .sort((a, b) => a.priority - b.priority);

    for (const contact of sortedContacts) {
      try {
        const success = await this.sendEmergencyEmail(
          contact.email,
          contact.name,
          userLocation,
          alertType,
          additionalInfo
        );

        results.push({
          contact: `${contact.name} (${contact.email})`,
          success
        });

        if (success) {
          sent++;
        } else {
          failed++;
        }

        // Add small delay between emails to avoid rate limiting
        await this.delay(200);

      } catch (error) {
        logger.error(`Error sending email to ${contact.name}:`, error);
        results.push({
          contact: `${contact.name} (${contact.email})`,
          success: false
        });
        failed++;
      }
    }

    logger.info(`Bulk email completed: ${sent} sent, ${failed} failed`);
    return { sent, failed, results };
  }

  /**
   * Send SOS status update email
   */
  static async sendSOSStatusUpdateEmail(
    email: string,
    contactName: string,
    status: 'resolved' | 'escalated' | 'cancelled',
    userLocation?: { latitude: number; longitude: number },
    resolvedBy?: string
  ): Promise<boolean> {
    try {
      const statusData = this.buildStatusUpdateEmail(
        contactName,
        status,
        userLocation,
        resolvedBy
      );

      return await this.sendEmail({
        to: email,
        subject: statusData.subject,
        text: statusData.text,
        html: statusData.html,
        priority: status === 'escalated' ? 'emergency' : 'high'
      });

    } catch (error) {
      logger.error('Error sending SOS status update email:', error);
      return false;
    }
  }

  /**
   * Build emergency email content
   */
  private static buildEmergencyEmail(
    contactName: string,
    alertType: string,
    userLocation: { latitude: number; longitude: number },
    locationUrl: string,
    additionalInfo?: any
  ): { subject: string; text: string; html: string } {
    const alertTitles = {
      'route_deviation': 'Route Deviation Alert',
      'panic_button': 'Panic Button Activated',
      'no_movement': 'No Movement Detected',
      'emergency_alert': 'Emergency Alert',
      'manual_trigger': 'Manual SOS Alert'
    };

    const alertDescriptions = {
      'route_deviation': 'has deviated significantly from their planned route',
      'panic_button': 'has activated the panic button',
      'no_movement': 'has not moved for an extended period',
      'emergency_alert': 'has triggered an emergency alert',
      'manual_trigger': 'has manually triggered an SOS alert'
    };

    const subject = `🚨 EMERGENCY: ${alertTitles[alertType as keyof typeof alertTitles] || 'Safety Alert'}`;
    const alertDescription = alertDescriptions[alertType as keyof typeof alertDescriptions] || 'needs emergency assistance';

    const text = `
EMERGENCY ALERT - Traveal Safety System

Dear ${contactName},

This is an urgent emergency notification from the Traveal Safety System.

ALERT DETAILS:
- A person in your emergency contact list ${alertDescription}
- Time: ${new Date().toLocaleString()}
- Location: ${locationUrl}
- Coordinates: ${userLocation.latitude}, ${userLocation.longitude}

IMMEDIATE ACTION REQUIRED:
1. Try to contact them immediately via phone
2. If you cannot reach them, consider visiting their location
3. If the situation appears serious, contact local emergency services

This is an automated alert from the Traveal Safety System. Please do not reply to this email.

For emergency services in your area, dial:
- India: 112
- US: 911
- UK: 999
- EU: 112

Stay safe,
Traveal Safety Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emergency Alert</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .alert-box { background-color: #fef2f2; border: 2px solid #fecaca; border-radius: 6px; padding: 15px; margin: 20px 0; }
        .location-btn { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .emergency-numbers { background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 EMERGENCY ALERT</h1>
            <p>${alertTitles[alertType as keyof typeof alertTitles] || 'Safety Alert'}</p>
        </div>
        
        <div class="content">
            <p>Dear <strong>${contactName}</strong>,</p>
            
            <div class="alert-box">
                <p><strong>A person in your emergency contact list ${alertDescription}</strong></p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Location:</strong> ${userLocation.latitude}, ${userLocation.longitude}</p>
            </div>
            
            <a href="${locationUrl}" class="location-btn" target="_blank">📍 View Location on Map</a>
            
            <h3>Immediate Action Required:</h3>
            <ol>
                <li>Try to contact them immediately via phone</li>
                <li>If you cannot reach them, consider visiting their location</li>
                <li>If the situation appears serious, contact local emergency services</li>
            </ol>
            
            <div class="emergency-numbers">
                <h4>Emergency Numbers:</h4>
                <ul>
                    <li>India: 112</li>
                    <li>US: 911</li>
                    <li>UK: 999</li>
                    <li>EU: 112</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>This is an automated alert from the Traveal Safety System. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Traveal Safety Team</p>
        </div>
    </div>
</body>
</html>
    `;

    return { subject, text, html };
  }

  /**
   * Build status update email content
   */
  private static buildStatusUpdateEmail(
    contactName: string,
    status: 'resolved' | 'escalated' | 'cancelled',
    userLocation?: { latitude: number; longitude: number },
    resolvedBy?: string
  ): { subject: string; text: string; html: string } {
    const statusInfo = {
      resolved: {
        subject: '✅ Emergency Alert RESOLVED',
        title: 'Emergency Alert Resolved',
        message: 'The emergency alert has been RESOLVED. The person is now safe and has confirmed their status.',
        color: '#059669'
      },
      escalated: {
        subject: '🚨 Emergency Alert ESCALATED',
        title: 'Emergency Alert Escalated',
        message: 'The emergency alert has been ESCALATED to authorities due to no response from the user.',
        color: '#dc2626'
      },
      cancelled: {
        subject: '❌ Emergency Alert CANCELLED',
        title: 'Emergency Alert Cancelled',
        message: 'The emergency alert has been CANCELLED. False alarm - no assistance needed.',
        color: '#6b7280'
      }
    };

    const info = statusInfo[status];
    const locationText = userLocation ? 
      `Last known location: https://maps.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}` : '';

    const text = `
Emergency Alert Update - Traveal Safety System

Dear ${contactName},

${info.message}

${resolvedBy ? `Resolved by: ${resolvedBy}` : ''}
${locationText}

Time: ${new Date().toLocaleString()}

Thank you for being part of our emergency contact network.

Traveal Safety Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; }
        .header { background-color: ${info.color}; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${info.title}</h1>
        </div>
        <div class="content">
            <p>Dear <strong>${contactName}</strong>,</p>
            <p>${info.message}</p>
            ${resolvedBy ? `<p><strong>Resolved by:</strong> ${resolvedBy}</p>` : ''}
            ${locationText ? `<p><strong>Location:</strong> <a href="${locationText}">${locationText}</a></p>` : ''}
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p>Thank you for being part of our emergency contact network.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Traveal Safety Team</p>
        </div>
    </div>
</body>
</html>
    `;

    return { subject: info.subject, text, html };
  }

  /**
   * Send email via SendGrid (mock implementation)
   */
  private static async sendViaSendGrid(message: any): Promise<{ success: boolean; error?: any }> {
    try {
      // In production, this would use the actual SendGrid SDK:
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(config.SENDGRID_API_KEY);
      // const result = await sgMail.send(message);
      // return { success: true };
      
      // Mock implementation for development/testing
      logger.info('Mock SendGrid email:', {
        to: message.to,
        subject: message.subject,
        from: message.from
      });
      
      // Simulate API call delay
      await this.delay(200);
      
      return { success: true };

    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Convert text to basic HTML
   */
  private static convertTextToHtml(text: string): string {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  /**
   * Map priority to SendGrid priority
   */
  private static mapPriorityToSendGrid(priority?: string): number {
    const priorityMap = {
      'emergency': 1,
      'high': 2,
      'normal': 3
    };
    return priorityMap[priority as keyof typeof priorityMap] || 3;
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Utility function for delays
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}