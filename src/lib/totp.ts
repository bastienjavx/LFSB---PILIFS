import { generateSecret as otpGenerateSecret, generateURI, verify } from 'otplib'
import QRCode from 'qrcode'

// Nom affiché dans l'application d'authentification (Google Authenticator, Authy…).
const ISSUER = 'Main Verte Admin'

export function generateSecret(): string {
  return otpGenerateSecret()
}

/** URL `otpauth://` à encoder dans le QR code, et image QR en data URL. */
export async function buildEnrollment(email: string, secret: string) {
  const otpauthUrl = generateURI({ issuer: ISSUER, label: email, secret })
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl, { margin: 1, width: 240 })
  return { otpauthUrl, qrDataUrl }
}

/**
 * Vérifie un code à 6 chiffres contre le secret de l'utilisateur.
 * `epochTolerance: 30` accepte le cran précédent/suivant (±30 s) pour absorber
 * un léger décalage d'horloge.
 */
export async function verifyToken(token: string, secret: string): Promise<boolean> {
  if (!token || !secret) return false
  try {
    const result = await verify({ secret, token: token.replace(/\s/g, ''), epochTolerance: 30 })
    return result.valid
  } catch {
    return false
  }
}
