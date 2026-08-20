import { mockConditions } from '../data/mockConditions';

const STORAGE_KEY_PRESENTATIONS = 'medclerk_ward_presentations';
const STORAGE_KEY_GUIDES = 'medclerk_cached_guides';

export const getWardPresentations = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PRESENTATIONS);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY_PRESENTATIONS, JSON.stringify(mockConditions));
      return mockConditions;
    }
    return JSON.parse(saved);
  } catch (e) {
    console.error("Storage error", e);
    return mockConditions;
  }
};

export const getCachedGuide = (diseaseName) => {
  if (!diseaseName) return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_GUIDES);
    if (!saved) return null;
    const guides = JSON.parse(saved);
    const normalizedQuery = diseaseName.trim().toLowerCase();

    // 1. Exact match
    let match = guides.find(g => g.conditionName.toLowerCase() === normalizedQuery);
    if (match) return match;

    // 2. Fuzzy / Partial match for instant response
    match = guides.find(g => {
      const name = g.conditionName.toLowerCase();
      return name.includes(normalizedQuery) || normalizedQuery.includes(name);
    });
    return match || null;
  } catch (e) {
    console.error("Storage error", e);
    return null;
  }
};

export const getAllCachedGuides = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_GUIDES);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Storage error", e);
    return [];
  }
};

export const saveConditionGuide = (guide) => {
  if (!guide || !guide.conditionName) return;

  try {
    // 1. Save full JSON guide to cache
    const savedGuidesRaw = localStorage.getItem(STORAGE_KEY_GUIDES);
    let guidesArray = savedGuidesRaw ? JSON.parse(savedGuidesRaw) : [];
    
    const existingIndex = guidesArray.findIndex(g => g.conditionName.toLowerCase() === guide.conditionName.toLowerCase());
    if (existingIndex >= 0) {
      guidesArray[existingIndex] = guide;
    } else {
      guidesArray.push(guide);
    }
    localStorage.setItem(STORAGE_KEY_GUIDES, JSON.stringify(guidesArray));

    // 2. Append to Ward Presentations Quick Access
    const presentationsRaw = localStorage.getItem(STORAGE_KEY_PRESENTATIONS);
    let presentationsArray = presentationsRaw ? JSON.parse(presentationsRaw) : mockConditions;

    const exists = presentationsArray.some(p => p.name.toLowerCase() === guide.conditionName.toLowerCase());
    if (!exists) {
      presentationsArray.push({
        id: Date.now(),
        name: guide.conditionName,
        system: guide.system || "General",
        isRedFlag: guide.redFlags ? guide.redFlags.length >= 3 : false
      });
      localStorage.setItem(STORAGE_KEY_PRESENTATIONS, JSON.stringify(presentationsArray));
    }
  } catch (e) {
    console.error("Storage error saving guide", e);
  }
};

export const deleteCondition = (id, conditionName) => {
  try {
    const presentationsRaw = localStorage.getItem(STORAGE_KEY_PRESENTATIONS);
    if (presentationsRaw) {
      const presentationsArray = JSON.parse(presentationsRaw);
      const filtered = presentationsArray.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY_PRESENTATIONS, JSON.stringify(filtered));
    }

    const guidesRaw = localStorage.getItem(STORAGE_KEY_GUIDES);
    if (guidesRaw) {
      const guidesArray = JSON.parse(guidesRaw);
      const filteredGuides = guidesArray.filter(g => g.conditionName.toLowerCase() !== conditionName.toLowerCase());
      localStorage.setItem(STORAGE_KEY_GUIDES, JSON.stringify(filteredGuides));
    }
  } catch (e) {
    console.error("Error deleting condition from storage", e);
  }
};
