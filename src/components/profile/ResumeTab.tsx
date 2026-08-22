import React, { useState } from 'react';
import { Plus, X, Award, Heart, Compass, FileText, Check } from 'lucide-react';
import { Employee } from '../../types';

interface ResumeTabProps {
  employee: Employee;
  isEditable: boolean;
  onUpdate: (data: Partial<Employee>) => void;
}

export const ResumeTab: React.FC<ResumeTabProps> = ({ employee, isEditable, onUpdate }) => {
  const [about, setAbout] = useState(employee.about || '');
  const [skills, setSkills] = useState<string[]>(employee.skills || []);
  const [certifications, setCertifications] = useState<string[]>(employee.certifications || []);
  const [whatILoveAboutJob, setWhatILoveAboutJob] = useState(employee.whatILoveAboutJob || '');
  const [interestsAndHobbies, setInterestsAndHobbies] = useState(employee.interestsAndHobbies || '');

  const [newSkillInput, setNewSkillInput] = useState('');
  const [newCertInput, setNewCertInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      const updated = [...skills, newSkillInput.trim()];
      setSkills(updated);
      setNewSkillInput('');
      onUpdate({ skills: updated });
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!isEditable) return;
    const updated = skills.filter((s) => s !== skillToRemove);
    setSkills(updated);
    onUpdate({ skills: updated });
  };

  const handleAddCertification = () => {
    if (newCertInput.trim() && !certifications.includes(newCertInput.trim())) {
      const updated = [...certifications, newCertInput.trim()];
      setCertifications(updated);
      setNewCertInput('');
      onUpdate({ certifications: updated });
    }
  };

  const handleRemoveCertification = (certToRemove: string) => {
    if (!isEditable) return;
    const updated = certifications.filter((c) => c !== certToRemove);
    setCertifications(updated);
    onUpdate({ certifications: updated });
  };

  const handleSaveTextChanges = () => {
    onUpdate({
      about,
      whatILoveAboutJob,
      interestsAndHobbies,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 text-[#2c332c]">
      {/* Save banner when editing */}
      {isEditable && (
        <div className="flex items-center justify-between p-3 bg-[#f8f7f4] border border-[#dedad2] rounded-xl">
          <span className="text-xs text-[#7d857d]">
            {isSaved ? (
              <span className="text-[#345c34] font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> All resume changes saved!
              </span>
            ) : (
              'You have permission to edit this resume section'
            )}
          </span>
          <button
            type="button"
            onClick={handleSaveTextChanges}
            className="px-3.5 py-1.5 bg-[#384538] hover:bg-[#2d382d] text-white rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Save Text Updates
          </button>
        </div>
      )}

      {/* About / Bio */}
      <div className="bg-white p-5 rounded-2xl border border-[#e8e6e1] shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-[#5a6e5a]" />
          <h3 className="text-sm font-bold text-[#2c332c]">About Me</h3>
        </div>
        {isEditable ? (
          <textarea
            rows={3}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Write a concise professional bio..."
            className="w-full p-3 bg-[#f8f7f4] border border-[#dedad2] rounded-xl text-xs sm:text-sm text-[#2c332c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
          />
        ) : (
          <p className="text-xs sm:text-sm text-[#5c665c] leading-relaxed">
            {about || 'No professional bio added yet.'}
          </p>
        )}
      </div>

      {/* Skills Chips */}
      <div className="bg-white p-5 rounded-2xl border border-[#e8e6e1] shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#5a6e5a]" />
            <h3 className="text-sm font-bold text-[#2c332c]">Professional Skills & Competencies</h3>
          </div>
        </div>

        {/* Chips list */}
        <div className="flex flex-wrap gap-2 mb-3">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#edebe6] border border-[#dedad2] text-[#3d463d] rounded-full text-xs font-medium"
            >
              <span>{skill}</span>
              {isEditable && (
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-[#7d857d] hover:text-rose-700 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
          {skills.length === 0 && (
            <span className="text-xs text-[#7d857d] italic">No skills listed yet.</span>
          )}
        </div>

        {/* Add Skill Input */}
        {isEditable && (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              placeholder="+ Add Skill (e.g. React, SQL, OKRs)"
              className="px-3 py-1.5 bg-[#f8f7f4] border border-[#dedad2] rounded-xl text-xs text-[#2c332c] placeholder:text-[#7d857d] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-3 py-1.5 bg-[#edebe6] hover:bg-[#dedad2] text-[#3d463d] rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        )}
      </div>

      {/* Certifications List */}
      <div className="bg-white p-5 rounded-2xl border border-[#e8e6e1] shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-[#5a6e5a]" />
          <h3 className="text-sm font-bold text-[#2c332c]">Certifications & Licenses</h3>
        </div>

        <ul className="space-y-2 mb-3">
          {certifications.map((cert) => (
            <li
              key={cert}
              className="flex items-center justify-between p-2.5 bg-[#f8f7f4] border border-[#edebe6] rounded-xl text-xs font-medium text-[#2c332c]"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5a6e5a]" />
                <span>{cert}</span>
              </div>
              {isEditable && (
                <button
                  type="button"
                  onClick={() => handleRemoveCertification(cert)}
                  className="text-[#7d857d] hover:text-rose-700 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </li>
          ))}
          {certifications.length === 0 && (
            <p className="text-xs text-[#7d857d] italic">No certifications listed.</p>
          )}
        </ul>

        {isEditable && (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={newCertInput}
              onChange={(e) => setNewCertInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCertification())}
              placeholder="+ Add Certification (e.g. AWS Certified, PMP)"
              className="flex-1 px-3 py-1.5 bg-[#f8f7f4] border border-[#dedad2] rounded-xl text-xs text-[#2c332c] placeholder:text-[#7d857d] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
            />
            <button
              type="button"
              onClick={handleAddCertification}
              className="px-3 py-1.5 bg-[#edebe6] hover:bg-[#dedad2] text-[#3d463d] rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        )}
      </div>

      {/* Free-text columns: "What I love about my job" & "Interests & hobbies" */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#e8e6e1] shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-[#a35343]" />
            <h3 className="text-sm font-bold text-[#2c332c]">What I Love About My Job</h3>
          </div>
          {isEditable ? (
            <textarea
              rows={3}
              value={whatILoveAboutJob}
              onChange={(e) => setWhatILoveAboutJob(e.target.value)}
              placeholder="What motivates and inspires you everyday..."
              className="w-full p-3 bg-[#f8f7f4] border border-[#dedad2] rounded-xl text-xs sm:text-sm text-[#2c332c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
            />
          ) : (
            <p className="text-xs sm:text-sm text-[#5c665c] leading-relaxed">
              {whatILoveAboutJob || 'Not specified.'}
            </p>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e8e6e1] shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="w-4 h-4 text-[#5a6e5a]" />
            <h3 className="text-sm font-bold text-[#2c332c]">My Interests and Hobbies</h3>
          </div>
          {isEditable ? (
            <textarea
              rows={3}
              value={interestsAndHobbies}
              onChange={(e) => setInterestsAndHobbies(e.target.value)}
              placeholder="Sports, arts, music, reading, travel..."
              className="w-full p-3 bg-[#f8f7f4] border border-[#dedad2] rounded-xl text-xs sm:text-sm text-[#2c332c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#5a6e5a]/20 focus:border-[#5a6e5a] transition"
            />
          ) : (
            <p className="text-xs sm:text-sm text-[#5c665c] leading-relaxed">
              {interestsAndHobbies || 'Not specified.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
