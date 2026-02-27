# UpSnap

A lightweight, all-in-one monitoring plugin for Craft CMS 5 that keeps your site healthy, secure, and fast.

## Description
UpSnap delivers real-time monitoring and actionable insights so you can detect downtime, performance issues, and security risks before they impact your users.

## Core Monitoring Features
🔍 Reachability monitoring with uptime tracking, response times, HTTP status checks, and historical trends  
🔒 SSL/TLS certificate validation with expiry alerts and security checks  
🔗 Broken link scanning for internal and external URLs  
📊 Google Lighthouse analysis with Performance, Accessibility, Best Practices, and SEO scores  
🌐 Domain health checks including DNS validation and expiry monitoring  
🔄 Mixed content detection to identify insecure resources on HTTPS pages  

---

## 🌍 Multi-Region Monitoring
Monitor your website from multiple global locations to detect regional downtime, latency issues, and real user impact across different geographies.

## 📡 Public Status Page Monitoring
Create and share public status pages to display uptime, performance history, and live monitoring stats with your users or clients.

## 🚨 Incidents Lists & Reporting
Track monitoring incidents with detailed timelines, status history, recovery tracking, and per-monitor reporting for better visibility and troubleshooting.

## 🔔 Rich Notification Integrations
Get real-time alerts through multiple channels:
Email
Slack
Discord
SMS
Telegram
Google Chat
Microsoft Teams
Webhooks
PagerDuty
Zapier
…and more integrations coming soon.

## 🌐 Website Monitoring
Comprehensive website health monitoring including availability, performance checks, SSL status, and content integrity monitoring in one place.

**UpSnap** helps Craft CMS developers, agencies, and site owners maintain reliable, secure, and high-performing websites - all from a simple, integrated dashboard.

---

## Requirements
- Strapi v5.x
- Nodejs ">=18.0.0 <=22.x.x"
- React 18 (provided by Strapi)


## 📦 Installation

Install via npm:

```bash
npm install @upsnap/strapi
```

or via yarn:

```bash
yarn add @upsnap/strapi
```

Enable it in confing/plugins:

```bash
upsnap: {
	enabled: true,
}
```

Restart Strapi:

```bash
npm run develop
```

Upsnap will appear in your admin sidebar.

## 🔧 Configuration

## Quick Setup Guide

After installing the plugin and restarting Strapi:

1. Go to **Upsnap → Settings → API Token**  
   Add your API Token from https://upsnap.ai website

2. Add a new monitor  
   or select a primary monitor if one is already created

3. Configure monitoring options

4. Save and go to dashboard


## Documentation
[Full Documentation](https://github.com/Appfoster/upsnap/wiki)

## Issue Tracking
[GitHub Issues](https://github.com/Appfoster/upsnap-strapi/issues)
[Changelog](https://github.com/Appfoster/upsnap/blob/main/CHANGELOG.md)

## Contact
**Email**: support@upsnap.ai
**Website**: [UpSnap](https://upsnap.ai/)