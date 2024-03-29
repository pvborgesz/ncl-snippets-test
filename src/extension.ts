import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
        const document = editor.document;
        const fileContent = document.getText();
        const panel = vscode.window.createWebviewPanel(
            'nclSnippetsteste',
            'NCL Snippets Teste', 
            vscode.ViewColumn.One, 
            { enableScripts: true }
        );

        panel.webview.html = getWebviewContent();
		// update the code based on the file opened in the editor
		panel.webview.postMessage({ command: 'update', text: fileContent });
		panel.webview.onDidReceiveMessage(
			message => {
			  switch (message.command) {
				case 'alert':
				  vscode.window.showErrorMessage(message.text);
				  return;
			  }
			}
		);
    } else {
        vscode.window.showInformationMessage('Nenhum arquivo aberto.');
    }

	let disposable = vscode.commands.registerCommand('nclsnippetsteste.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from nclSnippetsTeste!');
	});
	let nclScreen = vscode.commands.registerCommand('nclScreen.start', () => {
		vscode.window.showInformationMessage('Hello World from nclScreen.start!');
	});

	const panel = vscode.window.createWebviewPanel(
		'nclScreen', 
		'NCL Screen', 
		vscode.ViewColumn.One, 
		{
			enableScripts: true,
			retainContextWhenHidden: true
		}
	);

	panel.webview.html = getWebviewContent();
	panel.webview.onDidReceiveMessage(
		message => {
		  switch (message.command) {
			case 'alert':
			  vscode.window.showErrorMessage(message.text);
			  return;
		  }
		},
		undefined,
		context.subscriptions
	  );

	context.subscriptions.push(disposable);
	context.subscriptions.push(nclScreen);
}

function getWebviewContent() {
	return `<!DOCTYPE html>
	<html lang="pt">
	<head>
		<meta charset="UTF-8">
		<title>Parser NCL para HTML</title>
		<style>
			#mediaContainer, #regionContainer {
				position: relative;
				width: 100%;
				height: 500px;
				border: 1px solid #ccc;
			}
			.media, .region {
				position: absolute;
				box-sizing: border-box;
				border-radius: 10px;
				display: flex;
				align-items: center;
				justify-content: center;
				text-align: center;
				overflow: hidden;
				color: black;
				font-family: arial;
				border: 2px solid black;
				cursor: pointer; /* Estilo do cursor para indicar que o elemento é arrastável */
			}

			.region {
                background-color: rgba(0, 0, 255, 0.2); /* Cor de fundo para regiões */
            }
		</style>
	</head>
	<body>
	
	<input type="file" id="fileInput">
	<div id="mediaContainer"></div>


	<button id="exportButton">Exportar NCL Modificado</button>
	<button id="exportCSSButton">Exportar CSS</button>

	
	<script>

	
			
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
		document.getElementById('fileInput').addEventListener('change', function(event) {
			let file = event.target.files[0];
			if (!file) return;
	
			let reader = new FileReader();
			reader.onload = function(e) {
				let nclString = e.target.result;
	
				let parser = new DOMParser();
				let xmlDoc = parser.parseFromString(nclString, "text/xml");
	
				const colors = ['lightblue', 'lightgreen', 'lightcoral', 'lightyellow', 'lightgrey'];
				let colorIndex = 0;
	
				function createRegionElement(region, maxWidth, maxHeight) {
				let div = document.createElement('div');
				let regionId = region.getAttribute('id');
				div.id = regionId;
				div.className = 'region';
				div.textContent = regionId; 

				// Calcular as dimensões relativas ou usar as absolutas
				let width = parseInt(region.getAttribute('width'), 10);
				let height = parseInt(region.getAttribute('height'), 10);

				// Verifica se as dimensões são percentuais ou absolutas
				if (isNaN(width) || isNaN(height)) { // Assume que 'width' e 'height' podem ser, por exemplo, '50%'
					div.style.width = region.getAttribute('width') || '100%';
					div.style.height = region.getAttribute('height') || '100%';
				} else {
					// Aqui você ajustaria as dimensões com base nas dimensões máximas, se necessário
					// Isso requer que você tenha essas dimensões máximas disponíveis
					// Por simplicidade, vamos apenas atribuir os valores diretamente
					div.style.width = (width / maxWidth) * 100 + '%';
					div.style.height = (height / maxHeight) * 100 + '%';
				}

				div.style.zIndex = region.getAttribute('zIndex') || '1';
				
				div.addEventListener('mousedown', onDragStart);
				
				return div;
			}

			function initializeLayout(regionsData) {
				let maxWidth = window.innerWidth; // ou algum outro valor base
				let maxHeight = window.innerHeight; // ou algum outro valor base
			
				// Verifica se há regiões definidas
				if (!regionsData || regionsData.length === 0) {
					let fallbackRegion = document.createElement('div');
					fallbackRegion.id = 'fallbackRegion';
					fallbackRegion.className = 'region';
					fallbackRegion.textContent = 'Fallback Region';
					fallbackRegion.style.width = '100%';
					fallbackRegion.style.height = '100%';
					fallbackRegion.style.zIndex = 0;
					
					let regionElement = createRegionElement(fallbackRegion, maxWidth, maxHeight);
					document.body.appendChild(regionElement); // Ou adicione ao seu container de regiões
				} else {
					regionsData.forEach(regionData => {
						let regionElement = createRegionElement(regionData, maxWidth, maxHeight);
						document.body.appendChild(regionElement); // Ou adicione ao seu container de regiões
					});
				}
			}

				function createMediaElement(media) {
					let div = document.createElement('div');
					let mediaId = media.getAttribute('id');
					div.id = mediaId;
					div.className = 'media';
					div.style.borderColor = colors[colorIndex % colors.length];
					div.style.backgroundColor = colors[(colorIndex + 1) % colors.length];
					colorIndex++;
	
					let textNode = document.createElement('span');
					textNode.textContent = mediaId;
					div.appendChild(textNode);
	
					media.querySelectorAll('property').forEach(prop => {
						let name = prop.getAttribute('name');
						let value = prop.getAttribute('value');
	
						if (!isNaN(value) && value !== '' && (name === 'width' || name === 'height' || name === 'left' || name === 'top')) {
							value += 'px';
						}
	
						div.style[name] = value;
					});
	

					div.addEventListener('mousedown', onDragStart);
	
					return div;
				}
	
				function onDragStart(event) {
					let mediaDiv = event.target.closest('.media');
					if (!mediaDiv) return;
	
					let shiftX = event.clientX - mediaDiv.getBoundingClientRect().left;
					let shiftY = event.clientY - mediaDiv.getBoundingClientRect().top;
	
					mediaDiv.style.position = 'absolute';
					mediaDiv.style.zIndex = 1000;
					document.body.append(mediaDiv);
	
					moveAt(event.pageX, event.pageY);
	
					function moveAt(pageX, pageY) {
						mediaDiv.style.left = pageX - shiftX + 'px';
						mediaDiv.style.top = pageY - shiftY + 'px';
					}
	
					function onDrag(event) {
						moveAt(event.pageX, event.pageY);
					}
	
					function onDragEnd() {
						document.removeEventListener('mousemove', onDrag);
						mediaDiv.removeEventListener('mouseup', onDragEnd);
	
						// Armazena as novas posições
						let rect = mediaDiv.getBoundingClientRect();
						mediaDiv.dataset.finalLeft = rect.left - mediaContainer.getBoundingClientRect().left;
						mediaDiv.dataset.finalTop = rect.top - mediaContainer.getBoundingClientRect().top;
					}
	
					document.addEventListener('mousemove', onDrag);
					mediaDiv.addEventListener('mouseup', onDragEnd);
				}
				function onDragStartRegion(event) {
					let regionDiv = event.target.closest('.region');
					if (!regionDiv) return;
	
					let shiftX = event.clientX - regionDiv.getBoundingClientRect().left;
					let shiftY = event.clientY - regionDiv.getBoundingClientRect().top;
	
					regionDiv.style.position = 'absolute';
					regionDiv.style.zIndex = 1000;
					document.body.append(regionDiv);
	
					moveAt(event.pageX, event.pageY);
	
					function moveAt(pageX, pageY) {
						regionDiv.style.left = pageX - shiftX + 'px';
						regionDiv.style.top = pageY - shiftY + 'px';
					}
	
					function onDrag(event) {
						moveAt(event.pageX, event.pageY);
					}
	
					function onDragEnd() {
						document.removeEventListener('mousemove', onDrag);
						regionDiv.removeEventListener('mouseup', onDragEnd);
	
						// Armazena as novas posições
						let rect = regionDiv.getBoundingClientRect();
						regionDiv.dataset.finalLeft = rect.left - mediaContainer.getBoundingClientRect().left;
						regionDiv.dataset.finalTop = rect.top - mediaContainer.getBoundingClientRect().top;
					}
	
					document.addEventListener('mousemove', onDrag);
					regionDiv.addEventListener('mouseup', onDragEnd);
				}
	
				xmlDoc.querySelectorAll('media').forEach(media => {
					let mediaDiv = createMediaElement(media);
					document.getElementById('mediaContainer').appendChild(mediaDiv);
				});

				// xmlDoc.querySelectorAll('regionBase > region').forEach(regionCurr => {
				// 	let regionDiv = createRegionElement(regionCurr);
				// 	document.getElementById('regionContainer').appendChild(regionDiv);
				// });

				initializeLayout(xmlDoc.querySelectorAll('regionBase > region'));
			};
	
			reader.readAsText(file);
		});
	
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

// This method is called when your extension is deactivated
export function deactivate() {}
