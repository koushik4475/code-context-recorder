"use strict";
/**
 * Code Context Recorder - Core Package
 *
 * This package provides the core functionality for capturing, storing,
 * and searching code context across your development workflow.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION = exports.ContextSearch = exports.ContextCapture = exports.SQLiteStorageAdapter = exports.createDefaultConfig = exports.CodeContextRecorder = void 0;
// Main API
var CodeContextRecorder_1 = require("./api/CodeContextRecorder");
Object.defineProperty(exports, "CodeContextRecorder", { enumerable: true, get: function () { return CodeContextRecorder_1.CodeContextRecorder; } });
Object.defineProperty(exports, "createDefaultConfig", { enumerable: true, get: function () { return CodeContextRecorder_1.createDefaultConfig; } });
// Storage
var sqlite_1 = require("./storage/sqlite");
Object.defineProperty(exports, "SQLiteStorageAdapter", { enumerable: true, get: function () { return sqlite_1.SQLiteStorageAdapter; } });
// Capture
var ContextCapture_1 = require("./capture/ContextCapture");
Object.defineProperty(exports, "ContextCapture", { enumerable: true, get: function () { return ContextCapture_1.ContextCapture; } });
// Search
var ContextSearch_1 = require("./search/ContextSearch");
Object.defineProperty(exports, "ContextSearch", { enumerable: true, get: function () { return ContextSearch_1.ContextSearch; } });
// Types
__exportStar(require("./types"), exports);
// Version
exports.VERSION = '0.1.0';
//# sourceMappingURL=index.js.map