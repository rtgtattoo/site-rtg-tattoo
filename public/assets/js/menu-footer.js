const menuFooterDiv = document.createElement('div');
menuFooterDiv.className = 'menu-footer';

const isIndexPage1 = window.location.pathname.endsWith('index.html') || 
                   window.location.pathname.endsWith('/');

const basePath1 = isIndexPage1 ? '' : '../';
const pagePath1 = isIndexPage1 ? 'pages/' : '';

const menuFooterItems = [
    { 
        type: 'icon', 
        icon: 'fa-brands fa-instagram',
        page: 'https://www.instagram.com/studio.rtgtattoo/' 
    },
    { 
        type: 'icon', 
        icon: 'fa-brands fa-whatsapp',
        page: 'https://wa.me/5547997473919' 
    },
    { 
        type: 'icon', 
        icon: 'fa-brands fa-pinterest',
        page: 'https://br.pinterest.com/rtgtattoo/' 
    }
];

menuFooterItems.forEach(item => {
    const itemFooterContainer = document.createElement('div');
    itemFooterContainer.className = 'social-icon';
    
    const link = document.createElement('a');
    link.href = item.page;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.title = item.alt;

    if (item.type === 'image') {
        const icon = document.createElement('img');
        icon.src = item.src;
        icon.alt = item.alt;
        icon.className = 'icon-img';
        link.appendChild(icon);
    } 
    else if (item.type === 'icon') {
    const icon = document.createElement('i');
    icon.className = item.icon + ' footer-icon';
    link.appendChild(icon);
    }
    
    itemFooterContainer.appendChild(link);
    menuFooterDiv.appendChild(itemFooterContainer);
});

document.getElementById('footer-menu').appendChild(menuFooterDiv);

