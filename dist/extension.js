/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(__webpack_require__(1));
function activate(context) {
    let nclScreen = vscode.commands.registerCommand('nclScreen.start', () => {
        startNCLScreenWebview(context);
    });
    context.subscriptions.push(nclScreen);
}
exports.activate = activate;
function startNCLScreenWebview(context) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showInformationMessage('Nenhum arquivo aberto.');
        return;
    }
    const document = editor.document;
    const fileContent = document.getText(); // Obtém o conteúdo do arquivo atual
    const panel = vscode.window.createWebviewPanel('nclScreen', 'NCL Screen', vscode.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true
    });
    panel.webview.html = getWebviewContent(fileContent); // Passa o conteúdo do arquivo para o Webview
}
// function createInitialWebview(context: vscode.ExtensionContext) {
//     const editor = vscode.window.activeTextEditor;
//     const document = editor?.document;
//     const fileContent = document?.getText();
//     const panel = vscode.window.createWebviewPanel(
//         'nclSnippetsteste',
//         'NCL Snippets Teste',
//         vscode.ViewColumn.One,
//         { enableScripts: true }
//     );
//     panel.webview.html = getWebviewContent(); 
//     panel.webview.postMessage({ command: 'update', text: fileContent });
//     panel.webview.onDidReceiveMessage(message => {
//         if (message.command === 'alert') {
//             vscode.window.showErrorMessage(message.text);
//         }
//     }, undefined, context.subscriptions);
// }
// function createNCLScreenWebview(context: vscode.ExtensionContext) {
//     const panel = vscode.window.createWebviewPanel(
//         'nclScreen',
//         'NCL Screen',
//         vscode.ViewColumn.Two,
//         {
//             enableScripts: true,
//             retainContextWhenHidden: true
//         }
//     );
//     panel.webview.html = getWebviewContent(); 
//     panel.webview.onDidReceiveMessage(message => {
//         if (message.command === 'alert') {
//             vscode.window.showErrorMessage(message.text);
//         }
//     }, undefined, context.subscriptions);
// }
function createRegionGeneratorWebview(context) {
    const panel = vscode.window.createWebviewPanel('regionGenerator', 'Region Generator', vscode.ViewColumn.Three, { enableScripts: true });
    panel.webview.html = getContentGenerateRegion(); // Your function that returns HTML for the region generator
}
function getWebviewContent(fileContent) {
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
    
            body,
            html {
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
    
            #exportButton,
            #exportCSSButton {
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
                position: fixed;
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

        // <div id="container"></div>
        <script>


        const container = document.getElementById("container");
        let isDragging = false;
        let novaDiv;
        let startX, startY;
        let count = 0;
        let ctrlPressed = false;

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
            } else
            if (ctrlPressed) {
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
            } else {
                // Permite mover as regiões existentes
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

                    novaDiv.style.left = Math.min(startX
                        , currentX) + "px";
                    novaDiv.style.top = Math.min(startY, currentY) + "px";
                } else {
                    // Atualiza a posição da região sendo movida
                    novaDiv.style.left = (e.pageX - startX) + "px";
                    novaDiv.style.top = (e.pageY - startY) + "px";
                }
            }
        });
        container.addEventListener("mouseup", function () {
            isDragging = false;
        });



            let xmlDoc; // Variável global para armazenar o documento XML
    
            try {
                const nclString = \`${fileContent}\`; // Usando template literals para inserir o conteúdo
                const parser = new DOMParser();
                xmlDoc = parser.parseFromString(nclString, "application/xml");
                
                if (xmlDoc.getElementsByTagName("parsererror").length) {
                    throw new Error("Erro de parsing do XML.");
                }

                // Inicializar o layout com a base de regiões encontradas
                initializeLayout(xmlDoc.querySelector('regionBase'));
            } catch (error) {
                console.error("Erro no parsing do XML: ", error.message);
            }
            function calculatePercentage(percent, total) {
                return parseFloat(percent) / 100 * total;
            }
    
    
            function initializeLayout(regionBase) {
                const regionContainer = document.getElementById('regionContainer');
                regionContainer.innerHTML = ''; // Limpar container antes de adicionar novos elementos
    
                if (!regionBase) return;
                createRegionsDynamically(regionBase, regionContainer);
            }

            function addDraggable(element) {
                element.onmousedown = function (event) {
                    event.preventDefault();
                    var offsetX = event.clientX - element.getBoundingClientRect().left;
                    var offsetY = event.clientY - element.getBoundingClientRect().top;
    
                    function onMouseMove(event) {
                        element.style.left = (event.clientX - offsetX) + 'px';
                        element.style.top = (event.clientY - offsetY) + 'px';
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
                        addDraggable(div); // Adiciona funcionalidade de arrasto
    
                        // Recursivamente criar regiões filhas
                        if (region.children.length > 0) {
                            createRegionsDynamically(region, div);
                        }
                    }
                });
            }
    
            document.getElementById('exportButton').addEventListener('click', () => {
                if (!xmlDoc) {
                    console.error('Nenhum documento XML carregado.');
                    return;
                }
                const updatedNCL = updateNCLPositions(xmlDoc);
                download('modified.ncl', updatedNCL);
            });
    
    
    
            function updateProperty(element, propName, value) {
                let prop = element.querySelector('property[name="' + propName + '"]');
                if (!prop) {
                    prop = xmlDoc.createElement('property');
                    prop.setAttribute('name', propName);
                    element.appendChild(prop);
                }
                prop.setAttribute('value', value);
            }
    
            function download(filename, text) {
                let element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                element.setAttribute('download', filename);
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            }
        </script>
    </body>
    
    </html>
	`;
}
function getContentGenerateRegion() {
    return `<!DOCTYPE html>
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
    
            body,
            html {
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
                border: 2px solid #000;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                background-color: rgba(0, 0, 255, 0.2);
                cursor: pointer;
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
    
            #exportButton,
            #exportCSSButton {
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
        </style>
    </head>
    
    <body>
        <input type="file" id="fileInput" style="display: none;" />
        <button class="fileInput-button" onclick="document.getElementById('fileInput').click();">Selecionar arquivo
            NCL</button>
        <div id="mainRegion">
            <div id="regionContainer"></div>
        </div>
        <button id="exportButton">Exportar NCL Modificado</button>
        <button id="exportCSSButton">Exportar CSS</button>
        <script>
            let xmlDoc; // Variável global para armazenar o documento XML
    
            document.getElementById('fileInput').addEventListener('change', function (event) {
                const file = event.target.files[0];
                if (!file) {
                    alert("Por favor, selecione um arquivo.");
                    return;
                }
    
                const reader = new FileReader();
                reader.onload = function (e) {
                    try {
                        const nclString = e.target.result;
                        const parser = new DOMParser();
                        xmlDoc = parser.parseFromString(nclString, "application/xml");
    
                        if (xmlDoc.getElementsByTagName("parsererror").length) {
                            throw new Error("Erro de parsing do XML.");
                        }
    
                        // Inicializar o layout com a base de regiões encontradas
                        initializeLayout(xmlDoc.querySelector('regionBase'));
                    } catch (error) {
                        console.error("Erro no parsing do XML: ", error.message);
                    }
                };
                reader.readAsText(file);
            });
    
            function initializeLayout(regionBase) {
                const regionContainer = document.getElementById('regionContainer');
                regionContainer.innerHTML = ''; // Limpar container antes de adicionar novos elementos
    
                if (!regionBase) return;
                createRegionsDynamically(regionBase, regionContainer);
            }
    
            function createRegionsDynamically(regionElement, parentDiv) {
                const regions = regionElement.querySelectorAll('region');
                regions.forEach(region => {
                    if (!document.getElementById(region.getAttribute('id'))) {  // Verificar se o elemento já existe
                        const div = document.createElement('div');
                        div.id = region.getAttribute('id');
                        div.className = 'region';
                        // Converter porcentagens para valores absolutos baseados nas dimensões do elemento pai
                        div.style.width = calculatePercentage(region.getAttribute('width'), parentDiv.offsetWidth) + 'px';
                        div.style.height = calculatePercentage(region.getAttribute('height'), parentDiv.offsetHeight) + 'px';
                        div.style.position = 'absolute';
                        div.style.zIndex = region.getAttribute('zIndex') || 1;
                        div.textContent = region.getAttribute('id');
    
                        // Posicionar inicialmente
                        div.style.left = calculatePercentage(region.getAttribute('left') || '0%', parentDiv.offsetWidth) + 'px';
                        div.style.top = calculatePercentage(region.getAttribute('top') || '0%', parentDiv.offsetHeight) + 'px';
    
                        // Adicionando borda e uma cor de fundo leve para visibilidade
                        div.style.border = '1px solid black';
                        div.style.backgroundColor = 'rgba(100, 100, 250, 0.5)';
    
                        parentDiv.appendChild(div);
                        addDraggable(div); // Adiciona funcionalidade de arrasto
    
                        // Recursivamente criar regiões filhas
                        if (region.children.length > 0) {
                            createRegionsDynamically(region, div);
                        }
                    }
                });
            }
    
    
            function calculatePercentage(percent, total) {
                return parseFloat(percent) / 100 * total;
            }
    
            function addDraggable(element) {
                element.onmousedown = function (event) {
                    event.preventDefault();
                    event.stopPropagation(); // Isso impede que o evento continue a propagar para elementos pais
    
                    // Coordenadas iniciais do cursor e do elemento
                    var startX = event.clientX;
                    var startY = event.clientY;
                    var startLeft = parseInt(element.style.left, 10) || 0;
                    var startTop = parseInt(element.style.top, 10) || 0;
    
                    function onMouseMove(event) {
                        // Calcular novas posições
                        var newLeft = startLeft + event.clientX - startX;
                        var newTop = startTop + event.clientY - startY;
    
                        // Atualizar a posição do elemento
                        element.style.left = newLeft + 'px';
                        element.style.top = newTop + 'px';
                    }
    
                    function onMouseUp() {
                        // Remover os event listeners quando o mouse é solto
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                    }
    
                    // Adicionar event listeners para movimento do mouse e soltar o mouse
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                };
            }
    
    
            document.getElementById('exportCSSButton').addEventListener('click', function () {
                console.log('Iniciando exportação de CSS...');
                let cssString = "";
                document.querySelectorAll('.region').forEach(function (element) {
                    cssString += "#" + element.id + " { width: " + element.style.width + "; height: " + element.style.height + "; position: " + element.style.position + "; z-index: " + element.style.zIndex + "; left: " + element.style.left + "; top: " + element.style.top + "; }\n";
                });
    
                if (!cssString) {
                    console.error("Nenhum CSS para exportar.");
                    alert("Nenhuma região definida para exportar CSS.");
                    return;
                }
    
                download('style.css', cssString);
                console.log('CSS exportado com sucesso.');
                alert('CSS exportado com sucesso.');
            });
    
            document.getElementById('exportButton').addEventListener('click', () => {
                if (!xmlDoc) {
                    console.error('Nenhum documento XML carregado.');
                    return;
                }
                const updatedNCL = updateNCLPositions(xmlDoc);
                download('modified.ncl', updatedNCL);
            });
    
    
    
            function updateProperty(element, propName, value) {
                let prop = element.querySelector('property[name="' + propName + '"]');
                if (!prop) {
                    prop = xmlDoc.createElement('property');
                    prop.setAttribute('name', propName);
                    element.appendChild(prop);
                }
                prop.setAttribute('value', value);
            }
    
            function download(filename, text) {
                let element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                element.setAttribute('download', filename);
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            }
        </script>
    </body>
    
    </html>`;
}
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map