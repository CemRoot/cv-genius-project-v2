import crypto from 'crypto'

// Helper function to get encryption key safely
function getEncryptionKey() {
  if (typeof window !== 'undefined') {
    return null // Client-side: PASSWORD_ENCRYPTION_KEY not needed
  }
  if (!process.env.PASSWORD_ENCRYPTION_KEY) {
    throw new Error('PASSWORD_ENCRYPTION_KEY environment variable is required')
  }
  return process.env.PASSWORD_ENCRYPTION_KEY
}

const ALGORITHM = 'aes-256-gcm'

interface EncryptedData {
  encrypted: string
  iv: string
  tag: string
}

export class PasswordEncryption {
  /**
   * Encrypt sensitive data for secure API transmission
   */
  static encrypt(text: string): EncryptedData {
    try {
      // Generate random IV for each encryption
      const iv = crypto.randomBytes(16)
      const encryptionKey = getEncryptionKey()
      if (!encryptionKey) throw new Error('Encryption not available on client-side')
      
      // Derive a proper 32-byte key from the encryption key
      const key = crypto.createHash('sha256').update(encryptionKey).digest()
      
      // Create cipher with IV (using the modern createCipheriv)
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
      
      // Encrypt the text
      let encrypted = cipher.update(text, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      // Create HMAC for authentication
      const hmac = crypto.createHmac('sha256', key)
      hmac.update(encrypted + iv.toString('hex'))
      const tag = hmac.digest('hex')
      
      return {
        encrypted: encrypted,
        iv: iv.toString('hex'),
        tag: tag
      }
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  /**
   * Decrypt data received from API
   */
  static decrypt(encryptedData: EncryptedData): string {
    try {
      const { encrypted, iv, tag } = encryptedData
      const encryptionKey = getEncryptionKey()
      if (!encryptionKey) throw new Error('Decryption not available on client-side')
      
      // Derive the same 32-byte key from the encryption key
      const key = crypto.createHash('sha256').update(encryptionKey).digest()
      
      // Verify HMAC for integrity
      const hmac = crypto.createHmac('sha256', key)
      hmac.update(encrypted + iv)
      const expectedTag = hmac.digest('hex')
      
      if (tag !== expectedTag) {
        throw new Error('Data integrity check failed')
      }
      
      // Create decipher with IV (using the modern createDecipheriv)
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'))
      
      // Decrypt the text
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  /**
   * Encrypt multiple passwords at once
   */
  static encryptPasswords(passwords: Record<string, string>): Record<string, EncryptedData> {
    const encrypted: Record<string, EncryptedData> = {}
    
    for (const [key, password] of Object.entries(passwords)) {
      encrypted[key] = this.encrypt(password)
    }
    
    return encrypted
  }

  /**
   * Create secure hash for server-side validation
   */
  static createSecureHash(password: string, salt?: string): string {
    const usedSalt = salt || crypto.randomBytes(16).toString('hex')
    const hash = crypto.scryptSync(password, usedSalt, 64).toString('hex')
    return `${usedSalt}:${hash}`
  }

  /**
   * Verify password against secure hash
   */
  static verifySecureHash(password: string, hashedPassword: string): boolean {
    try {
      const [salt, hash] = hashedPassword.split(':')
      const testHash = crypto.scryptSync(password, salt, 64).toString('hex')
      return hash === testHash
    } catch (error) {
      return false
    }
  }
}

export default PasswordEncryption 