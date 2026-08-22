import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Calculator,
  Shield,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Percent,
  RefreshCw,
  Sparkles,
  ArrowUpDown,
  Lock,
} from 'lucide-react';
import { Employee, SalaryStructure, SalaryComponent } from '../../types';
import {
  calculateSalaryStructure,
  calculatePfAmounts,
  calculateNetTakeHome,
  formatCurrencyINR,
} from '../../utils/salaryCalculator';

interface SalaryInfoTabProps {
  employee: Employee;
  onSaveSalary: (updatedSalary: SalaryStructure) => void;
}

export const SalaryInfoTab: React.FC<SalaryInfoTabProps> = ({ employee, onSaveSalary }) => {
  const [wageView, setWageView] = useState<'month' | 'year'>('month');
  const [structure, setStructure] = useState<SalaryStructure>(() => {
    return calculateSalaryStructure(employee.salary);
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync if employee changes
  useEffect(() => {
    setStructure(calculateSalaryStructure(employee.salary));
  }, [employee.id]);

  // Derived calculations
  const basicComponent = structure.components.find((c) => c.id === 'basic');
  const basicAmount = basicComponent?.amount || 0;
  const { employeePf, employerPf } = calculatePfAmounts(
    basicAmount,
    structure.employeePfPercentage,
    structure.employerPfPercentage
  );
  const netTakeHome = calculateNetTakeHome(
    structure.monthlyWage,
    employeePf,
    structure.professionalTax
  );

  const totalComponentSum = structure.components.reduce((sum, c) => sum + c.amount, 0);
  const isOverWage = totalComponentSum > structure.monthlyWage;

  // Handle Monthly / Yearly wage change
  const handleWageChange = (val: number, view: 'month' | 'year') => {
    const monthly = view === 'year' ? Math.round(val / 12) : val;
    const updated: SalaryStructure = {
      ...structure,
      monthlyWage: Math.max(0, monthly),
      yearlyWage: Math.max(0, monthly * 12),
    };
    setStructure(calculateSalaryStructure(updated));
  };

  const handleComponentValueChange = (compId: string, newVal: number) => {
    const updatedComps = structure.components.map((c) => {
      if (c.id === compId) {
        return { ...c, value: Math.max(0, newVal) };
      }
      return c;
    });

    const updated: SalaryStructure = {
      ...structure,
      components: updatedComps,
    };
    setStructure(calculateSalaryStructure(updated));
  };

  const handleToggleComputationType = (
    compId: string,
    newType: 'percentage_wage' | 'percentage_basic' | 'fixed_amount'
  ) => {
    const updatedComps = structure.components.map((c) => {
      if (c.id === compId) {
        // Convert current amount into initial value for new type
        let newVal = c.value;
        if (newType === 'fixed_amount') {
          newVal = c.amount;
        } else if (newType === 'percentage_wage') {
          newVal = structure.monthlyWage > 0 ? Number(((c.amount / structure.monthlyWage) * 100).toFixed(2)) : 0;
        } else if (newType === 'percentage_basic') {
          newVal = basicAmount > 0 ? Number(((c.amount / basicAmount) * 100).toFixed(2)) : 0;
        }
        return { ...c, computationType: newType, value: newVal };
      }
      return c;
    });

    const updated: SalaryStructure = {
      ...structure,
      components: updatedComps,
    };
    setStructure(calculateSalaryStructure(updated));
  };

  const handleSave = () => {
    const finalStructure = calculateSalaryStructure(structure);
    onSaveSalary(finalStructure);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 text-[#2c332c]">
      {/* Admin Notice & Quick Save Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#f8f7f4] border border-[#dedad2] rounded-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#4a594a] text-white flex items-center justify-center font-bold text-xs shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#2c332c]">
              Admin-Only Salary & Compensation Configuration
            </p>
            <p className="text-[11px] text-[#5c665c]">
              Salary structure is confidential and strictly invisible to regular employees.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-[#345c34] flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </span>
          )}
          <button
            type="button"
            id="save-salary-structure-btn"
            onClick={handleSave}
            className="px-4 py-2 bg-[#384538] hover:bg-[#2d382d] active:bg-[#1f281f] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition cursor-pointer"
          >
            Save Salary Structure
          </button>
        </div>
      </div>

      {/* Top Wage & Working Days Fields */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e8e6e1] shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#edebe6]">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#5a6e5a]" />
            <h3 className="text-sm font-bold text-[#2c332c]">Wage & Schedule Parameters</h3>
          </div>
          <span className="px-2.5 py-0.5 bg-[#edebe6] text-[#3d463d] text-xs font-bold rounded-lg">
            Wage Type: {structure.wageType}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Monthly / Yearly Wage toggle */}
          <div className="sm:col-span-2 bg-[#f8f7f4] p-3.5 rounded-2xl border border-[#dedad2]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#3d463d]">Defined Gross Wage (INR)</label>
              <div className="flex items-center bg-white border border-[#dedad2] p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  id="wage-toggle-month"
                  onClick={() => setWageView('month')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    wageView === 'month'
                      ? 'bg-[#384538] text-white shadow-2xs'
                      : 'text-[#5c665c] hover:text-[#2c332c]'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  id="wage-toggle-year"
                  onClick={() => setWageView('year')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    wageView === 'year'
                      ? 'bg-[#384538] text-white shadow-2xs'
                      : 'text-[#5c665c] hover:text-[#2c332c]'
                  }`}
                >
                  Yearly (CTC)
                </button>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#7d857d]">
                ₹
              </span>
              <input
                id="wage-input-field"
                type="number"
                value={wageView === 'month' ? structure.monthlyWage : structure.yearlyWage}
                onChange={(e) => handleWageChange(parseFloat(e.target.value) || 0, wageView)}
                className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-[#dedad2] rounded-xl text-base font-bold text-[#2c332c] focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a]"
              />
            </div>
            <p className="text-[11px] text-[#7d857d] mt-1.5 flex justify-between">
              <span>Monthly: {formatCurrencyINR(structure.monthlyWage)}</span>
              <span>Yearly: {formatCurrencyINR(structure.yearlyWage)}</span>
            </p>
          </div>

          {/* Working Days per week */}
          <div>
            <label className="block text-xs font-bold text-[#3d463d] mb-1">
              Working Days in a Week
            </label>
            <select
              value={structure.workingDaysPerWeek}
              onChange={(e) =>
                setStructure({ ...structure, workingDaysPerWeek: parseInt(e.target.value) })
              }
              className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#dedad2] rounded-xl text-xs font-semibold text-[#2c332c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a]"
            >
              <option value={5}>5 Days / Week (Mon - Fri)</option>
              <option value={6}>6 Days / Week (Mon - Sat)</option>
            </select>
            <p className="text-[10px] text-[#7d857d] mt-1">Standard corporate policy</p>
          </div>

          {/* Break Time */}
          <div>
            <label className="block text-xs font-bold text-[#3d463d] mb-1">
              Daily Break Time
            </label>
            <select
              value={structure.breakTimeMinutes}
              onChange={(e) =>
                setStructure({ ...structure, breakTimeMinutes: parseInt(e.target.value) })
              }
              className="w-full px-3.5 py-2.5 bg-[#f8f7f4] border border-[#dedad2] rounded-xl text-xs font-semibold text-[#2c332c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a]"
            >
              <option value={60}>60 Mins (1 Hour Lunch + Tea)</option>
              <option value={45}>45 Mins</option>
              <option value={30}>30 Mins</option>
            </select>
            <p className="text-[10px] text-[#7d857d] mt-1">Deducted from gross active hours</p>
          </div>
        </div>
      </div>

      {/* Provident Fund (PF) & Statutory Deductions Block */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e8e6e1] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#edebe6]">
          <Shield className="w-4 h-4 text-[#5a6e5a]" />
          <h3 className="text-sm font-bold text-[#2c332c]">
            Provident Fund (PF) & Statutory Tax Deductions
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Employee PF */}
          <div className="p-4 bg-[#f8f7f4] border border-[#dedad2] rounded-2xl">
            <div className="flex justify-between items-start mb-1">
              <label className="text-xs font-bold text-[#2c332c]">Employee PF Contribution</label>
              <span className="font-mono font-bold text-xs text-[#2d4d2d] bg-[#eaf0ea] border border-[#c8dac8] px-2 py-0.5 rounded">
                {formatCurrencyINR(employeePf)}/mo
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                value={structure.employeePfPercentage}
                onChange={(e) =>
                  setStructure({
                    ...structure,
                    employeePfPercentage: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-20 px-2.5 py-1.5 bg-white border border-[#dedad2] rounded-lg text-xs font-bold text-[#2c332c]"
              />
              <span className="text-xs text-[#5c665c] font-semibold">% of Basic</span>
            </div>
            <p className="text-[10px] text-[#7d857d] mt-2 italic">
              *Note: PF is calculated based on the basic salary ({formatCurrencyINR(basicAmount)})
            </p>
          </div>

          {/* Employer PF */}
          <div className="p-4 bg-[#f8f7f4] border border-[#dedad2] rounded-2xl">
            <div className="flex justify-between items-start mb-1">
              <label className="text-xs font-bold text-[#2c332c]">Employer PF Contribution</label>
              <span className="font-mono font-bold text-xs text-[#2d4d2d] bg-[#eaf0ea] border border-[#c8dac8] px-2 py-0.5 rounded">
                {formatCurrencyINR(employerPf)}/mo
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                value={structure.employerPfPercentage}
                onChange={(e) =>
                  setStructure({
                    ...structure,
                    employerPfPercentage: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-20 px-2.5 py-1.5 bg-white border border-[#dedad2] rounded-lg text-xs font-bold text-[#2c332c]"
              />
              <span className="text-xs text-[#5c665c] font-semibold">% of Basic</span>
            </div>
            <p className="text-[10px] text-[#7d857d] mt-2 italic">
              *Company statutory match (included in company CTC package)
            </p>
          </div>

          {/* Professional Tax */}
          <div className="p-4 bg-[#f8f7f4] border border-[#dedad2] rounded-2xl">
            <div className="flex justify-between items-start mb-1">
              <label className="text-xs font-bold text-[#2c332c]">Professional Tax (PT)</label>
              <span className="font-mono font-bold text-xs text-[#2d4d2d] bg-[#eaf0ea] border border-[#c8dac8] px-2 py-0.5 rounded">
                {formatCurrencyINR(structure.professionalTax)}/mo
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                value={structure.professionalTax}
                onChange={(e) =>
                  setStructure({
                    ...structure,
                    professionalTax: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-24 px-2.5 py-1.5 bg-white border border-[#dedad2] rounded-lg text-xs font-bold text-[#2c332c]"
              />
              <span className="text-xs text-[#5c665c] font-semibold">₹ flat / month</span>
            </div>
            <p className="text-[10px] text-[#7d857d] mt-2 italic">
              *Note: Professional Tax deducted from the Gross salary
            </p>
          </div>
        </div>
      </div>

      {/* Salary Components Table */}
      <div className="bg-white rounded-2xl border border-[#e8e6e1] shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#edebe6] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#2c332c]">Salary Breakdown Components</h3>
            <p className="text-xs text-[#7d857d]">
              Live recalculation rules: Fixed Allowance automatically balances the remainder to equal exactly the defined Wage.
            </p>
          </div>
          {isOverWage && (
            <div className="flex items-center gap-1.5 text-[#9e4236] bg-[#faebe8] px-3 py-1 rounded-xl text-xs font-bold border border-[#f0c8c2]">
              <AlertTriangle className="w-4 h-4" />
              <span>Sum exceeds defined wage</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8f7f4] border-b border-[#edebe6] text-[#5c665c] font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-5">Component</th>
                <th className="py-3 px-4">Computation Basis</th>
                <th className="py-3 px-4 text-right">Value / Rate</th>
                <th className="py-3 px-5 text-right">Monthly Amount (₹)</th>
                <th className="py-3 px-4">Description / Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edebe6]">
              {structure.components.map((comp) => {
                const isFixedAllowance = comp.id === 'fixed_allowance';
                const percentageOfWage =
                  structure.monthlyWage > 0
                    ? ((comp.amount / structure.monthlyWage) * 100).toFixed(2)
                    : '0.00';

                return (
                  <tr
                    key={comp.id}
                    className={`hover:bg-[#f8f7f4]/60 transition ${
                      isFixedAllowance ? 'bg-[#f2f6f2] font-semibold' : ''
                    }`}
                  >
                    {/* Name */}
                    <td className="py-3.5 px-5 font-bold text-[#2c332c] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isFixedAllowance ? (
                          <Sparkles className="w-4 h-4 text-[#487a48] shrink-0" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[#7d857d]" />
                        )}
                        <span>{comp.name}</span>
                      </div>
                    </td>

                    {/* Computation Type */}
                    <td className="py-3.5 px-4">
                      {isFixedAllowance ? (
                        <span className="text-[11px] text-[#2d4d2d] bg-[#eaf0ea] px-2 py-0.5 rounded border border-[#c8dac8] font-medium">
                          Auto Residual
                        </span>
                      ) : (
                        <select
                          value={comp.computationType}
                          onChange={(e) =>
                            handleToggleComputationType(comp.id, e.target.value as any)
                          }
                          className="px-2 py-1 bg-[#f8f7f4] border border-[#dedad2] rounded-lg text-[#2c332c] text-xs focus:bg-white"
                        >
                          <option value="percentage_wage">% of Total Wage</option>
                          <option value="percentage_basic">% of Basic Salary</option>
                          <option value="fixed_amount">Fixed Amount (₹)</option>
                        </select>
                      )}
                    </td>

                    {/* Value Input */}
                    <td className="py-3.5 px-4 text-right">
                      {isFixedAllowance ? (
                        <span className="text-[#7d857d] font-mono">{percentageOfWage}%</span>
                      ) : (
                        <div className="inline-flex items-center gap-1 justify-end">
                          <input
                            type="number"
                            value={comp.value}
                            onChange={(e) =>
                              handleComponentValueChange(comp.id, parseFloat(e.target.value) || 0)
                            }
                            className="w-20 px-2 py-1 bg-[#f8f7f4] border border-[#dedad2] rounded-lg text-right font-mono text-xs font-bold text-[#2c332c] focus:bg-white"
                          />
                          <span className="text-[#7d857d] font-semibold text-[11px]">
                            {comp.computationType === 'fixed_amount' ? '₹' : '%'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Calculated Amount */}
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-[#2c332c] text-sm whitespace-nowrap">
                      {formatCurrencyINR(comp.amount)}
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 text-[#7d857d] text-[11px]">
                      {comp.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#f8f7f4] font-bold border-t-2 border-[#dedad2] text-[#2c332c]">
                <td className="py-3.5 px-5" colSpan={3}>
                  Total Gross Monthly Salary Components Sum
                </td>
                <td className="py-3.5 px-5 text-right font-mono text-base text-[#2d4d2d]">
                  {formatCurrencyINR(totalComponentSum)}
                </td>
                <td className="py-3.5 px-4 text-[#7d857d] text-[11px]">
                  Target Monthly Wage: {formatCurrencyINR(structure.monthlyWage)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Net Take-Home Calculation Summary Card */}
      <div className="bg-[#2c332c] text-white p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#a8b3a8]">
              Estimated Monthly Payout
            </span>
            <h4 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {formatCurrencyINR(netTakeHome)} <span className="text-sm font-normal text-[#a8b3a8]">/ month</span>
            </h4>
            <p className="text-xs text-[#a8b3a8] mt-1">
              Net In-Hand Salary after employee statutory deductions (PF + PT)
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-[#404c40] pt-4 md:pt-0 md:pl-6 text-xs">
            <div>
              <span className="text-[#a8b3a8] text-[11px] block">Gross Wage</span>
              <span className="font-mono font-bold text-[#edebe6] text-sm mt-0.5 block">
                {formatCurrencyINR(structure.monthlyWage)}
              </span>
            </div>
            <div>
              <span className="text-[#e29b93] text-[11px] block">- Employee PF (12%)</span>
              <span className="font-mono font-bold text-[#f5c2bc] text-sm mt-0.5 block">
                -{formatCurrencyINR(employeePf)}
              </span>
            </div>
            <div>
              <span className="text-[#e29b93] text-[11px] block">- Prof. Tax</span>
              <span className="font-mono font-bold text-[#f5c2bc] text-sm mt-0.5 block">
                -{formatCurrencyINR(structure.professionalTax)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
