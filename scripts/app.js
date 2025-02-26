import { showModal, closeModal } from "./utils.js";
import * as mapsModule from "./modules/maps.js";
import * as drawing from "./modules/drawing.js";

document.addEventListener("DOMContentLoaded", function () {
  let currentRegionIndex = -1;

  function init() {
    mapsModule.loadMapsFromLocalStorage();
    renderMapList();
    drawing.setupCanvas(document.getElementById("map-canvas"));

    document
      .getElementById("save-button")
      .addEventListener("click", mapsModule.saveMaps);
    document.getElementById("load-button").addEventListener("click", loadMaps);
    document
      .getElementById("import-export-map")
      .addEventListener("click", () => showModal("import-export-map-modal"));
    document
      .getElementById("import-map-button")
      .addEventListener("click", importMap);
    document
      .getElementById("export-map-button")
      .addEventListener("click", exportMap);
    document
      .getElementById("create-map")
      .addEventListener("click", () => showModal("create-map-modal"));
    document
      .getElementById("confirm-create-map")
      .addEventListener("click", createMap);
    document
      .getElementById("duplicate-map")
      .addEventListener("click", duplicateMap);
    document
      .getElementById("rename-map")
      .addEventListener("click", showRenameMapModal);
    document
      .getElementById("confirm-rename-map")
      .addEventListener("click", renameMap);
    document
      .getElementById("delete-map")
      .addEventListener("click", showDeleteMapModal);
    document
      .getElementById("yes-delete-map")
      .addEventListener("click", deleteMap);
    document
      .getElementById("no-delete-map")
      .addEventListener("click", () => closeModal("delete-map-modal"));

    document.getElementById("add-region").addEventListener("click", addRegion);
    document.getElementById("add-object").addEventListener("click", addObject);
    document
      .getElementById("add-object-item")
      .addEventListener("click", addObjectItem);

    document
      .getElementById("add-region-vertex")
      .addEventListener("click", addRegionVertex);

    document
      .getElementById("region-color")
      .addEventListener("change", updateRegionStyle);
    document
      .getElementById("region-line-width")
      .addEventListener("change", updateRegionStyle);
    document
      .getElementById("region-fill-color")
      .addEventListener("change", updateRegionStyle);
    document
      .getElementById("region-fill-enabled")
      .addEventListener("change", updateRegionStyle);
    document
      .getElementById("delete-region-button")
      .addEventListener("click", deleteRegion);

    document
      .getElementById("delete-object-button")
      .addEventListener("click", deleteObject);

    document.getElementById("objects").addEventListener("click", (event) => {
      if (event.target.tagName === "LI") {
        const index = Array.from(event.target.parentNode.children).indexOf(
          event.target
        );
        handleObjectClick(index);
      }
    });

    document
      .getElementById("save-object-changes")
      .addEventListener("click", updateObject);
    document
      .querySelectorAll(
        "#edit-object-modal .close-button, #edit-object-modal .cancel-button"
      )
      .forEach((button) => {
        button.addEventListener("click", () => closeModal("edit-object-modal"));
      });

    document.querySelectorAll(".close-button").forEach((button) => {
      button.addEventListener("click", () =>
        closeModal(button.closest(".modal").id)
      );
    });

    document.querySelectorAll(".collapsible").forEach((collapsible) => {
      collapsible
        .querySelector(".collapsible-header")
        .addEventListener("click", () =>
          collapsible.classList.toggle("active")
        );
    });
    document.querySelectorAll(".tab-button").forEach((tab) => {
      tab.addEventListener("click", () => {
        document
          .querySelectorAll(".tab-button")
          .forEach((t) => t.classList.remove("active"));
        document
          .querySelectorAll(".tab-content")
          .forEach((c) => c.classList.remove("active"));
        tab.classList.add("active");
        document
          .getElementById(`${tab.dataset.tab}-list`)
          .classList.add("active");
        if (tab.dataset.tab === "regions") renderRegions();
        else renderObjects();
      });
    });

    document
      .getElementById("toggle-panel-button")
      .addEventListener("click", () => {
        document
          .getElementById("import-export-panel")
          .classList.toggle("active");
      });
    document.getElementById("fit-to-screen").addEventListener("click", () => {
      if (mapsModule.getCurrentMapIndex() !== -1) {
        drawing.renderMap(mapsModule.maps[mapsModule.getCurrentMapIndex()]);
      }
    });

    document.addEventListener("objectClicked", (event) => {
      console.log("objectClicked event received with index:", event.detail);
      handleObjectClick(event.detail);
    });
  }

  function renderMapList() {
    const mapList = document.getElementById("map-list");
    mapList.innerHTML = "";
    mapsModule.maps.forEach((map, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = map.name;
      listItem.addEventListener("click", () => selectMap(index));
      mapList.appendChild(listItem);
    });
    updateButtonStates();
  }
  
  function selectMap(index) {
    mapsModule.setCurrentMapIndex(index);
    document
      .querySelectorAll("#map-list li")
      .forEach((li) => li.classList.remove("selected"));
    const selectedMapLi = document.querySelector(
      `#map-list li:nth-child(${index + 1})`
    );
    if (selectedMapLi) selectedMapLi.classList.add("selected");
    updateButtonStates();
    renderRegions();
    renderObjects();
    drawing.renderMap(mapsModule.maps[mapsModule.getCurrentMapIndex()]);
  }

  function updateButtonStates() {
    const mapSelected = mapsModule.getCurrentMapIndex() !== -1;
    document.getElementById("duplicate-map").disabled = !mapSelected;
    document.getElementById("rename-map").disabled = !mapSelected;
    document.getElementById("delete-map").disabled = !mapSelected;
  }

  function showRenameMapModal() {
    if (mapsModule.getCurrentMapIndex() !== -1) {
      document.getElementById("new-map-rename").value =
        mapsModule.maps[mapsModule.getCurrentMapIndex()].name;
      showModal("rename-map-modal");
    }
  }

  function showDeleteMapModal() {
    if (mapsModule.getCurrentMapIndex() !== -1) {
      showModal("delete-map-modal");
    }
  }

  function loadMaps() {
    mapsModule.loadMapsFromLocalStorage();
    renderMapList();
    if (mapsModule.getCurrentMapIndex() !== -1) {
      drawing.renderMap(mapsModule.maps[mapsModule.getCurrentMapIndex()]);
    }
    alert("Карты загружены из локального хранилища");
  }

  function createMap() {
    mapsModule.createMap();
    renderMapList();
    drawing.renderMap(mapsModule.maps[mapsModule.getCurrentMapIndex()]);
  }

  function duplicateMap() {
    mapsModule.duplicateMap();
    renderMapList();
    drawing.renderMap(mapsModule.maps[mapsModule.getCurrentMapIndex()]);
  }

  function renameMap() {
    mapsModule.renameMap();
    renderMapList();
    drawing.renderMap(mapsModule.maps[mapsModule.getCurrentMapIndex()]);
  }

  function deleteMap() {
    mapsModule.deleteMap();
    renderMapList();
    drawing.renderMap(mapsModule.maps[mapsModule.getCurrentMapIndex()]);
  }

  function importMap() {
    mapsModule.importMap();
    renderMapList();
    drawing.renderMap(mapsModule.maps[mapsModule.getCurrentMapIndex()]);
  }

  function exportMap() {
    mapsModule.exportMap();
  }

  function addRegion() {
    if (mapsModule.getCurrentMapIndex() === -1) return;

    const regionName = prompt("Введите название региона:", "Новый регион");
    if (regionName) {
      mapsModule.maps[mapsModule.getCurrentMapIndex()].regions.push({
        name: regionName,
        vertices: [],
        color: "#ff6600",
        lineWidth: 2,
        fillColor: "#ffffff",
        fillEnabled: false,
      });
      mapsModule.saveMaps();
      renderRegions();
      drawing.renderMap(mapsModule.maps[mapsModule.getCurrentMapIndex()]);
    }
  }

  function renderRegions() {
    if (mapsModule.getCurrentMapIndex() === -1) {
      document.getElementById("regions").innerHTML = "";
      document.getElementById("region-details").style.display = "none";
      return;
    }

    const regionsList = document.getElementById("regions");
    regionsList.innerHTML = "";

    const regions = mapsModule.maps[mapsModule.getCurrentMapIndex()].regions;
    if (!regions) return;

    regions.forEach((region, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = region.name;
      listItem.addEventListener("click", () => selectRegion(index));
      regionsList.appendChild(listItem);
    });

    if (currentRegionIndex >= regions.length) {
      currentRegionIndex = -1;
    }
    if (currentRegionIndex !== -1) {
      try {
        document
          .querySelector(`#regions li:nth-child(${currentRegionIndex + 1})`)
          .classList.add("selected");
      } catch (e) {}
      selectRegion(currentRegionIndex);
    } else {
      selectRegion(-1);
    }
  }

  function selectRegion(index) {
    currentRegionIndex = index;
    document
      .querySelectorAll("#regions li")
      .forEach((li) => li.classList.remove("selected"));
    const selectedLi = document.querySelector(
      `#regions li:nth-child(${index + 1})`
    );
    if (selectedLi) selectedLi.classList.add("selected");

    if (index === -1) {
      document.getElementById("region-details").style.display = "none";
    } else {
      document.getElementById("region-details").style.display = "block";
      renderRegionVertices();
      updateRegionStyleInputs();
    }
  }

  function addRegionVertex() {
    if (mapsModule.getCurrentMapIndex() === -1 || currentRegionIndex === -1)
      return;

    const x = parseFloat(document.getElementById("region-vertex-x").value);
    const y = parseFloat(document.getElementById("region-vertex-y").value);

    if (!isNaN(x) && !isNaN(y)) {
      mapsModule.maps[mapsModule.getCurrentMapIndex()].regions[
        currentRegionIndex
      ].vertices.push({ x, y });
      mapsModule.saveMaps();
      renderRegionVertices();
      drawing.renderMap(mapsModule.maps[mapsModule.getCurrentMapIndex()]);
      document.getElementById("region-vertex-x").value = "";
      document.getElementById("region-vertex-y").value = "";
    } else {
      alert("Введите корректные координаты (числа).");
    }
  }

  function renderRegionVertices() {
    if (mapsModule.getCurrentMapIndex() === -1 || currentRegionIndex === -1) {
      document.getElementById("region-items").innerHTML = "";
      return;
    }
    const vertexList = document.getElementById("region-items");
    vertexList.innerHTML = "";

    const region =
      mapsModule.maps[mapsModule.getCurrentMapIndex()].regions[
        currentRegionIndex
      ];

    region.vertices.forEach((vertex, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = `Вершина ${index + 1}: (${vertex.x}, ${vertex.y})`;
      listItem.addEventListener("click", () => deleteRegionVertex(index));
      vertexList.appendChild(listItem);
    });
  }

  function deleteRegion() {
    if (mapsModule.getCurrentMapIndex() === -1 || currentRegionIndex === -1)
      return;

    if (
      confirm(
        `Вы уверены, что хотите удалить регион "${
          mapsModule.maps[mapsModule.getCurrentMapIndex()].regions[
            currentRegionIndex
          ].name
        }"?`
      )
    ) {
      mapsModule.maps[mapsModule.getCurrentMapIndex()].regions.splice(
        currentRegionIndex,
        1
      );
      currentRegionIndex = -1;
      mapsModule.saveMaps();
      renderRegions();
      renderRegionVertices();
      drawing.renderMap(mapsModule.maps[mapsModule.getCurrentMapIndex()]);
    }
  }

  function deleteRegionVertex(index) {
    if (mapsModule.getCurrentMapIndex() === -1 || currentRegionIndex === -1)
      return;
    mapsModule.maps[mapsModule.getCurrentMapIndex()].regions[
      currentRegionIndex
    ].vertices.splice(index, 1);
    mapsModule.saveMaps();
    renderRegionVertices();
    drawing.renderMap(mapsModule.maps[mapsModule.getCurrentMapIndex()]);
  }

  function updateRegionStyle() {
    if (mapsModule.getCurrentMapIndex() === -1 || currentRegionIndex === -1)
      return;

    const color = document.getElementById("region-color").value;
    const lineWidth = parseFloat(
      document.getElementById("region-line-width").value
    );
    const fillColor = document.getElementById("region-fill-color").value;
    const fillEnabled = document.getElementById("region-fill-enabled").checked;

    const region =
      mapsModule.maps[mapsModule.getCurrentMapIndex()].regions[
        currentRegionIndex
      ];
    region.color = color;
    region.lineWidth = lineWidth;
    region.fillColor = fillColor;
    region.fillEnabled = fillEnabled;
    mapsModule.saveMaps();
    drawing.renderMap(mapsModule.maps[mapsModule.getCurrentMapIndex()]);
  }

  function updateRegionStyleInputs() {
    if (mapsModule.getCurrentMapIndex() === -1 || currentRegionIndex === -1) {
      document.getElementById("delete-region-button").disabled = true;
      return;
    }

    document.getElementById("delete-region-button").disabled = false;
    const region =
      mapsModule.maps[mapsModule.getCurrentMapIndex()].regions[
        currentRegionIndex
      ];
    document.getElementById("region-color").value = region.color;
    document.getElementById("region-line-width").value = region.lineWidth;
    document.getElementById("region-fill-color").value = region.fillColor;
    document.getElementById("region-fill-enabled").checked = region.fillEnabled;
  }

  function addObject() {
    if (mapsModule.getCurrentMapIndex() === -1) return;
    showModal("objects-list");
  }

  function addObjectItem() {
    if (mapsModule.getCurrentMapIndex() === -1) return;

    const objectName = document.getElementById("object-name").value.trim();
    const x = parseFloat(document.getElementById("object-x").value);
    const y = parseFloat(document.getElementById("object-y").value);
    const description = document
      .getElementById("object-description")
      .value.trim();

    if (objectName && !isNaN(x) && !isNaN(y)) {
      mapsModule.maps[mapsModule.getCurrentMapIndex()].objects.push({
        name: objectName,
        x,
        y,
        description,
        color: "#ff0000",
      });
      mapsModule.saveMaps();
      renderObjects();
      drawing.renderMap(mapsModule.maps[mapsModule.getCurrentMapIndex()]);
      document.getElementById("object-name").value = "";
      document.getElementById("object-x").value = "";
      document.getElementById("object-y").value = "";
      document.getElementById("object-description").value = "";
    } else {
      alert("Заполните все поля объекта (имя, координаты - числа).");
    }
  }

  function renderObjects() {
    if (mapsModule.getCurrentMapIndex() === -1) {
      document.getElementById("objects").innerHTML = "";
      return;
    }
    const objectsList = document.getElementById("objects");
    objectsList.innerHTML = "";
    const objects = mapsModule.maps[mapsModule.getCurrentMapIndex()].objects;
    if (!objects) return;
    objects.forEach((object, index) => {
      const listItem = document.createElement("li");
      listItem.textContent = object.name;
      listItem.addEventListener("click", () => handleObjectClick(index));
      objectsList.appendChild(listItem);
      listItem.classList.remove("selected");
      if (index === mapsModule.getSelectedObjectIndex()) {
        listItem.classList.add("selected");
      }
    });
  }

  function updateObject() {
    if (
      mapsModule.getCurrentMapIndex() === -1 ||
      mapsModule.getSelectedObjectIndex() === -1
    )
      return;

    const object =
      mapsModule.maps[mapsModule.getCurrentMapIndex()].objects[
        mapsModule.getSelectedObjectIndex()
      ];

    const newName = document.getElementById("edit-object-name").value.trim();
    const newX = parseFloat(document.getElementById("edit-object-x").value);
    const newY = parseFloat(document.getElementById("edit-object-y").value);
    const newDescription = document
      .getElementById("edit-object-description")
      .value.trim();
    const newColor = document.getElementById("edit-object-color").value;

    if (newName && !isNaN(newX) && !isNaN(newY)) {
      object.name = newName;
      object.x = newX;
      object.y = newY;
      object.description = newDescription;
      object.color = newColor;
      object.imageUrl = document
        .getElementById("edit-object-image-url")
        .value.trim();

      mapsModule.saveMaps();
      renderObjects();
      drawing.renderMap(mapsModule.maps[mapsModule.getCurrentMapIndex()]);
      closeModal("edit-object-modal");
    } else {
      alert("Пожалуйста, заполните все поля корректно.");
    }
  }

  function deleteObject() {
    if (
      mapsModule.getCurrentMapIndex() === -1 ||
      mapsModule.getSelectedObjectIndex() === -1
    )
      return;
    mapsModule.maps[mapsModule.getCurrentMapIndex()].objects.splice(
      mapsModule.getSelectedObjectIndex(),
      1
    );
    mapsModule.saveMaps();
    renderObjects();
    drawing.renderMap(mapsModule.maps[mapsModule.getCurrentMapIndex()]);
  }

  function handleObjectClick(index) {
    if (mapsModule.getCurrentMapIndex() === -1) return;

    mapsModule.selectObject(mapsModule.getCurrentMapIndex(), index);
    const object =
      mapsModule.maps[mapsModule.getCurrentMapIndex()].objects[index];

    document.getElementById("edit-object-name").value = object.name;
    document.getElementById("edit-object-x").value = object.x;
    document.getElementById("edit-object-y").value = object.y;
    document.getElementById("edit-object-description").value =
      object.description;
    document.getElementById("edit-object-color").value = object.color;
    document.getElementById("edit-object-image-url").value =
      object.imageUrl || "";

    showModal("edit-object-modal");
    updateObjectButtons();
  }

  function updateObjectButtons() {
    if (
      mapsModule.getCurrentMapIndex() === -1 ||
      mapsModule.getSelectedObjectIndex() === -1
    ) {
      document.getElementById("delete-object-button").disabled = true;
      return;
    }
    document.getElementById("delete-object-button").disabled = false;
  }

  init();
});
