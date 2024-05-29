import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let nclScreen = vscode.commands.registerCommand('nclScreen.start', () => {
    startNCLScreenWebview(context);
  });

  let generateRegion = vscode.commands.registerCommand('nclScreen.generateRegion', () => {
    vscode.window.showInformationMessage('Generate Region command executed');
    // Adicione aqui a lógica para gerar uma nova região
  });

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
  const fileContent = document.getText(); // Obtém o conteúdo do arquivo atual

  const panel = vscode.window.createWebviewPanel(
    'nclScreen',
    'NCL Screen',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    },
  );

  panel.webview.html = getWebviewContent(fileContent); // Passa o conteúdo do arquivo para o Webview
  panel.webview.onDidReceiveMessage(
    async message => {
      console.log('Received message from WebView:', message); // Log recebido
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

async function saveFile(uri: vscode.Uri, text: string, regions: any) {
  console.log('Saving file with content:', regions); // Log de salvamento de arquivo

  if (Array.isArray(regions)) {
    // Parse the text and change regions with the new positions
    let newContent = text;

    // Extract regions from text
    const regionsAux = newContent.match(/<region id="[^"]*"[^>]*>/g);
    console.log('Regions:', regionsAux);

    regionsAux?.forEach((regionTag: string) => {
      // Extract region id
      const regionIdMatch = regionTag.match(/id="([^"]*)"/);
      if (!regionIdMatch) { return; }

      const regionId = regionIdMatch[1];
      const region = regions.find((r: any) => r.id === regionId);
      if (!region) { return; }

      // Create a new region tag with updated positions
      let newRegionTag = regionTag.replace(/left="[^"]*"/, `left="${region.left}%"`)
        .replace(/top="[^"]*"/, `top="${region.top}%"`)
        .replace(/width="[^"]*"/, `width="${region.width}%"`)
        .replace(/height="[^"]*"/, `height="${region.height}%"`);

      // If the attributes do not exist, add them
      if (!newRegionTag.includes('left=')) {
        newRegionTag = newRegionTag.replace('>', ` left="${region.left}%"`);
      }
      if (!newRegionTag.includes('top=')) {
        newRegionTag = newRegionTag.replace('>', ` top="${region.top}%"`);
      }
      if (!newRegionTag.includes('width=')) {
        newRegionTag = newRegionTag.replace('>', ` width="${region.width}%"`);
      }
      if (!newRegionTag.includes('height=')) {
        newRegionTag = newRegionTag.replace('>', ` height="${region.height}%"`);
      }

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
            }

            #mainRegion {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }

            #regionContainer {
                position: relative;
                width: 100%;
                height: 90%;
                overflow: auto;
                background-color: #f0f0f0;
            }

            
            .region, .div-criada {
                position: absolute;
                overflow: hidden;
                background-color: rgba(0, 0, 255, 0.2);
                border-radius: 8px;
                border: 1px solid #000;
                cursor: move;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                text-shadow: 1px 1px 2px black;
                z-index: 1;
                user-select: none;
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
                width: 100vw;
                height: 100vh;
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
            }
        </style>
    </head>
    <body>
        <div id="mainRegion">
            <div id="regionContainer"></div>
        </div>
        <div id="legend">
            <strong>Legend:</strong>
            CTRL + Click to create a region, ALT + Click to delete a region, Click and drag to move a region.
        </div>
        <div id="container"></div> <!-- Certifique-se de que o container exista -->

        <div id="zIndexMonitor">Current z-index: 1</div>
        
        <script>
            const vscode = acquireVsCodeApi();
            const container = document.getElementById("container");
            const zIndexMonitor = document.getElementById("zIndexMonitor");
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
                }
                if (e.altKey) {
                    altPressed = true;
                }
            });

            document.addEventListener("keyup", function(e) {
                if (e.key === "Control") {
                    ctrlPressed = false;
                }
                if (e.key === "Alt") {
                    altPressed = false;
                }
            });

            container.addEventListener("mousedown", function (e) {
                if (altPressed && (e.target.classList.contains("region") || e.target.classList.contains("div-criada"))) {
                    e.target.remove();
                    return;
                } else if (ctrlPressed) {
                    isDragging = true;
                    const rect = container.getBoundingClientRect();
                    startX = e.clientX - rect.left;
                    startY = e.clientY - rect.top;
                    count++;

                    novaDiv = document.createElement("div");
                    novaDiv.className = "region";
                    novaDiv.style.left = startX + "px";
                    novaDiv.style.top = startY + "px";
                    novaDiv.style.backgroundColor = randomColor();
                    novaDiv.style.zIndex = currentZIndex;
                    novaDiv.id = "region_" + count;
                    novaDiv.textContent = "Region " + count;

                    const parentDiv = e.target.classList.contains("region") ? e.target : container;
                    parentDiv.appendChild(novaDiv);
                    addDraggable(novaDiv);

                    addRegionToXML(novaDiv.id, '0%', '0%', '10%', '10%', currentZIndex);
                } else if (e.target.classList.contains("region") || e.target.classList.contains("div-criada")) {
                    isDragging = true;
                    draggedDiv = e.target;
                    const rect = draggedDiv.getBoundingClientRect();
                    startX = e.clientX - rect.left;
                    startY = e.clientY - rect.top;
                }
            });

            container.addEventListener("mousemove", function (e) {
                if (isDragging) {
                    if (novaDiv) {
                        const currentX = e.clientX - container.getBoundingClientRect().left;
                        const currentY = e.clientY - container.getBoundingClientRect().top;
                        const width = Math.abs(currentX - startX);
                        const height = Math.abs(currentY - startY);
                        novaDiv.style.width = width + "px";
                        novaDiv.style.height = height + "px";
                        novaDiv.style.left = Math.min(startX, currentX) + "px";
                        novaDiv.style.top = Math.min(startY, currentY) + "px";
                    } else if (draggedDiv) {
                        const rect = container.getBoundingClientRect();
                        draggedDiv.style.left = (e.clientX - rect.left - startX) + "px";
                        draggedDiv.style.top = (e.clientY - rect.top - startY) + "px";
                    }
                }
            });

            container.addEventListener("mouseup", function () {
                isDragging = false;
                novaDiv = null;
                draggedDiv = null;
                sendUpdatedPositions();
            });

            container.addEventListener("wheel", function (e) {
                if (e.deltaY < 0) {
                    currentZIndex++;
                } else {
                    currentZIndex = Math.max(0, currentZIndex - 1);
                }
                zIndexMonitor.textContent = "Current z-index: " + currentZIndex;
            });

            function addDraggable(element) {
                element.onmousedown = function (event) {
                    if (parseInt(element.style.zIndex, 10) === currentZIndex || currentZIndex === 0) {
                        event.preventDefault();
                        event.stopPropagation();

                        var startX = event.clientX;
                        var startY = event.clientY;
                        var startLeft = parseInt(element.style.left, 10) || 0;
                        var startTop = parseInt(element.style.top, 10) || 0;
                        var parent = element.parentElement;

                        function onMouseMove(event) {
                            var newLeft = startLeft + event.clientX - startX;
                            var newTop = startTop + event.clientY - startY;

                            if (parent) {
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
                            }

                            element.style.left = newLeft + 'px';
                            element.style.top = newTop + 'px';
                        }

                        function onMouseUp() {
                            document.removeEventListener('mousemove', onMouseMove);
                            document.removeEventListener('mouseup', onMouseUp);
                        }

                        document.addEventListener('mousemove', onMouseMove);
                        document.addEventListener('mouseup', onMouseUp);
                    }
                };
            }

            let xmlDoc;

            try {
                const nclString = \`${fileContent}\`;
                const parser = new DOMParser();
                xmlDoc = parser.parseFromString(nclString, "application/xml");

                if (xmlDoc.getElementsByTagName("parsererror").length) {
                    throw new Error("Erro de parsing do XML.");
                }

                initializeLayout(xmlDoc.querySelector('regionBase'));
            } catch (error) {
                console.error("Erro no parsing do XML: ", error.message);
            }

            function initializeLayout(regionBase) {
                const regionContainer = document.getElementById('regionContainer');
                regionContainer.innerHTML = '';

                if (!regionBase) return;
                createRegionsDynamically(regionBase, regionContainer);
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

                        if (region.children.length > 0) {
                            createRegionsDynamically(region, div);
                        }
                    }
                });
            }

            function updateProperty(element, propName, value) {
                element.setAttribute(propName, value);
            }

            function updateNCLPositions(xmlDoc) {
                const regions = document.querySelectorAll('.region');
                regions.forEach(region => {
                    let regionElement = xmlDoc.getElementById(region.id);

                    if (!regionElement) {
                        regionElement = xmlDoc.createElement('region');
                        regionElement.setAttribute('id', region.id);
                        xmlDoc.querySelector('regionBase').appendChild(regionElement);
                    }

                    const left = (parseFloat(region.style.left) / container.offsetWidth * 100).toFixed(2);
                    const top = (parseFloat(region.style.top) / container.offsetHeight * 100).toFixed(2);
                    const width = (parseFloat(region.style.width) / container.offsetWidth * 100).toFixed(2);
                    const height = (parseFloat(region.style.height) / container.offsetHeight * 100).toFixed(2);

                    updateProperty(regionElement, 'left', left + '%');
                    updateProperty(regionElement, 'top', top + '%');
                    updateProperty(regionElement, 'width', width + '%');
                    updateProperty(regionElement, 'height', height + '%');
                });
                return new XMLSerializer().serializeToString(xmlDoc);
            }

            function addRegionToXML(id, left, top, width, height, zIndex) {
                const regionBase = xmlDoc.querySelector('regionBase');
                if (regionBase) {
                    const newRegion = xmlDoc.createElement('region');
                    newRegion.setAttribute('id', id);
                    newRegion.setAttribute('left', left);
                    newRegion.setAttribute('top', top);
                    newRegion.setAttribute('width', width);
                    newRegion.setAttribute('height', height);
                    newRegion.setAttribute('zIndex', zIndex);
                    regionBase.appendChild(newRegion);
                }
            }

            function sendUpdatedPositions() {
                const containerRect = container.getBoundingClientRect();
                const regions = Array.from(document.querySelectorAll('div.region, div.div-criada')).map(div => {
                    const divRect = div.getBoundingClientRect();
                    return {
                        id: div.id,
                        left: ((divRect.left - containerRect.left) / containerRect.width * 100).toFixed(2),
                        top: ((divRect.top - containerRect.top) / containerRect.height * 100).toFixed(2),
                        width: (divRect.width / containerRect.width * 100).toFixed(2),
                        height: (divRect.height / containerRect.height * 100).toFixed(2)
                    };
                });
            
                const updatedNCL = updateNCLPositions(xmlDoc);
            
                vscode.postMessage({
                    command: 'saveFile',
                    text: updatedNCL,
                    regions: regions
                });
            }
            
            

            window.addEventListener('message', event => {
                const message = event.data;
                console.log('Message received in WebView:', message);

                if (message.command === 'getContent') {
                    sendUpdatedPositions();
                }
            });
        </script>
    </body>
    </html>
  `;
}
