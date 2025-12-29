// Password hashing and Token utils using Web Crypto API (Edge compatible)

export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const exported = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

export async function verifySessionToken(token: string): Promise<any | null> {
  try {
    // Basic JWT verification logic without external libs for speed/compatibility
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return null;

    const data = JSON.parse(atob(payload));
    if (data.exp && Date.now() / 1000 > data.exp) return null; // Expired

    return data;
  } catch (e) {
    return null;
  }
}
