"use strict";
/**
 * Core type definitions for Code Context Recorder
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityCategory = exports.ContextSource = exports.ContextType = void 0;
var ContextType;
(function (ContextType) {
    ContextType["TEXT"] = "text";
    ContextType["VOICE"] = "voice";
    ContextType["LINK"] = "link";
    ContextType["CODE_SNIPPET"] = "code_snippet";
    ContextType["COMMIT"] = "commit";
    ContextType["MEETING_NOTE"] = "meeting_note";
    ContextType["DECISION"] = "decision";
    ContextType["BUG_REPORT"] = "bug_report";
    ContextType["RESEARCH"] = "research";
})(ContextType || (exports.ContextType = ContextType = {}));
var ContextSource;
(function (ContextSource) {
    ContextSource["MANUAL"] = "manual";
    ContextSource["GIT_HOOK"] = "git_hook";
    ContextSource["BROWSER_EXTENSION"] = "browser_extension";
    ContextSource["VSCODE_EXTENSION"] = "vscode_extension";
    ContextSource["CLI"] = "cli";
    ContextSource["API"] = "api";
})(ContextSource || (exports.ContextSource = ContextSource = {}));
var ActivityCategory;
(function (ActivityCategory) {
    ActivityCategory["DOCUMENTATION"] = "documentation";
    ActivityCategory["STACKOVERFLOW"] = "stackoverflow";
    ActivityCategory["GITHUB"] = "github";
    ActivityCategory["BLOG"] = "blog";
    ActivityCategory["VIDEO"] = "video";
    ActivityCategory["OTHER"] = "other";
})(ActivityCategory || (exports.ActivityCategory = ActivityCategory = {}));
//# sourceMappingURL=index.js.map