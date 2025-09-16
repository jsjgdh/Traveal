import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { EncryptionService } from '../services/encryptionService.js';

describe('EncryptionService', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    process.env.ENCRYPTION_KEY = 'test-encryption-key-for-testing-only';
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Data Encryption', () => {
    test('should encrypt and decrypt string data correctly', () => {
      const testData = 'This is sensitive data that needs encryption';
      const encrypted = EncryptionService.encrypt(testData);
      
      expect(encrypted).toHaveProperty('encrypted');
      expect(encrypted).toHaveProperty('salt');
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('tag');
      
      const decrypted = EncryptionService.decrypt(encrypted);
      expect(decrypted).toBe(testData);
    });

    test('should encrypt and decrypt object data correctly', () => {
      const testData = {
        user: 'john_doe',
        email: 'john@example.com',
        location: { lat: 10.8505, lng: 76.2711 }
      };
      
      const encrypted = EncryptionService.encrypt(testData);
      const decrypted = EncryptionService.decrypt(encrypted);
      
      expect(JSON.parse(decrypted)).toEqual(testData);
    });

    test('should use different salt and IV for each encryption', () => {
      const testData = 'Same data encrypted twice';
      
      const encrypted1 = EncryptionService.encrypt(testData);
      const encrypted2 = EncryptionService.encrypt(testData);
      
      expect(encrypted1.salt).not.toBe(encrypted2.salt);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted);
    });

    test('should fail decryption with wrong key', () => {
      const testData = 'Secure data';
      const encrypted = EncryptionService.encrypt(testData, 'key1');
      
      expect(() => {
        EncryptionService.decrypt(encrypted, 'wrong-key');
      }).toThrow('Failed to decrypt data');
    });
  });

  describe('Location Encryption', () => {
    test('should encrypt and decrypt location coordinates', () => {
      const latitude = 10.8505;
      const longitude = 76.2711;
      
      const encrypted = EncryptionService.encryptLocation(latitude, longitude);
      
      expect(encrypted).toHaveProperty('encryptedLat');
      expect(encrypted).toHaveProperty('encryptedLng');
      expect(encrypted).toHaveProperty('salt');
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('tag');
      
      const decrypted = EncryptionService.decryptLocation(
        encrypted.encryptedLat,
        encrypted.encryptedLng,
        encrypted.salt,
        encrypted.iv,
        encrypted.tag
      );
      
      expect(decrypted.latitude).toBeCloseTo(latitude, 6);
      expect(decrypted.longitude).toBeCloseTo(longitude, 6);
    });
  });

  describe('Password Hashing', () => {
    test('should hash password with multiple salt layers', async () => {
      const password = 'mySecurePassword123!';
      
      const result = await EncryptionService.hashPassword(password);
      
      expect(result).toHaveProperty('hash');
      expect(result).toHaveProperty('salt');
      expect(result).toHaveProperty('pepper');
      expect(result.hash).not.toBe(password);
      expect(result.salt).toHaveLength(64); // 32 bytes hex
      expect(result.pepper).toHaveLength(32); // 16 bytes hex
    });

    test('should verify correct password', async () => {
      const password = 'testPassword456!';
      
      const hashed = await EncryptionService.hashPassword(password);
      const isValid = await EncryptionService.verifyPassword(
        password,
        hashed.hash,
        hashed.salt,
        hashed.pepper
      );
      
      expect(isValid).toBe(true);
    });

    test('should reject wrong password', async () => {
      const password = 'correctPassword';
      const wrongPassword = 'wrongPassword';
      
      const hashed = await EncryptionService.hashPassword(password);
      const isValid = await EncryptionService.verifyPassword(
        wrongPassword,
        hashed.hash,
        hashed.salt,
        hashed.pepper
      );
      
      expect(isValid).toBe(false);
    });

    test('should generate different hashes for same password', async () => {
      const password = 'samePassword';
      
      const hash1 = await EncryptionService.hashPassword(password);
      const hash2 = await EncryptionService.hashPassword(password);
      
      expect(hash1.hash).not.toBe(hash2.hash);
      expect(hash1.salt).not.toBe(hash2.salt);
      expect(hash1.pepper).not.toBe(hash2.pepper);
    });
  });

  describe('API Key Generation', () => {
    test('should generate valid API key format', () => {
      const apiKey = EncryptionService.generateAPIKey();
      
      expect(apiKey).toMatch(/^tk_[0-9a-z]+_[0-9a-f]{64}_[0-9a-f]{8}$/);
      expect(apiKey.startsWith('tk_')).toBe(true);
    });

    test('should generate unique API keys', () => {
      const key1 = EncryptionService.generateAPIKey();
      const key2 = EncryptionService.generateAPIKey();
      
      expect(key1).not.toBe(key2);
    });
  });

  describe('JWT Payload Encryption', () => {
    test('should encrypt and decrypt JWT payload', () => {
      const payload = {
        userId: 'user123',
        role: 'user',
        permissions: ['read', 'write']
      };
      
      const encrypted = EncryptionService.encryptJWTPayload(payload);
      const decrypted = EncryptionService.decryptJWTPayload(encrypted);
      
      expect(decrypted).toEqual(payload);
    });
  });

  describe('Session Token Management', () => {
    test('should generate session token with hash', () => {
      const result = EncryptionService.generateSessionToken();
      
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('hash');
      expect(result).toHaveProperty('expires');
      expect(result.token).toHaveLength(128); // 64 bytes hex
      expect(result.hash).toHaveLength(128); // SHA512 hex
      expect(result.expires).toBeInstanceOf(Date);
    });

    test('should verify valid session token', () => {
      const sessionData = EncryptionService.generateSessionToken();
      const isValid = EncryptionService.verifySessionToken(
        sessionData.token,
        sessionData.hash
      );
      
      expect(isValid).toBe(true);
    });

    test('should reject invalid session token', () => {
      const sessionData = EncryptionService.generateSessionToken();
      const isValid = EncryptionService.verifySessionToken(
        'wrong-token',
        sessionData.hash
      );
      
      expect(isValid).toBe(false);
    });
  });

  describe('Field Encryption', () => {
    test('should encrypt field with type information', () => {
      const email = 'user@example.com';
      
      const encrypted = EncryptionService.encryptField(email, 'email');
      
      expect(encrypted).toHaveProperty('encrypted');
      expect(encrypted).toHaveProperty('salt');
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('tag');
      expect(encrypted).toHaveProperty('type');
      expect(encrypted.type).toBe('email');
    });
  });

  describe('Data Anonymization', () => {
    test('should anonymize data with different levels', () => {
      const data = 'sensitive-user-data';
      
      const low = EncryptionService.anonymizeData(data, 'low');
      const medium = EncryptionService.anonymizeData(data, 'medium');
      const high = EncryptionService.anonymizeData(data, 'high');
      
      expect(low).not.toBe(data);
      expect(medium).not.toBe(data);
      expect(high).not.toBe(data);
      expect(low).not.toBe(medium);
      expect(medium).not.toBe(high);
      
      // All should be hex strings
      expect(low).toMatch(/^[0-9a-f]+$/);
      expect(medium).toMatch(/^[0-9a-f]+$/);
      expect(high).toMatch(/^[0-9a-f]+$/);
    });

    test('should produce consistent anonymization for same input', () => {
      const data = 'consistent-data';
      
      const anon1 = EncryptionService.anonymizeData(data, 'medium');
      const anon2 = EncryptionService.anonymizeData(data, 'medium');
      
      expect(anon1).toBe(anon2);
    });
  });

  describe('Error Handling', () => {
    test('should handle encryption errors gracefully', () => {
      expect(() => {
        EncryptionService.encrypt('', '');
      }).toThrow('Failed to encrypt data');
    });

    test('should handle decryption errors gracefully', () => {
      const invalidEncrypted = {
        encrypted: 'invalid',
        salt: 'invalid',
        iv: 'invalid',
        tag: 'invalid'
      };
      
      expect(() => {
        EncryptionService.decrypt(invalidEncrypted);
      }).toThrow('Failed to decrypt data');
    });
  });
});