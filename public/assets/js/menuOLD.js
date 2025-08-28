
// Cria o elemento do menu
const menuDiv = document.createElement('div');
menuDiv.className = 'menu';


// Detecta se estamos na página principal (index.html)
const isIndexPage = window.location.pathname.endsWith('index.html') || 
                   window.location.pathname.endsWith('/');


// Define os caminhos base
const basePath = isIndexPage ? '' : '../';
const pagePath = isIndexPage ? 'pages/' : '';


// Define os itens do menu
const menuItems = [
    { type: 'link', text: 'Sobre', page: `${pagePath}about.html` },
    { type: 'link', text: 'Equipe', page: `${pagePath}team.html` },
    { type: 'link', text: 'Galeria', page: `${pagePath}gallery.html` },
    { type: 'image', src: `${basePath}assets/images/logo-png.png`, alt: 'Logo da RTG Tattoo' },
    { type: 'link', text: 'Orçamento', page: `${pagePath}orcamento.html` },
    { type: 'link', text: 'Endereço', page: `${pagePath}address.html` },
    { type: 'link', text: 'Contato', page: `${pagePath}contact.html` }
];

menuItems.forEach(item => {
    const itemContainer = document.createElement('div');
    
    if (item.type === 'link') {
        const link = document.createElement('a');
        link.className = 'menu-item';
        link.href = item.page;
        link.textContent = item.text;
        itemContainer.appendChild(link);
    } 
    else if (item.type === 'image') {
        const logo = document.createElement('img');
        logo.id = 'img-logo';
        logo.src = item.src;
        logo.alt = item.alt;
        itemContainer.appendChild(logo);
    }
    
    menuDiv.appendChild(itemContainer);
});

document.getElementById('header-menu').appendChild(menuDiv);

const imgLogo = document.getElementById('img-logo');
imgLogo.addEventListener('click', () => {
    window.location.href = `${basePath}index.html`;
});