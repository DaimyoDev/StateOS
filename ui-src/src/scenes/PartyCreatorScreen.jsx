import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import useGameStore from "../store";
import { POLICY_QUESTIONS } from "../data/policyData";
import "./PartyCreatorScreen.css";

// --- Helper Components from PoliticianCreator (can be refactored into a shared file later) ---
const PolicyOption = React.memo(
  ({ questionId, option, isChecked, onStanceChange }) => {
    const handleChange = () => onStanceChange(questionId, option.value);
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
  }
);

const PolicyQuestionCard = React.memo(
  ({ policyQuestion, currentStance, onStanceChange }) => (
    <div className="policy-card">
      <h4 className="policy-card-question-text">
        {policyQuestion.questionText}
      </h4>
      <div className="policy-card-options-group">
        {policyQuestion.options.map((option) => (
          <PolicyOption
            key={`${policyQuestion.id}-${option.value}`}
            questionId={policyQuestion.id}
            option={option}
            isChecked={currentStance === option.value}
            onStanceChange={onStanceChange}
          />
        ))}
      </div>
    </div>
  )
);

// --- Pixel Art Canvas Component ---
const PixelCanvas = ({ onLogoChange, initialLogo }) => {
  const canvasRef = useRef(null);
  const [selectedColor, setSelectedColor] = useState("#FF0000");
  const [isDrawing, setIsDrawing] = useState(false);

  const defaultPalette = useMemo(
    () => [
      "#FFFFFF",
      "#000000",
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFF00",
      "#FF00FF",
      "#00FFFF",
      "#C0C0C0",
      "#808080",
      "#800000",
      "#008000",
      "#000080",
      "#808000",
      "#800080",
      "#008080",
    ],
    []
  );

  const [palette, setPalette] = useState(defaultPalette);
  const [newColor, setNewColor] = useState("#CCCCCC");

  const PIXEL_SIZE = 16; // 16x16 grid = 256px canvas
  const GRID_SIZE = 16;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (initialLogo) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = initialLogo;
    } else {
      drawGrid(ctx);
    }
  }, [initialLogo]);

  const addColorToPalette = () => {
    if (newColor && !palette.includes(newColor)) {
      setPalette([...palette, newColor]);
    }
  };

  const deleteFromPalette = (colorToDelete) => {
    if (palette.length <= 1) return; // Don't delete the last color
    // If deleting the selected color, select another one
    if (selectedColor === colorToDelete) {
      const newSelected = palette.find((c) => c !== colorToDelete);
      setSelectedColor(newSelected || "#000000");
    }
    setPalette(palette.filter((c) => c !== colorToDelete));
  };

  const drawGrid = (ctx) => {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = "#DDDDDD";
    ctx.beginPath();
    for (let x = 0; x <= GRID_SIZE; x++) {
      ctx.moveTo(x * PIXEL_SIZE, 0);
      ctx.lineTo(x * PIXEL_SIZE, GRID_SIZE * PIXEL_SIZE);
    }
    for (let y = 0; y <= GRID_SIZE; y++) {
      ctx.moveTo(0, y * PIXEL_SIZE);
      ctx.lineTo(GRID_SIZE * PIXEL_SIZE, y * PIXEL_SIZE);
    }
    ctx.stroke();
  };

  const drawPixel = useCallback(
    (event) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();

      const x = Math.floor((event.clientX - rect.left) / PIXEL_SIZE);
      const y = Math.floor((event.clientY - rect.top) / PIXEL_SIZE);

      if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

      ctx.fillStyle = selectedColor;
      ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    },
    [selectedColor]
  );

  const handleMouseDown = useCallback(
    (e) => {
      setIsDrawing(true);
      drawPixel(e);
    },
    [drawPixel]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDrawing) return;
      drawPixel(e);
    },
    [isDrawing, drawPixel]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      onLogoChange(dataUrl);
    }
  }, [isDrawing, onLogoChange]);

  const handleMouseLeave = useCallback(() => {
    if (isDrawing) {
      handleMouseUp();
    }
  }, [isDrawing, handleMouseUp]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    drawGrid(ctx);
    onLogoChange(null);
  };

  return (
    <div className="pixel-canvas-container">
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * PIXEL_SIZE}
        height={GRID_SIZE * PIXEL_SIZE}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="pixel-canvas"
      />
      <div className="palette-controls">
        <div className="color-palette">
          {palette.map((color) => (
            <div key={color} className="palette-color-container">
              <button
                type="button"
                className={`palette-color ${
                  selectedColor === color ? "selected" : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
              <button
                type="button"
                className="delete-color-button"
                onClick={() => deleteFromPalette(color)}
                aria-label={`Delete ${color}`}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <div className="color-adder">
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="color-picker-input"
          />
          <button
            type="button"
            onClick={addColorToPalette}
            className="menu-button small-button"
          >
            Add
          </button>
        </div>

        <button
          type="button"
          onClick={clearCanvas}
          className="menu-button small-button"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

function PartyCreatorScreen() {
  const actions = useGameStore((state) => state.actions);
  const creatingParty = useGameStore((state) => state.creatingParty);

  const [activeTab, setActiveTab] = useState("identity");

  const { categories, sortedCategoryNames } = useMemo(() => {
    const cats = {};
    POLICY_QUESTIONS.forEach((q) => {
      if (!cats[q.category]) cats[q.category] = [];
      cats[q.category].push(q);
    });
    return { categories: cats, sortedCategoryNames: Object.keys(cats).sort() };
  }, []);

  const [selectedPolicyCategory, setSelectedPolicyCategory] = useState(
    sortedCategoryNames[0] || ""
  );

  const handleInputChange = (e) => {
    actions.updateCreatingPartyField(e.target.name, e.target.value);
  };

  const handlePolicyStanceChange = useCallback(
    (questionId, optionValue) => {
      actions.updateCreatingPartyPolicyStance(questionId, optionValue);
    },
    [actions]
  );

  const handleLogoChange = useCallback(
    (logoDataUrl) => {
      actions.updateCreatingPartyField("logoDataUrl", logoDataUrl);
    },
    [actions]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    actions.finalizeNewParty();
  };

  const handleCancel = () => {
    actions.navigateTo("CreatorHub");
  };

  if (!creatingParty) {
    return <div>Loading Party Creator...</div>;
  }

  return (
    <div className="party-creator-container">
      <form onSubmit={handleSubmit} className="creator-form">
        <h1 className="creator-title important-heading">
          {creatingParty.id ? "Edit Party" : "Create New Party"}
        </h1>

        <div className="creator-tabs">
          <button
            type="button"
            onClick={() => setActiveTab("identity")}
            className={`tab-button ${activeTab === "identity" ? "active" : ""}`}
          >
            Identity & Logo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("policies")}
            className={`tab-button ${activeTab === "policies" ? "active" : ""}`}
          >
            Policy Stances
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "identity" && (
            <section className="tab-section identity-section">
              <h2>Basic Information</h2>
              <div className="form-group">
                <label htmlFor="name">Party Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={creatingParty.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="color">Party Color:</label>
                <input
                  type="color"
                  id="color"
                  name="color"
                  value={creatingParty.color}
                  onChange={handleInputChange}
                />
              </div>
              <h2>Party Logo</h2>
              <p>Click and drag on the canvas to draw your party's logo.</p>
              <PixelCanvas
                onLogoChange={handleLogoChange}
                initialLogo={creatingParty.logoDataUrl}
              />
            </section>
          )}

          {activeTab === "policies" && (
            <section className="tab-section policy-stances-section">
              <div className="policy-controls-header">
                <h2>Policy Stances</h2>
                <div className="ideology-display">
                  Calculated Ideology:{" "}
                  <strong>
                    {creatingParty.ideology || "Not yet calculated"}
                  </strong>
                </div>
                <div className="policy-category-selector-container">
                  <label htmlFor="policy-category-select">View Category:</label>
                  <select
                    id="policy-category-select"
                    value={selectedPolicyCategory}
                    onChange={(e) => setSelectedPolicyCategory(e.target.value)}
                    className="policy-category-dropdown"
                  >
                    {sortedCategoryNames.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="policy-questions-list">
                {categories[selectedPolicyCategory]?.map((pq) => (
                  <PolicyQuestionCard
                    key={pq.id}
                    policyQuestion={pq}
                    currentStance={creatingParty.policyStances[pq.id]}
                    onStanceChange={handlePolicyStanceChange}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="menu-button" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="action-button">
            Save Party
          </button>
        </div>
      </form>
    </div>
  );
}

export default PartyCreatorScreen;
