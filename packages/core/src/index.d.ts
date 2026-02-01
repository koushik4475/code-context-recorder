/**
 * Code Context Recorder - Core Package
 *
 * This package provides the core functionality for capturing, storing,
 * and searching code context across your development workflow.
 */
export { CodeContextRecorder, createDefaultConfig } from './api/CodeContextRecorder';
export { SQLiteStorageAdapter } from './storage/sqlite';
export { ContextCapture } from './capture/ContextCapture';
export { ContextSearch } from './search/ContextSearch';
export * from './types';
export declare const VERSION = "0.1.0";
//# sourceMappingURL=index.d.ts.map