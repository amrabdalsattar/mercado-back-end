const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

/**
 * Send an email.
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    logger.info(`📧 Email sent to ${to} — MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`❌ Email failed to ${to}: ${error.message}`);
    throw error;
  }
};

module.exports = { sendEmail };
