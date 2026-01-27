/**
 * Equipment Service - Phase 18 BOAT-03, BOAT-04
 *
 * Manages equipment assignments and conflict detection with team isolation.
 */

import { prisma } from '../db/connection.js';

/**
 * Create an equipment assignment
 */
export async function createAssignment(teamId, data) {
  const assignment = await prisma.equipmentAssignment.create({
    data: {
      teamId,
      lineupId: data.lineupId || null,
      sessionId: data.sessionId || null,
      shellId: data.shellId || null,
      oarSetId: data.oarSetId || null,
      assignedDate: new Date(data.assignedDate),
      notes: data.notes || null,
    },
    include: {
      shell: { select: { id: true, name: true, boatClass: true } },
      oarSet: { select: { id: true, name: true, type: true } },
      lineup: { select: { id: true, name: true } },
    },
  });

  return formatAssignment(assignment);
}

/**
 * Get assignments for a team on a specific date
 */
export async function getAssignments(teamId, date) {
  const targetDate = new Date(date);
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

  const assignments = await prisma.equipmentAssignment.findMany({
    where: {
      teamId,
      assignedDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      shell: { select: { id: true, name: true, boatClass: true, status: true } },
      oarSet: { select: { id: true, name: true, type: true, status: true } },
      lineup: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return assignments.map(formatAssignment);
}

/**
 * Get assignments for a specific lineup
 */
export async function getLineupAssignments(lineupId, teamId) {
  const assignments = await prisma.equipmentAssignment.findMany({
    where: { lineupId, teamId },
    include: {
      shell: { select: { id: true, name: true, boatClass: true, status: true } },
      oarSet: { select: { id: true, name: true, type: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return assignments.map(formatAssignment);
}

/**
 * Delete an assignment
 */
export async function deleteAssignment(assignmentId, teamId) {
  const assignment = await prisma.equipmentAssignment.findFirst({
    where: { id: assignmentId, teamId },
  });

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  await prisma.equipmentAssignment.delete({
    where: { id: assignmentId },
  });

  return { success: true };
}

/**
 * Check for equipment conflicts on a given date
 */
export async function checkConflicts(teamId, date, shellIds = [], oarSetIds = [], excludeLineupId = null) {
  const targetDate = new Date(date);
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

  const conflicts = [];

  // Check shell conflicts
  if (shellIds.length > 0) {
    const shellAssignments = await prisma.equipmentAssignment.findMany({
      where: {
        teamId,
        shellId: { in: shellIds },
        assignedDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(excludeLineupId && { lineupId: { not: excludeLineupId } }),
      },
      include: {
        shell: { select: { id: true, name: true } },
        lineup: { select: { id: true, name: true } },
      },
    });

    for (const assignment of shellAssignments) {
      conflicts.push({
        type: 'double_booking',
        equipmentId: assignment.shellId,
        equipmentName: assignment.shell.name,
        equipmentType: 'shell',
        conflictingId: assignment.lineupId || assignment.sessionId,
        conflictingName: assignment.lineup?.name || 'Session',
        conflictDate: date,
        message: `${assignment.shell.name} is already assigned to "${assignment.lineup?.name || 'a session'}"`,
      });
    }
  }

  // Check oar set conflicts
  if (oarSetIds.length > 0) {
    const oarAssignments = await prisma.equipmentAssignment.findMany({
      where: {
        teamId,
        oarSetId: { in: oarSetIds },
        assignedDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(excludeLineupId && { lineupId: { not: excludeLineupId } }),
      },
      include: {
        oarSet: { select: { id: true, name: true } },
        lineup: { select: { id: true, name: true } },
      },
    });

    for (const assignment of oarAssignments) {
      conflicts.push({
        type: 'double_booking',
        equipmentId: assignment.oarSetId,
        equipmentName: assignment.oarSet.name,
        equipmentType: 'oarSet',
        conflictingId: assignment.lineupId || assignment.sessionId,
        conflictingName: assignment.lineup?.name || 'Session',
        conflictDate: date,
        message: `${assignment.oarSet.name} is already assigned to "${assignment.lineup?.name || 'a session'}"`,
      });
    }
  }

  // Check for maintenance status
  if (shellIds.length > 0) {
    const maintenanceShells = await prisma.shell.findMany({
      where: {
        id: { in: shellIds },
        teamId,
        status: { in: ['MAINTENANCE', 'RETIRED'] },
      },
    });

    for (const shell of maintenanceShells) {
      conflicts.push({
        type: shell.status === 'MAINTENANCE' ? 'maintenance' : 'unavailable',
        equipmentId: shell.id,
        equipmentName: shell.name,
        equipmentType: 'shell',
        conflictingId: null,
        conflictingName: null,
        conflictDate: date,
        message: `${shell.name} is ${shell.status.toLowerCase()}`,
      });
    }
  }

  return conflicts;
}

/**
 * Get equipment availability for a date (all shells and oars with status)
 */
export async function getEquipmentAvailability(teamId, date, excludeLineupId = null) {
  const targetDate = new Date(date);
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

  // Get all shells
  const shells = await prisma.shell.findMany({
    where: { teamId },
    include: {
      riggingProfile: { select: { id: true } },
    },
    orderBy: { name: 'asc' },
  });

  // Get all oar sets
  const oarSets = await prisma.oarSet.findMany({
    where: { teamId },
    orderBy: { name: 'asc' },
  });

  // Get assignments for the date
  const assignments = await prisma.equipmentAssignment.findMany({
    where: {
      teamId,
      assignedDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      ...(excludeLineupId && { lineupId: { not: excludeLineupId } }),
    },
    include: {
      lineup: { select: { id: true, name: true } },
    },
  });

  // Build conflict maps
  const shellConflicts = new Map();
  const oarConflicts = new Map();

  for (const assignment of assignments) {
    if (assignment.shellId) {
      const existing = shellConflicts.get(assignment.shellId);
      if (!existing) {
        shellConflicts.set(assignment.shellId, {
          type: 'double_booking',
          conflictingId: assignment.lineupId || assignment.sessionId,
          conflictingName: assignment.lineup?.name || 'Session',
        });
      }
    }
    if (assignment.oarSetId) {
      const existing = oarConflicts.get(assignment.oarSetId);
      if (!existing) {
        oarConflicts.set(assignment.oarSetId, {
          type: 'double_booking',
          conflictingId: assignment.lineupId || assignment.sessionId,
          conflictingName: assignment.lineup?.name || 'Session',
        });
      }
    }
  }

  // Format shells with status
  const shellsWithStatus = shells.map((shell) => {
    const conflict = shellConflicts.get(shell.id);
    const isUnavailable = ['MAINTENANCE', 'RETIRED'].includes(shell.status);

    return {
      id: shell.id,
      name: shell.name,
      boatClass: shell.boatClass,
      type: shell.type,
      weightClass: shell.weightClass,
      rigging: shell.rigging,
      status: shell.status,
      notes: shell.notes,
      isAssignedForDate: !!conflict,
      hasRiggingProfile: !!shell.riggingProfile,
      conflict: conflict
        ? {
            type: conflict.type,
            equipmentId: shell.id,
            equipmentName: shell.name,
            equipmentType: 'shell',
            conflictingId: conflict.conflictingId,
            conflictingName: conflict.conflictingName,
            conflictDate: date,
            message: `${shell.name} is already assigned to "${conflict.conflictingName}"`,
          }
        : isUnavailable
        ? {
            type: shell.status === 'MAINTENANCE' ? 'maintenance' : 'unavailable',
            equipmentId: shell.id,
            equipmentName: shell.name,
            equipmentType: 'shell',
            conflictingId: null,
            conflictingName: null,
            conflictDate: date,
            message: `${shell.name} is ${shell.status.toLowerCase()}`,
          }
        : null,
    };
  });

  // Format oar sets with status
  const oarSetsWithStatus = oarSets.map((oarSet) => {
    const conflict = oarConflicts.get(oarSet.id);
    const isUnavailable = ['MAINTENANCE', 'RETIRED'].includes(oarSet.status);

    return {
      id: oarSet.id,
      name: oarSet.name,
      type: oarSet.type,
      count: oarSet.count,
      status: oarSet.status,
      notes: oarSet.notes,
      isAssignedForDate: !!conflict,
      conflict: conflict
        ? {
            type: conflict.type,
            equipmentId: oarSet.id,
            equipmentName: oarSet.name,
            equipmentType: 'oarSet',
            conflictingId: conflict.conflictingId,
            conflictingName: conflict.conflictingName,
            conflictDate: date,
            message: `${oarSet.name} is already assigned to "${conflict.conflictingName}"`,
          }
        : isUnavailable
        ? {
            type: oarSet.status === 'MAINTENANCE' ? 'maintenance' : 'unavailable',
            equipmentId: oarSet.id,
            equipmentName: oarSet.name,
            equipmentType: 'oarSet',
            conflictingId: null,
            conflictingName: null,
            conflictDate: date,
            message: `${oarSet.name} is ${oarSet.status.toLowerCase()}`,
          }
        : null,
    };
  });

  return {
    date,
    shells: shellsWithStatus,
    oarSets: oarSetsWithStatus,
    conflictCount:
      shellsWithStatus.filter((s) => s.conflict).length +
      oarSetsWithStatus.filter((o) => o.conflict).length,
  };
}

/**
 * Format assignment for API response
 */
function formatAssignment(assignment) {
  return {
    id: assignment.id,
    teamId: assignment.teamId,
    lineupId: assignment.lineupId,
    sessionId: assignment.sessionId,
    shellId: assignment.shellId,
    oarSetId: assignment.oarSetId,
    assignedDate: assignment.assignedDate.toISOString().split('T')[0],
    notes: assignment.notes,
    createdAt: assignment.createdAt.toISOString(),
    shellName: assignment.shell?.name || null,
    oarSetName: assignment.oarSet?.name || null,
    lineupName: assignment.lineup?.name || null,
  };
}
