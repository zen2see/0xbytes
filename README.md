This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
First, run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Deploy on Vercel
The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# INSTALL
1. Initialize Next.js & shadcn/ui
If you haven't already, create a new Next.js project and initialize the shadcn CLI using pnpm.
# Create project (select Yes for TypeScript, Tailwind, and App Router)
## pnpm create next-app@latest 0xbytes
## cd 0xbytes
## pnpm dlx shadcn@latest init
Alternative fix: Instead of reinstalling, try a temporary workaround for the shadcn/ui request. Set the environment variable to skip SSL verification for this command:
## NODE_TLS_REJECT_UNAUTHORIZED=0 pnpm dlx shadcn@latest add card
# Add necessary shadcn components
## pnpm dlx shadcn@latest add card button tabs textarea input
USED RADIX - LYRA
Vega (Default): The classic shadcn/ui look, formerly known as "New York." It features medium border radius and balanced spacing.
Nova: Designed for compact layouts, featuring reduced padding and margins, making it ideal for dashboards and data-heavy interfaces.
Maia: Soft and rounded, with generous spacing. It is designed for a more relaxed or consumer-facing feel.
Lyra: Boxy and sharp, with zero border radius. It pairs well with monospace fonts and is suitable for technical or developer tools.
Mira: The most compact option, created specifically for high-density interfaces. 
2. The Byte Converter Component
Create a new file at app/page.tsx (or replace the existing one). This code uses FileReader to read files as ArrayBuffer and then converts them to Uint8Array (bytes).
# KEY DIFFERENCES IN NEXT.JS
Browser APIs: Unlike your Node.js script, browsers use FileReader and TextEncoder instead of the fs module.
State Management: React's useState handles the dynamic updates of the byte array on screen.
Shadcn Components: Using the shadcn Button and Tabs provides a professional UI out of the box.
How to Run
Use the pnpm command to start the development server:
## pnpm dev
If you want, I can do the local-storage persistence next (page state survives refresh) in one more quick pass.

# NOTES ON GEMINI
npm install -g @google/gemini-cli
 OR 
npx @google/gemini-cli

# CHANGES SO FAR
UTF-8 text input -> bytes
Hex text input -> bytes
file binary input -> bytes
hex file input -> bytes
copy bytes / copy hex
decoded UTF-8 preview from any current byte array

# PUT NEW APP ON EXISTING DO CD /home/user
git clone https://github.com/..

# INSTALL TO DO
cd /home/mavix/DEV/0xbytes
# INSTALL NODE
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
pnpm -v
# BUILD
pnpm install
pnpm run build

git init
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:yourusername/your-repo.git
git push -u origin main
# ON DO
install Node.js
install npm / pnpm if needed
install NGINX
configure firewall to allow HTTP/HTTPS
sudo apt update
sudo apt install -y nginx git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
cd /var/www
sudo git clone git@github.com:yourusername/your-repo.git 0xbytes
cd 0xbytes

# ON HOSTING SERVER
pnpm install         # or pnpm install
pnpm run build       # if Next.js or build step exists
pnpm start  

# INSTALL NGINX AND NODE IF NOT ALREADY THERE
sudo apt install -y nginx git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# CONFIGURE NGINX AS A REVERSE PROXY
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# ENABLE IT
sudo ln -s /etc/nginx/sites-available/BYTES /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# NEXT.JS CONFIG UPDATE
Because your app is Next.js, set basePath so URLs and assets work correctly under 0xbytes:
In /home/<user>/0xbytes/next.config.js:
const nextConfig = {
  basePath: '/0xbytes',
};
module.exports = nextConfig;

# PERMISSIONS

# CLONE AND RUN APP ON SERVER
cd /var/www
sudo git clone git@github.com:yourusername/your-repo.git 0xbytes
cd 0xbytes
pnpm install        
pnpm run build       # if Next.js or build step exists
pnpm start  

# KEEP APP RUNNING WITH PM2
sudo npm install -g pm2 I FNOT ALREADY INSTALLED
cd /var/www/0xbytes
pm2 start npm --name 0xbytes -- start
pm2 save
pm2 startup

# SUMMARY FOR A NEW SERVER
Push /DEV/0xbytes to GitHub.
Set up Node and NGINX on your DigitalOcean droplet.
Clone the repo on the server, install dependencies, build, and run.
Use NGINX reverse proxy to forward traffic to your app.
Use pm2 or systemd to run it continuously.