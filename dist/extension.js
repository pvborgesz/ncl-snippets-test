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
    // Registro do comando 'Hello World'
    let disposableHelloWorld = vscode.commands.registerCommand('nclsnippetsteste.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from nclSnippetsTeste!');
    });
    // Registro do comando para iniciar a tela NCL
    let nclScreen = vscode.commands.registerCommand('nclScreen.start', () => {
        createNCLScreenWebview(context);
    });
    // Registro do comando para gerar a região
    let generateRegion = vscode.commands.registerCommand('nclScreen.generateRegion', () => {
        createRegionGeneratorWebview(context);
    });
    // Adicionando todos os comandos registrados ao context.subscriptions para gerenciamento adequado do ciclo de vida
    context.subscriptions.push(disposableHelloWorld, nclScreen, generateRegion);
    // Verifica se há um editor de texto ativo ao ativar a extensão
    if (vscode.window.activeTextEditor) {
        createInitialWebview(context);
    }
    else {
        vscode.window.showInformationMessage('Nenhum arquivo aberto.');
    }
}
exports.activate = activate;
function createInitialWebview(context) {
    const editor = vscode.window.activeTextEditor;
    const document = editor?.document;
    const fileContent = document?.getText();
    const panel = vscode.window.createWebviewPanel('nclSnippetsteste', 'NCL Snippets Teste', vscode.ViewColumn.One, { enableScripts: true });
    panel.webview.html = getWebviewContent(); // Your function that returns HTML content
    panel.webview.postMessage({ command: 'update', text: fileContent });
    panel.webview.onDidReceiveMessage(message => {
        if (message.command === 'alert') {
            vscode.window.showErrorMessage(message.text);
        }
    }, undefined, context.subscriptions);
}
function createNCLScreenWebview(context) {
    const panel = vscode.window.createWebviewPanel('nclScreen', 'NCL Screen', vscode.ViewColumn.Two, {
        enableScripts: true,
        retainContextWhenHidden: true
    });
    panel.webview.html = getWebviewContent(); // Adjust if you have another HTML content generator for this
    panel.webview.onDidReceiveMessage(message => {
        if (message.command === 'alert') {
            vscode.window.showErrorMessage(message.text);
        }
    }, undefined, context.subscriptions);
}
function createRegionGeneratorWebview(context) {
    const panel = vscode.window.createWebviewPanel('regionGenerator', 'Region Generator', vscode.ViewColumn.Three, { enableScripts: true });
    panel.webview.html = getContentGenerateRegion(); // Your function that returns HTML for the region generator
}
function getWebviewContent() {
    return `
	<!DOCTYPE html>
	<html lang="pt">
	<head>
		<meta charset="UTF-8">
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
		</style>
	</head>
	<body>
	
	<input type="file" id="fileInput" style="display: none;" />
    <button class="fileInput-button" onclick="document.getElementById('fileInput').click();">Selecionar arquivo NCL</button>
    <div id="mainRegion">
        <div id="regionContainer"></div>
    </div>
    <button id="exportButton">Exportar NCL Modificado</button>
    <button id="exportCSSButton">Exportar CSS</button>
	
	<script>
		function updateNCLPositions(xmlDoc) {
			document.querySelectorAll('.region').forEach(element => {
				const xmlElement = xmlDoc.getElementById(element.id);
				if (xmlElement) {
					updateProperty(xmlElement, 'left', element.style.left);
					updateProperty(xmlElement, 'top', element.style.top);
				}
			});
			return new XMLSerializer().serializeToString(xmlDoc);
		}

		function updateNCLPositions(xmlDoc) {
			document.querySelectorAll('.media').forEach(div => {
				let media = xmlDoc.getElementById(div.id);
				if (media) {
					let leftProp = media.querySelector('property[name="left"]');
					let topProp = media.querySelector('property[name="top"]');
	
					if (!leftProp) {
						leftProp = xmlDoc.createElement('property');
						leftProp.setAttribute('name', 'left');
						media.appendChild(leftProp);
					}
					if (!topProp) {
						topProp = xmlDoc.createElement('property');
						topProp.setAttribute('name', 'top');
						media.appendChild(topProp);
					}
	
					leftProp.setAttribute('value', div.dataset.finalLeft + 'px');
					topProp.setAttribute('value', div.dataset.finalTop + 'px');
				}
			});
			return new XMLSerializer().serializeToString(xmlDoc);
		}
		
		let xmlDoc;
		
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
                const div = document.createElement('div');
                div.id = region.getAttribute('id');
                div.className = 'region';
                div.style.width = region.getAttribute('width');
                div.style.height = region.getAttribute('height');
                div.style.position = 'absolute';
                div.style.zIndex = region.getAttribute('zIndex') || 1;
                div.textContent = region.getAttribute('id'); 

                parentDiv.appendChild(div);
                addDraggable(div); // Adiciona funcionalidade de arrasto

                // Recursivamente criar regiões filhas
                if (region.children.length > 0) {
                    createRegionsDynamically(region, div);
                }
            });
        }

		function initializeLayout(regionBase) {
            const regionContainer = document.getElementById('regionContainer');
            regionContainer.innerHTML = ''; // Limpar container antes de adicionar novos elementos

            if (!regionBase) return;
            createRegionsDynamically(regionBase, regionContainer);
        }


		document.getElementById('exportButton').addEventListener('click', () => {
			xmlDoc = xmlDoc || document.implementation.createDocument(null, 'ncl');
			let updatedNCL = updateNCLPositions(xmlDoc);
			download('modified.ncl', updatedNCL);
		});
	
		function download(filename, text) {
			var element = document.createElement('a');
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
    <html lang="pt-br">
    
    <head>
        <meta charset="UTF-8">
        <title>Region Generator</title>
        <style>
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
                /* Cursor em forma de movimento para indicar que pode ser arrastada */
                color: white;
                /* Cor do texto */
                display: flex;
                /* Flexbox para alinhar o texto no centro */
                align-items: center;
                /* Alinha verticalmente no centro */
                justify-content: center;
                /* Alinha horizontalmente no centro */
                font-size: 16px;
                /* Tamanho do texto */
                text-shadow: 1px 1px 2px black;
                /* Sombra no texto para melhor visibilidade */
            }
    
            #legend {
                position: fixed;
                bottom: 10px;
                right: 10px;
                padding: 10px;
                background-color: #f8f8f8;
                border: 1px solid #ccc;
                border-radius: 5px;
                box-shadow: 1px 1px 5px #ccc;
            }
        </style>
    </head>
    
    <body>
        <div id="legend">
            <strong>Legenda:</strong> 
            CTRL + Click para criar uma região, ALT + Click para deletar uma região, Click e arraste para mover uma região.
        </div>
        <div id="container"></div>
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
                }
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
                    novaDiv.textContent = "Region " + count; // Adiciona texto ao elemento
    
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