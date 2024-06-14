import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let nclScreen = vscode.commands.registerCommand('nclScreen.start', () => {
    startNCLScreenWebview(context);
  });

  let generateRegion = vscode.commands.registerCommand(
    'nclScreen.generateRegion',
    () => {
      vscode.window.showInformationMessage('Generate Region command executed');
      // Adicione aqui a lógica para gerar uma nova região
    },
  );

  context.subscriptions.push(nclScreen);
  context.subscriptions.push(generateRegion);
}
function startNCLScreenWebview(context: vscode.ExtensionContext) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage('Nenhum arquivo aberto.');
    return;
  }

  const document = editor.document;
  const fileContent = document.getText();

  const panel = vscode.window.createWebviewPanel(
    'nclScreen',
    'NCL Screen',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    },
  );

  panel.webview.html = getWebviewContent(fileContent);
  panel.webview.onDidReceiveMessage(
    async message => {
      switch (message.command) {
        case 'updatePositions':
        case 'saveFile':
          await saveFile(document.uri, message.text, message.regions);
          break;
      }
    },
    undefined,
    context.subscriptions,
  );
}

// 1 caso de uso
// quando eu abrir o documento, se não houver regionBase, cria a regionBase com uma região parent (100%, 100%)
// se houver regionBase e não existirem regiões, criar uma região parent (100%, 100%)
// qualquer outro caso, não fazer nada

// 2 caso de uso
// Se já houver região, preciso conseguir adicionar novas regiões e atualizar o arquivo NCL.
// Se eu clicar com o CTRL pressionado, devo criar uma nova região com o tamanho que eu arrastar, mesmo que seja
// dentro de outra região.
// Se eu clicar com o ALT pressionado, devo deletar a região clicada.
// Se eu clicar e arrastar, devo mover a região clicada

async function saveFile(uri: vscode.Uri, text: string, regions: any) {
    console.log('Saving file with content:', regions); // Log de salvamento de arquivo
    if (Array.isArray(regions)) {
      let newContent = text;
      if (regions.length === 0) {
        const parentRegion = `<region id="parentRegion" width="100%" height="100%" left="0%" top="0%" zIndex="0"></region>`;
        newContent = newContent.replace(
          '</regionBase>',
          `  ${parentRegion}\n</regionBase>`,
        );
      }
  
      // Extract regions from text
      const regionsAux = newContent.match(/<region id="[^"]*"[^>]*\/?>/g);
      console.log('Regions:', regionsAux);
  
      regionsAux?.forEach((regionTag: string) => {
        // Extract region id
        const regionIdMatch = regionTag.match(/id="([^"]*)"/);
        if (!regionIdMatch) {
          return;
        }
  
        const regionId = regionIdMatch[1];
        const region = regions.find((r: any) => r.id === regionId);
        if (!region) {
          return;
        }
  
        // Ensure values are within 0% to 100%
        const left = Math.max(0, Math.min(100, region.left));
        const top = Math.max(0, Math.min(100, region.top));
        const width = Math.max(0, Math.min(100, region.width));
        const height = Math.max(0, Math.min(100, region.height));
        const zIndex = region.zIndex !== undefined ? region.zIndex : 0;
  
        // Create a new region tag with updated positions
        let newRegionTag = regionTag
          .replace(/left="[^"]*"/, `left="${left}%"`)
          .replace(/top="[^"]*"/, `top="${top}%"`)
          .replace(/width="[^"]*"/, `width="${width}%"`)
          .replace(/height="[^"]*"/, `height="${height}%"`)
          .replace(/zIndex="[^"]*"/, `zIndex="${zIndex}"`);
  
        // If the attributes do not exist, add them
        if (!newRegionTag.includes('left=')) {
          newRegionTag = newRegionTag.replace(/>/, ` left="${left}%" >`);
        }
        if (!newRegionTag.includes('top=')) {
          newRegionTag = newRegionTag.replace(/>/, ` top="${top}%" >`);
        }
        if (!newRegionTag.includes('width=')) {
          newRegionTag = newRegionTag.replace(/>/, ` width="${width}%" >`);
        }
        if (!newRegionTag.includes('height=')) {
          newRegionTag = newRegionTag.replace(/>/, ` height="${height}%" >`);
        }
        if (!newRegionTag.includes('zIndex=')) {
          newRegionTag = newRegionTag.replace(/>/, ` zIndex="${zIndex}" >`);
        }
  
        newRegionTag = newRegionTag.replace(/ +\/?>/, ' />');
  
        newContent = newContent.replace(regionTag, newRegionTag);
      });
  
      await vscode.workspace.fs.writeFile(uri, Buffer.from(newContent, 'utf8'));
    } else {
      console.error('Regions data is not an array:', regions);
    }
  }
  
  
  

function getWebviewContent(fileContent: string): string {
  return `
      <!DOCTYPE html>
      <html lang="pt">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Parser NCL para HTML</title>
          <style>
          #fileInput {
              position: relative;
              z-index: 10;
          }
  
          body, html {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
              user-select: none;
          }
  
          #mainRegion {
              display: flex;
              justify-content: center;
              align-items: center;
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              margin: auto;
          }
  
          #regionContainer {
              position: relative;
              width: 100%;
              height: 100%;
              overflow: hidden;
              background-color: #f0f0f0;
              margin: auto;
          }
  
          .region, .div-criada {
              position: absolute;
              overflow: hidden;
              background-color: rgba(0, 0, 255, 0.2);
              border-radius: 8px;
              color: white;
              text-align: center;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              text-shadow: 1px 1px 2px black;
              z-index: 1;
              user-select: none;
              max-width: 100%;
              max-height: 100%;
              min-width: 20px;
              min-height: 20px;
          }
  
          .region.resizing, .div-criada.resizing {
              cursor: se-resize;
          }
  
          .resize-handle {
              position: absolute;
              width: 10px;
              height: 10px;
              background-color: #fff;
              border: 1px solid #000;
              z-index: 2;
          }
  
          .resize-handle.se {
              bottom: 0;
              right: 0;
              cursor: se-resize;
          }
  
          .media {
              border: 1px solid #444;
              background-color: #eaeaea;
              padding: 5px;
              text-align: center;
              overflow: hidden;
              resize: both;
              z-index: 2;
          }
  
          #exportButton, #exportCSSButton {
              position: relative;
              z-index: 10;
              margin-top: 10px;
              padding: 10px 20px;
              border: none;
              background-color: #4CAF50;
              color: white;
              font-size: 16px;
              cursor: pointer;
              border-radius: 5px;
          }
  
          .fileInput-button {
              position: relative;
              z-index: 10;
              margin-top: 10px;
              padding: 10px 20px;
              border: none;
              background-color: #4CAF50;
              color: white;
              font-size: 16px;
              cursor: pointer;
              border-radius: 5px;
          }
  
          #container {
              width: 100%;
              height: 100%;
              border: 2px dashed #ccc;
              position: relative;
              overflow: auto;
          }
  
          #legend {
              position: fixed;
              bottom: 50px;
              right: 10px;
              padding: 10px;
              background-color: #494d54;
              border: 1px solid #ccc;
              border-radius: 5px;
              box-shadow: 1px 1px 5px #ccc;
              z-index: 100;
          }
  
          #zIndexMonitor {
              position: fixed;
              bottom: 10px;
              right: 10px;
              padding: 10px;
              background-color: #333;
              color: #fff;
              border-radius: 5px;
              border: 1px solid #ccc;
              box-shadow: 1px 1px 5px #ccc;
              z-index: 100;
          }
  
          #parentRegionSelect {
              position: fixed;
              top: 10px;
              right: 10px;
              z-index: 10;
              padding: 10px;
              background-color: #fff;
              border: 1px solid #ccc;
              border-radius: 5px;
          }
  
          .region.non-active {
              cursor: default !important;
          }
  
          .region.active {
              cursor: move !important;
          }
          </style>
      </head>
      <body>
          <div id="mainRegion">
          <select id="parentRegionSelect">
          <option value="">None (Top Level)</option>

          </select>
              <div id="regionContainer"></div>
              <div id="legend">
                  <strong>Legend:</strong>
                  CTRL + Click to create a region, ALT + Click to delete a region, Click and drag to move a region.
                  Scroll to change the z-index.
                  </div>
          </div>
          <div id="container"></div> 
  
          <div id="zIndexMonitor">Current z-index: 1</div>
          
          <script>
              const vscode = acquireVsCodeApi();
              const container = document.getElementById("container");
              const zIndexMonitor = document.getElementById("zIndexMonitor");
              const parentRegionSelect = document.getElementById("parentRegionSelect");
              const firstRegion = document.querySelector('.region');
              if (firstRegion) {
                    parentRegionSelect.value = firstRegion.id;
              }
              let isDragging = false;
              let novaDiv = null;
              let draggedDiv = null;
              let startX, startY;
              let count = 0;
              let ctrlPressed = false;
              let altPressed = false;
              let currentZIndex = 1;
  
              function randomColor() {
                  const r = Math.floor(Math.random() * 256);
                  const g = Math.floor(Math.random() * 256);
                  const b = Math.floor(Math.random() * 256);
                  return "rgba(" + r + ", " + g + ", " + b + ", 0.7)";
              }
  
              document.addEventListener("keydown", function(e) {
                  if (e.ctrlKey) {
                      ctrlPressed = true;

                        document.querySelectorAll('.region').forEach(region => {
                            region.classList.remove('active');
                            region.classList.add('non-active');
                        });
                        
                  }
                  if (e.altKey) {
                      altPressed = true;
                  }
                  updateCursorStyles();
              });
  
              document.addEventListener("keyup", function(e) {
                  if (e.key === "Control") {
                      ctrlPressed = false;
                  }
                  if (e.key === "Alt") {
                      altPressed = false;
                  }
                  updateCursorStyles();
              });
              

            function removeRegionFromXML(regionId) {
                const regionElement = xmlDoc.getElementById(regionId);
                if (regionElement) {
                    console.log('Removing region:', regionElement.id);
                    regionElement.parentElement.removeChild(regionElement);
                    sendUpdatedPositions();
                }
            }
              document.addEventListener("mousedown", function (e) {
                if (altPressed && (e.target.classList.contains("region") || e.target.classList.contains("div-criada"))) {
                    const regionId = e.target.id;
                    e.target.remove();
                    removeRegionFromXML(regionId);
                    updateParentRegionSelect();
                    console.log('Region deleted:', regionId);
                    return;
                } else if (ctrlPressed && !altPressed) {
                    const countAllDivs = document.querySelectorAll('.region').length + 1;
                    isDragging = true;
            
                    const parentDivId = parentRegionSelect.value || 'parentRegion'; // Default to 'parentRegion' if no selection
                    const target = document.getElementById(parentDivId) || regionContainer; // Fallback to regionContainer
                    const parentRect = target.getBoundingClientRect();
                    startX = e.clientX - parentRect.left;
                    startY = e.clientY - parentRect.top;
                    count++;
                    console.log('Creating new region:', countAllDivs);
                    novaDiv = document.createElement("div");
                    novaDiv.className = "region active";
                    novaDiv.style.left = startX + "px";
                    novaDiv.style.top = startY + "px";
                    novaDiv.style.backgroundColor = randomColor();
                    novaDiv.style.zIndex = currentZIndex;
                    novaDiv.id = "region_" + countAllDivs;
                    novaDiv.textContent = "Region " + countAllDivs;
            
                    target.appendChild(novaDiv);
                    addDraggable(novaDiv);
                    addResizable(novaDiv);
            
                    function onMouseMove(e) {
                        const currentX = e.clientX - parentRect.left;
                        const currentY = e.clientY - parentRect.top;
                        const width = Math.abs(currentX - startX);
                        const height = Math.abs(currentY - startY);
                        novaDiv.style.width = width + "px";
                        novaDiv.style.height = height + "px";
                        novaDiv.style.left = Math.min(startX, currentX) + "px";
                        novaDiv.style.top = Math.min(startY, currentY) + "px";
                    }
            
                    function onMouseUp() {
                        document.removeEventListener("mousemove", onMouseMove);
                        document.removeEventListener("mouseup", onMouseUp);
                        sendUpdatedPositions();
            
                        const left = (parseInt(novaDiv.style.left) / parentRect.width * 100).toFixed(2) + '%';
                        const top = (parseInt(novaDiv.style.top) / parentRect.height * 100).toFixed(2) + '%';
                        const width = (parseInt(novaDiv.style.width) / parentRect.width * 100).toFixed(2) + '%';
                        const height = (parseInt(novaDiv.style.height) / parentRect.height * 100).toFixed(2) + '%';
            
                        addRegionToXML(novaDiv.id, left, top, width, height, currentZIndex, parentDivId);
                    }
            
                    document.addEventListener("mousemove", onMouseMove);
                    document.addEventListener("mouseup", onMouseUp);
                } else if (e.target.classList.contains("region") || e.target.classList.contains("div-criada") && !altPressed) {
                    isDragging = true;
                    draggedDiv = e.target;
                    const rect = draggedDiv.getBoundingClientRect();
                    startX = e.clientX - rect.left;
                    startY = e.clientY - rect.top;
                    console.log('Dragging region:', draggedDiv.id);
                } 
            });
  
              parentRegionSelect.addEventListener('change', function () {
                  const selectedId = parentRegionSelect.value;
                  document.querySelectorAll('.region').forEach(region => {
                      if (region.id === selectedId) {
                          region.classList.add('active');
                          region.classList.remove('non-active');
                      } else {
                          region.classList.remove('active');
                          region.classList.add('non-active');
                      }
                  });
              });
  
              container.addEventListener("mousemove", function (e) {
                  if (isDragging ) {
                      if (novaDiv) {
                          const parentDivId = parentRegionSelect.value;
                          const parentDiv = parentDivId ? document.getElementById(parentDivId) : container;
                          const parentRect = parentDiv.getBoundingClientRect();
                          const currentX = e.clientX - parentRect.left;
                          const currentY = e.clientY - parentRect.top;
                          const width = Math.abs(currentX - startX);
                          const height = Math.abs(currentY - startY);
                          novaDiv.style.width = width + "px";
                          novaDiv.style.height = height + "px";
                          novaDiv.style.left = Math.min(startX, currentX) + "px";
                          novaDiv.style.top = Math.min(startY, currentY) + "px";
                      } else if (draggedDiv) {
                          const parentDiv = draggedDiv.parentElement;
                          const parentRect = parentDiv.getBoundingClientRect();
                          let newLeft = e.clientX - parentRect.left - startX;
                          let newTop = e.clientY - parentRect.top - startY;
                          
                          if (newLeft < 0) newLeft = 0;
                          if (newTop < 0) newTop = 0;
                          if (newLeft + draggedDiv.offsetWidth > parentRect.width) newLeft = parentRect.width - draggedDiv.offsetWidth;
                          if (newTop + draggedDiv.offsetHeight > parentRect.height) newTop = parentRect.height - draggedDiv.offsetHeight;
  
                          draggedDiv.style.left = newLeft + "px";
                          draggedDiv.style.top = newTop + "px";
                      }
                  }
              });
  
              container.addEventListener("mouseup", function () {
                  isDragging = false;
                  novaDiv = null;
                  draggedDiv = null;
                  sendUpdatedPositions();
              });
  
              document.addEventListener("wheel", function (e) {
                  if (e.deltaY < 0) {
                      currentZIndex++;
                  } else {
                      currentZIndex = Math.max(0, currentZIndex - 1);
                  }
                  zIndexMonitor.textContent = "Current z-index: " + currentZIndex;
                  updateCursorStyles();
              });
  
              function updateCursorStyles() {
                  document.querySelectorAll('.region').forEach(region => {
                      if (ctrlPressed) {
                          region.classList.remove('active');
                          region.classList.add('non-active');
                      } else if (parseInt(region.style.zIndex, 10) === currentZIndex) {
                          region.classList.add('active');
                          region.classList.remove('non-active');
                      } else {
                          region.classList.add('non-active');
                          region.classList.remove('active');
                      }
                  });
              }
  
              function addDraggable(element) {
                let offsetX, offsetY;
                let initialLeft, initialTop;
            
                element.onmousedown = function (event) {
                    if (parseInt(element.style.zIndex, 10) !== currentZIndex || ctrlPressed || altPressed) return;
            
                    event.preventDefault();
                    event.stopPropagation();
            
                    const rect = element.getBoundingClientRect();
                    offsetX = event.clientX - rect.left;
                    offsetY = event.clientY - rect.top;
            
                    initialLeft = element.style.left;
                    initialTop = element.style.top;
            
                    function onMouseMove(event) {
                        let newLeft = event.clientX - offsetX;
                        let newTop = event.clientY - offsetY;
            
                        // Ensure the element stays within the container bounds
                        const parent = element.parentElement;
                        const parentRect = parent.getBoundingClientRect();
                        const elementRect = element.getBoundingClientRect();
            
                        if (newLeft < 0) {
                            newLeft = 0;
                        } else if (newLeft + elementRect.width > parentRect.width) {
                            newLeft = parentRect.width - elementRect.width;
                        }
            
                        if (newTop < 0) {
                            newTop = 0;
                        } else if (newTop + elementRect.height > parentRect.height) {
                            newTop = parentRect.height - elementRect.height;
                        }
            
                        element.style.left = newLeft + 'px';
                        element.style.top = newTop + 'px';
                    }
            
                    function onMouseUp() {
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
            
                        // Only update positions if they have changed
                        if (element.style.left !== initialLeft || element.style.top !== initialTop) {
                            sendUpdatedPositions();
                        }
                    }
            
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                };
            }
              
              function addResizable(element) {
                  const resizeHandle = document.createElement('div');
                  resizeHandle.className = 'resize-handle se';
                  element.appendChild(resizeHandle);
              
                  resizeHandle.onmousedown = function(event) {
                      if (parseInt(element.style.zIndex, 10) !== currentZIndex || ctrlPressed) return;
              
                      event.preventDefault();
                      event.stopPropagation();
              
                      const initialWidth = element.getBoundingClientRect().width;
                      const initialHeight = element.getBoundingClientRect().height;
                      const initialX = event.clientX;
                      const initialY = event.clientY;
              
                      function onMouseMove(event) {
                          let newWidth = initialWidth + (event.clientX - initialX);
                          let newHeight = initialHeight + (event.clientY - initialY);
              
                          // Ensure values are within the valid range
                          newWidth = Math.max(20, Math.min(element.parentElement.getBoundingClientRect().width, newWidth));
                          newHeight = Math.max(20, Math.min(element.parentElement.getBoundingClientRect().height, newHeight));
              
                          element.style.width = newWidth + 'px';
                          element.style.height = newHeight + 'px';
                      }
              
                      function onMouseUp() {
                          document.removeEventListener('mousemove', onMouseMove);
                          document.removeEventListener('mouseup', onMouseUp);
                          sendUpdatedPositions();
                      }
              
                      document.addEventListener('mousemove', onMouseMove);
                      document.addEventListener('mouseup', onMouseUp);
                  };
              }
  
              function sendUpdatedPositions() {
                  const regions = Array.from(document.querySelectorAll('div.region, div.div-criada')).map(div => {
                      const parentRect = div.parentElement.getBoundingClientRect();
                      const divRect = div.getBoundingClientRect();
                      let left = ((divRect.left - parentRect.left) / parentRect.width * 100).toFixed(2);
                      let top = ((divRect.top - parentRect.top) / parentRect.height * 100).toFixed(2);
                      let width = (divRect.width / parentRect.width * 100).toFixed(2);
                      let height = (divRect.height / parentRect.height * 100).toFixed(2);
              
                      // Ensure values are within the valid range
                      left = Math.max(0, Math.min(100, left));
                      top = Math.max(0, Math.min(100, top));
                      width = Math.max(0, Math.min(100, width));
                      height = Math.max(0, Math.min(100, height));
                      const zIndex = parseInt(div.style.zIndex, 10)
              
                      const region = {
                          id: div.id,
                          left,
                          top,
                          width,
                          height,
                          zIndex
                      };
                      console.log('Updated region:', region);                    
                      return region;
                  });


                let updatedNCL = updateNCLPositions(xmlDoc, regions);

                updatedNCL = updatedNCL.replace(/^(.*)$/gm, (line) => {
                    // Remove o xmlns das linhas que não contêm o nó ncl
                    if (!line.includes('<ncl')) {
                        return line.replace(/xmlns="[^"]*"/g, '');
                    }
                    return line;
                });

                
                  vscode.postMessage({
                      command: 'saveFile',
                      text: updatedNCL,
                      regions: regions
                  });
              }
  
              function updateNCLPositions(xmlDoc, updatedRegions) {
                  updatedRegions.forEach(region => {
                      let regionElement = xmlDoc.getElementById(region.id);
  
                      if (!regionElement) {
                          regionElement = xmlDoc.createElement('region');
                          regionElement.setAttribute('id', region.id);
                          xmlDoc.querySelector('regionBase').appendChild(regionElement);
                      }
  
                      const left = region.left;
                      const top = region.top;
                      const width = region.width;
                      const height = region.height;
                      const zIndex = region.zIndex;
  
                      updateProperty(regionElement, 'left', left + '%');
                      updateProperty(regionElement, 'top', top + '%');
                      updateProperty(regionElement, 'width', width + '%');
                      updateProperty(regionElement, 'height', height + '%');
                        updateProperty(regionElement, 'zIndex', zIndex);
                      xmlDoc.querySelectorAll('*').forEach(node => node.removeAttribute('xmlns'));
                  });
                  return new XMLSerializer().serializeToString(xmlDoc);
              }
  
              function updateProperty(element, propName, value) {
                  element.setAttribute(propName, value);
              }
  
              function initializeLayout(regionBase) {
                  const regionContainer = document.getElementById('regionContainer');
                  regionContainer.innerHTML = '';
  
                  if (!regionBase) return;
                  createRegionsDynamically(regionBase, regionContainer);
                  updateParentRegionSelect();
              }
  
              function createRegionsDynamically(regionElement, parentDiv) {
                  const regions = regionElement.querySelectorAll('region');
                  regions.forEach(region => {
                      if (!document.getElementById(region.getAttribute('id'))) {  
                          const div = document.createElement('div');
                          div.id = region.getAttribute('id');
                          div.className = 'region';
  
                          div.style.width = region.getAttribute('width');
                          div.style.height = region.getAttribute('height');
                          div.style.position = 'absolute';
                          div.style.zIndex = region.getAttribute('zIndex') || 1;
                          div.textContent = region.getAttribute('id');
  
                          div.style.left = region.getAttribute('left');
                          div.style.top = region.getAttribute('top');
  
                          div.style.border = '1px solid black';
                          div.style.backgroundColor = 'rgba(100, 100, 250, 0.5)';
  
                          parentDiv.appendChild(div);
                          addDraggable(div);
                          addResizable(div);
  
                          if (region.children.length > 0) {
                              createRegionsDynamically(region, div);
                          }
                      }
                  });
                  updateCursorStyles();
              }
  
              document.querySelectorAll('.region').forEach(region => {
                  addDraggable(region);
                  addResizable(region);
              });
  
              function addRegionToXML(id, left, top, width, height, zIndex, parentId) {
                  const parentRegion = parentId ? xmlDoc.getElementById(parentId) : xmlDoc.querySelector('regionBase');
                  if (parentRegion) {
                      const newRegion = xmlDoc.createElement('region');
                      newRegion.setAttribute('id', id);
                      newRegion.setAttribute('left', left);
                      newRegion.setAttribute('top', top);
                      newRegion.setAttribute('width', width);
                      newRegion.setAttribute('height', height);
                      newRegion.setAttribute('zIndex', zIndex);
                      parentRegion.appendChild(newRegion);
                  }
              }
  
              function updateParentRegionSelect() {
                  parentRegionSelect.innerHTML = '<option value="">None (Top Level)</option>';
                  document.querySelectorAll('.region').forEach(region => {
                      const option = document.createElement('option');
                      option.value = region.id;
                      option.textContent = region.id;
                      parentRegionSelect.appendChild(option);
                  });
              }
  
              window.addEventListener('message', event => {
                  const message = event.data;
                  console.log('Message received in WebView:', message);
  
                  if (message.command === 'getContent') {
                      sendUpdatedPositions();
                  }
              });
  
              let xmlDoc;
  
              try {
                  const nclString = \`${fileContent}\`;
                  const parser = new DOMParser();
                  xmlDoc = parser.parseFromString(nclString, "application/xml");
  
                  if (xmlDoc.getElementsByTagName("parsererror").length) {
                      throw new Error("Erro de parsing do NCL.");
                  }
  
                  initializeLayout(xmlDoc.querySelector('regionBase'));
              } catch (error) {
                  console.error("Erro no parsing do NCL: ", error.message);
              }
          </script>
      </body>
      </html>
    `;
}
