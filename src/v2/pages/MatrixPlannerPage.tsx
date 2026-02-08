import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { MatrixPlanner } from '../components/seat-racing';
import { FADE_IN_VARIANTS } from '@v2/utils/animations';
import type { SwapSchedule } from '../types/advancedRanking';

export function MatrixPlannerPage() {
  const navigate = useNavigate();
  const [generatedSchedule, setGeneratedSchedule] = useState<SwapSchedule | null>(null);

  const handleScheduleGenerated = (schedule: SwapSchedule) => {
    setGeneratedSchedule(schedule);
    // Could save to local storage or create a session here
  };

  const handleClose = () => {
    navigate('/app/coach/seat-racing');
  };

  return (
    <motion.div
      variants={FADE_IN_VARIANTS}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-txt-secondary hover:text-txt-primary rounded-lg hover:bg-bg-hover transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-txt-primary">Matrix Session Planner</h1>
          <p className="text-txt-secondary mt-1">
            Generate optimal swap schedules for seat racing using Latin Square designs.
          </p>
        </div>
      </div>

      {/* Planner */}
      <div className="bg-bg-surface rounded-lg shadow-sm border border-bdr-default overflow-hidden">
        <MatrixPlanner onScheduleGenerated={handleScheduleGenerated} onClose={handleClose} />
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BenefitCard
          title="Optimal Coverage"
          description="Ensures all athletes are compared as evenly as possible, maximizing ranking accuracy."
        />
        <BenefitCard
          title="Fewer Pieces Needed"
          description="Latin Square design requires fewer pieces than random swaps to achieve the same comparison coverage."
        />
        <BenefitCard
          title="Statistical Validity"
          description="Balanced designs produce more reliable rankings with narrower confidence intervals."
        />
      </div>
    </motion.div>
  );
}

function BenefitCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-bg-raised rounded-lg p-4 border border-bdr-subtle">
      <h4 className="font-medium text-txt-primary mb-1">{title}</h4>
      <p className="text-sm text-txt-secondary">{description}</p>
    </div>
  );
}

export default MatrixPlannerPage;
