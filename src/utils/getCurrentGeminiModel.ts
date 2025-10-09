import { geminiModelSwitcher } from './geminiModelSwitcher';

export function getCurrentGeminiModel() {
  // Get the current model from the switcher
  return geminiModelSwitcher.getCurrentModel();
}

export function getCurrentGeminiModelName() {
  // Extract just the model name without the 'models/' prefix
  const currentModel = getCurrentGeminiModel();
  return currentModel.name.replace('models/', '');
}