// Configuração do botão de WhatsApp
document.getElementById('btn-enviar').addEventListener('click', function() {
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

// Menu mobile toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const menuItems = document.querySelector('.menu-items');
    
    if(menuToggle && menuItems) {
        menuToggle.addEventListener('click', function() {
            // Alternar menu
            menuItems.classList.toggle('active');
            
            // Alternar ícones
            const icon = this.querySelector('i');
            if(icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
            
            // Bloquear scroll quando menu aberto
            document.body.style.overflow = menuItems.classList.contains('active') ? 'hidden' : '';
        });
    }
});


document.addEventListener('DOMContentLoaded', function() {
    // Configura o modal
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("expandedImg");
    const captionText = document.getElementById("imgCaption");
    const closeBtn = document.querySelector(".close");
    
    // Adiciona evento de clique para todas as imagens da galeria
    document.querySelectorAll('.gallery-item img').forEach(img => {
        img.addEventListener('click', function() {
            modal.style.display = "block";
            modalImg.src = this.src;
            captionText.innerHTML = this.alt;
            document.body.style.overflow = "hidden"; // Desabilita scroll da página
        });
    });
    
    // Fecha o modal ao clicar no X
    closeBtn.addEventListener('click', function() {
        modal.style.display = "none";
        document.body.style.overflow = "auto"; // Reabilita scroll
    });
    
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
});
