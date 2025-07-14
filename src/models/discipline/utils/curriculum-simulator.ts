// Simulador de matriz curricular convertido de mdp.py para TypeScript

export type Timetable = {
  days: string;
  hours: string;
  teacher: string;
};

export type Discipline = {
  name: string;
  semester: number;
  attended: boolean;
  workload: number;
  type: string;
  code: string;
  timetables: Timetable[];
  pre_requiriments: string[];
};

export type PlanCurriculumOptions = {
  preferred_periods?: string[];
  max_workload?: number;
  max_optative_workload?: number;
  current_student_semester?: number;
  ignore_tcc_period_filter?: boolean;
};

const periodMap: Record<string, string> = {
  'AB-M': 'morning',
  'CD-M': 'morning',
  'AB-T': 'afternoon',
  'CD-T': 'afternoon',
  'AB-N': 'evening',
  'CD-N': 'evening',
};

function isPeriodAllowed(
  timetable: Timetable,
  periods: string[],
  disciplineName: string,
  ignoreTccPeriodFilter: boolean,
): boolean {
  const tccNames = ['TCC 1', 'TCC 2', 'TCC I', 'TCC II'];
  if (
    ignoreTccPeriodFilter &&
    tccNames.some((tcc) => disciplineName.toUpperCase().includes(tcc))
  ) {
    return true;
  }
  const firstHour = timetable.hours.split(' ')[0] || '';
  const period = periodMap[firstHour] || '';
  return periods.includes(period);
}

function hasConflict(t1: Timetable, t2: Timetable): boolean {
  const days1 = t1.days.split(' ');
  const hours1 = t1.hours.split(' ');
  const days2 = t2.days.split(' ');
  const hours2 = t2.hours.split(' ');
  for (let i = 0; i < days1.length; i++) {
    for (let j = 0; j < days2.length; j++) {
      if (days1[i] === days2[j] && hours1[i] === hours2[j]) {
        return true;
      }
    }
  }
  return false;
}

function isEligible(
  discipline: Discipline,
  attendedCodes: Set<string>,
): boolean {
  if (discipline.attended) return false;
  const missing = discipline.pre_requiriments.filter(
    (pr) => !attendedCodes.has(pr),
  );
  if (missing.length > 0) return false;
  return true;
}

function filterValidDisciplines(
  disciplines: Discipline[],
  preferredPeriods: string[],
  ignoreTccPeriodFilter: boolean,
): Discipline[] {
  return disciplines
    .map((d) => {
      const validTimetables = d.timetables.filter((t) =>
        isPeriodAllowed(t, preferredPeriods, d.name, ignoreTccPeriodFilter),
      );
      return { ...d, timetables: validTimetables };
    })
    .filter((d) => d.timetables.length > 0);
}

export interface CurriculumSemester {
  name: string;
  code: string;
  timetable: Timetable;
  workload: number;
  semester: number;
  type: string;
}

export interface CurriculumResult {
  quantity_semester: number;
  semesters: CurriculumSemester[][];
  prediction_status: 'success' | 'error';
  description: string;
  disciplines_erros?: {
    name: string;
    code: string;
    type: string;
    reason: string;
  }[];
  optative_workload_remaining: number;
}

export function planCurriculum(
  disciplines: Discipline[],
  options: PlanCurriculumOptions = {},
): CurriculumResult {
  // Cópia profunda para evitar mutação do array original
  const inputDisciplines = JSON.parse(
    JSON.stringify(disciplines),
  ) as Discipline[];

  const {
    preferred_periods = ['morning', 'afternoon'],
    max_workload = 600,
    max_optative_workload = 400,
    current_student_semester = 2,
    ignore_tcc_period_filter = true,
  } = options;

  // Filtra disciplinas válidas (com horários permitidos)
  const validDisciplines = filterValidDisciplines(
    inputDisciplines,
    preferred_periods,
    ignore_tcc_period_filter,
  ).map((d) => ({ ...d }));

  const attendedCodes = new Set(
    validDisciplines.filter((d) => d.attended).map((d) => d.code),
  );
  let optativeWorkload = 0;
  const plan: CurriculumSemester[][] = [];
  const maxSemesters = 20;
  let currentSemester = 1;
  let emptySemesters = 0;

  while (
    validDisciplines.some((d) => !d.attended) &&
    currentSemester <= maxSemesters
  ) {
    const eligible = validDisciplines.filter((d) =>
      isEligible(d, attendedCodes),
    );
    eligible.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'OBG' ? -1 : 1;
      return (
        Math.abs(a.semester - current_student_semester) -
        Math.abs(b.semester - current_student_semester)
      );
    });
    const semesterPlan: CurriculumSemester[] = [];
    let currentWorkload = 0;
    const occupiedSlots: Timetable[] = [];
    for (const discipline of eligible) {
      for (const timetable of discipline.timetables) {
        if (currentWorkload + discipline.workload > max_workload) continue;
        if (
          discipline.type === 'OPT' &&
          optativeWorkload >= max_optative_workload &&
          optativeWorkload !== 0
        )
          continue;
        const conflict = occupiedSlots.some((slot) =>
          hasConflict(timetable, slot),
        );
        if (!conflict) {
          semesterPlan.push({
            name: discipline.name,
            code: discipline.code,
            timetable,
            workload: discipline.workload,
            semester: discipline.semester,
            type: discipline.type,
          });
          discipline.attended = true;
          attendedCodes.add(discipline.code);
          currentWorkload += discipline.workload;
          if (discipline.type === 'OPT')
            optativeWorkload += discipline.workload;
          occupiedSlots.push(timetable);
          break;
        }
      }
    }
    if (semesterPlan.length === 0) {
      emptySemesters++;
      if (emptySemesters >= 3) break;
      currentSemester++;
      continue;
    } else {
      emptySemesters = 0;
      plan.push(semesterPlan);
      currentSemester++;
    }
  }

  // Construir resposta final
  const result: CurriculumResult = {
    quantity_semester: plan.length,
    semesters: plan,
    prediction_status: 'success',
    description: '',
    optative_workload_remaining: 0,
  };

  const disciplinesErrors: CurriculumResult['disciplines_erros'] = [];
  const alocatedCodes = new Set(
    disciplines.filter((d) => d.attended).map((d) => d.code),
  );
  for (const semester of plan) {
    for (const course of semester) {
      alocatedCodes.add(course.code);
    }
  }
  for (const d of disciplines) {
    if (alocatedCodes.has(d.code)) continue;
    if (d.type === 'OPT') continue;
    const reason: string[] = [];
    if (d.pre_requiriments.some((pr) => !attendedCodes.has(pr))) {
      reason.push('pré-requisitos não atendidos');
    }
    if (
      !d.timetables.some((t) =>
        isPeriodAllowed(t, preferred_periods, d.name, ignore_tcc_period_filter),
      )
    ) {
      reason.push('sem horários disponíveis no período permitido');
    }
    if (reason.length === 0) {
      reason.push('conflito de horário ou limite de carga horária');
    }
    disciplinesErrors.push({
      name: d.name,
      code: d.code,
      type: d.type,
      reason: reason.join(', '),
    });
  }
  const optativeRemaining = Math.max(
    0,
    max_optative_workload - optativeWorkload,
  );
  if (disciplinesErrors.length > 0) {
    result.prediction_status = 'error';
    result.description = 'Algumas disciplinas foram impossíveis de alocar';
    result.disciplines_erros = disciplinesErrors;
  } else {
    result.prediction_status = 'success';
    result.description = 'matriz finalizada com sucesso!';
  }
  result.optative_workload_remaining = optativeRemaining;
  return result;
}
