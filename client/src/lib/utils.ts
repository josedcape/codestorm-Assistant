import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const languageOptions = [
  { value: "javascript", label: "JavaScript", extension: "js" },
  { value: "typescript", label: "TypeScript", extension: "ts" },
  { value: "css", label: "CSS", extension: "css" },
  { value: "html", label: "HTML", extension: "html" },
  { value: "python", label: "Python", extension: "py" },
  { value: "java", label: "Java", extension: "java" },
  { value: "csharp", label: "C#", extension: "cs" },
  { value: "cpp", label: "C++", extension: "cpp" },
  { value: "go", label: "Go", extension: "go" },
  { value: "rust", label: "Rust", extension: "rs" },
  { value: "php", label: "PHP", extension: "php" },
  { value: "ruby", label: "Ruby", extension: "rb" },
  { value: "markdown", label: "Markdown", extension: "md" },
  { value: "json", label: "JSON", extension: "json" },
  { value: "plaintext", label: "Plain Text", extension: "txt" },
];

export function getLanguageForFilename(filename: string): string {
  if (!filename) return "plaintext";
  
  const extension = filename.split('.').pop()?.toLowerCase() || "";
  
  const language = languageOptions.find(lang => lang.extension === extension);
  return language?.value || "plaintext";
}

export function getFilenameExtensionForLanguage(language: string): string {
  const option = languageOptions.find(lang => lang.value === language);
  return option?.extension || "txt";
}

export function generateDefaultFilename(language: string): string {
  const extension = getFilenameExtensionForLanguage(language);
  return `untitled.${extension}`;
}

// Function to generate unique names for untitled files
export function generateUntitledFilename(language: string, existingFiles: string[]): string {
  const extension = getFilenameExtensionForLanguage(language);
  let index = 1;
  let filename = `untitled.${extension}`;
  
  while (existingFiles.includes(filename)) {
    filename = `untitled${index}.${extension}`;
    index++;
  }
  
  return filename;
}

// Simple function to create "fake" file paths for the UI
export function createFilePath(filename: string, parent?: string): string {
  if (!parent) return filename;
  return `${parent}/${filename}`;
}
