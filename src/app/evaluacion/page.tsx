import EvaluationContent from '@/app/evaluacion/EvaluationContent';

export const metadata = {
  title: 'Agenda tu caso — LexMatch',
  description:
    'Comparte los antecedentes de tu asunto legal y recibe propuestas de estudios verificados en menos de 6 horas hábiles.',
};

export default function EvaluacionPage() {
  return (
    <main className="bg-white">
      <EvaluationContent />
    </main>
  );
}
