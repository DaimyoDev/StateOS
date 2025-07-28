import React from "react";
import useGameStore from "./store";
import MainMenu from "./scenes/MainMenu";
import SettingsScreen from "./scenes/SettingsScreen";
import CampaignStartOptionsScreen from "./scenes/CampaignStartOptionsScreen";
import PoliticianCreator from "./scenes/PoliticianCreator";
import CampaignSetupScreen from "./scenes/CampaignSetupScreen";
import ManagePoliticiansScreen from "./scenes/ManagePoliticiansScreen";
import LocalAreaSetupScreen from "./scenes/LocalAreaSetupScreen";
import CampaignGameScreen from "./scenes/CampaignGameScreen";
import ElectionNightScreen from "./scenes/ElectionNightScreen";
import ThemeCreatorEditor from "./scenes/ThemeCreatorEditor";
import ElectionSimulatorScreen from "./scenes/ElectionSimulatorScreen";
import CreatorHub from "./scenes/CreatorHub";
import PartyCreatorScreen from "./scenes/PartyCreatorScreen";
import CountryDetailsScreen from "./scenes/CountryDetailsScreen";
import "./App.css";
import ToastContainer from "./components/toasts/ToastContainer";

function App() {
  const currentScene = useGameStore((state) => state.currentScene);
  const actions = useGameStore((state) => state.actions);

  // Initialize theme on first load
  React.useEffect(() => {
    if (actions.applyInitialTheme) {
      actions.applyInitialTheme();
    }
  }, [actions]);

  const renderScene = () => {
    switch (currentScene) {
      case "MainMenu":
        return <MainMenu />;
      case "SettingsScreen":
        return <SettingsScreen />;
      case "CreatorHub":
        return <CreatorHub />;
      case "CampaignStartOptionsScreen":
        return <CampaignStartOptionsScreen />;
      // case 'LoadGameScreen':
      //   return <LoadGameScreen />;
      case "PoliticianCreator":
        return <PoliticianCreator />;
      case "CampaignSetupScreen":
        return <CampaignSetupScreen />;
      case "ManagePoliticiansScreen":
        return <ManagePoliticiansScreen />;
      case "LocalAreaSetupScreen":
        return <LocalAreaSetupScreen />;
      case "CampaignGameScreen":
        return <CampaignGameScreen />;
      case "ElectionNightScreen":
        return <ElectionNightScreen />;
      case "ThemeCreatorEditor":
        return <ThemeCreatorEditor />;
      case "ElectionSimulatorScreen":
        return <ElectionSimulatorScreen />;
      case "PartyCreatorScreen":
        return <PartyCreatorScreen />;
      case "CountryDetailsScreen":
        return <CountryDetailsScreen />;
      default:
        console.warn(`Unknown scene: ${currentScene}, defaulting to MainMenu.`);
        return <MainMenu />; // Default to main menu
    }
  };

  return (
    <div className="App">
      {renderScene()}
      <ToastContainer />
    </div>
  );
}

export default App;
