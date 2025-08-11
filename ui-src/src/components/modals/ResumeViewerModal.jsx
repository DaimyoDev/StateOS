import React from "react";
import useGameStore from "../../store";
import Modal from "./Modal";
import "./StaffModals.css";

const ResumeViewerModal = ({ staffId, onClose }) => {
  const staffMember = useGameStore((state) =>
    state.talentPool.find((s) => s.id === staffId)
  );

  if (!staffMember) return null;

  const { resume } = staffMember;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Resume: ${staffMember.name}`}
    >
      <div className="staff-modal-content resume-content">
        <section>
          <h3>Summary</h3>
          <p>{resume.summary}</p>
        </section>
        <section>
          <h3>Work History</h3>
          {resume.workHistory.map((job, index) => (
            <div key={index} className="resume-job">
              <strong>{job.role}</strong> at {job.employer} ({job.duration})
              <p>{job.description}</p>
            </div>
          ))}
        </section>
        <section>
          <h3>Education</h3>
          <p>
            {resume.education.degree}, {resume.education.school}
          </p>
        </section>
        <section>
          <h3>Key Skills</h3>
          <ul className="resume-skills">
            {resume.keySkills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </section>
      </div>
    </Modal>
  );
};

export default ResumeViewerModal;
