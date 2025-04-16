import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFileSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all files
  app.get("/api/files", async (req, res) => {
    try {
      const files = await storage.getAllFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve files" });
    }
  });

  // Get a specific file
  app.get("/api/files/:id", async (req, res) => {
    try {
      const file = await storage.getFile(req.params.id);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      res.json(file);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve file" });
    }
  });

  // Create a new file
  app.post("/api/files", async (req, res) => {
    try {
      const fileData = insertFileSchema.parse({
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const file = await storage.createFile(fileData);
      res.status(201).json(file);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Failed to create file" });
    }
  });

  // Update a file
  app.put("/api/files/:id", async (req, res) => {
    try {
      const fileData = {
        ...req.body,
        updatedAt: new Date().toISOString()
      };

      const file = await storage.updateFile(req.params.id, fileData);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      res.json(file);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Failed to update file" });
    }
  });

  // Delete a file
  app.delete("/api/files/:id", async (req, res) => {
    try {
      const success = await storage.deleteFile(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "File not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // Get settings
  app.get("/api/settings", async (req, res) => {
    try {
      // For now, just return default settings
      // In a real app, you would look up settings from storage
      const settings = await storage.getSettings("default");
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve settings" });
    }
  });

  // Update settings
  app.put("/api/settings", async (req, res) => {
    try {
      const settings = await storage.updateSettings("default", req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Run code (simplified for demo)
  app.post("/api/run", (req, res) => {
    try {
      const { code, language } = req.body;
      
      if (!code || !language) {
        return res.status(400).json({ 
          error: "Both code and language are required" 
        });
      }
      
      // For security reasons, this is just a mock implementation
      // Real implementation would use a proper sandbox
      let output = "";
      
      switch (language) {
        case "javascript":
          output = "JavaScript execution output would appear here";
          break;
        case "python":
          output = "Python execution output would appear here";
          break;
        default:
          output = `Execution for ${language} is not supported yet`;
      }
      
      res.json({ output });
    } catch (error) {
      res.status(500).json({ error: "Failed to execute code" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
