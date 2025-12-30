import path from 'path';

/**
 * Validates that a given path is safe and doesn't attempt directory traversal
 * @param targetPath - The path to validate
 * @param basePath - The base directory that targetPath should be within
 * @returns The resolved safe path
 * @throws Error if path is unsafe
 */
export function validateSafePath(targetPath: string, basePath: string): string {
  // Resolve both paths to absolute paths
  const resolvedBase = path.resolve(basePath);
  const resolvedTarget = path.resolve(basePath, targetPath);
  
  // Check if the resolved target is within the base directory
  const relative = path.relative(resolvedBase, resolvedTarget);
  
  // If relative path starts with "..", it's trying to escape
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Invalid path: ${targetPath} attempts to access outside base directory`);
  }
  
  // Additional check: ensure no path traversal patterns
  if (targetPath.includes('..') || targetPath.includes('~')) {
    throw new Error(`Invalid path: ${targetPath} contains forbidden patterns`);
  }
  
  return resolvedTarget;
}

/**
 * Validates memory directory configuration
 * @param memoryDir - The memory directory from config
 * @param projectDir - The project root directory
 * @returns The validated absolute path
 */
export function validateMemoryDir(memoryDir: string, projectDir: string): string {
  // Ensure memoryDir is relative
  if (path.isAbsolute(memoryDir)) {
    throw new Error('Memory directory must be a relative path within the project');
  }
  
  return validateSafePath(memoryDir, projectDir);
}
