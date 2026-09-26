export type AdminTool = {
  id: string
  name: string
}

export type AdminCategory = {
  slug: string
  name: string
  tools: AdminTool[]
}

export const categories: AdminCategory[] = [
  {
    slug: 'downloaders',
    name: 'Media downloader',
    tools: [
      { id: 'tiktok-downloader', name: 'TikTok' },
      { id: 'youtube-downloader', name: 'YouTube' },
      { id: 'instagram-downloader', name: 'Instagram' },
      { id: 'x-threads-downloader', name: 'X and Threads' }
    ]
  },

  {
    slug: 'design-tools',
    name: 'Design tools',
    tools: [
      { id: 'svg-vectorizer', name: 'SVG vectorizer' },
      { id: 'base64-converter', name: 'Base64 converter' },
      { id: 'qr-barcode-generator', name: 'QR and barcode generator' },
      {
        id: 'color-palette-generator',
        name: 'Color picker and palette generator'
      },
      { id: 'image-compressor', name: 'Image compressor' }
    ]
  },

  {
    slug: 'security',
    name: 'Security tools',
    tools: [
      { id: 'base64-encode-decode', name: 'Base64 encode/decode' },
      { id: 'aes-encryptor', name: 'AES encryptor' },
      { id: 'password-generator', name: 'Password generator' },
      { id: 'hash-generator', name: 'Hash generator' },
      { id: 'uuid-generator', name: 'UUID/GUID generator' },
      { id: 'password-strength-checker', name: 'Password strength checker' },
      { id: 'file-hash-checker', name: 'File hash checker' }
    ]
  },

  {
    slug: 'utilities',
    name: 'Utilities and web dev',
    tools: [
      { id: 'json-formatter', name: 'JSON formatter' },
      { id: 'jwt-decoder', name: 'JWT decoder' },
      { id: 'markdown-notes', name: 'Markdown notes' },
      { id: 'url-parser', name: 'URL parser' },
      { id: 'regex-tester', name: 'Regex tester' },
      { id: 'case-converter', name: 'Case converter' },
      { id: 'text-diff-checker', name: 'Text diff checker' },
      { id: 'cron-parser', name: 'Cron expression parser' },
      { id: 'github-repo-downloader', name: 'GitHub Repository Downloader' }
    ]
  },

  {
    slug: 'networking',
    name: 'Networking and IT support',
    tools: [
      { id: 'ip-network-info', name: 'IP and network info' },
      { id: 'subnet-calculator', name: 'CIDR/subnet calculator' },
      { id: 'timestamp-converter', name: 'Epoch timestamp converter' },
      { id: 'dns-lookup', name: 'DNS Lookup' },
      { id: 'ping-tester', name: 'Ping/Latency tester' },
      { id: 'mac-vendor-lookup', name: 'MAC Address vendor lookup' },
      { id: 'whois-lookup', name: 'WHOIS/domain info lookup' }
    ]
  }
]
