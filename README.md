# 🚀 Upsnap – Advanced Website Health Monitoring for Strapi

> Enterprise-grade website monitoring directly inside your Strapi Admin Panel.

Upsnap is a powerful monitoring plugin for Strapi that enables you to track uptime, SSL certificates, broken links, performance health, domain integrity, and mixed content issues — all from a clean, real-time dashboard inside your CMS.

Designed for agencies, SaaS platforms, and enterprise teams.

---

## ✨ Why Upsnap?

Modern websites fail silently — expired SSL, broken internal links, mixed content errors, slow response times.  
Upsnap helps you detect issues before your users do.

✔ Monitor multiple domains  
✔ Detect critical infrastructure issues  
✔ Visual health dashboard inside Strapi  
✔ Built for Strapi v5 architecture  

---

## 📦 Installation

Install via npm:

```bash
npm install @upsnap/strapi
```

or via yarn:

```bash
yarn add @upsnap/strapi
```

Restart Strapi:

```bash
npm run develop
```

Upsnap will appear in your admin sidebar.

---

## ⚙️ Requirements

- Strapi v5.x
- Node.js 18+
- React 18 (provided by Strapi)

---

## 🛠 Features

### 🌐 Uptime Monitoring
- HTTP status validation
- Response time measurement
- Availability tracking

### 🔐 SSL Certificate Monitoring
- Expiry date detection
- Certificate validity checks
- Security warnings

### 🔗 Broken Link Detection
- Internal link scanning
- External link validation
- Dead link reporting

### ⚡ Performance Health
- Server response analysis
- Latency tracking
- Basic performance indicators

### 🛡 Mixed Content Detection
- HTTP resources inside HTTPS pages
- Security vulnerability detection

### 📊 Clean Admin Dashboard
- Real-time monitoring overview
- Status visualization
- Health summary per domain

---

## 🧠 How It Works

Upsnap performs secure server-side checks:

1. Fetches target domain
2. Validates HTTP status
3. Inspects SSL certificate
4. Scans DOM for broken links
5. Detects mixed content
6. Measures response metrics

All results are aggregated and displayed within Strapi's admin interface.

---

## 🔧 Configuration

After installation:

1. Go to **Settings → Plugins → Upsnap**
2. Add your target domains
3. Configure monitoring options
4. Save and start monitoring

---

## 📊 Use Cases

- SaaS platforms managing multiple domains
- Agencies maintaining client websites
- DevOps monitoring dashboards
- Enterprise content systems
- Website audit automation

---

## 🏗 Development

Clone the repository:

```bash
git clone https://github.com/Appfoster/upsnap-strapi
```

Install dependencies:

```bash
npm install
```

Build plugin:

```bash
npm run build
```

Watch mode (for development):

```bash
npm run watch
```

---

## 📁 Project Structure

```
/admin      → Admin UI (React)
/server     → Backend logic
/dist       → Compiled output (published to npm)
```

---

## 🔒 Security

- Runs server-side within Strapi
- No external tracking
- No third-party data storage
- Respects Strapi permission system

---

## 🧩 Compatibility

| Strapi Version | Supported |
|----------------|------------|
| v5.x           | ✅ Yes     |
| v4.x           | ❌ No      |

---

## 🧪 Production Readiness

- Built using Strapi Plugin SDK
- Peer dependency aligned with Strapi v5
- TypeScript support
- Modular architecture
- Designed for scalability

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**Appfoster**  
Website: https://appfoster.com  
Email: info@appfoster.com  

---

## 🌍 Roadmap

- Scheduled monitoring (cron-based)
- Email / Slack alerts
- Historical monitoring logs
- Public status page integration
- Performance scoring system

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create your feature branch
3. Commit changes
4. Open a pull request

---

## ⭐ Support

If you find Upsnap useful:

- Star the repository
- Share with your team
- Submit feature requests
- Report issues

---

## 📌 About Strapi

Upsnap is built for Strapi — the leading open-source headless CMS.

Learn more at: https://strapi.io

---

Built with precision. Designed for reliability.  
Monitor smarter with Upsnap.
