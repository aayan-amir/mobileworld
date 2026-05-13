const nodemailer = require('nodemailer');

function money(amount) {
  return `PKR ${Number(amount || 0).toLocaleString('en-PK')}`;
}

function configured() {
  return process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD && process.env.OWNER_EMAIL;
}

async function sendOrderEmail(order, screenshot) {
  if (!configured()) return { skipped: true };

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
  const rows = items.map((item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.variant}</td>
      <td>${item.qty}</td>
      <td>${money(item.price)}</td>
      <td>${money(item.price * item.qty)}</td>
    </tr>
  `).join('');

  await transporter.sendMail({
    from: `"Mobile World" <${process.env.GMAIL_USER}>`,
    to: process.env.OWNER_EMAIL,
    subject: `New Order #${order.id} — ${money(order.total_amount)} — Mobile World`,
    html: `
      <h2>New Order #${order.id}</h2>
      <p><strong>Timestamp:</strong> ${order.created_at || new Date().toISOString()}</p>
      <p><strong>Customer:</strong> ${order.customer_name}<br>${order.customer_email}<br>${order.customer_phone}</p>
      <table cellpadding="8" cellspacing="0" border="1">
        <thead><tr><th>Product</th><th>Variant</th><th>Qty</th><th>Unit price</th><th>Subtotal</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <h3>Grand total: ${money(order.total_amount)}</h3>
      <p>Payment screenshot is ${screenshot?.url ? `<a href="${screenshot.url}">available here</a>` : 'attached'}.</p>
    `,
    attachments: screenshot?.localPath ? [{ filename: 'payment-screenshot', path: screenshot.localPath }] : []
  });

  return { sent: true };
}

module.exports = { sendOrderEmail };
