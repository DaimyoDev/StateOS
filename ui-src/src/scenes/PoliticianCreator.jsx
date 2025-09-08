import React, { useState, useMemo, useCallback, useEffect } from "react";
import useGameStore from "../store";
import "./PoliticianCreator.css";
import SubtabDropdown from "../components/ui/SubtabDropdown";
import {
  POLICY_QUESTIONS,
  ATTRIBUTES_LIST,
  BACKGROUND_FIELDS,
} from "../data/policyData";
import { BASE_IDEOLOGIES } from "../data/ideologiesData";
import { POLICY_PRESETS } from "../data/policyPresetsData";
import { POSSIBLE_POLICY_FOCUSES } from "../data/governmentData";

// --- Helper: Memoized PolicyOption (Keep as is) ---
const PolicyOption = React.memo(function PolicyOption({
  questionId,
  option,
  isChecked,
  onStanceChange,
}) {
  const handleChange = () => {
    onStanceChange(questionId, option.value);
  };

  return (
    <label className="policy-card-option-label">
      <input
        type="radio"
        name={questionId}
        value={option.value}
        checked={isChecked}
        onChange={handleChange}
      />
      <span>{option.text}</span>
    </label>
  );
});

// --- Helper: Memoized PolicyQuestionCard (Keep as is) ---
const PolicyQuestionCard = React.memo(function PolicyQuestionCard({
  policyQuestion,
  currentStance,
  onStanceChange,
}) {
  if (!policyQuestion || !policyQuestion.id) {
    return (
      <div className="policy-card">
        <p>Invalid question data.</p>
      </div>
    );
  }
  if (!Array.isArray(policyQuestion.options)) {
    return (
      <div className="policy-card">
        <h4 className="policy-card-question-text">
          {policyQuestion.questionText}
        </h4>
        <p>Options not available for this question.</p>
      </div>
    );
  }

  return (
    <div className="policy-card">
      <h4 className="policy-card-question-text">
        {policyQuestion.questionText}
      </h4>
      <div className="policy-card-options-group">
        {policyQuestion.options.map((option) => {
          if (
            option &&
            typeof option.value !== "undefined" &&
            typeof option.text !== "undefined"
          ) {
            return (
              <PolicyOption
                key={`${policyQuestion.id}-${option.value}`}
                questionId={policyQuestion.id}
                option={option}
                isChecked={currentStance === option.value}
                onStanceChange={onStanceChange}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
});

function PoliticianCreator() {
  const [activeTab, setActiveTab] = useState("identity");
  const creatingPolitician = useGameStore((state) => state.creatingPolitician);
  const politicianToEditId = useGameStore((state) => state.politicianToEditId);
  const actions = useGameStore((state) => state.actions);
  const isEditMode = !!politicianToEditId;

  const { categories, sortedCategoryNames } = useMemo(() => {
    const cats = {};
    (POLICY_QUESTIONS || []).forEach((question) => {
      if (question && question.category && question.id) {
        if (!cats[question.category]) {
          cats[question.category] = [];
        }
        cats[question.category].push(question);
      }
    });
    const sortedNames = Object.keys(cats).sort();
    return { categories: cats, sortedCategoryNames: sortedNames };
  }, []);

  const [selectedPolicyCategory, setSelectedPolicyCategory] = useState(() =>
    sortedCategoryNames.length > 0 ? sortedCategoryNames[0] : ""
  );

  useEffect(() => {
    if (
      sortedCategoryNames.length > 0 &&
      (!selectedPolicyCategory ||
        !sortedCategoryNames.includes(selectedPolicyCategory))
    ) {
      setSelectedPolicyCategory(sortedCategoryNames[0]);
    } else if (
      sortedCategoryNames.length === 0 &&
      selectedPolicyCategory !== ""
    ) {
      setSelectedPolicyCategory("");
    }
  }, [sortedCategoryNames, selectedPolicyCategory]);

  const questionsForSelectedCategory = useMemo(() => {
    return categories[selectedPolicyCategory] || [];
  }, [selectedPolicyCategory, categories]);

  const handleInputChange = (e) => {
    actions.updateCreatingPoliticianField(e.target.name, e.target.value);
  };

  const handleRangeInputChange = (e) => {
    actions.updateCreatingPoliticianField(
      e.target.name,
      parseInt(e.target.value, 10)
    );
  };

  const handleAgeChange = (e) => {
    actions.updateCreatingPoliticianField("age", parseInt(e.target.value, 10));
  };

  const handleSelectChange = (e) => {
    actions.updateCreatingPoliticianField(e.target.name, e.target.value);
  };

  const handleAttributeChange = (attr, value) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      actions.updateCreatingPoliticianAttribute(attr.toLowerCase(), numValue);
    }
  };

  const handleBackgroundChange = (fieldKey, value) => {
    actions.updateCreatingPoliticianBackground(fieldKey, value);
  };

  const handlePolicyStanceChange = useCallback(
    (questionId, optionValue) => {
      actions.updateCreatingPoliticianPolicyStance(questionId, optionValue);
    },
    [actions]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    actions.recalculateIdeology();
    // The finalize action now handles navigation
    actions.finalizeNewPolitician();
  };

  const handleApplyPreset = useCallback(
    (ideologyName) => {
      if (!ideologyName) return; // Do nothing if no ideology is selected (e.g. placeholder)
      const presetStances = POLICY_PRESETS[ideologyName];
      if (presetStances) {
        const newStances = { ...creatingPolitician.policyStances };
        POLICY_QUESTIONS.forEach((pq) => {
          if (pq && pq.id) {
            if (presetStances[pq.id]) {
              newStances[pq.id] = presetStances[pq.id];
            }
          }
        });
        actions.updateCreatingPoliticianField("policyStances", newStances);
        actions.recalculateIdeology(`Preset: ${ideologyName}`);
      }
    },
    [actions, creatingPolitician]
  );

  const handleRandomize = useCallback(() => {
    // Name and Age
    actions.updateCreatingPoliticianField(
      "firstName",
      `First${Math.floor(Math.random() * 1000)}`
    );
    actions.updateCreatingPoliticianField(
      "lastName",
      `Last${Math.floor(Math.random() * 1000)}`
    );
    actions.updateCreatingPoliticianField(
      "age",
      25 + Math.floor(Math.random() * 50)
    );

    // --- NEW: Randomize new identity fields ---
    actions.updateCreatingPoliticianField(
      "sex",
      Math.random() < 0.5 ? "male" : "female"
    );
    actions.updateCreatingPoliticianField(
      "policyFocus",
      POSSIBLE_POLICY_FOCUSES[
        Math.floor(Math.random() * POSSIBLE_POLICY_FOCUSES.length)
      ]
    );
    // --- END NEW ---

    // Policy Stances
    const newRandomStances = {};
    POLICY_QUESTIONS.forEach((policyQuestionObject) => {
      if (
        policyQuestionObject &&
        policyQuestionObject.id &&
        Array.isArray(policyQuestionObject.options) &&
        policyQuestionObject.options.length > 0
      ) {
        const questionId = policyQuestionObject.id;
        const availableOptions = policyQuestionObject.options;
        const randomOption =
          availableOptions[Math.floor(Math.random() * availableOptions.length)];
        if (randomOption && typeof randomOption.value !== "undefined") {
          newRandomStances[questionId] = randomOption.value;
        }
      }
    });
    actions.updateCreatingPoliticianField("policyStances", newRandomStances);

    // Attributes
    const newRandomAttributes = { ...creatingPolitician.attributes };
    ATTRIBUTES_LIST.forEach((attr) => {
      newRandomAttributes[attr.toLowerCase()] = Math.floor(Math.random() * 101);
    });
    actions.updateCreatingPoliticianField("attributes", newRandomAttributes);

    // Background
    const newRandomBackground = { ...creatingPolitician.background };
    BACKGROUND_FIELDS.forEach((field) => {
      if (Array.isArray(field.options) && field.options.length > 0) {
        newRandomBackground[field.key] =
          field.options[Math.floor(Math.random() * field.options.length)];
      }
    });
    actions.updateCreatingPoliticianField("background", newRandomBackground);

    // --- NEW: Randomize starting resource fields ---
    actions.updateCreatingPoliticianField(
      "politicalCapital",
      5 + Math.floor(Math.random() * 56) // Range 5-60
    );
    actions.updateCreatingPoliticianField(
      "nameRecognition",
      500 + Math.floor(Math.random() * 49501) // Range 500-50,000
    );
    actions.updateCreatingPoliticianField(
      "treasury",
      1000 + Math.floor(Math.random() * 149001) // Range 1,000-150,000
    );
    actions.updateCreatingPoliticianField(
      "campaignFunds",
      500 + Math.floor(Math.random() * 74501) // Range 500-75,000
    );
    // --- END NEW ---

    // Final Recalculation
    actions.recalculateIdeology("Randomized");
  }, [actions, creatingPolitician.attributes, creatingPolitician.background]);

  const handleCancel = () => {
    actions.resetCreatingPolitician();
    // UPDATED: Use the new navigateBack action
    actions.navigateBack();
  };

  const handleManualRecalculate = () => {
    actions.recalculateIdeology("Manual Recalculation");
  };

  if (
    !creatingPolitician ||
    !creatingPolitician.attributes ||
    !creatingPolitician.policyStances ||
    !creatingPolitician.background
  ) {
    return <div className="loading-creator">Loading creator data...</div>;
  }

  return (
    <div className="politician-creator-container">
      <form onSubmit={handleSubmit} className="creator-form">
        <h1 className="creator-title important-heading">
          {isEditMode ? "Edit Politician" : "Create Your Politician"}
        </h1>

        <div className="creator-tabs">
          <SubtabDropdown
            tabs={[
              { id: "identity", label: "Identity" },
              { id: "resources", label: "Starting Resources" },
              { id: "policies", label: "Policy Stances" },
              { id: "background", label: "Attributes & Background" }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            label="Select Section"
          />
        </div>

        <div className="tab-content">
          {activeTab === "identity" && (
            <section className="tab-section identity-section">
              {/* ... Identity Form Content ... */}
              <h2>Basic Information</h2>
              <div className="form-group">
                <label htmlFor="firstName">First Name:</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={creatingPolitician.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name:</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={creatingPolitician.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="age">Age: {creatingPolitician.age}</label>
                <input
                  type="range"
                  id="age"
                  name="age"
                  min="18"
                  max="75"
                  value={creatingPolitician.age}
                  onChange={handleAgeChange}
                />
              </div>
              <div className="form-group">
                {/* CHANGED */}
                <label>Sex:</label>
                <select
                  // CHANGED
                  name="sex"
                  // CHANGED
                  value={creatingPolitician.sex}
                  onChange={handleSelectChange}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
            </section>
          )}

          {activeTab === "resources" && (
            <section className="tab-section resources-section">
              <h2>Starting Resources</h2>
              <p className="policy-instructions">
                Directly set the initial resources and influence for your
                politician.
              </p>

              <div className="attributes-grid">
                <div className="form-group">
                  <label htmlFor="politicalCapital">
                    Political Capital: {creatingPolitician.politicalCapital ?? 0}
                  </label>
                  <input
                    type="range"
                    id="politicalCapital"
                    name="politicalCapital"
                    min="0"
                    max="100"
                    step="1"
                    value={creatingPolitician.politicalCapital ?? 0}
                    onChange={handleRangeInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nameRecognition">
                    Name Recognition:{" "}
                    {(creatingPolitician.nameRecognition ?? 0).toLocaleString()}
                  </label>
                  <input
                    type="range"
                    id="nameRecognition"
                    name="nameRecognition"
                    min="0"
                    max="100000"
                    step="500"
                    value={creatingPolitician.nameRecognition ?? 0}
                    onChange={handleRangeInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="treasury">
                    Personal Treasury: $
                    {(creatingPolitician.treasury ?? 0).toLocaleString()}
                  </label>
                  <input
                    type="range"
                    id="treasury"
                    name="treasury"
                    min="0"
                    max="500000"
                    step="1000"
                    value={creatingPolitician.treasury ?? 0}
                    onChange={handleRangeInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="campaignFunds">
                    Campaign Funds: $
                    {(creatingPolitician.campaignFunds ?? 0).toLocaleString()}
                  </label>
                  <input
                    type="range"
                    id="campaignFunds"
                    name="campaignFunds"
                    min="0"
                    max="250000"
                    step="500"
                    value={creatingPolitician.campaignFunds ?? 0}
                    onChange={handleRangeInputChange}
                  />
                </div>
              </div>
            </section>
          )}

          {activeTab === "policies" && (
            <section className="tab-section policy-stances-section">
              {/* --- NEW Structure for Policy Controls Header --- */}
              <div className="policy-controls-header">
                <div className="policy-section-title-container">
                  <h2>Policy Stances</h2>
                </div>
                <div className="ideology-display-and-recalc">
                  <div className="ideology-display-container">
                    <p className="ideology-display">
                      Calculated Ideology:{" "}
                      <strong>
                        {creatingPolitician.calculatedIdeology ||
                          "Not yet calculated"}
                      </strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualRecalculate}
                    className="action-button recalculate-button"
                  >
                    Recalculate Ideology
                  </button>
                </div>
                <div className="policy-presets-container">
                  <label
                    htmlFor="policy-preset-select"
                    className="preset-select-label"
                  >
                    Apply Preset:
                  </label>
                  <select
                    id="policy-preset-select"
                    className="policy-preset-dropdown"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleApplyPreset(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      - Select Preset -
                    </option>
                    {BASE_IDEOLOGIES.filter(
                      (ideo) => ideo && POLICY_PRESETS[ideo.name]
                    ).map((ideology) => (
                      <option key={ideology.id} value={ideology.name}>
                        {ideology.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="policy-category-selector-container">
                  <label
                    htmlFor="policy-category-select"
                    className="category-select-label"
                  >
                    View Category:
                  </label>
                  <select
                    id="policy-category-select"
                    value={selectedPolicyCategory}
                    onChange={(e) => setSelectedPolicyCategory(e.target.value)}
                    className="policy-category-dropdown"
                  >
                    {sortedCategoryNames.map((categoryName) => (
                      <option key={categoryName} value={categoryName}>
                        {categoryName} ({categories[categoryName]?.length || 0})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="policy-instructions">
                Select your stance for each policy. You do not need to answer
                every question.
              </p>

              <div className="policy-questions-list">
                {questionsForSelectedCategory.length > 0 ? (
                  questionsForSelectedCategory.map((policyQuestion) => (
                    <PolicyQuestionCard
                      key={policyQuestion.id}
                      policyQuestion={policyQuestion}
                      currentStance={
                        creatingPolitician.policyStances[policyQuestion.id]
                      }
                      onStanceChange={handlePolicyStanceChange}
                    />
                  ))
                ) : (
                  <p className="no-questions-message">
                    {selectedPolicyCategory
                      ? `No questions in ${selectedPolicyCategory}.`
                      : "Please select a category."}
                  </p>
                )}
              </div>
            </section>
          )}

          {activeTab === "background" && (
            <section className="tab-section attributes-background-section">
              {/* ... Attributes & Background Form Content ... */}
              <h2>Attributes & Background</h2>
              <div className="attributes-grid">
                {ATTRIBUTES_LIST.map((attr) => (
                  <div key={attr} className="form-group attribute-item">
                    <label htmlFor={attr.toLowerCase()}>
                      {attr}:{" "}
                      {creatingPolitician.attributes[attr.toLowerCase()] || 0}
                    </label>
                    <input
                      type="range"
                      id={attr.toLowerCase()}
                      name={attr.toLowerCase()}
                      min="0"
                      max="100"
                      value={
                        creatingPolitician.attributes[attr.toLowerCase()] || 0
                      }
                      onChange={(e) =>
                        handleAttributeChange(attr, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
              <h3>Professional History</h3>
              {BACKGROUND_FIELDS.map((field) => (
                <div key={field.key} className="form-group">
                  <label htmlFor={field.key}>{field.label}:</label>
                  <select
                    name={field.key}
                    id={field.key}
                    value={creatingPolitician.background[field.key] || ""}
                    onChange={(e) =>
                      handleBackgroundChange(field.key, e.target.value)
                    }
                  >
                    <option value="" disabled>
                      - Select -
                    </option>
                    {(field.options || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <h3>Political Focus</h3>
              <div className="form-group">
                <label htmlFor="policyFocus">Starting Policy Focus:</label>
                <p
                  style={{
                    fontSize: "0.8em",
                    color: "var(--secondary-text)",
                    margin: "-5px 0 10px 0",
                  }}
                >
                  This choice will influence the types of policies your
                  character is initially skilled at and likely to propose.
                </p>
                <select
                  id="policyFocus"
                  name="policyFocus"
                  value={creatingPolitician.policyFocus}
                  onChange={handleSelectChange}
                >
                  {POSSIBLE_POLICY_FOCUSES.map((focus) => (
                    <option key={focus} value={focus}>
                      {focus}
                    </option>
                  ))}
                </select>
              </div>
            </section>
          )}
        </div>

        <div className="form-actions">
          {/* ... Form action buttons ... */}
          {!isEditMode && (
            <button
              type="button"
              className="menu-button"
              onClick={handleRandomize}
            >
              Randomize Info
            </button>
          )}
          <button type="button" className="menu-button" onClick={handleCancel}>
            {isEditMode ? "Cancel Edit" : "Back"}
          </button>
          <button type="submit" className="action-button">
            {isEditMode ? "Save Changes" : "Create Politician"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PoliticianCreator;
