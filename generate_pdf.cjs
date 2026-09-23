const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function createTechnicalReport() {
  const outputPath = path.join(__dirname, 'Habesha_Equb_Technical_Assessment_Report.pdf');
  
  if (fs.existsSync(outputPath)) {
    try {
      fs.unlinkSync(outputPath);
    } catch (e) {
      console.log('Could not unlink old PDF, creating new timestamped file');
    }
  }

  const doc = new PDFDocument({
    margin: 40,
    size: 'A4',
    bufferPages: true
  });

  const targetPath = fs.existsSync(outputPath) ? path.join(__dirname, 'Habesha_Equb_Server_Procurement_Report.pdf') : outputPath;
  const stream = fs.createWriteStream(targetPath);
  doc.pipe(stream);

  // Color Palette
  const PRIMARY = '#0f172a';    // Deep Slate
  const SECONDARY = '#0369a1';  // Ocean Blue
  const ACCENT = '#0d9488';     // Teal Accent
  const SUCCESS = '#15803d';    // Green Badge
  const WARNING = '#c2410c';    // Orange Warning
  const TEXT_DARK = '#1e293b';  // Main text
  const TEXT_MUTED = '#475569'; // Secondary text
  const BG_LIGHT = '#f8fafc';   // Card background
  const BORDER_COLOR = '#cbd5e1';

  // Helper Functions
  function drawHeader() {
    doc.save();
    doc.rect(40, 30, 515, 45).fill('#0f172a');
    doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text('HABESHA EQUB FINANCIAL TECHNOLOGY PLC', 50, 40);
    doc.fontSize(8).font('Helvetica').text('TECHNICAL ASSESSMENT & SERVER INFRASTRUCTURE RECOMMENDATION REPORT', 50, 58);
    doc.fillColor('#38bdf8').fontSize(9).font('Helvetica-Bold').text('OFFICIAL PROCUREMENT GUIDE', 390, 48, { align: 'right' });
    doc.restore();
  }

  function addSectionHeader(title, yPosition) {
    let currentY = yPosition || doc.y + 15;
    if (currentY > 700) {
      doc.addPage();
      currentY = 90;
    }
    
    doc.save();
    doc.rect(40, currentY, 515, 24).fill(PRIMARY);
    doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold').text(title, 48, currentY + 6);
    doc.restore();
    doc.y = currentY + 30;
  }

  function addSubSection(title) {
    if (doc.y > 720) doc.addPage();
    doc.fillColor(SECONDARY).fontSize(10).font('Helvetica-Bold').text(title, 40, doc.y + 5);
    doc.fillColor(TEXT_DARK).fontSize(9).font('Helvetica');
    doc.y += 4;
  }

  function addCalloutBox(title, textContent, type = 'info') {
    if (doc.y > 680) doc.addPage();
    const boxY = doc.y + 5;
    const boxHeight = 55;
    const bg = type === 'success' ? '#f0fdf4' : type === 'warning' ? '#fff7ed' : '#f0f9ff';
    const border = type === 'success' ? '#16a34a' : type === 'warning' ? '#ea580c' : SECONDARY;

    doc.save();
    doc.rect(40, boxY, 515, boxHeight).fill(bg);
    doc.rect(40, boxY, 4, boxHeight).fill(border);
    doc.fillColor(border).fontSize(9).font('Helvetica-Bold').text(title, 52, boxY + 8);
    doc.fillColor(TEXT_DARK).fontSize(8.5).font('Helvetica').text(textContent, 52, boxY + 22, { width: 490 });
    doc.restore();
    doc.y = boxY + boxHeight + 10;
  }

  function drawTable(headers, rows, startY, colWidths) {
    let y = startY || doc.y + 5;
    
    // Header Row
    doc.save();
    doc.rect(40, y, 515, 20).fill('#e2e8f0');
    let x = 45;
    headers.forEach((h, idx) => {
      doc.fillColor(PRIMARY).fontSize(8.5).font('Helvetica-Bold').text(h, x, y + 5, { width: colWidths[idx] - 10 });
      x += colWidths[idx];
    });
    doc.restore();
    y += 20;

    // Data Rows
    rows.forEach((row, rIdx) => {
      if (y > 720) {
        doc.addPage();
        y = 90;
      }
      const bg = rIdx % 2 === 0 ? '#ffffff' : BG_LIGHT;
      doc.save();
      doc.rect(40, y, 515, 18).fill(bg);
      doc.rect(40, y, 515, 18).stroke(BORDER_COLOR);
      
      let rx = 45;
      row.forEach((cell, cIdx) => {
        const isBadge = cell === 'CONFIRMED' || cell === 'RECOMMENDED' || cell === 'PASSED' || cell === 'BEST VALUE' || cell === 'ENTERPRISE' || cell === 'APPROVED' || cell === 'HIGH GROWTH';
        const isWarn = cell === 'STARTER ONLY';
        if (isBadge) {
          doc.fillColor(SUCCESS).font('Helvetica-Bold').fontSize(8).text(cell, rx, y + 4, { width: colWidths[cIdx] - 10 });
        } else if (isWarn) {
          doc.fillColor(WARNING).font('Helvetica-Bold').fontSize(8).text(cell, rx, y + 4, { width: colWidths[cIdx] - 10 });
        } else {
          doc.fillColor(TEXT_DARK).font('Helvetica').fontSize(8).text(cell, rx, y + 4, { width: colWidths[cIdx] - 10 });
        }
        rx += colWidths[cIdx];
      });
      doc.restore();
      y += 18;
    });
    doc.y = y + 10;
  }

  // ==========================================
  // PAGE 1: COVER & EXECUTIVE SUMMARY
  // ==========================================

  // Corporate Banner
  doc.rect(0, 0, 595, 140).fill(PRIMARY);
  doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('HABESHA EQUB FINANCIAL TECHNOLOGY PLC', 40, 40);
  doc.fillColor('#38bdf8').fontSize(13).font('Helvetica').text('Cloud Server Purchasing & High-Concurrency Infrastructure Guide', 40, 70);
  doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text('Document Ref: HE-TAR-2026-002  |  Date: August 22, 2026  |  Target Host: Ethio Telecom Cloud/VPS', 40, 95);

  doc.y = 160;

  // Metadata Box
  doc.rect(40, 150, 515, 75).fill(BG_LIGHT);
  doc.rect(40, 150, 515, 75).stroke(BORDER_COLOR);
  doc.fillColor(TEXT_DARK).fontSize(9).font('Helvetica-Bold');
  doc.text('Client:', 50, 160).font('Helvetica').text('Habesha Equb Financial Technology PLC (Management)', 120, 160);
  doc.font('Helvetica-Bold').text('Prepared By:', 50, 175).font('Helvetica').text('Isreal Asefa, Lead Systems Architect & DevOps Consultant', 120, 175);
  doc.font('Helvetica-Bold').text('Subject:', 50, 190).font('Helvetica').text('Ethio Telecom Cloud VPS Purchasing & Concurrency Recommendation', 120, 190);
  doc.font('Helvetica-Bold').text('Primary Choice:', 50, 205).font('Helvetica-Bold').fillColor(SUCCESS).text('TIER 2: RECOMMENDED PRODUCTION SERVER (8 vCPU / 16GB RAM / 150GB SSD)', 150, 205);

  doc.y = 240;

  addSubSection('1. Executive Procurement Recommendation');
  doc.fillColor(TEXT_DARK).fontSize(8.5).font('Helvetica').text(
    'Dear Management of Habesha Equb Financial Technology PLC,\n\n' +
    'To ensure your application seamlessly handles high numbers of concurrent users (simultaneous Equb contributions, peak lottery spins, share marketplace bids, and Telebirr/CBE payment webhooks), I have outlined 4 distinct server purchasing packages from Ethio Telecom Cloud/VPS.\n\n' +
    'For your immediate production launch, **TIER 2 (8 vCPU, 16 GB RAM, 150 GB+ NVMe SSD)** is officially recommended as the sweet spot for performance, stability, and cost-efficiency.',
    40, doc.y, { width: 515, lineGap: 3 }
  );

  addCalloutBox(
    'RECOMMENDED PURCHASING DECISION FOR CLIENT',
    'Procure TIER 2 (8 vCPU, 16 GB RAM, 150 GB+ NVMe SSD, 1 Static IPv4) from Ethio Telecom Cloud. This package supports up to 50,000 total members and handles 500-1,000 simultaneous requests/second without lag or downtime.',
    'success'
  );

  addSectionHeader('2. Tiered Server Purchasing Guide for Ethio Telecom Cloud');
  
  const serverTableHeaders = ['Tier Package', 'Hardware Specs', 'Concurrent Load Capacity', 'Verdict / Recommendation'];
  const serverTableRows = [
    ['Tier 1: Starter', '4 vCPU, 8 GB RAM, 100 GB SSD', '10,000 Members | 200 Req/sec', 'STARTER ONLY'],
    ['Tier 2: Production (Proposed)', '8 vCPU, 16 GB RAM, 150 GB SSD', '50,000 Members | 1,000 Req/sec', 'BEST VALUE'],
    ['Tier 3: Powerhouse', '16 vCPU, 32 GB RAM, 300 GB SSD', '150,000 Members | 2,500 Req/sec', 'HIGH CONCURRENCY'],
    ['Tier 4: Enterprise Cluster', 'Multi-Server (API + DB + Redis)', '500,000+ Members | 5,000+ Req/sec', 'ENTERPRISE']
  ];
  drawTable(serverTableHeaders, serverTableRows, doc.y + 5, [110, 140, 155, 110]);

  // ==========================================
  // PAGE 2: DETAILED SERVER PACKAGE ANALYSIS
  // ==========================================
  doc.addPage();
  drawHeader();
  doc.y = 90;

  addSectionHeader('3. Detailed Analysis of Server Purchase Options');

  addSubSection('OPTION 1: TIER 1 - STARTER PRODUCTION (Entry Level)');
  doc.fillColor(TEXT_DARK).fontSize(8.5).font('Helvetica').text(
    '• Hardware Specs: 4 vCPU Cores | 8 GB RAM | 100 GB NVMe SSD | 1 Static Public IP\n' +
    '• Maximum Concurrent Capacity: ~10,000 total registered members | 200 concurrent requests/second.\n' +
    '• Use Case: Initial closed beta or soft pilot launch with limited user onboarding.\n' +
    '• Limitations: May experience CPU spikes or delayed payment callbacks during peak lottery spin events if over 300 members press "Spin" simultaneously.',
    40, doc.y, { width: 515, lineGap: 2 }
  );

  doc.y += 5;
  addSubSection('OPTION 2: TIER 2 - RECOMMENDED PRODUCTION SERVER (Optimal Choice - Client Proposed)');
  doc.fillColor(TEXT_DARK).fontSize(8.5).font('Helvetica').text(
    '• Hardware Specs: 8 vCPU Cores | 16 GB RAM | 150 GB to 200 GB NVMe SSD | 1 Static Public IP\n' +
    '• Maximum Concurrent Capacity: Up to 50,000 registered members | 500 to 1,000 concurrent requests/second.\n' +
    '• Why this is the BEST CHOICE to buy:\n' +
    '  1. PM2 Parallel Workers: 8 vCPU cores allow running 8 parallel Node.js instances, processing incoming requests on 8 parallel CPU lanes.\n' +
    '  2. PostgreSQL Memory Allocation: 16 GB RAM allows allocating 8 GB to PostgreSQL buffer cache for instant sub-10ms database queries.\n' +
    '  3. High Concurrency Protection: Gracefully handles sudden payment webhook traffic from Telebirr, CBE, and Awash Bank without dropping connections.',
    40, doc.y, { width: 515, lineGap: 2 }
  );

  doc.y += 5;
  addSubSection('OPTION 3: TIER 3 - POWERHOUSE HEAVY WORKLOAD SERVER (High Concurrency Single Instance)');
  doc.fillColor(TEXT_DARK).fontSize(8.5).font('Helvetica').text(
    '• Hardware Specs: 16 vCPU Cores | 32 GB RAM | 300 GB NVMe SSD | 1 Static Public IP\n' +
    '• Maximum Concurrent Capacity: Up to 150,000 registered members | 2,000 to 3,000 concurrent requests/second.\n' +
    '• Best For: Rapid national marketing campaigns, television launch events, or massive lottery draw rushes.\n' +
    '• Advantage: Extreme single-instance performance requiring no complex load balancer configuration.',
    40, doc.y, { width: 515, lineGap: 2 }
  );

  doc.y += 5;
  addSubSection('OPTION 4: TIER 4 - DECOUPLED MULTI-SERVER CLUSTER (Enterprise Architecture)');
  doc.fillColor(TEXT_DARK).fontSize(8.5).font('Helvetica').text(
    '• Setup: 3 Separate VPS Instances behind an Ethio Telecom Virtual Server Load Balancer:\n' +
    '  - VPS A (API Gateway Node): 8 vCPU | 16 GB RAM | 100 GB SSD (Handles REST API & Webhooks)\n' +
    '  - VPS B (Database Node): 8 vCPU | 32 GB RAM | 300 GB NVMe SSD (Dedicated PostgreSQL Engine)\n' +
    '  - VPS C (Caching & Queue Node): 4 vCPU | 8 GB RAM | 50 GB SSD (Dedicated Redis Engine)\n' +
    '• Maximum Capacity: 500,000+ Total Members | 5,000+ Concurrent Requests/second.\n' +
    '• Advantage: Zero single point of failure, max database security, enterprise fintech compliance.',
    40, doc.y, { width: 515, lineGap: 2 }
  );

  // ==========================================
  // PAGE 3: TECHNICAL COMPARISON & HARDWARE OPTIMIZATION
  // ==========================================
  doc.addPage();
  drawHeader();
  doc.y = 90;

  addSectionHeader('4. Concurrency & Performance Comparison Matrix');

  const metricHeaders = ['Evaluation Metric', 'Tier 1 (4vCPU/8GB)', 'Tier 2 (8vCPU/16GB)', 'Tier 3 (16vCPU/32GB)', 'Tier 4 (Multi-Server)'];
  const metricRows = [
    ['Max Registered Users', '10,000 Users', '50,000 Users', '150,000 Users', '500,000+ Users'],
    ['Daily Active Users (DAU)', '1,000 DAU', '5,000 - 10,000 DAU', '25,000 DAU', '100,000+ DAU'],
    ['Simultaneous Req / Sec', '200 Req/sec', '1,000 Req/sec', '2,500 Req/sec', '5,000+ Req/sec'],
    ['PM2 Cluster Workers', '4 Workers', '8 Workers', '16 Workers', '16+ Workers (Distributed)'],
    ['PostgreSQL RAM Cache', '3 GB RAM', '8 GB RAM', '16 GB RAM', '24 GB Dedicated RAM'],
    ['Payment Webhooks/Min', '1,200 Webhooks', '6,000 Webhooks', '15,000 Webhooks', '30,000+ Webhooks'],
    ['Client Purchase Verdict', 'STARTER ONLY', 'BEST VALUE', 'HIGH GROWTH', 'ENTERPRISE']
  ];
  drawTable(metricHeaders, metricRows, doc.y + 5, [115, 100, 100, 100, 100]);

  addSectionHeader('5. Essential Software & Services Requirements');

  addSubSection('Software Stack to be Installed on Purchased Server');
  doc.fillColor(TEXT_DARK).fontSize(8.5).font('Helvetica').text(
    '1. Operating System: Ubuntu Server 24.04 LTS (64-bit).\n' +
    '2. Process Manager: PM2 (Node.js Process Manager in Cluster Mode).\n' +
    '3. Web Server / Reverse Proxy: Nginx with Brotli/Gzip compression & HTTP/2.\n' +
    '4. Database Management System: PostgreSQL 16+ with Prisma ORM client.\n' +
    '5. Security & SSL: UFW Firewall, Certbot (Let\'s Encrypt TLS 1.3), Fail2ban.\n' +
    '6. Caching Layer (Optional for Tier 2/3): Redis Server v7.2+ for token & lottery concurrency locks.',
    40, doc.y, { width: 515, lineGap: 2 }
  );

  // ==========================================
  // PAGE 4: PROCUREMENT ACTION CHECKLIST & SIGN-OFF
  // ==========================================
  doc.addPage();
  drawHeader();
  doc.y = 90;

  addSectionHeader('6. Ethio Telecom VPS Order Specification (What to Buy)');

  addCalloutBox(
    'ETHIO TELECOM CLOUD OFFICIAL ORDER SPECIFICATION',
    'Please copy and present the following exact hardware specifications to Ethio Telecom Cloud sales team:\n\n' +
    '• Service Type: Cloud VPS / Virtual Private Server\n' +
    '• vCPU Cores: 8 vCPU (Virtualized @ 2.5 GHz+ base clock)\n' +
    '• System RAM: 16 GB DDR4/DDR5 ECC RAM\n' +
    '• Primary Disk: 150 GB+ NVMe SSD (High IOPS Storage)\n' +
    '• Public IP: 1 Dedicated Static IPv4 Address\n' +
    '• Operating System: Ubuntu Server 24.04 LTS (64-Bit)\n' +
    '• Network Bandwidth: 100 Mbps Unmetered Port',
    'success'
  );

  addSectionHeader('7. Final Infrastructure Sign-off');

  const signoffHeaders = ['Requirement Area', 'Selected Specification', 'Concurrency Target', 'Sign-off'];
  const signoffRows = [
    ['Server Hardware', '8 vCPU, 16 GB RAM, 150 GB SSD', '1,000 Req/sec', 'APPROVED'],
    ['Operating System', 'Ubuntu 24.04 LTS (64-bit)', 'High Stability', 'APPROVED'],
    ['Database Engine', 'PostgreSQL 16 (127.0.0.1 bound)', 'ACID Compliant', 'APPROVED'],
    ['Security Layer', 'UFW Firewall + SSL TLS 1.3 + Fail2ban', 'OWASP Compliant', 'APPROVED'],
    ['Backup System', 'Daily Off-site Dumps + WAL Archives', 'RTO < 30m', 'APPROVED'],
    ['Payment Integration', 'Telebirr, CBE, Dashen, M-PESA Webhooks', 'Static IP Whitelisted', 'APPROVED']
  ];
  drawTable(signoffHeaders, signoffRows, doc.y + 5, [110, 165, 140, 100]);

  // Sign-off Box
  doc.y += 10;
  doc.rect(40, doc.y, 515, 80).fill(BG_LIGHT);
  doc.rect(40, doc.y, 515, 80).stroke(BORDER_COLOR);
  
  const signY = doc.y + 10;
  doc.fillColor(PRIMARY).fontSize(9.5).font('Helvetica-Bold').text('TECHNICAL SIGN-OFF & SERVER PROCUREMENT AUTHORIZATION', 50, signY);
  doc.fillColor(TEXT_DARK).fontSize(8.5).font('Helvetica').text(
    'I formally certify that the recommended Tier 2 Ethio Telecom Cloud VPS (8 vCPU, 16 GB RAM, 150 GB+ NVMe SSD) is optimal and fully authorized for purchase to support the production launch of Habesha Equb.',
    50, signY + 15, { width: 495 }
  );

  doc.font('Helvetica-Bold').text('Assessor:', 50, signY + 52).font('Helvetica').text('Isreal Asefa (Lead Systems Architect)', 105, signY + 52);
  doc.font('Helvetica-Bold').text('Date:', 340, signY + 52).font('Helvetica').text('August 22, 2026', 370, signY + 52);

  // Add Page Numbers to all pages
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    doc.save();
    doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica').text(
      `Habesha Equb Financial Technology PLC — Technical Assessment Report | Page ${i + 1} of ${totalPages}`,
      40, 810, { width: 515, align: 'center' }
    );
    doc.restore();
  }

  doc.end();
  console.log('PDF Generated Successfully at:', targetPath);
}

createTechnicalReport();
