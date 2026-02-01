/**
 * Code Context Recorder - Core Package
 * 
 * This package provides the core functionality for capturing, storing,
 * and searching code context across your development workflow.
 */

// Main API
export { CodeContextRecorder, createDefaultConfig } from './api/CodeContextRecorder';

// Storage
export { SQLiteStorageAdapter } from './storage/sqlite';

// Capture
export { ContextCapture } from './capture/ContextCapture';

// Search
export { ContextSearch } from './search/ContextSearch';

// Types
export * from './types';

// Version
export const VERSION = '0.1.0';
