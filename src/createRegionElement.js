
function createRegionElement(region, maxWidth, maxHeight, parentDiv = document.body) {
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
        // Ajusta as dimensões com base nas dimensões máximas ou do parentDiv, se necessário
        div.style.width = maxWidth ? (width / maxWidth) * 100 + '%' : width + 'px';
        div.style.height = maxHeight ? (height / maxHeight) * 100 + '%' : height + 'px';
    }

    div.style.zIndex = region.getAttribute('zIndex') || '1';

    div.addEventListener('mousedown', onDragStart);

    parentDiv.appendChild(div); // Adiciona a região ao elemento pai

    // Verifica se a região atual possui regiões filhas e as cria recursivamente
    region.querySelectorAll('region').forEach(childRegion => {
        // Aqui, você precisa ajustar maxWidth e maxHeight se for basear nas dimensões da região pai
        createRegionElement(childRegion, width, height, div);
    });

    return div;
}