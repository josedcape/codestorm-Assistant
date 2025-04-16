import { v4 as uuidv4 } from 'uuid';
import { File, InsertFile, Settings } from "@shared/schema";

// Storage interface
export interface IStorage {
  getAllFiles(): Promise<File[]>;
  getFile(id: string): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: string, file: Partial<File>): Promise<File | undefined>;
  deleteFile(id: string): Promise<boolean>;
  getSettings(userId: string): Promise<Settings>;
  updateSettings(userId: string, settings: Partial<Settings>): Promise<Settings>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private files: Map<string, File>;
  private userSettings: Map<string, Settings>;

  constructor() {
    this.files = new Map();
    this.userSettings = new Map();

    // Default settings
    this.userSettings.set('default', {
      id: 1,
      userId: 'default',
      theme: 'dark',
      fontSize: 14,
      tabSize: 2,
      wordWrap: false,
      autoSave: false,
      keybindings: {}
    });

    // Sample file for initial state
    const sampleFile: File = {
      id: uuidv4(),
      name: 'main.js',
      content: `/**
 * Main application file
 * This file contains the core functionality of the application
 */

// Import dependencies
import { formatData, processInput } from './utils.js';

// Configuration options
const CONFIG = {
  debug: true,
  version: '1.0.0',
  apiEndpoint: 'https://api.example.com/v1',
  timeout: 5000
};

class Application {
  constructor(options = {}) {
    this.options = { ...CONFIG, ...options };
    this.initialized = false;
    this.data = [];
  }

  async initialize() {
    try {
      console.log(\`Initializing application v\${this.options.version}\`);
      
      // Fetch initial data
      const response = await fetch(this.options.apiEndpoint);
      const rawData = await response.json();
      this.data = formatData(rawData);
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize:', error);
      return false;
    }
  }

  process(input) {
    if (!this.initialized) {
      throw new Error('Application not initialized');
    }
    
    return processInput(input, this.data);
  }
}

// Export the Application class
export default Application;

// Example usage
if (require.main === module) {
  const app = new Application();
  app.initialize().then(() => {
    console.log('Application ready!');
  });
}`,
      language: 'javascript',
      path: '',
      userId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.files.set(sampleFile.id, sampleFile);
  }

  async getAllFiles(): Promise<File[]> {
    return Array.from(this.files.values());
  }

  async getFile(id: string): Promise<File | undefined> {
    return this.files.get(id);
  }

  async createFile(fileData: InsertFile): Promise<File> {
    const id = fileData.id || uuidv4();
    const now = new Date().toISOString();
    
    const file: File = {
      ...fileData,
      id,
      createdAt: now,
      updatedAt: now
    } as File;
    
    this.files.set(id, file);
    return file;
  }

  async updateFile(id: string, fileData: Partial<File>): Promise<File | undefined> {
    const existingFile = this.files.get(id);
    if (!existingFile) return undefined;

    const updatedFile = {
      ...existingFile,
      ...fileData,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: string): Promise<boolean> {
    return this.files.delete(id);
  }

  async getSettings(userId: string): Promise<Settings> {
    // Return default settings if none exist for user
    return this.userSettings.get(userId) || this.userSettings.get('default')!;
  }

  async updateSettings(userId: string, settingsData: Partial<Settings>): Promise<Settings> {
    const existingSettings = await this.getSettings(userId);
    
    const updatedSettings: Settings = {
      ...existingSettings,
      ...settingsData,
      userId // Ensure userId doesn't change
    };

    this.userSettings.set(userId, updatedSettings);
    return updatedSettings;
  }
}

// Export the storage instance
export const storage = new MemStorage();
