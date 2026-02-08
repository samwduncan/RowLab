import { format, parseISO, isPast, isFuture, isToday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  ChevronRight,
  MoreVertical,
  Trash2,
  Copy,
  Edit,
  Anchor,
} from 'lucide-react';
import { Menu } from '@headlessui/react';
import type { Regatta } from '../../types/regatta';

type RegattaListProps = {
  regattas: Regatta[];
  isLoading?: boolean;
  onSelect: (regatta: Regatta) => void;
  onEdit: (regatta: Regatta) => void;
  onDelete: (regatta: Regatta) => void;
  onDuplicate: (regatta: Regatta) => void;
};

export function RegattaList({
  regattas,
  isLoading,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
}: RegattaListProps) {
  const upcoming = regattas.filter((r) => isFuture(parseISO(r.date)) || isToday(parseISO(r.date)));
  const past = regattas.filter((r) => isPast(parseISO(r.date)) && !isToday(parseISO(r.date)));

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-white/[0.02] rounded-2xl h-24 border border-white/[0.06]"
          />
        ))}
      </div>
    );
  }

  if (regattas.length === 0) {
    return (
      <div className="relative text-center py-16 rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-primary/[0.03] to-transparent pointer-events-none" />
        <Anchor className="w-14 h-14 mx-auto mb-4 text-ink-muted" strokeWidth={1} />
        <p className="text-xl font-display text-ink-primary">No regattas yet</p>
        <p className="text-sm text-ink-secondary mt-2">
          Create your first regatta to start tracking race results
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {upcoming.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xs font-semibold text-ink-secondary uppercase tracking-[0.15em]">
              Upcoming
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-ink-border to-transparent" />
            <span className="text-xs font-mono text-ink-tertiary tabular-nums">
              {upcoming.length}
            </span>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {upcoming.map((regatta, i) => (
                <RegattaCard
                  key={regatta.id}
                  regatta={regatta}
                  index={i}
                  onSelect={onSelect}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                />
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xs font-semibold text-ink-secondary uppercase tracking-[0.15em]">
              Past
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-ink-border to-transparent" />
            <span className="text-xs font-mono text-ink-tertiary tabular-nums">{past.length}</span>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {past.map((regatta, i) => (
                <RegattaCard
                  key={regatta.id}
                  regatta={regatta}
                  index={i}
                  onSelect={onSelect}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  isPast
                />
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}
    </div>
  );
}

function RegattaCard({
  regatta,
  index,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  isPast = false,
}: {
  regatta: Regatta;
  index: number;
  onSelect: (r: Regatta) => void;
  onEdit: (r: Regatta) => void;
  onDelete: (r: Regatta) => void;
  onDuplicate: (r: Regatta) => void;
  isPast?: boolean;
}) {
  const dateStr = format(parseISO(regatta.date), 'MMM d, yyyy');
  const isMultiDay = regatta.endDate && regatta.endDate !== regatta.date;
  const endDateStr = isMultiDay ? ` — ${format(parseISO(regatta.endDate!), 'MMM d')}` : '';
  const monthStr = format(parseISO(regatta.date), 'MMM').toUpperCase();
  const dayStr = format(parseISO(regatta.date), 'd');
  const isTodayRegatta = isToday(parseISO(regatta.date));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.04, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      {/* Gradient border wrapper */}
      <div
        className={`
        relative rounded-2xl p-px
        bg-gradient-to-b from-white/[0.12] to-white/[0.02]
        hover:from-white/[0.18] hover:to-white/[0.04]
        transition-all duration-200
        ${isPast ? 'opacity-60 hover:opacity-80' : ''}
      `}
      >
        {/* Inner card */}
        <div
          className="relative rounded-[15px] bg-ink-raised overflow-hidden cursor-pointer
                     shadow-card hover:shadow-card-hover transition-all duration-200
                     hover:-translate-y-px"
          onClick={() => onSelect(regatta)}
        >
          {/* Top highlight line */}
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.15] to-transparent
                          opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          />

          {/* Live indicator glow for today's regattas */}
          {isTodayRegatta && (
            <div className="absolute inset-0 bg-gradient-to-r from-data-good/[0.04] to-transparent pointer-events-none" />
          )}

          <div className="flex items-center p-5 gap-5">
            {/* Date badge */}
            <div
              className={`
              flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center
              ${
                isTodayRegatta
                  ? 'bg-data-good/[0.12] ring-1 ring-data-good/20'
                  : 'bg-accent-primary/[0.08] ring-1 ring-accent-primary/10'
              }
            `}
            >
              <span
                className={`text-[10px] font-bold tracking-widest ${
                  isTodayRegatta ? 'text-data-good' : 'text-accent-primary'
                }`}
              >
                {monthStr}
              </span>
              <span
                className={`text-2xl font-display font-bold -mt-0.5 ${
                  isTodayRegatta ? 'text-data-good' : 'text-accent-primary'
                }`}
              >
                {dayStr}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-ink-bright truncate text-base">{regatta.name}</h4>
                {isTodayRegatta && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-data-good/[0.12] text-data-good ring-1 ring-data-good/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-data-good animate-pulse-subtle" />
                    Live
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-1.5 text-sm text-ink-secondary">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-ink-tertiary" />
                  {dateStr}
                  {endDateStr}
                </span>
                {regatta.location && (
                  <span className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-ink-tertiary flex-shrink-0" />
                    {regatta.location}
                  </span>
                )}
              </div>

              {regatta._count?.races !== undefined && (
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs font-mono text-ink-tertiary px-2 py-0.5 rounded-md bg-ink-deep/50 tabular-nums">
                    {regatta._count.races} {regatta._count.races === 1 ? 'race' : 'races'}
                  </span>
                  {regatta.courseType && (
                    <span className="text-xs text-ink-tertiary px-2 py-0.5 rounded-md bg-ink-deep/50">
                      {regatta.courseType}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Menu as="div" className="relative">
                <Menu.Button
                  className="p-2 rounded-xl hover:bg-white/[0.05] transition-colors
                           opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4 text-ink-secondary" />
                </Menu.Button>
                <Menu.Items
                  className="absolute right-0 mt-1 w-48 rounded-xl shadow-2xl border border-white/[0.08] bg-ink-float py-1 z-10
                                      backdrop-blur-xl"
                >
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 text-ink-primary ${
                          active ? 'bg-white/[0.05]' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(regatta);
                        }}
                      >
                        <Edit className="w-4 h-4 text-ink-secondary" />
                        Edit
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 text-ink-primary ${
                          active ? 'bg-white/[0.05]' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(regatta);
                        }}
                      >
                        <Copy className="w-4 h-4 text-ink-secondary" />
                        Duplicate
                      </button>
                    )}
                  </Menu.Item>
                  <div className="my-1 h-px bg-white/[0.06]" />
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 text-data-poor ${
                          active ? 'bg-data-poor/[0.08]' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(regatta);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>
              <ChevronRight
                className="w-5 h-5 text-ink-muted opacity-0 group-hover:opacity-100
                                       group-hover:translate-x-0.5 transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
