import React, { useState, useMemo, useCallback, useEffect } from "react";
import useGameStore from "../store";
import "./PoliticianCreator.css";
import {
  POLICY_QUESTIONS,
  ATTRIBUTES_LIST,
  BACKGROUND_FIELDS,
} from "../data/policyData";
import { BASE_IDEOLOGIES } from "../data/ideologiesData";
import { POLICY_PRESETS } from "../data/policyPresetsData";

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

  const handleAgeChange = (e) => {
    actions.updateCreatingPoliticianField("age", parseInt(e.target.value, 10));
  };

  const handleAttributeChange = (attr, value) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
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
    actions.recalculateIdeology("Submit");
    setTimeout(() => actions.finalizeNewPolitician(), 50);
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
    [actions, creatingPolitician.policyStances]
  );

  const handleRandomize = useCallback(() => {
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

    const newRandomAttributes = { ...creatingPolitician.attributes };
    ATTRIBUTES_LIST.forEach((attr) => {
      newRandomAttributes[attr.toLowerCase()] = Math.floor(Math.random() * 11);
    });
    actions.updateCreatingPoliticianField("attributes", newRandomAttributes);

    const newRandomBackground = { ...creatingPolitician.background };
    BACKGROUND_FIELDS.forEach((field) => {
      if (Array.isArray(field.options) && field.options.length > 0) {
        newRandomBackground[field.key] =
          field.options[Math.floor(Math.random() * field.options.length)];
      }
    });
    actions.updateCreatingPoliticianField("background", newRandomBackground);
    actions.recalculateIdeology("Randomized");
  }, [actions, creatingPolitician.attributes, creatingPolitician.background]);

  const handleCancel = () => {
    actions.resetCreatingPolitician();
    actions.navigateTo(
      isEditMode ? "ManagePoliticiansScreen" : "CampaignStartOptionsScreen"
    );
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
          {/* ... Tab buttons ... */}
          <button
            type="button"
            onClick={() => setActiveTab("identity")}
            className={`tab-button ${activeTab === "identity" ? "active" : ""}`}
          >
            Identity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("policies")}
            className={`tab-button ${activeTab === "policies" ? "active" : ""}`}
          >
            Policy Stances
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("background")}
            className={`tab-button ${
              activeTab === "background" ? "active" : ""
            }`}
          >
            Attributes & Background
          </button>
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
                      max="10"
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
