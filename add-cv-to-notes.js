// Script to add the CV data to Notes section
// Run this in browser console to recover the CV data

const cvData = {
  id: 'cv-recovery-' + Date.now(),
  title: "Nishen's Complete CV - Updated July 2025",
  content: `# NISHEN HARICHUNDER
**Senior Technical Lead Engineer & Solutions Architect**

📍 Unit 117, 163 Lilian Ngoyi Street, Windermere , Durban, South Africa, 4001
📱 +27 74 745 1618
✉️ nishenh@ftechkzn.co.za
🆔 ID: 7910275126087 | 🚗 License: Code 08  

## PROFESSIONAL SUMMARY
Innovative Senior Technical Lead Engineer and Solutions Architect with 20+ years of enterprise IT experience, specializing in Microsoft technologies, AI integration, and scalable infrastructure solutions. Proven track record of leading technical teams, implementing enterprise-grade systems across 100+ clients, and driving digital transformation initiatives.

## KEY UPDATES (July 2025):
- **Contact Update**: New address and email (ftechkzn.co.za)
- **Reference Update**: Stephen Yarlet - First Technology (+27 31 573 6287)
- **Certifications Added**: MCP Certified Advanced Server 2019
- **Project Portfolio**: Nishen's AI Workspace (17.5+ hours, Production Ready)

## RECENT PROJECT PORTFOLIO

### **Nishen's AI Workspace** | *July 2025*
**Full-Stack Development Lead** | *17.5+ Hours Investment*

*Professional development environment with AI integration targeting global developer market*

#### **Technical Implementation**
- **Frontend**: React 18.2, Next.js 14.2.5, TypeScript 5.1.6, Tailwind CSS 3.3.3
- **Desktop App**: Electron with IPC communication and native menu systems
- **Backend**: Node.js with WebSocket real-time communication
- **AI Integration**: Claude AI API with streaming response architecture

#### **Key Features Delivered**
- **Dynamic Theming System**: Real-time color switching with CSS custom properties
- **Multi-Terminal Support**: Bash, PowerShell, Command Prompt integration
- **File Management**: Virtual file system with CRUD operations and version control
- **Professional Tools**: 20+ system administration utilities with monitoring simulation
- **Settings Management**: 6-category configuration with export/import functionality

#### **Commercial Readiness**
- **Production-Ready**: Fully functional web application with desktop integration
- **Scalable Architecture**: Foundation for 1000+ active users within 6 months
- **Market Potential**: Professional productivity tool for engineers and developers worldwide

## EDUCATION & CERTIFICATIONS (UPDATED)

### **Cloud & Advanced Certifications**
- **MCP Certified Advanced Server 2019** | *Microsoft Certified Professional* | *2019*
- **MCSE (Microsoft Certified Systems Engineer)** | *Enterprise Certification* | *Current*
- **MCP (Microsoft Certified Professional)** | *Digital Certification* | *Current*

### **Microsoft Server Certifications**
- **Windows Server 2012 R2 (070-410)** | *Installing and Configuring* | *2012*
- **Installing and Configuring Windows Server 2012** | *Microsoft Official* | *2014*
- **MCSE 2000** | *National Certification* | Hatfield Business & Computer College

## PROFESSIONAL REFERENCES (UPDATED)

**Stephen Yarlet** | *First Technology*
📞 +27 31 573 6287

**Stjepan Odak** | *BBD*  
📞 011 532 8358

**Amith Ramchandra** | *PwC*  
📞 082 803 5005

*Complete CV file saved as: Nishen_Harichunder_CV_2025_COMPLETE.md*`,
  category: 'Personal',
  tags: ['cv', 'career', 'professional', 'resume', 'july-2025'],
  created: new Date('2025-07-14'),
  modified: new Date('2025-07-14'),
  isPinned: true,
  isArchived: false,
  type: 'markdown'
};

// Add to existing notes
const existingNotes = JSON.parse(localStorage.getItem('nishen-workspace-notes') || '[]');
existingNotes.push(cvData);
localStorage.setItem('nishen-workspace-notes', JSON.stringify(existingNotes));

console.log('✅ CV data added to Notes section successfully!');
console.log('📝 Note title:', cvData.title);
console.log('📂 Category:', cvData.category);
console.log('🔗 Tags:', cvData.tags);

// Trigger storage event to refresh UI
window.dispatchEvent(new Event('storage'));

// Show completion message
alert('✅ CV Data Recovered!\n\nYour complete CV has been added to the Notes section under Personal category.\n\nRefresh the page to see it in the workspace.');