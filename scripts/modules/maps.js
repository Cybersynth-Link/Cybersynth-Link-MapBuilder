import { showModal, closeModal } from "../utils.js";

export let maps = [];
let currentMapIndex = -1;
let currentObjectIndex = -1;

export function getCurrentMapIndex() {
  return currentMapIndex;
}

export function setCurrentMapIndex(index) {
  currentMapIndex = index;
}

export function getSelectedObjectIndex() {
  return currentObjectIndex;
}

export function selectObject(mapIndex, objectIndex) {
  if (maps[mapIndex]) {
    currentObjectIndex = objectIndex;
  }
}

export function getObjectAtCoordinates(mapIndex, x, y, radius) {
  if (maps[mapIndex]) {
    const objects = maps[mapIndex].objects;
    if (!objects) return null;

    let closestObject = null;
    let minDistance = Infinity;

    for (const object of objects) {
      const distance = Math.sqrt((x - object.x) ** 2 + (y - object.y) ** 2);
      if (distance < minDistance) {
        minDistance = distance;
        closestObject = object;
      }
    }

    if (closestObject && minDistance <= radius) {
      return closestObject;
    }
  }

  return null;
}

export function saveMaps() {
  localStorage.setItem("maps", JSON.stringify(maps));
}

export function loadMapsFromLocalStorage() {
  const storedMaps = localStorage.getItem("maps");
  if (storedMaps) {
    maps = JSON.parse(storedMaps);
  }
}

export function createMap() {
  const mapName = document.getElementById("new-map-name").value.trim();
  if (mapName) {
    maps.push({ name: mapName, regions: [], objects: [] });
    saveMaps();
    closeModal("create-map-modal");
  }
}

export function duplicateMap() {
  if (getCurrentMapIndex() === -1) return;
  const originalMap = maps[getCurrentMapIndex()];
  const duplicatedMap = JSON.parse(JSON.stringify(originalMap));
  duplicatedMap.name = `${originalMap.name} (Копия)`;
  maps.push(duplicatedMap);
  saveMaps();
}

export function renameMap() {
  if (getCurrentMapIndex() !== -1) {
    const newName = document.getElementById("new-map-rename").value.trim();
    if (newName) {
      maps[getCurrentMapIndex()].name = newName;
      saveMaps();
      closeModal("rename-map-modal");
    }
  }
}

export function deleteMap() {
  if (getCurrentMapIndex() !== -1) {
    maps.splice(getCurrentMapIndex(), 1);
    saveMaps();
    setCurrentMapIndex(-1);
    closeModal("delete-map-modal");
  }
}

export function importMap() {
  const mapDataString = document
    .getElementById("map-data-textarea")
    .value.trim();
  try {
    const mapData = JSON.parse(mapDataString);
    if (
      mapData &&
      mapData.name &&
      Array.isArray(mapData.regions) &&
      Array.isArray(mapData.objects)
    ) {
      maps.push(mapData);
      saveMaps();
      closeModal("import-export-map-modal");
    } else {
      alert("Неверный формат данных карты.");
    }
  } catch (error) {
    alert("Ошибка при импорте карты: " + error.message);
  }
}

export function exportMap() {
  if (getCurrentMapIndex() !== -1) {
    const mapData = maps[getCurrentMapIndex()];
    const mapDataString = JSON.stringify(mapData, null, 2);
    document.getElementById("map-data-textarea").value = mapDataString;
  }
}

export function getCurrentMap() {
  if (currentMapIndex === -1) return null;
  return maps[currentMapIndex];
}
