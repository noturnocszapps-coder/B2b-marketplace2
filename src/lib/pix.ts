// src/lib/pix.ts

export interface PixConfig {
  key: string;
  recipient: string;
  city: string;
  amount: number;
  description?: string;
  transactionId?: string;
}

function leftPad(value: string | number, length: number): string {
  return String(value).padStart(length, '0');
}

function formatField(id: string, value: string): string {
  return id + leftPad(value.length, 2) + value;
}

function calculateCRC16(payload: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Generates a static Pix BR Code payload.
 */
export function generatePixPayload(config: PixConfig): string {
  const { key, recipient, city, amount, description = '', transactionId = '***' } = config;

  // 00: Payload Format Indicator
  let payload = formatField('00', '01');

  // 26: Merchant Account Information - Pix
  const gui = formatField('00', 'br.gov.bcb.pix');
  const keyField = formatField('01', key.replace(/[^a-zA-Z0-9@.-]/g, '')); // Basic sanitization
  const infoField = description ? formatField('02', description.substring(0, 40)) : '';
  payload += formatField('26', gui + keyField + infoField);

  // 52: Merchant Category Code
  payload += formatField('52', '0000');

  // 53: Transaction Currency (BRL = 986)
  payload += formatField('53', '986');

  // 54: Transaction Amount
  payload += formatField('54', amount.toFixed(2));

  // 58: Country Code
  payload += formatField('58', 'BR');

  // 59: Merchant Name
  // Remove accents and special chars for better compatibility
  const sanitizedRecipient = recipient.normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 25).toUpperCase();
  payload += formatField('59', sanitizedRecipient || 'RECEBEDOR');

  // 60: Merchant City
  const sanitizedCity = city.normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 15).toUpperCase();
  payload += formatField('60', sanitizedCity || 'CIDADE');

  // 62: Additional Data Field Template
  const txIdField = formatField('05', transactionId.substring(0, 25));
  payload += formatField('62', txIdField);

  // 63: CRC16
  payload += '6304';
  payload += calculateCRC16(payload);

  return payload;
}
