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
document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('.menu-items').classList.toggle('active');
    this.querySelector('i').classList.toggle('fa-bars');
    this.querySelector('i').classList.toggle('fa-times');
});

