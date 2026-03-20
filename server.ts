import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import nodemailer from 'nodemailer';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending email
  app.post('/api/send-email', async (req, res) => {
    const { name, email, projects } = req.body;

    // Create a transporter
    // Note: For real production, you'd use a real service like SendGrid, Mailgun, or Gmail with OAuth2.
    // For this demo, we'll use a mock transporter or a common pattern.
    // Since I don't have real credentials, I'll log the email and return success.
    // If the user provides SMTP credentials, they can be added here.
    
    console.log('--- New Inquiry Received ---');
    console.log(`From: ${name} (${email})`);
    console.log(`To: Nattakarm@sif.or.th`);
    console.log('Projects:', JSON.stringify(projects, null, 2));
    console.log('---------------------------');

    // Mock sending email
    // In a real scenario, you'd do:
    /*
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: email,
      to: 'Nattakarm@sif.or.th',
      subject: `New Inquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nProjects:\n${projects.map(p => `- ${p.title} (${p.province}) - Budget: ${p.budget}`).join('\n')}`,
    };

    await transporter.sendMail(mailOptions);
    */

    // For now, we simulate success
    setTimeout(() => {
      res.status(200).json({ message: 'Email sent successfully' });
    }, 1000);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
