import { prisma } from '../db/connection.js';

/**
 * Create a new regatta
 */
export async function createRegatta(teamId, data) {
  const {
    name,
    location,
    date,
    endDate,
    host,
    venueType,
    courseType,
    conditions,
    description,
    externalUrl,
    teamGoals,
  } = data;

  const regatta = await prisma.regatta.create({
    data: {
      teamId,
      name,
      location,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      host,
      venueType,
      courseType,
      conditions: conditions || {},
      description,
      externalUrl,
      teamGoals,
    },
  });

  return regatta;
}

/**
 * Get all regattas for a team
 */
export async function getRegattas(teamId, options = {}) {
  const { limit = 20, offset = 0, season } = options;

  const where = { teamId };
  if (season) {
    // Filter by season (e.g., "Spring 2025")
    const [seasonName, year] = season.split(' ');
    const yearNum = parseInt(year);
    if (seasonName === 'Spring') {
      where.date = {
        gte: new Date(`${yearNum}-01-01`),
        lte: new Date(`${yearNum}-06-30`),
      };
    } else if (seasonName === 'Fall') {
      where.date = {
        gte: new Date(`${yearNum}-07-01`),
        lte: new Date(`${yearNum}-12-31`),
      };
    }
  }

  const regattas = await prisma.regatta.findMany({
    where,
    include: {
      _count: { select: { races: true } },
    },
    orderBy: { date: 'desc' },
    take: limit,
    skip: offset,
  });

  return regattas;
}

/**
 * Get regatta with all events, races and results
 */
export async function getRegattaById(teamId, regattaId) {
  const regatta = await prisma.regatta.findFirst({
    where: { id: regattaId, teamId },
    include: {
      events: {
        orderBy: { sortOrder: 'asc' },
        include: {
          races: {
            orderBy: { scheduledTime: 'asc' },
            include: {
              results: {
                orderBy: { place: 'asc' },
                include: {
                  lineup: {
                    select: { id: true, name: true },
                  },
                },
              },
              checklist: {
                include: {
                  items: {
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
            },
          },
        },
      },
      // Keep races for backward compatibility
      races: {
        orderBy: { scheduledTime: 'asc' },
        include: {
          results: {
            orderBy: { place: 'asc' },
            include: {
              lineup: {
                select: { id: true, name: true },
              },
            },
          },
        },
      },
    },
  });

  if (!regatta) throw new Error('Regatta not found');
  return regatta;
}

/**
 * Update regatta
 */
export async function updateRegatta(teamId, regattaId, data) {
  const existing = await prisma.regatta.findFirst({
    where: { id: regattaId, teamId },
  });
  if (!existing) throw new Error('Regatta not found');

  return prisma.regatta.update({
    where: { id: regattaId },
    data: {
      name: data.name,
      location: data.location,
      date: data.date ? new Date(data.date) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : data.endDate === null ? null : undefined,
      host: data.host,
      venueType: data.venueType,
      courseType: data.courseType,
      conditions: data.conditions,
      description: data.description,
      externalUrl: data.externalUrl,
      teamGoals: data.teamGoals,
    },
  });
}

/**
 * Delete regatta and all related data
 */
export async function deleteRegatta(teamId, regattaId) {
  const existing = await prisma.regatta.findFirst({
    where: { id: regattaId, teamId },
  });
  if (!existing) throw new Error('Regatta not found');

  await prisma.regatta.delete({
    where: { id: regattaId },
  });

  return { success: true };
}

/**
 * Add a race to a regatta
 */
export async function addRace(teamId, regattaId, data) {
  const regatta = await prisma.regatta.findFirst({
    where: { id: regattaId, teamId },
  });
  if (!regatta) throw new Error('Regatta not found');

  const race = await prisma.race.create({
    data: {
      regattaId,
      eventName: data.eventName,
      boatClass: data.boatClass,
      distanceMeters: data.distanceMeters || 2000,
      isHeadRace: data.isHeadRace || false,
      scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : null,
    },
  });

  return race;
}

/**
 * Update race
 */
export async function updateRace(teamId, raceId, data) {
  const race = await prisma.race.findFirst({
    where: { id: raceId },
    include: { regatta: true },
  });
  if (!race || race.regatta.teamId !== teamId) {
    throw new Error('Race not found');
  }

  return prisma.race.update({
    where: { id: raceId },
    data: {
      eventName: data.eventName,
      boatClass: data.boatClass,
      distanceMeters: data.distanceMeters,
      isHeadRace: data.isHeadRace,
      scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : undefined,
    },
  });
}

/**
 * Delete race
 */
export async function deleteRace(teamId, raceId) {
  const race = await prisma.race.findFirst({
    where: { id: raceId },
    include: { regatta: true },
  });
  if (!race || race.regatta.teamId !== teamId) {
    throw new Error('Race not found');
  }

  await prisma.race.delete({
    where: { id: raceId },
  });

  return { success: true };
}

/**
 * Add result to a race
 */
export async function addResult(teamId, raceId, data) {
  const race = await prisma.race.findFirst({
    where: { id: raceId },
    include: { regatta: true },
  });
  if (!race || race.regatta.teamId !== teamId) {
    throw new Error('Race not found');
  }

  // Calculate raw speed if time provided
  let rawSpeed = null;
  if (data.finishTimeSeconds && race.distanceMeters) {
    rawSpeed = race.distanceMeters / data.finishTimeSeconds;
  }

  const result = await prisma.raceResult.create({
    data: {
      raceId,
      teamName: data.teamName,
      isOwnTeam: data.isOwnTeam || false,
      lineupId: data.lineupId,
      finishTimeSeconds: data.finishTimeSeconds,
      place: data.place,
      marginBackSeconds: data.marginBackSeconds,
      rawSpeed,
    },
  });

  return result;
}

/**
 * Update result
 */
export async function updateResult(teamId, resultId, data) {
  const result = await prisma.raceResult.findFirst({
    where: { id: resultId },
    include: { race: { include: { regatta: true } } },
  });
  if (!result || result.race.regatta.teamId !== teamId) {
    throw new Error('Result not found');
  }

  // Recalculate raw speed if time changed
  let rawSpeed = result.rawSpeed;
  if (data.finishTimeSeconds && result.race.distanceMeters) {
    rawSpeed = result.race.distanceMeters / data.finishTimeSeconds;
  }

  return prisma.raceResult.update({
    where: { id: resultId },
    data: {
      teamName: data.teamName,
      isOwnTeam: data.isOwnTeam,
      lineupId: data.lineupId,
      finishTimeSeconds: data.finishTimeSeconds,
      place: data.place,
      marginBackSeconds: data.marginBackSeconds,
      rawSpeed,
    },
  });
}

/**
 * Batch add results (for importing full race results)
 */
export async function batchAddResults(teamId, raceId, results) {
  const race = await prisma.race.findFirst({
    where: { id: raceId },
    include: { regatta: true },
  });
  if (!race || race.regatta.teamId !== teamId) {
    throw new Error('Race not found');
  }

  const createdResults = [];
  for (const data of results) {
    let rawSpeed = null;
    if (data.finishTimeSeconds && race.distanceMeters) {
      rawSpeed = race.distanceMeters / data.finishTimeSeconds;
    }

    const result = await prisma.raceResult.create({
      data: {
        raceId,
        teamName: data.teamName,
        isOwnTeam: data.isOwnTeam || false,
        lineupId: data.lineupId,
        finishTimeSeconds: data.finishTimeSeconds,
        place: data.place,
        marginBackSeconds: data.marginBackSeconds,
        rawSpeed,
      },
    });
    createdResults.push(result);
  }

  return createdResults;
}

// ============================================
// Event Functions (Regatta -> Event -> Race)
// ============================================

/**
 * Create an event within a regatta
 */
export async function createEvent(teamId, regattaId, data) {
  const regatta = await prisma.regatta.findFirst({
    where: { id: regattaId, teamId },
  });
  if (!regatta) throw new Error('Regatta not found');

  const event = await prisma.event.create({
    data: {
      regattaId,
      name: data.name,
      category: data.category,
      scheduledDay: data.scheduledDay,
      sortOrder: data.sortOrder || 0,
    },
  });

  return event;
}

/**
 * Update an event
 */
export async function updateEvent(teamId, eventId, data) {
  const event = await prisma.event.findFirst({
    where: { id: eventId },
    include: { regatta: true },
  });
  if (!event || event.regatta.teamId !== teamId) {
    throw new Error('Event not found');
  }

  return prisma.event.update({
    where: { id: eventId },
    data: {
      name: data.name,
      category: data.category,
      scheduledDay: data.scheduledDay,
      sortOrder: data.sortOrder,
    },
  });
}

/**
 * Delete an event and cascade to races
 */
export async function deleteEvent(teamId, eventId) {
  const event = await prisma.event.findFirst({
    where: { id: eventId },
    include: { regatta: true },
  });
  if (!event || event.regatta.teamId !== teamId) {
    throw new Error('Event not found');
  }

  await prisma.event.delete({
    where: { id: eventId },
  });

  return { success: true };
}

/**
 * Add a race to an event
 */
export async function addRaceToEvent(teamId, eventId, data) {
  const event = await prisma.event.findFirst({
    where: { id: eventId },
    include: { regatta: true },
  });
  if (!event || event.regatta.teamId !== teamId) {
    throw new Error('Event not found');
  }

  const race = await prisma.race.create({
    data: {
      regattaId: event.regattaId, // Keep for backward compatibility
      eventId,
      eventName: data.eventName || event.name,
      boatClass: data.boatClass,
      distanceMeters: data.distanceMeters || 2000,
      isHeadRace: data.isHeadRace || false,
      scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : null,
    },
  });

  return race;
}

// ============================================
// Checklist Template Functions
// ============================================

/**
 * Get all checklist templates for a team
 */
export async function getChecklistTemplates(teamId) {
  return prisma.checklistTemplate.findMany({
    where: { teamId },
    include: {
      items: {
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  });
}

/**
 * Create a checklist template
 */
export async function createChecklistTemplate(teamId, data) {
  const { name, isDefault, items } = data;

  // If setting as default, unset other defaults
  if (isDefault) {
    await prisma.checklistTemplate.updateMany({
      where: { teamId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const template = await prisma.checklistTemplate.create({
    data: {
      teamId,
      name,
      isDefault: isDefault || false,
      items: {
        create: (items || []).map((item, index) => ({
          text: item.text,
          role: item.role || 'anyone',
          sortOrder: item.sortOrder ?? index,
        })),
      },
    },
    include: {
      items: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  return template;
}

/**
 * Update a checklist template
 */
export async function updateChecklistTemplate(teamId, templateId, data) {
  const existing = await prisma.checklistTemplate.findFirst({
    where: { id: templateId, teamId },
  });
  if (!existing) throw new Error('Template not found');

  const { name, isDefault, items } = data;

  // If setting as default, unset other defaults
  if (isDefault) {
    await prisma.checklistTemplate.updateMany({
      where: { teamId, isDefault: true, id: { not: templateId } },
      data: { isDefault: false },
    });
  }

  // Update template and replace items
  const template = await prisma.checklistTemplate.update({
    where: { id: templateId },
    data: {
      name,
      isDefault,
      items: items
        ? {
            deleteMany: {},
            create: items.map((item, index) => ({
              text: item.text,
              role: item.role || 'anyone',
              sortOrder: item.sortOrder ?? index,
            })),
          }
        : undefined,
    },
    include: {
      items: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  return template;
}

/**
 * Delete a checklist template
 */
export async function deleteChecklistTemplate(teamId, templateId) {
  const existing = await prisma.checklistTemplate.findFirst({
    where: { id: templateId, teamId },
  });
  if (!existing) throw new Error('Template not found');

  await prisma.checklistTemplate.delete({
    where: { id: templateId },
  });

  return { success: true };
}

// ============================================
// Race Checklist Functions
// ============================================

/**
 * Get checklist for a race
 */
export async function getRaceChecklist(teamId, raceId) {
  const race = await prisma.race.findFirst({
    where: { id: raceId },
    include: { regatta: true },
  });
  if (!race || race.regatta.teamId !== teamId) {
    throw new Error('Race not found');
  }

  return prisma.raceChecklist.findUnique({
    where: { raceId },
    include: {
      items: {
        orderBy: { sortOrder: 'asc' },
      },
      template: true,
    },
  });
}

/**
 * Create a race checklist from a template
 */
export async function createRaceChecklist(teamId, raceId, templateId) {
  const race = await prisma.race.findFirst({
    where: { id: raceId },
    include: { regatta: true },
  });
  if (!race || race.regatta.teamId !== teamId) {
    throw new Error('Race not found');
  }

  // Check if checklist already exists
  const existing = await prisma.raceChecklist.findUnique({
    where: { raceId },
  });
  if (existing) {
    throw new Error('Checklist already exists for this race');
  }

  // Get template items if templateId provided
  let templateItems = [];
  if (templateId) {
    const template = await prisma.checklistTemplate.findFirst({
      where: { id: templateId, teamId },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
    if (template) {
      templateItems = template.items;
    }
  }

  const checklist = await prisma.raceChecklist.create({
    data: {
      raceId,
      templateId,
      items: {
        create: templateItems.map((item, index) => ({
          text: item.text,
          role: item.role,
          sortOrder: item.sortOrder ?? index,
          completed: false,
        })),
      },
    },
    include: {
      items: {
        orderBy: { sortOrder: 'asc' },
      },
      template: true,
    },
  });

  return checklist;
}

/**
 * Toggle a checklist item
 */
export async function updateChecklistItem(teamId, itemId, completed, userId) {
  const item = await prisma.raceChecklistItem.findFirst({
    where: { id: itemId },
    include: {
      checklist: {
        include: {
          race: {
            include: { regatta: true },
          },
        },
      },
    },
  });

  if (!item || item.checklist.race.regatta.teamId !== teamId) {
    throw new Error('Checklist item not found');
  }

  return prisma.raceChecklistItem.update({
    where: { id: itemId },
    data: {
      completed,
      completedBy: completed ? userId : null,
      completedAt: completed ? new Date() : null,
    },
  });
}

/**
 * Get checklist progress for a race
 */
export async function getRaceChecklistProgress(teamId, raceId) {
  const checklist = await getRaceChecklist(teamId, raceId);
  if (!checklist) {
    return { total: 0, completed: 0, percentage: 0 };
  }

  const total = checklist.items.length;
  const completed = checklist.items.filter((item) => item.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, percentage };
}

// ============================================
// External Ranking Functions
// ============================================

/**
 * Get external rankings for a team
 */
export async function getExternalRankings(teamId, options = {}) {
  const { boatClass, source, season } = options;

  const where = { teamId };
  if (boatClass) where.boatClass = boatClass;
  if (source) where.source = source;
  if (season) where.season = season;

  return prisma.externalRanking.findMany({
    where,
    include: {
      externalTeam: true,
    },
    orderBy: { ranking: 'asc' },
  });
}

/**
 * Add an external ranking
 */
export async function addExternalRanking(teamId, data) {
  const {
    externalTeamId,
    boatClass,
    source,
    ranking,
    season,
    updatedDate,
    notes,
  } = data;

  // Verify external team exists
  const externalTeam = await prisma.externalTeam.findUnique({
    where: { id: externalTeamId },
  });
  if (!externalTeam) throw new Error('External team not found');

  return prisma.externalRanking.upsert({
    where: {
      teamId_externalTeamId_boatClass_source_season: {
        teamId,
        externalTeamId,
        boatClass,
        source,
        season: season || '',
      },
    },
    create: {
      teamId,
      externalTeamId,
      boatClass,
      source,
      ranking,
      season,
      updatedDate: new Date(updatedDate),
      notes,
    },
    update: {
      ranking,
      updatedDate: new Date(updatedDate),
      notes,
    },
    include: {
      externalTeam: true,
    },
  });
}

/**
 * Delete an external ranking
 */
export async function deleteExternalRanking(teamId, rankingId) {
  const ranking = await prisma.externalRanking.findFirst({
    where: { id: rankingId, teamId },
  });
  if (!ranking) throw new Error('Ranking not found');

  await prisma.externalRanking.delete({
    where: { id: rankingId },
  });

  return { success: true };
}
