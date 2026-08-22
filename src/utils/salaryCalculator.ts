import { SalaryComponent, SalaryStructure } from '../types';

export function createDefaultSalaryStructure(monthlyWage: number = 50000): SalaryStructure {
  const structure: SalaryStructure = {
    wageType: 'Fixed Wage',
    monthlyWage,
    yearlyWage: monthlyWage * 12,
    workingDaysPerWeek: 5,
    breakTimeMinutes: 60,
    employeePfPercentage: 12,
    employerPfPercentage: 12,
    professionalTax: 200,
    components: [
      {
        id: 'basic',
        name: 'Basic Salary',
        computationType: 'percentage_wage',
        value: 50, // 50% of Wage
        amount: 0,
        description: '50% of Monthly Wage (Foundation for PF & Allowances)',
      },
      {
        id: 'hra',
        name: 'House Rent Allowance (HRA)',
        computationType: 'percentage_basic',
        value: 50, // 50% of Basic
        amount: 0,
        description: '50% of Basic Salary for rental accommodation support',
      },
      {
        id: 'standard_allowance',
        name: 'Standard Allowance',
        computationType: 'percentage_wage',
        value: 16.67, // 16.67% of Wage (~1/6th)
        amount: 0,
        description: 'Standard recurring monthly professional allowance',
      },
      {
        id: 'performance_bonus',
        name: 'Performance Bonus',
        computationType: 'percentage_basic',
        value: 8.33, // 8.33% of Basic (~1/12th)
        amount: 0,
        description: 'Variable incentive based on performance evaluation',
      },
      {
        id: 'lta',
        name: 'Leave Travel Allowance (LTA)',
        computationType: 'percentage_basic',
        value: 8.33, // 8.33% of Basic
        amount: 0,
        description: 'Tax-exempt travel and vacation allowance assistance',
      },
      {
        id: 'fixed_allowance',
        name: 'Fixed Allowance',
        computationType: 'percentage_wage',
        value: 0,
        amount: 0,
        description: 'Balancing component (= Wage − sum of all other components)',
        isReadOnly: true,
      },
    ],
  };

  return calculateSalaryStructure(structure);
}

export function calculateSalaryStructure(structure: SalaryStructure): SalaryStructure {
  const wage = Number(structure.monthlyWage) || 0;
  const components = [...structure.components];

  // 1. Calculate Basic first
  const basicComp = components.find((c) => c.id === 'basic');
  let basicAmount = 0;
  if (basicComp) {
    if (basicComp.computationType === 'percentage_wage') {
      basicAmount = Math.round((wage * basicComp.value) / 100);
    } else if (basicComp.computationType === 'fixed_amount') {
      basicAmount = Math.min(basicComp.value, wage);
    } else {
      basicAmount = Math.round((wage * basicComp.value) / 100);
    }
    basicComp.amount = basicAmount;
  }

  // 2. Calculate other defined components except fixed_allowance
  let sumOtherComponents = 0;
  components.forEach((comp) => {
    if (comp.id === 'fixed_allowance') return;

    if (comp.id === 'basic') {
      sumOtherComponents += comp.amount;
      return;
    }

    let amt = 0;
    if (comp.computationType === 'percentage_basic') {
      amt = Math.round((basicAmount * comp.value) / 100);
    } else if (comp.computationType === 'percentage_wage') {
      amt = Math.round((wage * comp.value) / 100);
    } else if (comp.computationType === 'fixed_amount') {
      amt = Math.round(comp.value);
    }

    comp.amount = amt;
    sumOtherComponents += amt;
  });

  // 3. Fixed Allowance is the remainder: Wage - sum of other components
  const fixedComp = components.find((c) => c.id === 'fixed_allowance');
  if (fixedComp) {
    const remainder = Math.max(0, wage - sumOtherComponents);
    fixedComp.amount = remainder;
    fixedComp.value = wage > 0 ? Number(((remainder / wage) * 100).toFixed(2)) : 0;
  }

  return {
    ...structure,
    monthlyWage: wage,
    yearlyWage: wage * 12,
    components,
  };
}

export function calculatePfAmounts(basicAmount: number, employeePfRate: number, employerPfRate: number) {
  const employeePf = Math.round((basicAmount * employeePfRate) / 100);
  const employerPf = Math.round((basicAmount * employerPfRate) / 100);
  return { employeePf, employerPf };
}

export function calculateNetTakeHome(
  monthlyWage: number,
  employeePfAmount: number,
  professionalTax: number
): number {
  return Math.max(0, monthlyWage - employeePfAmount - professionalTax);
}

export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}
