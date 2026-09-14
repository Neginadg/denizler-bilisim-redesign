// Vercel serverless function: receives the contact form POST from iletisim.html
// and relays it to Resend using a server-side API key (never exposed to the browser).
//
// Required environment variables (set in the Vercel project settings, not in code):
//   RESEND_API_KEY  - secret API key from resend.com
//   RESEND_TO_EMAIL - the inbox that should receive submissions. Until a sending
//                     domain is verified on Resend, this must be the same email
//                     address the Resend account was signed up with.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message, company } = req.body || {};

  // Honeypot: real visitors never see or fill this field, bots often do.
  if (company) {
    return res.status(200).json({ success: true });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_TO_EMAIL) {
    console.error('Missing RESEND_API_KEY or RESEND_TO_EMAIL environment variable');
    return res.status(500).json({ error: 'Server is not configured' });
  }

  try {
    const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Denizler Bilişim Web Sitesi <onboarding@resend.dev>',
        to: [process.env.RESEND_TO_EMAIL],
        reply_to: email,
        subject: `Web sitesi iletişim formu — ${name}`,
        text: `İsim: ${name}\nE-posta: ${email}\n\nMesaj:\n${message}`,
        html: `<p><strong>İsim:</strong> ${escapeHtml(name)}</p><p><strong>E-posta:</strong> ${escapeHtml(email)}</p><p><strong>Mesaj:</strong><br>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error('Resend API error:', resendRes.status, errText);
      return res.status(502).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
};
