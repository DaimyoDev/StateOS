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
// Import other scenes as you create them:
// import CreatorHub from './scenes/CreatorHub';
// import ElectionSimScreen from './scenes/ElectionSimScreen';
// import CampaignGameScreen from './scenes/CampaignGameScreen';
// import LoadGameScreen from './scenes/LoadGameScreen'; // If you have this
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
      // Add cases for other scenes as you build them:
      // case 'CreatorHub':
      //   return <CreatorHub />;
      // case 'ElectionSimScreen':
      //   return <ElectionSimScreen />;
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
