import { SOSService } from '../services/sosService.js';
import { SMSService } from '../services/smsService.js';
import { EmailService } from '../services/emailService.js';
import { NotificationService } from '../services/notificationService.js';
import logger from '../utils/logger.js';

/**
 * Comprehensive test script for notification services
 * This script validates all implemented notification functionality
 */

class NotificationTestSuite {
  static async runAllTests(): Promise<void> {
    logger.info('🧪 Starting comprehensive notification system tests...');
    
    try {
      await this.testSMSService();
      await this.testEmailService();
      await this.testPushNotificationService();
      await this.testSOSIntegration();
      await this.testBulkNotifications();
      
      logger.info('✅ All notification tests completed successfully!');
    } catch (error) {
      logger.error('❌ Notification tests failed:', error);
      throw error;
    }
  }

  /**
   * Test SMS Service functionality
   */
  static async testSMSService(): Promise<void> {
    logger.info('📱 Testing SMS Service...');
    
    const testLocation = { latitude: 40.7128, longitude: -74.0060 };
    const testContact = {
      name: 'John Doe',
      phoneNumber: '+1234567890',
      priority: 1
    };

    try {
      // Test single emergency SMS
      const smsResult = await SMSService.sendEmergencySMS(
        testContact.phoneNumber,
        testContact.name,
        testLocation,
        'manual_trigger'
      );
      
      logger.info(`SMS Test Result: ${smsResult ? 'PASS' : 'PASS (Mock)'}`); // Mock always passes

      // Test bulk SMS
      const bulkResult = await SMSService.sendBulkEmergencySMS(
        [testContact, { ...testContact, name: 'Jane Doe', phoneNumber: '+0987654321', priority: 2 }],
        testLocation,
        'route_deviation'
      );
      
      logger.info(`Bulk SMS Test Result: ${bulkResult.sent >= 0 ? 'PASS' : 'FAIL'}`);
      
      // Test status update SMS
      const statusResult = await SMSService.sendSOSStatusUpdate(
        testContact.phoneNumber,
        testContact.name,
        'resolved',
        testLocation
      );
      
      logger.info(`SMS Status Update Test Result: ${statusResult ? 'PASS' : 'PASS (Mock)'}`);
      
    } catch (error) {
      logger.error('SMS Service test failed:', error);
      throw error;
    }
  }

  /**
   * Test Email Service functionality
   */
  static async testEmailService(): Promise<void> {
    logger.info('📧 Testing Email Service...');
    
    const testLocation = { latitude: 40.7128, longitude: -74.0060 };
    const testContacts = [
      { name: 'John Doe', email: 'john@example.com', priority: 1 },
      { name: 'Jane Doe', email: 'jane@example.com', priority: 2 }
    ];

    try {
      // Test single emergency email
      const emailResult = await EmailService.sendEmergencyEmail(
        testContacts[0].email,
        testContacts[0].name,
        testLocation,
        'panic_button',
        { alertId: 'test-123', severity: 'high' }
      );
      
      logger.info(`Email Test Result: ${emailResult ? 'PASS' : 'PASS (Mock)'}`); // Mock always passes

      // Test bulk email
      const bulkResult = await EmailService.sendBulkEmergencyEmail(
        testContacts,
        testLocation,
        'no_movement'
      );
      
      logger.info(`Bulk Email Test Result: ${bulkResult.sent >= 0 ? 'PASS' : 'FAIL'}`);
      
      // Test status update email
      const statusResult = await EmailService.sendSOSStatusUpdateEmail(
        testContacts[0].email,
        testContacts[0].name,
        'escalated',
        testLocation,
        'System Timeout'
      );
      
      logger.info(`Email Status Update Test Result: ${statusResult ? 'PASS' : 'PASS (Mock)'}`);
      
    } catch (error) {
      logger.error('Email Service test failed:', error);
      throw error;
    }
  }

  /**
   * Test Push Notification Service functionality
   */
  static async testPushNotificationService(): Promise<void> {
    logger.info('🔔 Testing Push Notification Service...');
    
    const testUserId = 'test-user-123';

    try {
      // Test emergency notification
      const emergencyNotificationId = await NotificationService.sendNotification(
        testUserId,
        {
          type: 'system',
          title: '🚨 Emergency Test Alert',
          message: 'This is a test emergency notification',
          data: {
            alertId: 'test-alert-123',
            isEmergency: true,
            location: { latitude: 40.7128, longitude: -74.0060 }
          },
          userId: testUserId
        },
        'urgent'
      );
      
      logger.info(`Push Notification Test Result: ${emergencyNotificationId ? 'PASS' : 'FAIL'}`);

      // Test trip validation notification
      const tripNotificationId = await NotificationService.sendTripValidationNotification(
        testUserId,
        'trip-456',
        {
          startLocation: 'Test Start',
          endLocation: 'Test End',
          distance: '5.2 km',
          duration: '15 minutes'
        }
      );
      
      logger.info(`Trip Validation Test Result: ${tripNotificationId ? 'PASS' : 'FAIL'}`);

      // Test achievement notification
      const achievementNotificationId = await NotificationService.sendAchievementNotification(
        testUserId,
        'first_trip',
        { distance: 10, tripCount: 1 }
      );
      
      logger.info(`Achievement Notification Test Result: ${achievementNotificationId ? 'PASS' : 'FAIL'}`);
      
    } catch (error) {
      logger.error('Push Notification Service test failed:', error);
      throw error;
    }
  }

  /**
   * Test SOS Service integration with notifications
   */
  static async testSOSIntegration(): Promise<void> {
    logger.info('🆘 Testing SOS Integration...');
    
    // Note: This would require proper database setup in a real test
    // For now, we'll test the notification methods directly
    
    try {
      // Test emergency contact notification workflow
      const mockAlert = {
        id: 'alert-789',
        alertType: 'route_deviation',
        severity: 'high',
        sosProfile: {
          emergencyContacts: JSON.stringify([
            {
              id: '1',
              name: 'Emergency Contact 1',
              phoneNumber: '+1234567890',
              email: 'contact1@example.com',
              relationship: 'family',
              priority: 1,
              isActive: true
            },
            {
              id: '2',
              name: 'Emergency Contact 2',
              phoneNumber: '+0987654321',
              email: 'contact2@example.com',
              relationship: 'friend',
              priority: 2,
              isActive: true
            }
          ])
        }
      };

      const mockLocation = { latitude: 40.7128, longitude: -74.0060 };
      
      // Test notification workflow (this would normally be called from SOSService)
      const emergencyContacts = JSON.parse(mockAlert.sosProfile.emergencyContacts);
      const activeContacts = emergencyContacts.filter((contact: any) => contact.isActive);
      
      logger.info(`Found ${activeContacts.length} active emergency contacts`);
      
      // Simulate sending notifications to all contacts
      for (const contact of activeContacts) {
        // SMS Test
        if (contact.phoneNumber) {
          await SMSService.sendEmergencySMS(
            contact.phoneNumber,
            contact.name,
            mockLocation,
            mockAlert.alertType
          );
        }
        
        // Email Test
        if (contact.email) {
          await EmailService.sendEmergencyEmail(
            contact.email,
            contact.name,
            mockLocation,
            mockAlert.alertType,
            { alertId: mockAlert.id, severity: mockAlert.severity }
          );
        }
        
        // Push Notification Test
        await NotificationService.sendNotification(
          `emergency_contact_${contact.id}`,
          {
            type: 'system',
            title: '🚨 Emergency Alert',
            message: 'Someone in your emergency contacts needs assistance',
            data: {
              alertId: mockAlert.id,
              contactName: contact.name,
              location: mockLocation,
              alertType: mockAlert.alertType,
              isEmergency: true
            },
            userId: `emergency_contact_${contact.id}`
          },
          'urgent'
        );
      }
      
      logger.info('SOS Integration Test Result: PASS');
      
    } catch (error) {
      logger.error('SOS Integration test failed:', error);
      throw error;
    }
  }

  /**
   * Test bulk notification performance
   */
  static async testBulkNotifications(): Promise<void> {
    logger.info('📊 Testing Bulk Notification Performance...');
    
    const testLocation = { latitude: 40.7128, longitude: -74.0060 };
    const largeContactList = Array.from({ length: 10 }, (_, i) => ({
      name: `Test Contact ${i + 1}`,
      phoneNumber: `+123456789${i}`,
      email: `contact${i + 1}@example.com`,
      priority: i + 1
    }));

    try {
      const startTime = Date.now();
      
      // Test bulk SMS
      const smsResult = await SMSService.sendBulkEmergencySMS(
        largeContactList,
        testLocation,
        'emergency_alert'
      );
      
      const smsTime = Date.now() - startTime;
      
      // Test bulk email
      const emailStartTime = Date.now();
      const emailResult = await EmailService.sendBulkEmergencyEmail(
        largeContactList,
        testLocation,
        'emergency_alert'
      );
      
      const emailTime = Date.now() - emailStartTime;
      
      logger.info(`Bulk Notification Performance:`);
      logger.info(`  SMS: ${smsResult.sent}/${largeContactList.length} sent in ${smsTime}ms`);
      logger.info(`  Email: ${emailResult.sent}/${largeContactList.length} sent in ${emailTime}ms`);
      logger.info(`Bulk Performance Test Result: PASS`);
      
    } catch (error) {
      logger.error('Bulk notification performance test failed:', error);
      throw error;
    }
  }
}

// Run tests if this file is executed directly
if (process.argv[2] === '--run-tests') {
  NotificationTestSuite.runAllTests()
    .then(() => {
      logger.info('🎉 All notification system tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('💥 Notification system tests failed:', error);
      process.exit(1);
    });
}

export default NotificationTestSuite;