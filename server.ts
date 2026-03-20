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

    const targetEmail = 'nattakarn@sif.or.th';

    // Check for SMTP credentials
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.log('--- Inquiry Received (SMTP NOT CONFIGURED) ---');
      console.log(`From: ${name} (${email})`);
      console.log(`To: ${targetEmail}`);
      console.log('Projects:', JSON.stringify(projects, null, 2));
      console.log('---------------------------');
      
      // Return success to the client but log the issue
      return res.status(200).json({ 
        message: 'Simulation: Inquiry logged to console. Configure SMTP for real emails.',
        simulated: true 
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost || 'smtp.gmail.com',
        port: parseInt(smtpPort || '465'),
        secure: (smtpPort === '465' || !smtpPort),
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const projectList = projects.map((p: any) => 
        `- ${p.title}\n  จังหวัด: ${p.province}\n  งบประมาณ: ฿${p.budget.toLocaleString()}\n  องค์กร: ${p.organization}`
      ).join('\n\n');

      const mailOptions = {
        from: `"${name}" <${smtpUser}>`,
        replyTo: email,
        to: targetEmail,
        subject: `[Inquiry] สนใจสนับสนุนโครงการจากคุณ ${name}`,
        text: `มีผู้สนใจสนับสนุนโครงการใหม่\n\nข้อมูลผู้ติดต่อ:\nชื่อ: ${name}\nอีเมล: ${email}\n\nรายการโครงการที่สนใจ:\n${projectList}\n\n--- จบรายการ ---`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #00408b;">มีผู้สนใจสนับสนุนโครงการใหม่</h2>
            <p><strong>ข้อมูลผู้ติดต่อ:</strong></p>
            <ul>
              <li><strong>ชื่อ:</strong> ${name}</li>
              <li><strong>อีเมล:</strong> <a href="mailto:${email}">${email}</a></li>
            </ul>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <p><strong>รายการโครงการที่สนใจ:</strong></p>
            ${projects.map((p: any) => `
              <div style="margin-bottom: 15px; padding: 10px; background: #f8f9ff; border-radius: 8px;">
                <h3 style="margin: 0; color: #00408b;">${p.title}</h3>
                <p style="margin: 5px 0;"><strong>จังหวัด:</strong> ${p.province}</p>
                <p style="margin: 5px 0;"><strong>งบประมาณ:</strong> ฿${p.budget.toLocaleString()}</p>
                <p style="margin: 5px 0;"><strong>องค์กร:</strong> ${p.organization}</p>
              </div>
            `).join('')}
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${targetEmail}`);
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
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
