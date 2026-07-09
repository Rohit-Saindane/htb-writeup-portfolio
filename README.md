# 🚀 Hack The Box Writeups Portfolio

A premium, highly interactive web application showcasing cybersecurity writeups, machine walkthroughs, and live Hack The Box platform profile statistics. Built using **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.

---

## ✨ Key Features

- **📊 Live HTB Stats Dashboard:**
  - Queries Hack The Box APIs (Basic Profile, Machine Progress, and Solves Activity) concurrently.
  - Custom concentric radial SVG chart mapping machine difficulty completion percentages.
  - Interactive feed showcasing the 5 most recent machine solves with relative dates and points.
  - Secure API route caching (10-minute TTL) and rate limiting (60 requests/hour).
  - Clean mock data fallback reflecting real-time stats if offline.

- **✍️ MDX-Powered Walkthroughs:**
  - Writeups authored in MDX, featuring dynamic headings, lists, and structured metadata.
  - Interactive **Copy-to-Clipboard** terminal buttons for easy command copy.
  - Auto-generated table of contents for smooth article navigation.

- **🛡️ Tech Arsenal Grid:**
  - Dynamic display of tools and skills (Nmap, Burp Suite, Metasploit, Python, BloodHound, Wireshark).
  - Premium glowing borders and custom hover transitions using Framer Motion.

- **🌓 Theme Engine:**
  - Sleek hacker-themed Dark Mode and clean, accessible Light Mode via `next-themes`.

---

## 🛠️ Technology Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, CSS variables
- **Animations:** Framer Motion, Lucide icons
- **Content:** MDX (Markdown Component), gray-matter

---

## 📂 Project Structure

```bash
htb-writeup-portfolio/
├── content/                     # MDX Writeups
│   └── writeups/
│       ├── season-9-release-arena/
│       └── season-10/
├── public/                      # Static assets (Favicon, Fonts, Machine Logos)
├── scripts/                     # Helper & automation scripts
│   ├── download-logos.js        # Automatic logos downloader
│   └── import-writeups.js       # Script to parse and migrate writeup files
├── src/
│   ├── app/                     # Next.js pages & route handlers
│   │   ├── api/htb-stats/       # HTB concurrent stats aggregator API
│   │   ├── writeups/            # Catalog and writeup slug page
│   │   └── page.tsx             # Portfolio homepage
│   ├── components/              # Interactive UI components
│   │   ├── HtbStatsCard.tsx     # High-end concentric stats widget
│   │   ├── WriteupCard.tsx      # Writeup display card
│   │   ├── ThemeToggle.tsx      # Dark / Light theme switch
│   │   └── Navbar.tsx & Footer.tsx
│   ├── lib/
│   │   └── mdx.ts               # MDX content reader and path mapper
│   └── styles/
│       └── prism-hacker.css     # Terminal code block styling
```

---

## ⚙️ Configuration & Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Rohit-Saindane/htb-writeup-portfolio.git
   cd htb-writeup-portfolio
   ```

2. **Set Up Environment Variables:**
   Create a `.env.local` file in the root directory and add your Hack The Box credentials:
   ```env
   # HTB API Authorization Bearer Token
   HTB_APP_TOKEN="your_htb_app_token_here"
   
   # HTB Account User ID
   HTB_USER_ID="your_htb_user_id_here"
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 🔗 Connected Repositories

- **Portfolio Website:** [htb-writeup-portfolio](https://github.com/Rohit-Saindane/htb-writeup-portfolio)
- **Raw Writeup Markdown Files:** [HTB-Writeups](https://github.com/Rohit-Saindane/HTB-Writeups)
