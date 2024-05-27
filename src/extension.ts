import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {
  let nclScreen = vscode.commands.registerCommand('nclScreen.start', () => {
    startNCLScreenWebview(context);
  });

  context.subscriptions.push(nclScreen);
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



  
  function getUpdatedContent(fileContent: string): Promise<string | undefined> {
    return new Promise(resolve => {
      // Atualiza o conteúdo aqui se necessário
      resolve(fileContent);
    });
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

                .region {
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
                }

                .baseRegion {
                    position: absolute;
                    border: 2px solid #000;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    overflow: hidden;
                    background-color: rgba(0, 0, 255, 0.1);
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
                    height: 100vh;
                    border: 2px dashed #ccc;
                    position: relative;
                }

                .div-criada {
                    position: absolute;
                    border-radius: 8px;
                    border: 1px solid #000;
                    cursor: move;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    text-shadow: 1px 1px 2px black;
                }

                #legend {
                    posição: fixed;
                    bottom: 10px;
                    right: 10px;
                    padding: 10px;
                    background-color: #494d54; 
                    border: 1px solid #ccc;
                    border-radius: 5px;
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

            
            
            <script>
            const vscode = acquireVsCodeApi();
            const container = document.getElementById("container");
            let isDragging = false;
            let novaDiv;
            let startX, startY;
            let count = 0;
            let ctrlPressed = false;
            let altPressed = false;

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
                if (altPressed && e.target.classList.contains("div-criada")) {
                    container.removeChild(e.target);
                    return;
                } else if (ctrlPressed) {
                    isDragging = true;
                    startX = e.pageX;
                    startY = e.pageY;
                    count++;

                    novaDiv = document.createElement("div");
                    novaDiv.className = "div-criada";
                    novaDiv.style.left = startX + "px";
                    novaDiv.style.top = startY + "px";
                    novaDiv.style.backgroundColor = randomColor();
                    novaDiv.id = "region_" + count;
                    novaDiv.textContent = "Region " + count; 

                    container.appendChild(novaDiv);

                    // Adicionar nova região ao XML
                    addRegionToXML(novaDiv.id, '0%', '0%', '10%', '10%', '1');
                } else {
                    if (e.target.classList.contains("div-criada")) {
                        novaDiv = e.target;
                        startX = e.pageX - novaDiv.offsetLeft;
                        startY = e.pageY - novaDiv.offsetTop;
                        isDragging = true;
                    }
                }
            });

            container.addEventListener("mousemove", function (e) {
                if (isDragging) {
                    if (ctrlPressed) {
                        const currentX = e.pageX;
                        const currentY = e.pageY;
                        const width = Math.abs(currentX - startX);
                        const height = Math.abs(currentY - startY);
                        novaDiv.style.width = width + "px";
                        novaDiv.style.height = height + "px";

                        novaDiv.style.left = Math.min(startX, currentX) + "px";
                        novaDiv.style.top = Math.min(startY, currentY) + "px";
                    } else {
                        novaDiv.style.left = (e.pageX - startX) + "px";
                        novaDiv.style.top = (e.pageY - startY) + "px";
                    }
                }
            });

            container.addEventListener("mouseup", function () {
                isDragging = false;
                sendUpdatedPositions();
            });

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

            function calculatePercentage(percent, total) {
                return parseFloat(percent) / 100 * total;
            }

            function initializeLayout(regionBase) {
                const regionContainer = document.getElementById('regionContainer');
                regionContainer.innerHTML = '';

                if (!regionBase) return;
                createRegionsDynamically(regionBase, regionContainer);
            }

            function addDraggable(element) {
                element.onmousedown = function (event) {
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

                        // Limite o movimento para os limites do pai
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
                };
            }

            function createRegionsDynamically(regionElement, parentDiv) {
                const regions = regionElement.querySelectorAll('region');
                regions.forEach(region => {
                    if (!document.getElementById(region.getAttribute('id'))) {  
                        const div = document.createElement('div');
                        div.id = region.getAttribute('id');
                        div.className = 'region';

                        div.style.width = calculatePercentage(region.getAttribute('width'), parentDiv.offsetWidth) + 'px';
                        div.style.height = calculatePercentage(region.getAttribute('height'), parentDiv.offsetHeight) + 'px';
                        div.style.position = 'absolute';
                        div.style.zIndex = region.getAttribute('zIndex') || 1;
                        div.textContent = region.getAttribute('id');

                        div.style.left = calculatePercentage(region.getAttribute('left') || '0%', parentDiv.offsetWidth) + 'px';
                        div.style.top = calculatePercentage(region.getAttribute('top') || '0%', parentDiv.offsetHeight) + 'px';

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
                const regions = document.querySelectorAll('.region, .div-criada');
                regions.forEach(region => {
                    let regionElement = xmlDoc.getElementById(region.id);

                    // Se a região não existir no XML, crie uma nova
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
                const regions = Array.from(document.querySelectorAll('div[class]')).map(div => {
                    return {
                        id: div.id,
                        left: (parseFloat(div.style.left) / container.offsetWidth * 100).toFixed(2),
                        top: (parseFloat(div.style.top) / container.offsetHeight * 100).toFixed(2),
                        width: (parseFloat(div.style.width) / container.offsetWidth * 100).toFixed(2),
                        height: (parseFloat(div.style.height) / container.offsetHeight * 100).toFixed(2),
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
