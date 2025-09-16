#!/usr/bin/env python3
"""
Advanced 128-bit Encryption Utilities for Traveal
Government-grade encryption and data security for Python components
"""

import os
import json
import base64
import hashlib
import secrets
from typing import Dict, Any, Optional, Tuple, Union
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.kdf.scrypt import Scrypt
from cryptography.hazmat.primitives import hashes, padding
from cryptography.hazmat.backends import default_backend
from cryptography.fernet import Fernet


class TravealCrypto:
    """Advanced encryption service for Traveal application"""
    
    # Constants for encryption
    AES_KEY_SIZE = 32  # 256 bits
    AES_BLOCK_SIZE = 16  # 128 bits
    SALT_SIZE = 32
    IV_SIZE = 16
    PBKDF2_ITERATIONS = 100000
    SCRYPT_N = 2**14
    SCRYPT_R = 8
    SCRYPT_P = 1
    
    def __init__(self, master_key: Optional[str] = None):
        """Initialize with optional master key"""
        self.master_key = master_key or os.environ.get('TRAVEAL_ENCRYPTION_KEY')
        self.backend = default_backend()
    
    def generate_key(self) -> bytes:
        """Generate a random 256-bit key"""
        return secrets.token_bytes(self.AES_KEY_SIZE)
    
    def generate_salt(self) -> bytes:
        """Generate a random salt"""
        return secrets.token_bytes(self.SALT_SIZE)
    
    def generate_iv(self) -> bytes:
        """Generate a random initialization vector"""
        return secrets.token_bytes(self.IV_SIZE)
    
    def derive_key_pbkdf2(self, password: str, salt: bytes) -> bytes:
        """Derive key using PBKDF2"""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA512(),
            length=self.AES_KEY_SIZE,
            salt=salt,
            iterations=self.PBKDF2_ITERATIONS,
            backend=self.backend
        )
        return kdf.derive(password.encode())
    
    def derive_key_scrypt(self, password: str, salt: bytes) -> bytes:
        """Derive key using Scrypt (more secure but slower)"""
        kdf = Scrypt(
            algorithm=hashes.SHA256(),
            length=self.AES_KEY_SIZE,
            salt=salt,
            n=self.SCRYPT_N,
            r=self.SCRYPT_R,
            p=self.SCRYPT_P,
            backend=self.backend
        )
        return kdf.derive(password.encode())
    
    def encrypt_data_aes(
        self, 
        data: Union[str, dict], 
        password: Optional[str] = None,
        use_scrypt: bool = True
    ) -> Dict[str, str]:
        """
        Encrypt data using AES-256-CBC with PBKDF2/Scrypt key derivation
        
        Args:
            data: Data to encrypt (string or dictionary)
            password: Optional password (uses master_key if not provided)
            use_scrypt: Use Scrypt instead of PBKDF2 for key derivation
            
        Returns:
            Dictionary containing encrypted data and metadata
        """
        try:
            # Convert data to string if needed
            if isinstance(data, dict):
                plaintext = json.dumps(data, separators=(',', ':'))
            else:
                plaintext = str(data)
            
            # Generate salt and IV
            salt = self.generate_salt()
            iv = self.generate_iv()
            
            # Derive key
            key_password = password or self.master_key
            if not key_password:
                raise ValueError("No password or master key provided")
            
            if use_scrypt:
                key = self.derive_key_scrypt(key_password, salt)
            else:
                key = self.derive_key_pbkdf2(key_password, salt)
            
            # Pad data
            padder = padding.PKCS7(128).padder()
            padded_data = padder.update(plaintext.encode()) + padder.finalize()
            
            # Encrypt
            cipher = Cipher(
                algorithms.AES(key),
                modes.CBC(iv),
                backend=self.backend
            )
            encryptor = cipher.encryptor()
            ciphertext = encryptor.update(padded_data) + encryptor.finalize()
            
            # Create authentication tag using HMAC
            auth_tag = hashlib.pbkdf2_hmac(
                'sha256',
                ciphertext + salt + iv,
                key,
                10000,
                32
            )
            
            return {
                'encrypted': base64.b64encode(ciphertext).decode(),
                'salt': base64.b64encode(salt).decode(),
                'iv': base64.b64encode(iv).decode(),
                'auth_tag': base64.b64encode(auth_tag).decode(),
                'method': 'scrypt' if use_scrypt else 'pbkdf2',
                'version': '1.0'
            }
            
        except Exception as e:
            raise RuntimeError(f"Encryption failed: {str(e)}")
    
    def decrypt_data_aes(
        self, 
        encrypted_data: Dict[str, str], 
        password: Optional[str] = None
    ) -> str:
        """
        Decrypt AES encrypted data
        
        Args:
            encrypted_data: Dictionary containing encrypted data and metadata
            password: Password for decryption
            
        Returns:
            Decrypted plaintext string
        """
        try:
            # Extract components
            ciphertext = base64.b64decode(encrypted_data['encrypted'])
            salt = base64.b64decode(encrypted_data['salt'])
            iv = base64.b64decode(encrypted_data['iv'])
            auth_tag = base64.b64decode(encrypted_data['auth_tag'])
            method = encrypted_data.get('method', 'pbkdf2')
            
            # Derive key
            key_password = password or self.master_key
            if not key_password:
                raise ValueError("No password or master key provided")
            
            if method == 'scrypt':
                key = self.derive_key_scrypt(key_password, salt)
            else:
                key = self.derive_key_pbkdf2(key_password, salt)
            
            # Verify authentication tag
            expected_tag = hashlib.pbkdf2_hmac(
                'sha256',
                ciphertext + salt + iv,
                key,
                10000,
                32
            )
            
            if not secrets.compare_digest(auth_tag, expected_tag):
                raise ValueError("Authentication tag verification failed")
            
            # Decrypt
            cipher = Cipher(
                algorithms.AES(key),
                modes.CBC(iv),
                backend=self.backend
            )
            decryptor = cipher.decryptor()
            padded_plaintext = decryptor.update(ciphertext) + decryptor.finalize()
            
            # Remove padding
            unpadder = padding.PKCS7(128).unpadder()
            plaintext = unpadder.update(padded_plaintext) + unpadder.finalize()
            
            return plaintext.decode()
            
        except Exception as e:
            raise RuntimeError(f"Decryption failed: {str(e)}")
    
    def encrypt_location(
        self, 
        latitude: float, 
        longitude: float, 
        password: Optional[str] = None
    ) -> Dict[str, str]:
        """Encrypt location coordinates"""
        location_data = {
            'lat': latitude,
            'lng': longitude,
            'timestamp': int(secrets.randbits(32))  # Add noise
        }
        return self.encrypt_data_aes(location_data, password)
    
    def decrypt_location(
        self, 
        encrypted_data: Dict[str, str], 
        password: Optional[str] = None
    ) -> Tuple[float, float]:
        """Decrypt location coordinates"""
        decrypted = self.decrypt_data_aes(encrypted_data, password)
        location_data = json.loads(decrypted)
        return location_data['lat'], location_data['lng']
    
    def encrypt_with_fernet(self, data: Union[str, dict]) -> str:
        """Encrypt using Fernet (simpler, high-level encryption)"""
        if isinstance(data, dict):
            data = json.dumps(data, separators=(',', ':'))
        
        # Generate key from master key
        if not self.master_key:
            raise ValueError("Master key required for Fernet encryption")
        
        key_material = hashlib.sha256(self.master_key.encode()).digest()
        key = base64.urlsafe_b64encode(key_material)
        
        fernet = Fernet(key)
        encrypted = fernet.encrypt(data.encode())
        
        return base64.b64encode(encrypted).decode()
    
    def decrypt_with_fernet(self, encrypted_data: str) -> str:
        """Decrypt Fernet encrypted data"""
        if not self.master_key:
            raise ValueError("Master key required for Fernet decryption")
        
        key_material = hashlib.sha256(self.master_key.encode()).digest()
        key = base64.urlsafe_b64encode(key_material)
        
        fernet = Fernet(key)
        encrypted_bytes = base64.b64decode(encrypted_data)
        decrypted = fernet.decrypt(encrypted_bytes)
        
        return decrypted.decode()
    
    def generate_secure_hash(
        self, 
        data: str, 
        salt: Optional[bytes] = None,
        iterations: int = 100000
    ) -> Dict[str, str]:
        """Generate secure hash with salt"""
        if salt is None:
            salt = self.generate_salt()
        
        hash_value = hashlib.pbkdf2_hmac(
            'sha512',
            data.encode(),
            salt,
            iterations,
            64
        )
        
        return {
            'hash': base64.b64encode(hash_value).decode(),
            'salt': base64.b64encode(salt).decode(),
            'iterations': str(iterations)
        }
    
    def verify_hash(
        self, 
        data: str, 
        stored_hash: str, 
        salt: str, 
        iterations: int = 100000
    ) -> bool:
        """Verify data against stored hash"""
        try:
            salt_bytes = base64.b64decode(salt)
            stored_hash_bytes = base64.b64decode(stored_hash)
            
            computed_hash = hashlib.pbkdf2_hmac(
                'sha512',
                data.encode(),
                salt_bytes,
                iterations,
                64
            )
            
            return secrets.compare_digest(computed_hash, stored_hash_bytes)
            
        except Exception:
            return False
    
    def anonymize_data(
        self, 
        data: str, 
        level: str = 'medium'
    ) -> str:
        """Anonymize data with different security levels"""
        levels = {
            'low': 1,
            'medium': 3,
            'high': 5
        }
        
        rounds = levels.get(level, 3)
        result = data
        
        for i in range(rounds):
            salt = f"traveal_anon_{i}_{self.master_key or 'default'}"
            result = hashlib.sha256((result + salt).encode()).hexdigest()
        
        return result
    
    def generate_api_key(self) -> str:
        """Generate secure API key"""
        prefix = "tk_"  # traveal key
        timestamp = hex(int(secrets.randbits(32)))[2:]
        random_part = secrets.token_hex(32)
        
        # Generate checksum
        checksum_data = timestamp + random_part
        checksum = hashlib.sha256(checksum_data.encode()).hexdigest()[:8]
        
        return f"{prefix}{timestamp}_{random_part}_{checksum}"
    
    def secure_delete(self, data: str, rounds: int = 3) -> None:
        """Securely overwrite sensitive data in memory"""
        # Note: This is limited in Python due to garbage collection
        # For truly secure deletion, use specialized libraries
        for _ in range(rounds):
            data = secrets.token_hex(len(data))


class TravealDataProcessor:
    """Data processing utilities for analytics and machine learning"""
    
    def __init__(self, crypto: TravealCrypto):
        self.crypto = crypto
    
    def anonymize_trip_data(
        self, 
        trip_data: Dict[str, Any],
        anonymization_level: str = 'medium'
    ) -> Dict[str, Any]:
        """Anonymize trip data for analytics"""
        anonymized = {}
        
        # Anonymize personally identifiable information
        if 'user_id' in trip_data:
            anonymized['user_hash'] = self.crypto.anonymize_data(
                str(trip_data['user_id']), 
                anonymization_level
            )
        
        # Preserve analytical value while protecting privacy
        preservable_fields = [
            'distance', 'duration', 'mode', 'purpose', 
            'companions', 'weather', 'time_of_day'
        ]
        
        for field in preservable_fields:
            if field in trip_data:
                anonymized[field] = trip_data[field]
        
        # Fuzzy location data
        if 'start_location' in trip_data:
            lat, lng = trip_data['start_location']
            # Add noise to location (100m radius)
            noise_lat = secrets.randbelow(200) - 100  # ±100m
            noise_lng = secrets.randbelow(200) - 100
            anonymized['start_area'] = {
                'lat_zone': int(lat * 1000 + noise_lat) / 1000,
                'lng_zone': int(lng * 1000 + noise_lng) / 1000
            }
        
        if 'end_location' in trip_data:
            lat, lng = trip_data['end_location']
            noise_lat = secrets.randbelow(200) - 100
            noise_lng = secrets.randbelow(200) - 100
            anonymized['end_area'] = {
                'lat_zone': int(lat * 1000 + noise_lat) / 1000,
                'lng_zone': int(lng * 1000 + noise_lng) / 1000
            }
        
        # Round timestamps to nearest hour
        if 'start_time' in trip_data:
            import datetime
            start_time = datetime.datetime.fromisoformat(trip_data['start_time'])
            rounded_hour = start_time.replace(minute=0, second=0, microsecond=0)
            anonymized['start_hour'] = rounded_hour.isoformat()
        
        anonymized['anonymized_at'] = datetime.datetime.utcnow().isoformat()
        anonymized['anonymization_level'] = anonymization_level
        
        return anonymized
    
    def encrypt_sensitive_fields(
        self, 
        data: Dict[str, Any],
        sensitive_fields: list = None
    ) -> Dict[str, Any]:
        """Encrypt sensitive fields in data"""
        if sensitive_fields is None:
            sensitive_fields = [
                'email', 'phone', 'name', 'address', 
                'device_id', 'ip_address'
            ]
        
        result = data.copy()
        
        for field in sensitive_fields:
            if field in result:
                encrypted = self.crypto.encrypt_data_aes(str(result[field]))
                result[f"{field}_encrypted"] = encrypted
                del result[field]  # Remove original
        
        return result


# Example usage and testing functions
def test_encryption():
    """Test the encryption functionality"""
    crypto = TravealCrypto("test-master-key-123")
    
    # Test basic encryption
    test_data = {"message": "Hello, Traveal!", "sensitive": True}
    encrypted = crypto.encrypt_data_aes(test_data)
    decrypted = crypto.decrypt_data_aes(encrypted)
    
    print("✓ Basic encryption test passed")
    
    # Test location encryption
    lat, lng = 10.8505, 76.2711  # Thrissur, Kerala
    encrypted_location = crypto.encrypt_location(lat, lng)
    decrypted_lat, decrypted_lng = crypto.decrypt_location(encrypted_location)
    
    assert abs(lat - decrypted_lat) < 0.0001
    assert abs(lng - decrypted_lng) < 0.0001
    print("✓ Location encryption test passed")
    
    # Test hash generation
    hash_data = crypto.generate_secure_hash("test-password")
    is_valid = crypto.verify_hash("test-password", **hash_data)
    assert is_valid
    print("✓ Hash verification test passed")
    
    # Test API key generation
    api_key = crypto.generate_api_key()
    assert api_key.startswith("tk_")
    print("✓ API key generation test passed")
    
    print("All encryption tests completed successfully!")


if __name__ == "__main__":
    test_encryption()