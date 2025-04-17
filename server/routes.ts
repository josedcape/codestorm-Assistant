import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFileSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { handleAIGenerate, handleTerminalExecute, handleCodeCorrection } from "./ai";
import multer from 'multer';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

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


  // Configuración de multer para la carga de archivos
  const storageMulter = multer.diskStorage({
    destination: function (req, file, cb) {
      const tempDir = '/tmp/uploads';
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      cb(null, tempDir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });

  const upload = multer({ storage: storageMulter });

  // Ruta para subir y descomprimir archivos ZIP
  app.post('/api/upload-zip', upload.single('zipFile'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
    }

    const zipPath = req.file.path;
    const extractPath = '/home/runner/workspace';

    // Crear directorio temporal para la extracción
    const tempExtractDir = '/tmp/extract';
    if (!fs.existsSync(tempExtractDir)) {
      fs.mkdirSync(tempExtractDir, { recursive: true });
    }

    // Descomprimir el archivo
    exec(`unzip -o "${zipPath}" -d "${tempExtractDir}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error descomprimiendo el archivo: ${error.message}`);
        return res.status(500).json({ error: 'Error al descomprimir el archivo' });
      }

      // Copiar archivos al directorio de trabajo
      exec(`cp -r "${tempExtractDir}"/* "${extractPath}"`, (cpError, cpStdout, cpStderr) => {
        if (cpError) {
          console.error(`Error copiando archivos: ${cpError.message}`);
          return res.status(500).json({ error: 'Error al copiar los archivos descomprimidos' });
        }

        // Limpiar archivos temporales
        exec(`rm -rf "${zipPath}" "${tempExtractDir}"`, () => {
          res.json({ success: true, message: 'Archivo descomprimido correctamente' });
        });
      });
    });
  });

  // API endpoints para IA
  app.post("/api/ai/generate", async (req, res) => {
    await handleAIGenerate(req, res);
  });

  // Ruta para corrección de código
  app.post('/api/correct', async (req, res) => {
    await handleCodeCorrection(req, res);
  });

  // API endpoint para ejecución de comandos de terminal
  app.post("/api/terminal/execute", handleTerminalExecute);

  const httpServer = createServer(app);
  return httpServer;
}