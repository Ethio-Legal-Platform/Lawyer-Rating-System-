import SibApiV3Sdk from 'sib-api-v3-sdk';

/**
 * Sends a verification email with an OTP code via the Brevo (Sendinblue) API.
 * Falls back to console logging if the API key is not configured.
 *
 * @param {string} toEmail - Recipient email address.
 * @param {string} code    - OTP code to include in the email body.
 * @returns {Promise<boolean>} True if the email was dispatched successfully.
 */
export async function sendBrevoEmail(toEmail, code) {
  const apiKey      = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@lexrating.gov.et';
  const senderName  = process.env.BREVO_SENDER_NAME  || 'LEX-RATING System';

  // Graceful fallback when API key is absent / placeholder
  if (!apiKey || apiKey === 'your_brevo_api_key_here') {
    console.warn('\n⚠️  WARNING: Brevo API Key not configured in .env. Email was NOT sent.');
    console.log(`=== MOCK OTP LOG ===\nOTP for ${toEmail}: ${code}\n====================\n`);
    return false;
  }

  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    defaultClient.authentications['api-key'].apiKey = apiKey;

    const apiInstance    = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail  = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject     = 'Your LEX-RATING verification code';
    sendSmtpEmail.textContent = `Your verification code is: ${code}`;
    sendSmtpEmail.sender      = { name: senderName, email: senderEmail };
    sendSmtpEmail.to          = [{ email: toEmail }];

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`\n📧 Email sent via Brevo to: ${toEmail} — Message ID: ${data.messageId}\n`);
    return true;
  } catch (err) {
    const errorMsg = err?.response?.body?.message || err?.response?.text || err.message || err;
    console.error('\n❌ [emailService] Brevo API error:', errorMsg);
    console.log(`\n=== FALLBACK OTP LOG ===\nOTP for ${toEmail}: ${code}\n========================\n`);
    return false;
  }
}

