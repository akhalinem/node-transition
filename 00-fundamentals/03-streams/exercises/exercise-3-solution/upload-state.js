import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * Manages upload state for pause/resume functionality
 */

const STATE_DIR = '.upload-states';

// Ensure state directory exists
if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
}

/**
 * Get state file path for a given file
 */
function getStateFilePath(filePath) {
    const hash = crypto.createHash('md5').update(filePath).digest('hex');
    return path.join(STATE_DIR, `${hash}.json`);
}

/**
 * Save upload state
 */
export function saveState(filePath, state) {
    const stateFile = getStateFilePath(filePath);
    const data = {
        ...state,
        filePath,
        timestamp: new Date().toISOString()
    };
    fs.writeFileSync(stateFile, JSON.stringify(data, null, 2));
}

/**
 * Load upload state
 */
export function loadState(filePath) {
    const stateFile = getStateFilePath(filePath);
    
    if (!fs.existsSync(stateFile)) {
        return null;
    }
    
    try {
        const data = fs.readFileSync(stateFile, 'utf8');
        const state = JSON.parse(data);
        
        // Check if state is stale (older than 24 hours)
        const age = Date.now() - new Date(state.timestamp).getTime();
        const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
        
        if (age > MAX_AGE) {
            console.log('⚠️  Upload state is stale (>24h), starting fresh');
            clearState(filePath);
            return null;
        }
        
        return state;
    } catch (error) {
        console.error('Failed to load state:', error.message);
        return null;
    }
}

/**
 * Clear upload state
 */
export function clearState(filePath) {
    const stateFile = getStateFilePath(filePath);
    
    if (fs.existsSync(stateFile)) {
        fs.unlinkSync(stateFile);
    }
}

/**
 * Check if upload can be resumed
 */
export function canResume(filePath) {
    const state = loadState(filePath);
    
    if (!state) {
        return false;
    }
    
    // Verify the file still exists and hasn't changed
    if (!fs.existsSync(filePath)) {
        console.log('⚠️  Original file not found, cannot resume');
        clearState(filePath);
        return false;
    }
    
    const currentStats = fs.statSync(filePath);
    
    if (currentStats.size !== state.totalSize) {
        console.log('⚠️  File size changed, cannot resume');
        clearState(filePath);
        return false;
    }
    
    return true;
}

/**
 * Get resume information
 */
export function getResumeInfo(filePath) {
    if (!canResume(filePath)) {
        return null;
    }
    
    const state = loadState(filePath);
    const percentComplete = ((state.bytesUploaded / state.totalSize) * 100).toFixed(1);
    
    return {
        bytesUploaded: state.bytesUploaded,
        totalSize: state.totalSize,
        percentComplete,
        filename: state.filename,
        serverPath: state.serverPath
    };
}

/**
 * List all pending uploads
 */
export function listPendingUploads() {
    if (!fs.existsSync(STATE_DIR)) {
        return [];
    }
    
    const files = fs.readdirSync(STATE_DIR);
    const uploads = [];
    
    for (const file of files) {
        try {
            const data = fs.readFileSync(path.join(STATE_DIR, file), 'utf8');
            const state = JSON.parse(data);
            
            if (fs.existsSync(state.filePath)) {
                uploads.push({
                    filePath: state.filePath,
                    filename: state.filename,
                    bytesUploaded: state.bytesUploaded,
                    totalSize: state.totalSize,
                    percentComplete: ((state.bytesUploaded / state.totalSize) * 100).toFixed(1),
                    timestamp: state.timestamp
                });
            }
        } catch (error) {
            // Skip invalid state files
        }
    }
    
    return uploads;
}

/**
 * Clear all upload states
 */
export function clearAllStates() {
    if (!fs.existsSync(STATE_DIR)) {
        return 0;
    }
    
    const files = fs.readdirSync(STATE_DIR);
    
    for (const file of files) {
        fs.unlinkSync(path.join(STATE_DIR, file));
    }
    
    return files.length;
}
