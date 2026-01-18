# Phase 3: Lineups Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build lineup management with database persistence, shell/equipment tracking, custom boat configurations, and export functionality.

**Architecture:** Follow Phase 1/2 patterns - service layer, v1 routes with auth/team isolation, Zustand stores, React Query integration.

**Reference Files:**
- Service pattern: `server/services/athleteService.js`
- Route pattern: `server/routes/athletes.js`
- Auth middleware: `server/middleware/auth.js`
- Store pattern: `src/store/lineupStore.js`

---

## Phase 3A: Backend Services

### Task 1: Create Lineup Service

**Files:**
- Create: `server/services/lineupService.js`

**Step 1: Create lineup service with CRUD operations**

Create `server/services/lineupService.js`:

```javascript
import { prisma } from '../db/connection.js';

/**
 * Create a new lineup
 */
export async function createLineup(teamId, data) {
  const { name, notes, assignments } = data;

  const lineup = await prisma.lineup.create({
    data: {
      teamId,
      name,
      notes: notes || null,
      assignments: assignments?.length > 0 ? {
        create: assignments.map(a => ({
          athleteId: a.athleteId,
          boatClass: a.boatClass,
          shellName: a.shellName || null,
          seatNumber: a.seatNumber,
          side: a.side,
          isCoxswain: a.isCoxswain || false,
        })),
      } : undefined,
    },
    include: {
      assignments: {
        include: {
          athlete: {
            select: { id: true, firstName: true, lastName: true, side: true },
          },
        },
      },
    },
  });

  return formatLineup(lineup);
}

/**
 * Get all lineups for a team
 */
export async function getLineups(teamId, options = {}) {
  const { includeAssignments = false } = options;

  const lineups = await prisma.lineup.findMany({
    where: { teamId },
    include: includeAssignments ? {
      assignments: {
        include: {
          athlete: {
            select: { id: true, firstName: true, lastName: true, side: true },
          },
        },
      },
    } : {
      _count: {
        select: { assignments: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return lineups.map(l => formatLineup(l, includeAssignments));
}

/**
 * Get a single lineup by ID
 */
export async function getLineupById(teamId, lineupId) {
  const lineup = await prisma.lineup.findFirst({
    where: { id: lineupId, teamId },
    include: {
      assignments: {
        include: {
          athlete: {
            select: { id: true, firstName: true, lastName: true, side: true, weightKg: true },
          },
        },
        orderBy: [
          { boatClass: 'asc' },
          { shellName: 'asc' },
          { seatNumber: 'desc' },
        ],
      },
    },
  });

  if (!lineup) {
    throw new Error('Lineup not found');
  }

  return formatLineup(lineup, true);
}

/**
 * Update a lineup
 */
export async function updateLineup(teamId, lineupId, data) {
  const existing = await prisma.lineup.findFirst({
    where: { id: lineupId, teamId },
  });

  if (!existing) {
    throw new Error('Lineup not found');
  }

  const { name, notes, assignments } = data;

  // If assignments provided, replace all
  if (assignments !== undefined) {
    // Delete existing assignments
    await prisma.lineupAssignment.deleteMany({
      where: { lineupId },
    });

    // Create new assignments
    if (assignments.length > 0) {
      await prisma.lineupAssignment.createMany({
        data: assignments.map(a => ({
          lineupId,
          athleteId: a.athleteId,
          boatClass: a.boatClass,
          shellName: a.shellName || null,
          seatNumber: a.seatNumber,
          side: a.side,
          isCoxswain: a.isCoxswain || false,
        })),
      });
    }
  }

  const lineup = await prisma.lineup.update({
    where: { id: lineupId },
    data: {
      name: name !== undefined ? name : undefined,
      notes: notes !== undefined ? notes : undefined,
    },
    include: {
      assignments: {
        include: {
          athlete: {
            select: { id: true, firstName: true, lastName: true, side: true },
          },
        },
      },
    },
  });

  return formatLineup(lineup, true);
}

/**
 * Delete a lineup
 */
export async function deleteLineup(teamId, lineupId) {
  const existing = await prisma.lineup.findFirst({
    where: { id: lineupId, teamId },
  });

  if (!existing) {
    throw new Error('Lineup not found');
  }

  await prisma.lineup.delete({
    where: { id: lineupId },
  });

  return { deleted: true };
}

/**
 * Duplicate a lineup
 */
export async function duplicateLineup(teamId, lineupId, newName) {
  const original = await prisma.lineup.findFirst({
    where: { id: lineupId, teamId },
    include: {
      assignments: true,
    },
  });

  if (!original) {
    throw new Error('Lineup not found');
  }

  const lineup = await prisma.lineup.create({
    data: {
      teamId,
      name: newName || `${original.name} (Copy)`,
      notes: original.notes,
      assignments: {
        create: original.assignments.map(a => ({
          athleteId: a.athleteId,
          boatClass: a.boatClass,
          shellName: a.shellName,
          seatNumber: a.seatNumber,
          side: a.side,
          isCoxswain: a.isCoxswain,
        })),
      },
    },
    include: {
      assignments: {
        include: {
          athlete: {
            select: { id: true, firstName: true, lastName: true, side: true },
          },
        },
      },
    },
  });

  return formatLineup(lineup, true);
}

/**
 * Export lineup data for PDF/CSV generation
 */
export async function exportLineupData(teamId, lineupId) {
  const lineup = await prisma.lineup.findFirst({
    where: { id: lineupId, teamId },
    include: {
      assignments: {
        include: {
          athlete: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              side: true,
              weightKg: true,
              ergTests: {
                where: { testType: '2k' },
                orderBy: { testDate: 'desc' },
                take: 1,
                select: { timeSeconds: true, testDate: true },
              },
            },
          },
        },
        orderBy: [
          { boatClass: 'asc' },
          { shellName: 'asc' },
          { seatNumber: 'desc' },
        ],
      },
      team: {
        select: { name: true },
      },
    },
  });

  if (!lineup) {
    throw new Error('Lineup not found');
  }

  // Group assignments by boat
  const boats = {};
  for (const assignment of lineup.assignments) {
    const boatKey = `${assignment.boatClass}-${assignment.shellName || 'default'}`;
    if (!boats[boatKey]) {
      boats[boatKey] = {
        boatClass: assignment.boatClass,
        shellName: assignment.shellName,
        seats: [],
        coxswain: null,
      };
    }

    const athleteData = {
      seatNumber: assignment.seatNumber,
      side: assignment.side,
      athlete: assignment.athlete ? {
        id: assignment.athlete.id,
        name: `${assignment.athlete.firstName} ${assignment.athlete.lastName}`,
        firstName: assignment.athlete.firstName,
        lastName: assignment.athlete.lastName,
        side: assignment.athlete.side,
        weightKg: assignment.athlete.weightKg ? Number(assignment.athlete.weightKg) : null,
        latest2k: assignment.athlete.ergTests?.[0] ? {
          timeSeconds: Number(assignment.athlete.ergTests[0].timeSeconds),
          date: assignment.athlete.ergTests[0].testDate,
        } : null,
      } : null,
    };

    if (assignment.isCoxswain) {
      boats[boatKey].coxswain = athleteData.athlete;
    } else {
      boats[boatKey].seats.push(athleteData);
    }
  }

  // Sort seats by seat number descending (8 -> 1)
  for (const boat of Object.values(boats)) {
    boat.seats.sort((a, b) => b.seatNumber - a.seatNumber);
  }

  return {
    id: lineup.id,
    name: lineup.name,
    notes: lineup.notes,
    teamName: lineup.team.name,
    createdAt: lineup.createdAt,
    updatedAt: lineup.updatedAt,
    boats: Object.values(boats),
  };
}

/**
 * Format lineup for API response
 */
function formatLineup(lineup, includeAssignments = false) {
  const base = {
    id: lineup.id,
    name: lineup.name,
    notes: lineup.notes,
    createdAt: lineup.createdAt,
    updatedAt: lineup.updatedAt,
  };

  if (includeAssignments && lineup.assignments) {
    base.assignments = lineup.assignments.map(a => ({
      id: a.id,
      athleteId: a.athleteId,
      athlete: a.athlete ? {
        id: a.athlete.id,
        name: `${a.athlete.firstName} ${a.athlete.lastName}`,
        firstName: a.athlete.firstName,
        lastName: a.athlete.lastName,
        side: a.athlete.side,
      } : null,
      boatClass: a.boatClass,
      shellName: a.shellName,
      seatNumber: a.seatNumber,
      side: a.side,
      isCoxswain: a.isCoxswain,
    }));
  } else if (lineup._count) {
    base.assignmentCount = lineup._count.assignments;
  }

  return base;
}
```

**Step 2: Update services index**

Add to `server/services/index.js`:
```javascript
export * from './lineupService.js';
```

**Step 3: Verify syntax**

```bash
node --check server/services/lineupService.js
```

Expected: No output (success)

**Step 4: Commit**

```bash
git add server/services/lineupService.js server/services/index.js
git commit -m "feat: add lineup service with CRUD, duplicate, export data"
```

---

### Task 2: Create Shell Service

**Files:**
- Create: `server/services/shellService.js`

**Step 1: Create shell service with CRUD operations**

Create `server/services/shellService.js`:

```javascript
import { prisma } from '../db/connection.js';

/**
 * Create a new shell
 */
export async function createShell(teamId, data) {
  const { name, boatClass, notes } = data;

  // Check for duplicate name in team
  const existing = await prisma.shell.findUnique({
    where: {
      teamId_name: { teamId, name },
    },
  });

  if (existing) {
    throw new Error('Shell with this name already exists');
  }

  const shell = await prisma.shell.create({
    data: {
      teamId,
      name,
      boatClass,
      notes: notes || null,
    },
  });

  return formatShell(shell);
}

/**
 * Get all shells for a team
 */
export async function getShells(teamId, filters = {}) {
  const where = { teamId };

  if (filters.boatClass) {
    where.boatClass = filters.boatClass;
  }

  const shells = await prisma.shell.findMany({
    where,
    orderBy: [{ boatClass: 'asc' }, { name: 'asc' }],
  });

  return shells.map(formatShell);
}

/**
 * Get a single shell by ID
 */
export async function getShellById(teamId, shellId) {
  const shell = await prisma.shell.findFirst({
    where: { id: shellId, teamId },
  });

  if (!shell) {
    throw new Error('Shell not found');
  }

  return formatShell(shell);
}

/**
 * Update a shell
 */
export async function updateShell(teamId, shellId, data) {
  const existing = await prisma.shell.findFirst({
    where: { id: shellId, teamId },
  });

  if (!existing) {
    throw new Error('Shell not found');
  }

  // If changing name, check for duplicates
  if (data.name && data.name !== existing.name) {
    const duplicate = await prisma.shell.findFirst({
      where: {
        teamId,
        name: data.name,
        NOT: { id: shellId },
      },
    });

    if (duplicate) {
      throw new Error('Shell with this name already exists');
    }
  }

  const updateData = {};
  const allowedFields = ['name', 'boatClass', 'notes'];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  const shell = await prisma.shell.update({
    where: { id: shellId },
    data: updateData,
  });

  return formatShell(shell);
}

/**
 * Delete a shell
 */
export async function deleteShell(teamId, shellId) {
  const existing = await prisma.shell.findFirst({
    where: { id: shellId, teamId },
  });

  if (!existing) {
    throw new Error('Shell not found');
  }

  await prisma.shell.delete({
    where: { id: shellId },
  });

  return { deleted: true };
}

/**
 * Get shells grouped by boat class
 */
export async function getShellsByBoatClass(teamId) {
  const shells = await prisma.shell.findMany({
    where: { teamId },
    orderBy: [{ boatClass: 'asc' }, { name: 'asc' }],
  });

  const grouped = {};
  for (const shell of shells) {
    if (!grouped[shell.boatClass]) {
      grouped[shell.boatClass] = [];
    }
    grouped[shell.boatClass].push(formatShell(shell));
  }

  return grouped;
}

/**
 * Bulk import shells
 */
export async function bulkImportShells(teamId, shells) {
  const results = { created: 0, skipped: 0, errors: [] };

  for (const data of shells) {
    try {
      await createShell(teamId, data);
      results.created++;
    } catch (error) {
      if (error.message.includes('already exists')) {
        results.skipped++;
      } else {
        results.errors.push({
          shell: data.name,
          error: error.message,
        });
      }
    }
  }

  return results;
}

/**
 * Format shell for API response
 */
function formatShell(shell) {
  return {
    id: shell.id,
    name: shell.name,
    boatClass: shell.boatClass,
    notes: shell.notes,
  };
}
```

**Step 2: Update services index**

Add to `server/services/index.js`:
```javascript
export * from './shellService.js';
```

**Step 3: Verify syntax**

```bash
node --check server/services/shellService.js
```

**Step 4: Commit**

```bash
git add server/services/shellService.js server/services/index.js
git commit -m "feat: add shell service with CRUD, grouped by boat class"
```

---

### Task 3: Create Boat Config Service

**Files:**
- Create: `server/services/boatConfigService.js`

**Step 1: Create boat config service**

Create `server/services/boatConfigService.js`:

```javascript
import { prisma } from '../db/connection.js';

// Standard boat configurations
const STANDARD_CONFIGS = [
  { name: '8+', numSeats: 8, hasCoxswain: true },
  { name: '4+', numSeats: 4, hasCoxswain: true },
  { name: '4-', numSeats: 4, hasCoxswain: false },
  { name: '4x', numSeats: 4, hasCoxswain: false },
  { name: '2-', numSeats: 2, hasCoxswain: false },
  { name: '2x', numSeats: 2, hasCoxswain: false },
  { name: '1x', numSeats: 1, hasCoxswain: false },
];

/**
 * Create a new boat config
 */
export async function createBoatConfig(teamId, data) {
  const { name, numSeats, hasCoxswain } = data;

  // Check for duplicate name in team
  const existing = await prisma.boatConfig.findUnique({
    where: {
      teamId_name: { teamId, name },
    },
  });

  if (existing) {
    throw new Error('Boat config with this name already exists');
  }

  const config = await prisma.boatConfig.create({
    data: {
      teamId,
      name,
      numSeats,
      hasCoxswain: hasCoxswain || false,
    },
  });

  return formatBoatConfig(config);
}

/**
 * Get all boat configs for a team (including standard configs)
 */
export async function getBoatConfigs(teamId, options = {}) {
  const { includeStandard = true } = options;

  const customConfigs = await prisma.boatConfig.findMany({
    where: { teamId },
    orderBy: [{ numSeats: 'desc' }, { name: 'asc' }],
  });

  const configs = customConfigs.map(c => ({
    ...formatBoatConfig(c),
    isCustom: true,
  }));

  if (includeStandard) {
    // Add standard configs that don't exist as custom
    const customNames = new Set(configs.map(c => c.name));
    for (const std of STANDARD_CONFIGS) {
      if (!customNames.has(std.name)) {
        configs.push({
          id: `standard-${std.name}`,
          ...std,
          isCustom: false,
        });
      }
    }

    // Sort by numSeats descending
    configs.sort((a, b) => b.numSeats - a.numSeats);
  }

  return configs;
}

/**
 * Get a single boat config by ID
 */
export async function getBoatConfigById(teamId, configId) {
  // Check if it's a standard config
  if (configId.startsWith('standard-')) {
    const name = configId.replace('standard-', '');
    const standard = STANDARD_CONFIGS.find(c => c.name === name);
    if (standard) {
      return { id: configId, ...standard, isCustom: false };
    }
    throw new Error('Boat config not found');
  }

  const config = await prisma.boatConfig.findFirst({
    where: { id: configId, teamId },
  });

  if (!config) {
    throw new Error('Boat config not found');
  }

  return { ...formatBoatConfig(config), isCustom: true };
}

/**
 * Update a boat config
 */
export async function updateBoatConfig(teamId, configId, data) {
  // Cannot update standard configs
  if (configId.startsWith('standard-')) {
    throw new Error('Cannot modify standard boat configs');
  }

  const existing = await prisma.boatConfig.findFirst({
    where: { id: configId, teamId },
  });

  if (!existing) {
    throw new Error('Boat config not found');
  }

  // If changing name, check for duplicates
  if (data.name && data.name !== existing.name) {
    const duplicate = await prisma.boatConfig.findFirst({
      where: {
        teamId,
        name: data.name,
        NOT: { id: configId },
      },
    });

    if (duplicate) {
      throw new Error('Boat config with this name already exists');
    }

    // Also check against standard configs
    if (STANDARD_CONFIGS.some(c => c.name === data.name)) {
      throw new Error('Cannot use standard config name');
    }
  }

  const updateData = {};
  const allowedFields = ['name', 'numSeats', 'hasCoxswain'];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  const config = await prisma.boatConfig.update({
    where: { id: configId },
    data: updateData,
  });

  return { ...formatBoatConfig(config), isCustom: true };
}

/**
 * Delete a boat config
 */
export async function deleteBoatConfig(teamId, configId) {
  // Cannot delete standard configs
  if (configId.startsWith('standard-')) {
    throw new Error('Cannot delete standard boat configs');
  }

  const existing = await prisma.boatConfig.findFirst({
    where: { id: configId, teamId },
  });

  if (!existing) {
    throw new Error('Boat config not found');
  }

  await prisma.boatConfig.delete({
    where: { id: configId },
  });

  return { deleted: true };
}

/**
 * Get standard boat configurations
 */
export function getStandardConfigs() {
  return STANDARD_CONFIGS.map(c => ({
    id: `standard-${c.name}`,
    ...c,
    isCustom: false,
  }));
}

/**
 * Format boat config for API response
 */
function formatBoatConfig(config) {
  return {
    id: config.id,
    name: config.name,
    numSeats: config.numSeats,
    hasCoxswain: config.hasCoxswain,
  };
}
```

**Step 2: Update services index**

Add to `server/services/index.js`:
```javascript
export * from './boatConfigService.js';
```

**Step 3: Verify syntax**

```bash
node --check server/services/boatConfigService.js
```

**Step 4: Commit**

```bash
git add server/services/boatConfigService.js server/services/index.js
git commit -m "feat: add boat config service with standard and custom configs"
```

---

## Phase 3B: Backend Routes

### Task 4: Create Lineup Routes

**Files:**
- Create: `server/routes/lineups.js`

**Step 1: Create v1 lineup routes**

Create `server/routes/lineups.js`:

```javascript
import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import {
  createLineup,
  getLineups,
  getLineupById,
  updateLineup,
  deleteLineup,
  duplicateLineup,
  exportLineupData,
} from '../services/lineupService.js';
import { authenticateToken, requireRole, teamIsolation } from '../middleware/auth.js';

const router = express.Router();

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', details: errors.array() },
    });
  }
  next();
};

/**
 * GET /api/v1/lineups
 * List all lineups for the team
 */
router.get(
  '/',
  authenticateToken,
  teamIsolation,
  [
    query('includeAssignments').optional().isBoolean(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const lineups = await getLineups(req.user.activeTeamId, {
        includeAssignments: req.query.includeAssignments === 'true',
      });
      res.json({
        success: true,
        data: { lineups },
      });
    } catch (error) {
      console.error('Get lineups error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to get lineups' },
      });
    }
  }
);

/**
 * GET /api/v1/lineups/:id
 * Get single lineup with assignments
 */
router.get(
  '/:id',
  authenticateToken,
  teamIsolation,
  [param('id').isUUID()],
  validateRequest,
  async (req, res) => {
    try {
      const lineup = await getLineupById(req.user.activeTeamId, req.params.id);
      res.json({
        success: true,
        data: { lineup },
      });
    } catch (error) {
      if (error.message === 'Lineup not found') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: error.message },
        });
      }
      console.error('Get lineup error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to get lineup' },
      });
    }
  }
);

/**
 * GET /api/v1/lineups/:id/export
 * Get lineup data for export (includes erg times, weights)
 */
router.get(
  '/:id/export',
  authenticateToken,
  teamIsolation,
  [param('id').isUUID()],
  validateRequest,
  async (req, res) => {
    try {
      const data = await exportLineupData(req.user.activeTeamId, req.params.id);
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      if (error.message === 'Lineup not found') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: error.message },
        });
      }
      console.error('Export lineup error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to export lineup' },
      });
    }
  }
);

/**
 * POST /api/v1/lineups
 * Create new lineup
 */
router.post(
  '/',
  authenticateToken,
  teamIsolation,
  requireRole('OWNER', 'COACH'),
  [
    body('name').trim().isLength({ min: 1, max: 100 }),
    body('notes').optional().trim().isLength({ max: 500 }),
    body('assignments').optional().isArray(),
    body('assignments.*.athleteId').isUUID(),
    body('assignments.*.boatClass').trim().isLength({ min: 1, max: 20 }),
    body('assignments.*.seatNumber').isInt({ min: 1, max: 8 }),
    body('assignments.*.side').isIn(['Port', 'Starboard']),
    body('assignments.*.isCoxswain').optional().isBoolean(),
    body('assignments.*.shellName').optional().trim().isLength({ max: 100 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const lineup = await createLineup(req.user.activeTeamId, req.body);
      res.status(201).json({
        success: true,
        data: { lineup },
      });
    } catch (error) {
      console.error('Create lineup error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to create lineup' },
      });
    }
  }
);

/**
 * POST /api/v1/lineups/:id/duplicate
 * Duplicate an existing lineup
 */
router.post(
  '/:id/duplicate',
  authenticateToken,
  teamIsolation,
  requireRole('OWNER', 'COACH'),
  [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const lineup = await duplicateLineup(
        req.user.activeTeamId,
        req.params.id,
        req.body.name
      );
      res.status(201).json({
        success: true,
        data: { lineup },
      });
    } catch (error) {
      if (error.message === 'Lineup not found') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: error.message },
        });
      }
      console.error('Duplicate lineup error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to duplicate lineup' },
      });
    }
  }
);

/**
 * PATCH /api/v1/lineups/:id
 * Update lineup
 */
router.patch(
  '/:id',
  authenticateToken,
  teamIsolation,
  requireRole('OWNER', 'COACH'),
  [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('notes').optional().trim().isLength({ max: 500 }),
    body('assignments').optional().isArray(),
    body('assignments.*.athleteId').optional().isUUID(),
    body('assignments.*.boatClass').optional().trim().isLength({ min: 1, max: 20 }),
    body('assignments.*.seatNumber').optional().isInt({ min: 1, max: 8 }),
    body('assignments.*.side').optional().isIn(['Port', 'Starboard']),
    body('assignments.*.isCoxswain').optional().isBoolean(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const lineup = await updateLineup(req.user.activeTeamId, req.params.id, req.body);
      res.json({
        success: true,
        data: { lineup },
      });
    } catch (error) {
      if (error.message === 'Lineup not found') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: error.message },
        });
      }
      console.error('Update lineup error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to update lineup' },
      });
    }
  }
);

/**
 * DELETE /api/v1/lineups/:id
 * Delete lineup
 */
router.delete(
  '/:id',
  authenticateToken,
  teamIsolation,
  requireRole('OWNER', 'COACH'),
  [param('id').isUUID()],
  validateRequest,
  async (req, res) => {
    try {
      await deleteLineup(req.user.activeTeamId, req.params.id);
      res.json({
        success: true,
        data: { message: 'Lineup deleted' },
      });
    } catch (error) {
      if (error.message === 'Lineup not found') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: error.message },
        });
      }
      console.error('Delete lineup error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to delete lineup' },
      });
    }
  }
);

export default router;
```

**Step 2: Register routes in server/index.js**

Add import near other route imports:
```javascript
import lineupRoutes from './routes/lineups.js';
```

Add route mounting after other v1 routes:
```javascript
app.use('/api/v1/lineups', lineupRoutes);
```

**Step 3: Verify syntax**

```bash
node --check server/routes/lineups.js
```

**Step 4: Commit**

```bash
git add server/routes/lineups.js server/index.js
git commit -m "feat: add v1 lineup routes with CRUD, duplicate, export"
```

---

### Task 5: Create Shell Routes

**Files:**
- Create: `server/routes/shells.js`

**Step 1: Create v1 shell routes**

Create `server/routes/shells.js`:

```javascript
import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import {
  createShell,
  getShells,
  getShellById,
  updateShell,
  deleteShell,
  getShellsByBoatClass,
  bulkImportShells,
} from '../services/shellService.js';
import { authenticateToken, requireRole, teamIsolation } from '../middleware/auth.js';

const router = express.Router();

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', details: errors.array() },
    });
  }
  next();
};

/**
 * GET /api/v1/shells
 * List all shells for the team
 */
router.get(
  '/',
  authenticateToken,
  teamIsolation,
  [
    query('boatClass').optional().trim(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const shells = await getShells(req.user.activeTeamId, req.query);
      res.json({
        success: true,
        data: { shells },
      });
    } catch (error) {
      console.error('Get shells error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to get shells' },
      });
    }
  }
);

/**
 * GET /api/v1/shells/grouped
 * Get shells grouped by boat class
 */
router.get(
  '/grouped',
  authenticateToken,
  teamIsolation,
  async (req, res) => {
    try {
      const grouped = await getShellsByBoatClass(req.user.activeTeamId);
      res.json({
        success: true,
        data: { grouped },
      });
    } catch (error) {
      console.error('Get grouped shells error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to get shells' },
      });
    }
  }
);

/**
 * GET /api/v1/shells/:id
 * Get single shell
 */
router.get(
  '/:id',
  authenticateToken,
  teamIsolation,
  [param('id').isUUID()],
  validateRequest,
  async (req, res) => {
    try {
      const shell = await getShellById(req.user.activeTeamId, req.params.id);
      res.json({
        success: true,
        data: { shell },
      });
    } catch (error) {
      if (error.message === 'Shell not found') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: error.message },
        });
      }
      console.error('Get shell error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to get shell' },
      });
    }
  }
);

/**
 * POST /api/v1/shells
 * Create new shell
 */
router.post(
  '/',
  authenticateToken,
  teamIsolation,
  requireRole('OWNER', 'COACH'),
  [
    body('name').trim().isLength({ min: 1, max: 100 }),
    body('boatClass').trim().isLength({ min: 1, max: 20 }),
    body('notes').optional().trim().isLength({ max: 500 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const shell = await createShell(req.user.activeTeamId, req.body);
      res.status(201).json({
        success: true,
        data: { shell },
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE', message: error.message },
        });
      }
      console.error('Create shell error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to create shell' },
      });
    }
  }
);

/**
 * POST /api/v1/shells/bulk-import
 * Bulk import shells
 */
router.post(
  '/bulk-import',
  authenticateToken,
  teamIsolation,
  requireRole('OWNER', 'COACH'),
  [
    body('shells').isArray({ min: 1, max: 100 }),
    body('shells.*.name').trim().isLength({ min: 1, max: 100 }),
    body('shells.*.boatClass').trim().isLength({ min: 1, max: 20 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const result = await bulkImportShells(req.user.activeTeamId, req.body.shells);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Bulk import shells error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to import shells' },
      });
    }
  }
);

/**
 * PATCH /api/v1/shells/:id
 * Update shell
 */
router.patch(
  '/:id',
  authenticateToken,
  teamIsolation,
  requireRole('OWNER', 'COACH'),
  [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('boatClass').optional().trim().isLength({ min: 1, max: 20 }),
    body('notes').optional().trim().isLength({ max: 500 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const shell = await updateShell(req.user.activeTeamId, req.params.id, req.body);
      res.json({
        success: true,
        data: { shell },
      });
    } catch (error) {
      if (error.message === 'Shell not found') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: error.message },
        });
      }
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE', message: error.message },
        });
      }
      console.error('Update shell error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to update shell' },
      });
    }
  }
);

/**
 * DELETE /api/v1/shells/:id
 * Delete shell
 */
router.delete(
  '/:id',
  authenticateToken,
  teamIsolation,
  requireRole('OWNER', 'COACH'),
  [param('id').isUUID()],
  validateRequest,
  async (req, res) => {
    try {
      await deleteShell(req.user.activeTeamId, req.params.id);
      res.json({
        success: true,
        data: { message: 'Shell deleted' },
      });
    } catch (error) {
      if (error.message === 'Shell not found') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: error.message },
        });
      }
      console.error('Delete shell error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to delete shell' },
      });
    }
  }
);

export default router;
```

**Step 2: Register routes in server/index.js**

Add import:
```javascript
import shellRoutes from './routes/shells.js';
```

Add route mounting:
```javascript
app.use('/api/v1/shells', shellRoutes);
```

**Step 3: Verify syntax**

```bash
node --check server/routes/shells.js
```

**Step 4: Commit**

```bash
git add server/routes/shells.js server/index.js
git commit -m "feat: add v1 shell routes with CRUD, grouped, bulk import"
```

---

### Task 6: Create Boat Config Routes

**Files:**
- Create: `server/routes/boatConfigs.js`

**Step 1: Create v1 boat config routes**

Create `server/routes/boatConfigs.js`:

```javascript
import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import {
  createBoatConfig,
  getBoatConfigs,
  getBoatConfigById,
  updateBoatConfig,
  deleteBoatConfig,
  getStandardConfigs,
} from '../services/boatConfigService.js';
import { authenticateToken, requireRole, teamIsolation } from '../middleware/auth.js';

const router = express.Router();

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', details: errors.array() },
    });
  }
  next();
};

/**
 * GET /api/v1/boat-configs
 * List all boat configs (standard + custom)
 */
router.get(
  '/',
  authenticateToken,
  teamIsolation,
  [
    query('includeStandard').optional().isBoolean(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const configs = await getBoatConfigs(req.user.activeTeamId, {
        includeStandard: req.query.includeStandard !== 'false',
      });
      res.json({
        success: true,
        data: { configs },
      });
    } catch (error) {
      console.error('Get boat configs error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to get boat configs' },
      });
    }
  }
);

/**
 * GET /api/v1/boat-configs/standard
 * Get only standard boat configs
 */
router.get(
  '/standard',
  authenticateToken,
  async (req, res) => {
    try {
      const configs = getStandardConfigs();
      res.json({
        success: true,
        data: { configs },
      });
    } catch (error) {
      console.error('Get standard configs error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to get standard configs' },
      });
    }
  }
);

/**
 * GET /api/v1/boat-configs/:id
 * Get single boat config
 */
router.get(
  '/:id',
  authenticateToken,
  teamIsolation,
  async (req, res) => {
    try {
      const config = await getBoatConfigById(req.user.activeTeamId, req.params.id);
      res.json({
        success: true,
        data: { config },
      });
    } catch (error) {
      if (error.message === 'Boat config not found') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: error.message },
        });
      }
      console.error('Get boat config error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to get boat config' },
      });
    }
  }
);

/**
 * POST /api/v1/boat-configs
 * Create new custom boat config
 */
router.post(
  '/',
  authenticateToken,
  teamIsolation,
  requireRole('OWNER', 'COACH'),
  [
    body('name').trim().isLength({ min: 1, max: 50 }),
    body('numSeats').isInt({ min: 1, max: 8 }),
    body('hasCoxswain').optional().isBoolean(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const config = await createBoatConfig(req.user.activeTeamId, req.body);
      res.status(201).json({
        success: true,
        data: { config },
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE', message: error.message },
        });
      }
      console.error('Create boat config error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to create boat config' },
      });
    }
  }
);

/**
 * PATCH /api/v1/boat-configs/:id
 * Update custom boat config
 */
router.patch(
  '/:id',
  authenticateToken,
  teamIsolation,
  requireRole('OWNER', 'COACH'),
  [
    body('name').optional().trim().isLength({ min: 1, max: 50 }),
    body('numSeats').optional().isInt({ min: 1, max: 8 }),
    body('hasCoxswain').optional().isBoolean(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const config = await updateBoatConfig(req.user.activeTeamId, req.params.id, req.body);
      res.json({
        success: true,
        data: { config },
      });
    } catch (error) {
      if (error.message === 'Boat config not found') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: error.message },
        });
      }
      if (error.message.includes('Cannot modify') || error.message.includes('Cannot use')) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_OPERATION', message: error.message },
        });
      }
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE', message: error.message },
        });
      }
      console.error('Update boat config error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to update boat config' },
      });
    }
  }
);

/**
 * DELETE /api/v1/boat-configs/:id
 * Delete custom boat config
 */
router.delete(
  '/:id',
  authenticateToken,
  teamIsolation,
  requireRole('OWNER', 'COACH'),
  async (req, res) => {
    try {
      await deleteBoatConfig(req.user.activeTeamId, req.params.id);
      res.json({
        success: true,
        data: { message: 'Boat config deleted' },
      });
    } catch (error) {
      if (error.message === 'Boat config not found') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: error.message },
        });
      }
      if (error.message.includes('Cannot delete')) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_OPERATION', message: error.message },
        });
      }
      console.error('Delete boat config error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to delete boat config' },
      });
    }
  }
);

export default router;
```

**Step 2: Register routes in server/index.js**

Add import:
```javascript
import boatConfigRoutes from './routes/boatConfigs.js';
```

Add route mounting:
```javascript
app.use('/api/v1/boat-configs', boatConfigRoutes);
```

**Step 3: Verify and commit**

```bash
node --check server/routes/boatConfigs.js
git add server/routes/boatConfigs.js server/index.js
git commit -m "feat: add v1 boat config routes with standard and custom configs"
```

---

## Phase 3C: Frontend Store Updates

### Task 7: Update Lineup Store for API Integration

**Files:**
- Modify: `src/store/lineupStore.js`

**Step 1: Add API integration methods to lineupStore**

Add the following methods to the existing `lineupStore.js` after the existing methods (before the closing `})));`):

```javascript
  // ============================================
  // API Integration Methods
  // ============================================

  /**
   * Fetch lineups from API
   */
  fetchLineups: async () => {
    try {
      const response = await fetch('/api/v1/lineups', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        return data.data.lineups;
      }
      throw new Error(data.error?.message || 'Failed to fetch lineups');
    } catch (error) {
      console.error('Fetch lineups error:', error);
      throw error;
    }
  },

  /**
   * Load lineup from API by ID
   */
  fetchLineupById: async (lineupId) => {
    try {
      const response = await fetch(`/api/v1/lineups/${lineupId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        return data.data.lineup;
      }
      throw new Error(data.error?.message || 'Failed to fetch lineup');
    } catch (error) {
      console.error('Fetch lineup error:', error);
      throw error;
    }
  },

  /**
   * Save current lineup to API
   */
  saveLineupToAPI: async (name, notes = '') => {
    const state = get();
    const assignments = [];

    // Convert activeBoats to assignments
    for (const boat of state.activeBoats) {
      // Add seat assignments
      for (const seat of boat.seats) {
        if (seat.athlete) {
          assignments.push({
            athleteId: seat.athlete.id,
            boatClass: boat.name,
            shellName: boat.shellName || null,
            seatNumber: seat.seatNumber,
            side: seat.side,
            isCoxswain: false,
          });
        }
      }
      // Add coxswain
      if (boat.coxswain) {
        assignments.push({
          athleteId: boat.coxswain.id,
          boatClass: boat.name,
          shellName: boat.shellName || null,
          seatNumber: 0,
          side: 'Port',
          isCoxswain: true,
        });
      }
    }

    try {
      const response = await fetch('/api/v1/lineups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ name, notes, assignments }),
      });
      const data = await response.json();
      if (data.success) {
        set({ lineupName: name });
        return data.data.lineup;
      }
      throw new Error(data.error?.message || 'Failed to save lineup');
    } catch (error) {
      console.error('Save lineup error:', error);
      throw error;
    }
  },

  /**
   * Update existing lineup in API
   */
  updateLineupInAPI: async (lineupId, name, notes = '') => {
    const state = get();
    const assignments = [];

    for (const boat of state.activeBoats) {
      for (const seat of boat.seats) {
        if (seat.athlete) {
          assignments.push({
            athleteId: seat.athlete.id,
            boatClass: boat.name,
            shellName: boat.shellName || null,
            seatNumber: seat.seatNumber,
            side: seat.side,
            isCoxswain: false,
          });
        }
      }
      if (boat.coxswain) {
        assignments.push({
          athleteId: boat.coxswain.id,
          boatClass: boat.name,
          shellName: boat.shellName || null,
          seatNumber: 0,
          side: 'Port',
          isCoxswain: true,
        });
      }
    }

    try {
      const response = await fetch(`/api/v1/lineups/${lineupId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ name, notes, assignments }),
      });
      const data = await response.json();
      if (data.success) {
        set({ lineupName: name });
        return data.data.lineup;
      }
      throw new Error(data.error?.message || 'Failed to update lineup');
    } catch (error) {
      console.error('Update lineup error:', error);
      throw error;
    }
  },

  /**
   * Delete lineup from API
   */
  deleteLineupFromAPI: async (lineupId) => {
    try {
      const response = await fetch(`/api/v1/lineups/${lineupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        return true;
      }
      throw new Error(data.error?.message || 'Failed to delete lineup');
    } catch (error) {
      console.error('Delete lineup error:', error);
      throw error;
    }
  },

  /**
   * Duplicate lineup via API
   */
  duplicateLineupInAPI: async (lineupId, newName) => {
    try {
      const response = await fetch(`/api/v1/lineups/${lineupId}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ name: newName }),
      });
      const data = await response.json();
      if (data.success) {
        return data.data.lineup;
      }
      throw new Error(data.error?.message || 'Failed to duplicate lineup');
    } catch (error) {
      console.error('Duplicate lineup error:', error);
      throw error;
    }
  },

  /**
   * Get lineup export data from API
   */
  getLineupExportData: async (lineupId) => {
    try {
      const response = await fetch(`/api/v1/lineups/${lineupId}/export`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.error?.message || 'Failed to get export data');
    } catch (error) {
      console.error('Get export data error:', error);
      throw error;
    }
  },

  /**
   * Update shell name for a boat
   */
  updateBoatShell: (boatId, shellName) => {
    set(state => ({
      activeBoats: state.activeBoats.map(boat =>
        boat.id === boatId
          ? { ...boat, shellName }
          : boat
      )
    }));
  },

  // Track current lineup ID for updates
  currentLineupId: null,
  setCurrentLineupId: (id) => set({ currentLineupId: id }),
```

**Step 2: Add import for authStore if using authenticatedFetch**

At the top of the file, you may want to add:
```javascript
// Note: For API calls, we use localStorage.getItem('accessToken') directly
// to avoid circular dependency with authStore
```

**Step 3: Commit**

```bash
git add src/store/lineupStore.js
git commit -m "feat: add API integration methods to lineupStore"
```

---

### Task 8: Create Shell Store

**Files:**
- Create: `src/store/shellStore.js`

**Step 1: Create Zustand store for shells**

Create `src/store/shellStore.js`:

```javascript
import { create } from 'zustand';

const useShellStore = create((set, get) => ({
  // State
  shells: [],
  groupedShells: {},
  loading: false,
  error: null,

  // Actions

  /**
   * Fetch all shells for the team
   */
  fetchShells: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/v1/shells', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        set({ shells: data.data.shells, loading: false });
        return data.data.shells;
      } else {
        throw new Error(data.error?.message || 'Failed to fetch shells');
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * Fetch shells grouped by boat class
   */
  fetchGroupedShells: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/v1/shells/grouped', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        set({ groupedShells: data.data.grouped, loading: false });
        return data.data.grouped;
      } else {
        throw new Error(data.error?.message || 'Failed to fetch grouped shells');
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * Create a new shell
   */
  createShell: async (shellData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/v1/shells', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(shellData),
      });
      const data = await response.json();

      if (data.success) {
        set((state) => ({
          shells: [...state.shells, data.data.shell],
          loading: false,
        }));
        return data.data.shell;
      } else {
        throw new Error(data.error?.message || 'Failed to create shell');
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * Update a shell
   */
  updateShell: async (shellId, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/v1/shells/${shellId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await response.json();

      if (data.success) {
        set((state) => ({
          shells: state.shells.map((s) =>
            s.id === shellId ? data.data.shell : s
          ),
          loading: false,
        }));
        return data.data.shell;
      } else {
        throw new Error(data.error?.message || 'Failed to update shell');
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * Delete a shell
   */
  deleteShell: async (shellId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/v1/shells/${shellId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        set((state) => ({
          shells: state.shells.filter((s) => s.id !== shellId),
          loading: false,
        }));
        return true;
      } else {
        throw new Error(data.error?.message || 'Failed to delete shell');
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * Get shells for a specific boat class
   */
  getShellsForBoatClass: (boatClass) => {
    const state = get();
    return state.shells.filter((s) => s.boatClass === boatClass);
  },

  /**
   * Clear error
   */
  clearError: () => set({ error: null }),
}));

export default useShellStore;
```

**Step 2: Commit**

```bash
git add src/store/shellStore.js
git commit -m "feat: add shell Zustand store with CRUD operations"
```

---

### Task 9: Create Boat Config Store

**Files:**
- Create: `src/store/boatConfigStore.js`

**Step 1: Create Zustand store for boat configs**

Create `src/store/boatConfigStore.js`:

```javascript
import { create } from 'zustand';

const useBoatConfigStore = create((set, get) => ({
  // State
  configs: [],
  standardConfigs: [],
  loading: false,
  error: null,

  // Actions

  /**
   * Fetch all boat configs (standard + custom)
   */
  fetchConfigs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/v1/boat-configs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        const configs = data.data.configs;
        set({
          configs,
          standardConfigs: configs.filter((c) => !c.isCustom),
          loading: false,
        });
        return configs;
      } else {
        throw new Error(data.error?.message || 'Failed to fetch configs');
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * Fetch only standard configs (no auth required)
   */
  fetchStandardConfigs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/v1/boat-configs/standard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        set({ standardConfigs: data.data.configs, loading: false });
        return data.data.configs;
      } else {
        throw new Error(data.error?.message || 'Failed to fetch standard configs');
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * Create a new custom boat config
   */
  createConfig: async (configData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/v1/boat-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(configData),
      });
      const data = await response.json();

      if (data.success) {
        const newConfig = { ...data.data.config, isCustom: true };
        set((state) => ({
          configs: [...state.configs, newConfig],
          loading: false,
        }));
        return newConfig;
      } else {
        throw new Error(data.error?.message || 'Failed to create config');
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * Update a custom boat config
   */
  updateConfig: async (configId, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/v1/boat-configs/${configId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await response.json();

      if (data.success) {
        const updatedConfig = { ...data.data.config, isCustom: true };
        set((state) => ({
          configs: state.configs.map((c) =>
            c.id === configId ? updatedConfig : c
          ),
          loading: false,
        }));
        return updatedConfig;
      } else {
        throw new Error(data.error?.message || 'Failed to update config');
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * Delete a custom boat config
   */
  deleteConfig: async (configId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/v1/boat-configs/${configId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        set((state) => ({
          configs: state.configs.filter((c) => c.id !== configId),
          loading: false,
        }));
        return true;
      } else {
        throw new Error(data.error?.message || 'Failed to delete config');
      }
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  /**
   * Get config by name
   */
  getConfigByName: (name) => {
    const state = get();
    return state.configs.find((c) => c.name === name);
  },

  /**
   * Clear error
   */
  clearError: () => set({ error: null }),
}));

export default useBoatConfigStore;
```

**Step 2: Commit**

```bash
git add src/store/boatConfigStore.js
git commit -m "feat: add boat config Zustand store with standard and custom support"
```

---

## Phase 3D: UI Components

### Task 10: Create Shell Management Modal

**Files:**
- Create: `src/components/Assignment/ShellManagementModal.jsx`

**Step 1: Create shell management modal component**

Create `src/components/Assignment/ShellManagementModal.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import useShellStore from '../../store/shellStore';

/**
 * Modal for managing shells (equipment)
 */
function ShellManagementModal({ isOpen, onClose }) {
  const { shells, loading, error, fetchShells, createShell, updateShell, deleteShell, clearError } = useShellStore();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', boatClass: '8+', notes: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const boatClasses = ['8+', '4+', '4-', '4x', '2-', '2x', '1x'];

  useEffect(() => {
    if (isOpen) {
      fetchShells();
    }
  }, [isOpen, fetchShells]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateShell(editingId, formData);
        setEditingId(null);
      } else {
        await createShell(formData);
        setIsAdding(false);
      }
      setFormData({ name: '', boatClass: '8+', notes: '' });
    } catch (err) {
      // Error is handled by store
    }
  };

  const handleEdit = (shell) => {
    setEditingId(shell.id);
    setFormData({ name: shell.name, boatClass: shell.boatClass, notes: shell.notes || '' });
    setIsAdding(false);
  };

  const handleDelete = async (shellId) => {
    try {
      await deleteShell(shellId);
      setDeleteConfirm(null);
    } catch (err) {
      // Error is handled by store
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', boatClass: '8+', notes: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card rounded-2xl p-6 w-full max-w-2xl mx-4 animate-slide-up max-h-[80vh] overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🚣</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Shell Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your team's boats and equipment
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-500 hover:text-red-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
              {editingId ? 'Edit Shell' : 'Add New Shell'}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Shell Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Varsity Eight"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Boat Class
                </label>
                <select
                  value={formData.boatClass}
                  onChange={(e) => setFormData({ ...formData, boatClass: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                >
                  {boatClasses.map((bc) => (
                    <option key={bc} value={bc}>{bc}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Empacher 2019, lightweight"
                rows={2}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingId ? 'Update' : 'Add Shell')}
              </button>
            </div>
          </form>
        )}

        {/* Shell List */}
        <div className="flex-1 overflow-y-auto">
          {loading && shells.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : shells.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-5xl mb-3">🛶</div>
              <p>No shells added yet</p>
              <p className="text-sm mt-2">Add your team's boats to assign them to lineups</p>
            </div>
          ) : (
            <div className="space-y-2">
              {boatClasses.map((boatClass) => {
                const classShells = shells.filter((s) => s.boatClass === boatClass);
                if (classShells.length === 0) return null;

                return (
                  <div key={boatClass} className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 px-2">
                      {boatClass}
                    </h3>
                    {classShells.map((shell) => (
                      <div
                        key={shell.id}
                        className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 mb-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {shell.name}
                            </span>
                            {shell.notes && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {shell.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(shell)}
                              className="px-2 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                            >
                              Edit
                            </button>
                            {deleteConfirm === shell.id ? (
                              <>
                                <button
                                  onClick={() => handleDelete(shell.id)}
                                  className="px-2 py-1 text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="px-2 py-1 text-gray-600 hover:text-gray-800 text-sm"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(shell.id)}
                                className="px-2 py-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Button */}
        {!isAdding && !editingId && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsAdding(true)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Shell
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShellManagementModal;
```

**Step 2: Commit**

```bash
git add src/components/Assignment/ShellManagementModal.jsx
git commit -m "feat: add ShellManagementModal for equipment management"
```

---

### Task 11: Update LineupToolbar with Save/Load/Export

**Files:**
- Create: `src/components/Assignment/LineupToolbar.jsx`

**Step 1: Create lineup toolbar component**

Create `src/components/Assignment/LineupToolbar.jsx`:

```javascript
import React, { useState } from 'react';
import useLineupStore from '../../store/lineupStore';
import useAuthStore from '../../store/authStore';
import SavedLineupsModal from './SavedLineupsModal';
import ShellManagementModal from './ShellManagementModal';

/**
 * Toolbar for lineup management actions
 */
function LineupToolbar({ onExportPDF, onExportCSV }) {
  const { isAuthenticated } = useAuthStore();
  const {
    lineupName,
    activeBoats,
    saveLineupToAPI,
    currentLineupId,
    updateLineupInAPI,
    clearLineup,
  } = useLineupStore();

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showShellModal, setShowShellModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const hasLineup = activeBoats.length > 0;

  const handleSave = async () => {
    if (!saveName.trim()) {
      setSaveError('Please enter a lineup name');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      if (currentLineupId) {
        await updateLineupInAPI(currentLineupId, saveName.trim(), saveNotes.trim());
      } else {
        await saveLineupToAPI(saveName.trim(), saveNotes.trim());
      }
      setShowSaveModal(false);
      setSaveName('');
      setSaveNotes('');
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewLineup = () => {
    if (hasLineup && !window.confirm('Clear current lineup? Unsaved changes will be lost.')) {
      return;
    }
    clearLineup();
  };

  return (
    <>
      <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
        {/* Lineup Name */}
        {lineupName && (
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-sm font-medium">
            {lineupName}
          </span>
        )}

        <div className="flex-1" />

        {/* New Lineup */}
        <button
          onClick={handleNewLineup}
          className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium flex items-center gap-1"
          title="New Lineup"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New
        </button>

        {/* Load */}
        <button
          onClick={() => setShowLoadModal(true)}
          className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium flex items-center gap-1"
          title="Load Lineup"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Load
        </button>

        {/* Save */}
        {isAuthenticated && (
          <button
            onClick={() => {
              setSaveName(lineupName || '');
              setShowSaveModal(true);
            }}
            disabled={!hasLineup}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg flex items-center gap-1 transition-all"
            title="Save Lineup"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save
          </button>
        )}

        {/* Shells */}
        {isAuthenticated && (
          <button
            onClick={() => setShowShellModal(true)}
            className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium flex items-center gap-1"
            title="Manage Shells"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Shells
          </button>
        )}

        {/* Export Dropdown */}
        {hasLineup && (
          <div className="relative group">
            <button
              className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium flex items-center gap-1"
              title="Export"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={onExportPDF}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
              >
                Export PDF
              </button>
              <button
                onClick={onExportCSV}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
              >
                Export CSV
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSaveModal(false)}
          />
          <div className="relative glass-card rounded-2xl p-6 w-full max-w-md mx-4 animate-slide-up">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              {currentLineupId ? 'Update Lineup' : 'Save Lineup'}
            </h3>

            {saveError && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                {saveError}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lineup Name
              </label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Race Day Lineup"
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={saveNotes}
                onChange={(e) => setSaveNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                placeholder="Any notes about this lineup..."
                rows={2}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal */}
      <SavedLineupsModal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        onLoad={(lineup) => {
          // This will be handled by the parent component
          console.log('Load lineup:', lineup);
        }}
      />

      {/* Shell Management Modal */}
      <ShellManagementModal
        isOpen={showShellModal}
        onClose={() => setShowShellModal(false)}
      />
    </>
  );
}

export default LineupToolbar;
```

**Step 2: Commit**

```bash
git add src/components/Assignment/LineupToolbar.jsx
git commit -m "feat: add LineupToolbar with save/load/export actions"
```

---

### Task 12: Create Lineup Export Service

**Files:**
- Create: `src/services/lineupExportService.js`

**Step 1: Create export service for PDF and CSV**

Create `src/services/lineupExportService.js`:

```javascript
/**
 * Service for exporting lineups to PDF and CSV formats
 */

/**
 * Format time from seconds to MM:SS.s
 */
function formatTime(seconds) {
  if (!seconds) return '-';
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  return `${mins}:${secs.padStart(4, '0')}`;
}

/**
 * Export lineup to CSV format
 */
export function exportLineupToCSV(exportData) {
  const rows = [
    ['Lineup Name', exportData.name],
    ['Team', exportData.teamName],
    ['Exported', new Date().toLocaleString()],
    [],
  ];

  for (const boat of exportData.boats) {
    rows.push([`Boat: ${boat.boatClass}${boat.shellName ? ` (${boat.shellName})` : ''}`]);
    rows.push(['Seat', 'Side', 'Athlete', 'Weight (kg)', '2k Time']);

    // Add coxswain if present
    if (boat.coxswain) {
      rows.push([
        'Cox',
        '-',
        boat.coxswain.name,
        boat.coxswain.weightKg || '-',
        '-',
      ]);
    }

    // Add rowers
    for (const seat of boat.seats) {
      rows.push([
        seat.seatNumber,
        seat.side,
        seat.athlete?.name || 'Empty',
        seat.athlete?.weightKg || '-',
        seat.athlete?.latest2k ? formatTime(seat.athlete.latest2k.timeSeconds) : '-',
      ]);
    }

    rows.push([]); // Empty row between boats
  }

  // Convert to CSV string
  const csvContent = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${exportData.name.replace(/[^a-z0-9]/gi, '_')}_lineup.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Export lineup to PDF format
 * Uses browser print dialog for simplicity
 */
export function exportLineupToPDF(exportData) {
  // Create a printable HTML document
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups for PDF export');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${exportData.name} - Lineup</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        h1 { font-size: 24px; margin-bottom: 5px; }
        .subtitle { color: #666; margin-bottom: 20px; }
        .boat { margin-bottom: 30px; page-break-inside: avoid; }
        .boat-header {
          background: #1e40af;
          color: white;
          padding: 8px 12px;
          font-weight: bold;
          border-radius: 4px 4px 0 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 0;
        }
        th, td {
          padding: 8px 12px;
          text-align: left;
          border: 1px solid #e5e7eb;
        }
        th {
          background: #f3f4f6;
          font-weight: 600;
        }
        .empty { color: #9ca3af; font-style: italic; }
        .cox-row { background: #fef3c7; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>${exportData.name}</h1>
      <p class="subtitle">${exportData.teamName} | Exported ${new Date().toLocaleDateString()}</p>

      ${exportData.boats.map((boat) => `
        <div class="boat">
          <div class="boat-header">
            ${boat.boatClass}${boat.shellName ? ` - ${boat.shellName}` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>Seat</th>
                <th>Side</th>
                <th>Athlete</th>
                <th>Weight</th>
                <th>2k</th>
              </tr>
            </thead>
            <tbody>
              ${boat.coxswain ? `
                <tr class="cox-row">
                  <td>Cox</td>
                  <td>-</td>
                  <td>${boat.coxswain.name}</td>
                  <td>${boat.coxswain.weightKg ? boat.coxswain.weightKg + ' kg' : '-'}</td>
                  <td>-</td>
                </tr>
              ` : ''}
              ${boat.seats.map((seat) => `
                <tr>
                  <td>${seat.seatNumber}</td>
                  <td>${seat.side}</td>
                  <td class="${seat.athlete ? '' : 'empty'}">${seat.athlete?.name || 'Empty'}</td>
                  <td>${seat.athlete?.weightKg ? seat.athlete.weightKg + ' kg' : '-'}</td>
                  <td>${seat.athlete?.latest2k ? formatTime(seat.athlete.latest2k.timeSeconds) : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}

      ${exportData.notes ? `<p><strong>Notes:</strong> ${exportData.notes}</p>` : ''}

      <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #1e40af; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Print / Save as PDF
      </button>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Export current lineup state (from store) to CSV
 */
export function exportActiveLineupToCSV(activeBoats, lineupName, teamName = 'Team') {
  const boats = activeBoats.map((boat) => ({
    boatClass: boat.name,
    shellName: boat.shellName,
    coxswain: boat.coxswain,
    seats: boat.seats.map((seat) => ({
      seatNumber: seat.seatNumber,
      side: seat.side,
      athlete: seat.athlete,
    })),
  }));

  exportLineupToCSV({
    name: lineupName || 'Untitled Lineup',
    teamName,
    boats,
  });
}

/**
 * Export current lineup state (from store) to PDF
 */
export function exportActiveLineupToPDF(activeBoats, lineupName, teamName = 'Team', notes = '') {
  const boats = activeBoats.map((boat) => ({
    boatClass: boat.name,
    shellName: boat.shellName,
    coxswain: boat.coxswain,
    seats: boat.seats.map((seat) => ({
      seatNumber: seat.seatNumber,
      side: seat.side,
      athlete: seat.athlete,
    })),
  }));

  exportLineupToPDF({
    name: lineupName || 'Untitled Lineup',
    teamName,
    notes,
    boats,
  });
}
```

**Step 2: Commit**

```bash
git add src/services/lineupExportService.js
git commit -m "feat: add lineup export service for PDF and CSV"
```

---

### Task 13: Update SavedLineupsModal for v1 API

**Files:**
- Modify: `src/components/Assignment/SavedLineupsModal.jsx`

**Step 1: Update to use v1 API endpoints**

Replace the fetch URLs in `SavedLineupsModal.jsx`:

Change line 27-28 from:
```javascript
        const res = await fetch('/api/lineups', {
          headers: getAuthHeaders(),
```

To:
```javascript
        const res = await fetch('/api/v1/lineups', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
```

Change line 60-61 from:
```javascript
        const res = await fetch(`/api/lineups/${lineup.id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
```

To:
```javascript
        const res = await fetch(`/api/v1/lineups/${lineup.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
```

Also update the response handling (line 31) from:
```javascript
        setLineups(data.lineups || []);
```

To:
```javascript
        setLineups(data.data?.lineups || []);
```

**Step 2: Commit**

```bash
git add src/components/Assignment/SavedLineupsModal.jsx
git commit -m "feat: update SavedLineupsModal for v1 API endpoints"
```

---

## Phase 3E: Integration

### Task 14: Wire Up BoatColumn Shell Selection

**Files:**
- Modify: `src/components/Assignment/BoatColumn.jsx` (or create if doesn't exist)

**Step 1: Add shell selection dropdown to boat column header**

Add to BoatColumn component (inside the boat header section):

```javascript
// Add import at top
import useShellStore from '../../store/shellStore';

// Inside component, after other hooks:
const { shells } = useShellStore();
const boatShells = shells.filter(s => s.boatClass === boat.name);

// Add shell selector in the boat header (after boat name):
{boatShells.length > 0 && (
  <select
    value={boat.shellName || ''}
    onChange={(e) => updateBoatShell(boat.id, e.target.value || null)}
    className="ml-2 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
  >
    <option value="">Select shell...</option>
    {boatShells.map(shell => (
      <option key={shell.id} value={shell.name}>
        {shell.name}
      </option>
    ))}
  </select>
)}
```

**Step 2: Commit**

```bash
git add src/components/Assignment/BoatColumn.jsx
git commit -m "feat: wire up shell selection in BoatColumn"
```

---

### Task 15: Add Keyboard Shortcuts Hook

**Files:**
- Create: `src/hooks/useLineupKeyboardShortcuts.js`

**Step 1: Create keyboard shortcuts hook**

Create `src/hooks/useLineupKeyboardShortcuts.js`:

```javascript
import { useEffect, useCallback } from 'react';
import useLineupStore from '../store/lineupStore';

/**
 * Hook for lineup keyboard shortcuts
 * - Cmd/Ctrl+Z: Undo
 * - Cmd/Ctrl+Shift+Z: Redo
 * - Cmd/Ctrl+S: Save (calls onSave callback)
 * - Escape: Clear selection
 */
export function useLineupKeyboardShortcuts({ onSave, enabled = true }) {
  const { undo, redo, clearSeatSelection, clearAthleteSelection } = useLineupStore();

  const handleKeyDown = useCallback((e) => {
    if (!enabled) return;

    // Skip if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    const isMod = e.metaKey || e.ctrlKey;

    // Undo: Cmd/Ctrl+Z
    if (isMod && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo?.();
    }

    // Redo: Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y
    if ((isMod && e.key === 'z' && e.shiftKey) || (isMod && e.key === 'y')) {
      e.preventDefault();
      redo?.();
    }

    // Save: Cmd/Ctrl+S
    if (isMod && e.key === 's') {
      e.preventDefault();
      onSave?.();
    }

    // Escape: Clear selection
    if (e.key === 'Escape') {
      e.preventDefault();
      clearSeatSelection();
      clearAthleteSelection();
    }
  }, [enabled, undo, redo, onSave, clearSeatSelection, clearAthleteSelection]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);
}

export default useLineupKeyboardShortcuts;
```

**Step 2: Commit**

```bash
git add src/hooks/useLineupKeyboardShortcuts.js
git commit -m "feat: add keyboard shortcuts hook for lineup (undo/redo/save/escape)"
```

---

## Phase 3F: Testing

### Task 16: Backend API Testing

**Verification:**

```bash
# Start server
npm run dev:server

# Test lineup CRUD
curl -X POST http://localhost:3002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use token from login response
export TOKEN="your_access_token"

# Create lineup
curl -X POST http://localhost:3002/api/v1/lineups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Race Day Lineup",
    "notes": "For Saturday regatta",
    "assignments": []
  }'

# List lineups
curl http://localhost:3002/api/v1/lineups \
  -H "Authorization: Bearer $TOKEN"

# Create shell
curl -X POST http://localhost:3002/api/v1/shells \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Varsity Eight",
    "boatClass": "8+",
    "notes": "Empacher 2020"
  }'

# List shells
curl http://localhost:3002/api/v1/shells \
  -H "Authorization: Bearer $TOKEN"

# Get boat configs
curl http://localhost:3002/api/v1/boat-configs \
  -H "Authorization: Bearer $TOKEN"
```

---

### Task 17: Frontend Integration Testing

**Verification:**

```bash
# Start both servers
npm run dev

# Navigate to http://localhost:3001
# - Log in with test account
# - Go to Lineups page
# - Add boats to workspace
# - Drag athletes to seats
# - Click Save, enter name
# - Verify lineup appears in saved list
# - Click Load, select lineup
# - Verify lineup loads correctly
# - Test Export PDF/CSV
# - Test keyboard shortcuts (Cmd+Z, Cmd+Shift+Z, Escape)
```

---

## Execution Checklist

- [ ] Task 1: Lineup service
- [ ] Task 2: Shell service
- [ ] Task 3: Boat config service
- [ ] Task 4: Lineup routes
- [ ] Task 5: Shell routes
- [ ] Task 6: Boat config routes
- [ ] Task 7: Update lineupStore for API
- [ ] Task 8: Create shellStore
- [ ] Task 9: Create boatConfigStore
- [ ] Task 10: ShellManagementModal
- [ ] Task 11: LineupToolbar
- [ ] Task 12: lineupExportService
- [ ] Task 13: Update SavedLineupsModal
- [ ] Task 14: Wire up BoatColumn shell selection
- [ ] Task 15: Keyboard shortcuts hook
- [ ] Task 16: Backend testing
- [ ] Task 17: Frontend testing

---

## API Endpoints Summary (Phase 3)

### Lineups
- `GET /api/v1/lineups` - List lineups
- `GET /api/v1/lineups/:id` - Get lineup with assignments
- `GET /api/v1/lineups/:id/export` - Get export data (with erg times, weights)
- `POST /api/v1/lineups` - Create lineup
- `POST /api/v1/lineups/:id/duplicate` - Duplicate lineup
- `PATCH /api/v1/lineups/:id` - Update lineup
- `DELETE /api/v1/lineups/:id` - Delete lineup

### Shells
- `GET /api/v1/shells` - List shells
- `GET /api/v1/shells/grouped` - Shells grouped by boat class
- `GET /api/v1/shells/:id` - Get shell
- `POST /api/v1/shells` - Create shell
- `POST /api/v1/shells/bulk-import` - Bulk import shells
- `PATCH /api/v1/shells/:id` - Update shell
- `DELETE /api/v1/shells/:id` - Delete shell

### Boat Configs
- `GET /api/v1/boat-configs` - List all configs (standard + custom)
- `GET /api/v1/boat-configs/standard` - Standard configs only
- `GET /api/v1/boat-configs/:id` - Get config
- `POST /api/v1/boat-configs` - Create custom config
- `PATCH /api/v1/boat-configs/:id` - Update custom config
- `DELETE /api/v1/boat-configs/:id` - Delete custom config
