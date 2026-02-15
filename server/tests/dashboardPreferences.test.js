/**
 * Dashboard Preferences Route Tests
 * Verifies that req.user.id (not req.user.userId) is used correctly
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Dashboard Preferences Route - req.user.id fix', () => {
  it('should use req.user.id instead of req.user.userId', () => {
    const filePath = path.resolve('server/routes/dashboardPreferences.js');
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Verify req.user.userId is NOT present
    expect(fileContent).not.toContain('req.user.userId');

    // Verify req.user.id IS present in the expected places
    const occurrences = (fileContent.match(/req\.user\.id/g) || []).length;
    
    // Should appear in:
    // 1. GET route: findUnique where clause
    // 2. GET route: error logging
    // 3. PUT route: upsert where clause
    // 4. PUT route: upsert create clause
    // 5. PUT route: error logging
    expect(occurrences).toBeGreaterThanOrEqual(5);
  });

  it('should verify auth middleware sets req.user.id', () => {
    const authPath = path.resolve('server/middleware/auth.js');
    const authContent = fs.readFileSync(authPath, 'utf-8');

    // Verify auth middleware sets req.user.id (from payload.sub)
    expect(authContent).toContain('req.user = {');
    expect(authContent).toContain('id: payload.sub');
  });
});
