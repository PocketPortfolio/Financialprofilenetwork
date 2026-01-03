"use strict";
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvFrom = csvFrom;
exports.csvParse = csvParse;
const Papa = __importStar(require("papaparse"));
const XLSX = __importStar(require("xlsx"));
async function csvFrom(file) {
    const buf = await file.arrayBuffer();
    if (file.mime === 'text/csv' || /\.csv$/i.test(file.name)) {
        return new TextDecoder('utf-8').decode(buf).replace(/^\uFEFF/, '');
    }
    if (/sheet|excel/i.test(file.mime) || /\.(xlsx|xls)$/i.test(file.name)) {
        const wb = XLSX.read(buf, { type: 'array' });
        const first = wb.SheetNames[0];
        const csv = XLSX.utils.sheet_to_csv(wb.Sheets[first], { FS: ',', RS: '\n', strip: true });
        return csv.replace(/^\uFEFF/, '');
    }
    throw new Error(`Unsupported mime: ${file.mime}`);
}
function csvParse(text) {
    const { data, errors } = Papa.parse(text, { header: true, dynamicTyping: false, skipEmptyLines: 'greedy' });
    if (errors?.length) {
        // Keep parsing but callers can choose to warn
    }
    return data.filter(Boolean);
}
