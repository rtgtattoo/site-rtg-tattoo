// main.js melhorado
document.addEventListener('DOMContentLoaded', function() {
    // Configuração do botão de WhatsApp
    const btnEnviar = document.getElementById('btn-enviar');
    if (btnEnviar) {
        btnEnviar.addEventListener('click', function() {
            // Obter valores do formulário
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const telefone = document.getElementById('telefone').value;
            const tamanho = document.getElementById('tamanho').value;
            const local = document.getElementById('local').value;
            const descricao = document.getElementById('descricao').value;
            const referencia = document.getElementById('referencia').value;
            
            // Construir mensagem formatada para WhatsApp
            const mensagem = `*Nova Solicitação de Orçamento - RTG Tattoo*%0A%0A` +
                                `*Nome:* ${nome}%0A` +
                                `*Email:* ${email}%0A` +
                                `*Telefone:* ${telefone}%0A` +
                                `*Tamanho:* ${tamanho || 'Não informado'}%0A` +
                                `*Local do corpo:* ${local || 'Não informado'}%0A` +
                                `*Descrição:*%0A${descricao}%0A%0A` +
                                `*Referências:*%0A${referencia || 'Nenhuma referência fornecida'}`;
            
            // Criar link do WhatsApp
            const whatsappUrl = `https://wa.me/5547997473919?text=${mensagem}`;
            
            // Abrir WhatsApp
            window.open(whatsappUrl, '_blank');
            
            // Feedback visual
            const btn = this;
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<i class="fas fa-check"></i> Enviado!';
            btn.classList.add('btn-success');
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('btn-success');
            }, 3000);
        });
    }

    // Menu mobile toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const menuItems = document.querySelector('.menu-items');
    const headerMenu = document.getElementById('header-menu');
    
    if(menuToggle && menuItems) {
        menuToggle.addEventListener('click', function() {
            // Alternar menu
            menuItems.classList.toggle('active');
            document.body.style.overflow = menuItems.classList.contains('active') ? 'hidden' : '';
            
            // Alternar ícones
            const icon = this.querySelector('i');
            if(icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }

    // Fechar menu ao clicar em um link
    const menuLinks = document.querySelectorAll('.menu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuItems.classList.remove('active');
            document.body.style.overflow = '';
            if (menuToggle.querySelector('i').classList.contains('fa-times')) {
                menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
            }
        });
    });

    // Configuração do modal de imagens
    const modal = document.getElementById("imageModal");
    if (modal) {
        const modalImg = document.getElementById("expandedImg");
        const captionText = document.getElementById("imgCaption");
        const closeBtn = document.querySelector(".close");
        
        // Adiciona evento de clique para todas as imagens da galeria
        document.querySelectorAll('.gallery-item img').forEach(img => {
            img.addEventListener('click', function() {
                modal.style.display = "block";
                modalImg.src = this.src;
                captionText.innerHTML = this.alt;
                document.body.style.overflow = "hidden";
            });
        });
        
        // Fecha o modal ao clicar no X
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                modal.style.display = "none";
                document.body.style.overflow = "auto";
            });
        }
        
        // Fecha o modal ao clicar fora da imagem
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = "none";
                document.body.style.overflow = "auto";
            }
        });
        
        // Fecha com a tecla ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === "Escape" && modal.style.display === "block") {
                modal.style.display = "none";
                document.body.style.overflow = "auto";
            }
        });
    }

    // Scroll suave para âncoras
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header transparente no scroll
    window.addEventListener('scroll', function() {
        if (headerMenu) {
            if (window.scrollY > 100) {
                headerMenu.style.background = 'rgba(26, 26, 26, 0.95)';
                headerMenu.style.backdropFilter = 'blur(10px)';
            } else {
                headerMenu.style.background = 'rgba(26, 26, 26, 0.8)';
                headerMenu.style.backdropFilter = 'blur(5px)';
            }
        }
    });

    // Animação de elementos ao scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.about-card, .team-member, .gallery-item, .contact-method');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = 1;
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Inicializar elementos com opacidade 0 para animação
    document.querySelectorAll('.about-card, .team-member, .gallery-item, .contact-method').forEach(element => {
        element.style.opacity = 0;
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    // Executar animação ao carregar e ao scroll
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);
});

