import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../data.json');

// Storage Interface
export interface Storage {
  uploadFile: (name: string, type: string, data: string) => Promise<{ url: string; name: string; type: string }>;
  getFile: (fileId: string) => Promise<{ type: string; data: Buffer } | null>;
}

// 1. Cloudinary Implementation
class CloudinaryStorage implements Storage {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(name: string, type: string, data: string) {
    // data is base64 string (data:image/png;base64,...)
    try {
      const result = await cloudinary.uploader.upload(data, {
        resource_type: 'auto', // auto-detect image/video/raw
        public_id: `student-portal/${Date.now()}-${name}`,
      });
      return { url: result.secure_url, name, type };
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      throw new Error("Upload failed");
    }
  }

  async getFile(fileId: string) {
    // Cloudinary handles serving files via URL, so this might not be needed
    // unless we proxy downloads. For now, return null as URL is direct.
    return null;
  }
}

// 2. Local File Implementation (Fallback)
class LocalStorage implements Storage {
  private files: Record<string, { name: string; type: string; data: string }>;

  constructor() {
    this.files = {};
    if (fs.existsSync(DATA_FILE)) {
      try {
        const fileData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        this.files = fileData.files || {};
      } catch (e) {
        console.error("Failed to load local files:", e);
      }
    }
  }

  private save() {
    let existingData: any = {};
    if (fs.existsSync(DATA_FILE)) {
        try {
            existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        } catch (e) {}
    }
    
    const newData = {
        ...existingData,
        files: this.files
    };
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
  }

  async uploadFile(name: string, type: string, data: string) {
    const fileId = Date.now().toString();
    this.files[fileId] = { name, type, data };
    this.save();
    // Return a local API URL
    return { url: `/api/files/${fileId}`, name, type };
  }

  async getFile(fileId: string) {
    const file = this.files[fileId];
    if (!file) return null;

    const matches = file.data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const type = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      return { type, data: buffer };
    }
    return null;
  }
}

// Factory
export const getStorage = (): Storage => {
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    console.log("Using Cloudinary Storage");
    return new CloudinaryStorage();
  }
  console.log("Using Local File Storage (Fallback)");
  return new LocalStorage();
};
