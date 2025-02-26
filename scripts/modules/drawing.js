import * as mapsModule from "./maps.js";

let svg;
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let startDragX = 0;
let startDragY = 0;
let initialViewBox = null;
let mouseDownInfo = {
  x: null,
  y: null,
  object: null,
};

const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "text");
tooltip.setAttribute("visibility", "hidden");
tooltip.setAttribute("pointer-events", "none");
tooltip.setAttribute("font-family", "sans-serif");
tooltip.setAttribute("font-size", "12px");
tooltip.setAttribute("text-anchor", "middle");
tooltip.setAttribute("fill", "var(--primary-color)");

export function getScale() {
  return scale;
}

export function getOffsetX() {
  return offsetX;
}

export function getOffsetY() {
  return offsetY;
}

export function getInitialViewBox() {
  return initialViewBox;
}

export function setupCanvas(svgElement) {
  svg = svgElement;

  svg.addEventListener("mousedown", handleMouseDown);
  svg.addEventListener("mousemove", handleMouseMove);
  svg.addEventListener("mouseup", handleMouseUp);
  svg.addEventListener("wheel", handleWheel);
  svg.addEventListener("contextmenu", preventContextMenu);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.appendChild(tooltip);
}

export function renderMap(mapData) {
  if (!mapData) return;

  clearCanvas();

  const regions = mapData.regions || [];
  regions.forEach((region) => drawRegion(region));

  const objects = mapData.objects || [];
  objects.forEach((object, index) => drawObject(object, index));

  const viewBox = calculateViewBox(mapData);
  if (initialViewBox === null) {
    initialViewBox = viewBox;
  }
  setViewBox(viewBox.x, viewBox.y, viewBox.width, viewBox.height);
  applyTransform();
}

export function clearCanvas() {
  const paths = svg.querySelectorAll("path");
  paths.forEach((path) => path.remove());
  const circles = svg.querySelectorAll("circle");
  circles.forEach((circle) => circle.remove());
  const texts = svg.querySelectorAll("text");
  texts.forEach((text) => text.remove());
  const groups = svg.querySelectorAll("g");
  groups.forEach((group) => group.remove());
}

function drawRegion(region) {
  if (!region || region.vertices.length < 3) return;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

  let d = `M ${region.vertices[0].x},${region.vertices[0].y} `;
  for (let i = 1; i < region.vertices.length; i++) {
    d += `L ${region.vertices[i].x},${region.vertices[i].y} `;
  }
  d += "Z";

  path.setAttribute("d", d);
  path.setAttribute("stroke", region.color);
  path.setAttribute("stroke-width", region.lineWidth);

  if (region.fillEnabled) {
    path.setAttribute("fill", region.fillColor);
  } else {
    path.setAttribute("fill", "none");
  }

  svg.appendChild(path);
}

function drawObject(object, index) {
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", object.x);
  text.setAttribute("y", object.y - 10);
  text.setAttribute("fill", "var(--primary-color)");
  text.setAttribute("font-size", "12px");
  text.setAttribute("font-family", "sans-serif");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("pointer-events", "none");
  text.setAttribute("visibility", "hidden");
  text.textContent = `${object.name}\n(${object.x}, ${object.y})`;
  text.setAttribute("class", `object-label-${index}`);
  group.appendChild(text);

  if (object.imageUrl) {
    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );
    image.setAttribute("x", object.x - 25);
    image.setAttribute("y", object.y - 25);
    image.setAttribute("width", 50);
    image.setAttribute("height", 50);
    image.setAttribute("href", object.imageUrl);

    image.addEventListener("mouseover", () => {
      text.setAttribute("visibility", "visible");
    });
    image.addEventListener("mouseout", () => {
      text.setAttribute("visibility", "hidden");
    });

    group.appendChild(image);
  } else {
    const invisibleCircle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    invisibleCircle.setAttribute("cx", object.x);
    invisibleCircle.setAttribute("cy", object.y);
    invisibleCircle.setAttribute("r", 15);
    invisibleCircle.setAttribute("fill", "none");
    invisibleCircle.setAttribute("stroke", "none");
    invisibleCircle.setAttribute("pointer-events", "all");

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", object.x);
    circle.setAttribute("cy", object.y);
    circle.setAttribute("r", 5);
    circle.setAttribute("fill", object.color);

    invisibleCircle.addEventListener("mouseover", () => {
      text.setAttribute("visibility", "visible");
    });
    invisibleCircle.addEventListener("mouseout", () => {
      text.setAttribute("visibility", "hidden");
    });

    group.appendChild(invisibleCircle);
    group.appendChild(circle);
  }

  svg.appendChild(group);
}

function calculateViewBox(mapData) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  if (mapData.regions) {
    mapData.regions.forEach((region) => {
      region.vertices.forEach((vertex) => {
        minX = Math.min(minX, vertex.x);
        minY = Math.min(minY, vertex.y);
        maxX = Math.max(maxX, vertex.x);
        maxY = Math.max(maxY, vertex.y);
      });
    });
  }

  if (mapData.objects) {
    mapData.objects.forEach((object) => {
      minX = Math.min(minX, object.x);
      minY = Math.min(minY, object.y);
      maxX = Math.max(maxX, object.x);
      maxY = Math.max(maxY, object.y);
    });
  }
  if (minX === Infinity) {
    return { x: -100, y: -100, width: 200, height: 200 };
  }

  const padding = 20;
  const width = maxX - minX + 2 * padding;
  const height = maxY - minY + 2 * padding;
  const x = minX - padding;
  const y = minY - padding;

  return { x, y, width, height };
}

function setViewBox(x, y, width, height) {
  svg.setAttribute("viewBox", `${x} ${y} ${width} ${height}`);
}

function applyTransform() {
  if (!initialViewBox) return;

  const newX = initialViewBox.x - offsetX;
  const newY = initialViewBox.y - offsetY;
  const newWidth = initialViewBox.width / scale;
  const newHeight = initialViewBox.height / scale;

  setViewBox(newX, newY, newWidth, newHeight);
}

function handleMouseDown(event) {
  console.log("handleMouseDown triggered");
  isDragging = true;
  startDragX = event.clientX;
  startDragY = event.clientY;
  svg.style.cursor = "grabbing";

  const rect = svg.getBoundingClientRect();
  mouseDownInfo.x =
    (event.clientX - rect.left) / scale + initialViewBox.x - offsetX / scale;
  mouseDownInfo.y =
    (event.clientY - rect.top) / scale + initialViewBox.y - offsetY / scale;

  console.log("Mouse down coordinates:", mouseDownInfo.x, mouseDownInfo.y);
  console.log("Scale, OffsetX, OffsetY:", scale, offsetX, offsetY);

  let closestObject = null;
  let minDistance = Infinity;
  const detectionRadius = 15 / scale;
  const currentMap = mapsModule.maps[mapsModule.getCurrentMapIndex()];

  if (currentMap?.objects) {
    for (const [index, object] of currentMap.objects.entries()) {
      const distance = Math.sqrt(
        (mouseDownInfo.x - object.x) ** 2 + (mouseDownInfo.y - object.y) ** 2
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestObject = { ...object, index };
      }
    }
  }
  if (closestObject && minDistance <= detectionRadius) {
    mouseDownInfo.object = closestObject;
    console.log("Closest object found on mousedown:", mouseDownInfo.object);
  } else {
    mouseDownInfo.object = null;
    console.log("No object found on mousedown");
  }
}

function handleMouseMove(event) {
  if (!initialViewBox) return;

  const rect = svg.getBoundingClientRect();
  const mouseX =
    (event.clientX - rect.left) / scale + initialViewBox.x - offsetX / scale;
  const mouseY =
    (event.clientY - rect.top) / scale + initialViewBox.y - offsetY / scale;

  if (isDragging) {
    const scaleFactor = (initialViewBox.width / (rect.width * scale)) * 2;
    const deltaX = (event.clientX - startDragX) * scaleFactor;
    const deltaY = (event.clientY - startDragY) * scaleFactor;

    offsetX += deltaX;
    offsetY += deltaY;

    applyTransform();

    startDragX = event.clientX;
    startDragY = event.clientY;
    return;
  }

  let closestObject = null;
  let minDistance = Infinity;
  const detectionRadius = 15 / scale;
  const currentMap = mapsModule.maps[mapsModule.getCurrentMapIndex()];

  if (currentMap?.objects) {
    for (const [index, object] of currentMap.objects.entries()) {
      const distance = Math.sqrt(
        (mouseX - object.x) ** 2 + (mouseY - object.y) ** 2
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestObject = { ...object, index };
      }
    }
  }
}

function handleMouseUp(event) {
  console.log("handleMouseUp triggered");
  if (isDragging) {
    isDragging = false;
    svg.style.cursor = "grab";

    if (mouseDownInfo.object) {
      console.log(
        "MouseUp: Object was present on MouseDown",
        mouseDownInfo.object
      );
      const rect = svg.getBoundingClientRect();
      const mouseUpX =
        (event.clientX - rect.left) / scale +
        initialViewBox.x -
        offsetX / scale;
      const mouseUpY =
        (event.clientY - rect.top) / scale + initialViewBox.y - offsetY / scale;

      const distance = Math.sqrt(
        (mouseDownInfo.x - mouseUpX) ** 2 + (mouseDownInfo.y - mouseUpY) ** 2
      );
      const detectionRadius = 15 / scale;

      if (distance <= detectionRadius) {
        console.log(
          "Dispatching objectClicked event for index:",
          mouseDownInfo.object.index
        );
        const objectClickEvent = new CustomEvent("objectClicked", {
          detail: mouseDownInfo.object.index,
        });
        document.dispatchEvent(objectClickEvent);
      } else {
        console.log(
          "MouseUp: Distance exceeded detection radius",
          distance,
          detectionRadius
        );
      }
    } else {
      console.log("MouseUp: No object was present on MouseDown");
    }
  }
  mouseDownInfo.x = null;
  mouseDownInfo.y = null;
  mouseDownInfo.object = null;
}

function handleWheel(event) {
  event.preventDefault();

  const delta = event.deltaY > 0 ? -0.1 : 0.1;
  const newScale = scale + delta;

  if (newScale <= 0) return;

  const rect = svg.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const currentViewBox = svg.viewBox.baseVal;
  const cursorX = currentViewBox.x + (x / rect.width) * currentViewBox.width;
  const cursorY = currentViewBox.y + (y / rect.height) * currentViewBox.height;

  const newWidth = initialViewBox.width / newScale;
  const newHeight = initialViewBox.height / newScale;

  const newX = cursorX - (x / rect.width) * newWidth;
  const newY = cursorY - (y / rect.height) * newHeight;

  offsetX = initialViewBox.x - newX;
  offsetY = initialViewBox.y - newY;

  scale = newScale;
  applyTransform();
}

function preventContextMenu(event) {
  event.preventDefault();
}
