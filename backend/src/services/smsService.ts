import { config } from '../config/environment.js';
import logger from '../utils/logger.js';

interface SMSMessage {
  to: string;
  message: string;
  priority?: 'normal' | 'high' | 'emergency';
}

interface TwilioResponse {
  sid: string;
  status: string;
  errorCode?: string;
  errorMessage?: string;
}

export class SMSService {
  private static isConfigured(): boolean {
    return !!(config.TWILIO_ACCOUNT_SID && config.TWILIO_AUTH_TOKEN && config.TWILIO_PHONE_NUMBER);
  }

  /**
   * Send emergency SMS to contact
   */
  static async sendEmergencySMS(
    phoneNumber: string,
    contactName: string,
    userLocation: { latitude: number; longitude: number },
    alertType: string = 'route_deviation'
  ): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        logger.warn('SMS service not configured - logging emergency message');
        logger.error(`Emergency SMS would be sent to ${contactName} (${phoneNumber}): ${alertType} alert`);
        return false;
      }

      const locationText = `Location: https://maps.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}`;
      
      const emergencyMessage = this.buildEmergencyMessage(contactName, alertType, locationText);

      return await this.sendSMS({
        to: phoneNumber,
        message: emergencyMessage,
        priority: 'emergency'
      });

    } catch (error) {
      logger.error('Error sending emergency SMS:', error);
      return false;
    }
  }

  /**
   * Send SMS using Twilio
   */
  static async sendSMS(smsData: SMSMessage): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        logger.warn('SMS service not configured - message not sent');
        logger.info(`SMS would be sent to ${smsData.to}: ${smsData.message}`);
        return false;
      }

      // Create Twilio client
      const twilioClient = this.createTwilioClient();
      
      const message = await twilioClient.messages.create({
        body: smsData.message,
        from: config.TWILIO_PHONE_NUMBER,
        to: this.formatPhoneNumber(smsData.to)
      });

      logger.info(`SMS sent successfully: ${message.sid}`);
      return true;

    } catch (error: any) {
      logger.error('Error sending SMS:', {
        error: error.message,
        to: smsData.to,
        code: error.code
      });
      return false;
    }
  }

  /**
   * Send SMS to multiple recipients (emergency contacts)
   */
  static async sendBulkEmergencySMS(
    contacts: Array<{ name: string; phoneNumber: string; priority: number }>,
    userLocation: { latitude: number; longitude: number },
    alertType: string = 'emergency_alert'
  ): Promise<{ sent: number; failed: number; results: Array<{ contact: string; success: boolean }> }> {
    const results = [];
    let sent = 0;
    let failed = 0;

    // Sort contacts by priority (lower number = higher priority)
    const sortedContacts = contacts.sort((a, b) => a.priority - b.priority);

    for (const contact of sortedContacts) {
      try {
        const success = await this.sendEmergencySMS(
          contact.phoneNumber,
          contact.name,
          userLocation,
          alertType
        );

        results.push({
          contact: `${contact.name} (${contact.phoneNumber})`,
          success
        });

        if (success) {
          sent++;
        } else {
          failed++;
        }

        // Add small delay between messages to avoid rate limiting
        await this.delay(500);

      } catch (error) {
        logger.error(`Error sending SMS to ${contact.name}:`, error);
        results.push({
          contact: `${contact.name} (${contact.phoneNumber})`,
          success: false
        });
        failed++;
      }
    }

    logger.info(`Bulk SMS completed: ${sent} sent, ${failed} failed`);
    return { sent, failed, results };
  }

  /**
   * Send SOS alert status update
   */
  static async sendSOSStatusUpdate(
    phoneNumber: string,
    contactName: string,
    status: 'resolved' | 'escalated' | 'cancelled',
    userLocation?: { latitude: number; longitude: number }
  ): Promise<boolean> {
    try {
      let message = '';
      
      switch (status) {
        case 'resolved':
          message = `${contactName}, this is an update from Traveal Safety System. The emergency alert has been RESOLVED. The person is now safe and has confirmed their status.`;
          break;
        case 'escalated':
          message = `${contactName}, this is an URGENT update from Traveal Safety System. The emergency alert has been ESCALATED to authorities due to no response from the user.`;
          if (userLocation) {
            message += ` Last known location: https://maps.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}`;
          }
          break;
        case 'cancelled':
          message = `${contactName}, this is an update from Traveal Safety System. The emergency alert has been CANCELLED. False alarm - no assistance needed.`;
          break;
      }

      return await this.sendSMS({
        to: phoneNumber,
        message,
        priority: status === 'escalated' ? 'emergency' : 'high'
      });

    } catch (error) {
      logger.error('Error sending SOS status update:', error);
      return false;
    }
  }

  /**
   * Build emergency message text
   */
  private static buildEmergencyMessage(
    contactName: string,
    alertType: string,
    locationText: string
  ): string {
    const alertMessages = {
      'route_deviation': 'has deviated significantly from their planned route',
      'panic_button': 'has triggered a panic alert',
      'no_movement': 'has not moved for an extended period',
      'emergency_alert': 'has triggered an emergency alert',
      'manual_trigger': 'has manually triggered an SOS alert'
    };

    const alertDescription = alertMessages[alertType as keyof typeof alertMessages] || 'needs emergency assistance';

    return `EMERGENCY ALERT from Traveal Safety System: A person in your emergency contact list ${alertDescription}. Please check on them immediately. ${locationText}. If you cannot reach them, consider contacting local emergency services.`;
  }

  /**
   * Format phone number for international SMS
   */
  private static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let formatted = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present
    if (!formatted.startsWith('+')) {
      if (formatted.length === 10) {
        // Assume US number
        formatted = `+1${formatted}`;
      } else if (formatted.length === 11 && formatted.startsWith('1')) {
        // US number with country code
        formatted = `+${formatted}`;
      } else if (formatted.length === 10 && !formatted.startsWith('91')) {
        // Assume Indian number
        formatted = `+91${formatted}`;
      } else {
        // Add + if missing
        formatted = `+${formatted}`;
      }
    }

    return formatted;
  }

  /**
   * Create Twilio client (mock implementation for now)
   */
  private static createTwilioClient(): any {
    // In production, this would use the actual Twilio SDK:
    // const twilio = require('twilio');
    // return twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
    
    // Mock implementation for development/testing
    return {
      messages: {
        create: async (messageData: any) => {
          logger.info('Mock Twilio SMS:', messageData);
          
          // Simulate API call delay
          await this.delay(100);
          
          // Mock successful response
          return {
            sid: `SM${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
            status: 'queued',
            to: messageData.to,
            from: messageData.from,
            body: messageData.body
          };
        }
      }
    };
  }

  /**
   * Utility function for delays
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    // Basic validation for international phone numbers
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Get emergency number for country
   */
  static getEmergencyNumber(countryCode: string = 'DEFAULT'): string {
    return config.EMERGENCY_PHONE_NUMBERS[countryCode as keyof typeof config.EMERGENCY_PHONE_NUMBERS] || 
           config.EMERGENCY_PHONE_NUMBERS.DEFAULT;
  }
}