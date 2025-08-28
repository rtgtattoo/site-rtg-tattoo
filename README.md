# RTG Tattoo 🎨🤖

Projeto inovador de **simulação de tatuagens** usando **inteligência artificial** e **realidade aumentada**.  
Esta aplicação permite visualizar como uma tatuagem ficaria em seu corpo antes de fazê-la permanentemente.

---

## 📋 Sobre o Projeto
O **RTG Tattoo** é uma aplicação web que utiliza:

- 🕶 **Realidade Aumentada** para visualização em tempo real  
- 🤖 **Inteligência Artificial** para adaptação perfeita à curvatura do corpo  
- 🖼 **Processamento de Imagem** para aplicação realista de tatuagens  
- ⚡ **Streamlit** para uma interface simples e amigável  

---

## ✨ Funcionalidades Principais
- 📸 Upload de imagens do corpo e designs de tatuagem  
- 🎯 Posicionamento preciso da tatuagem na área desejada  
- 🔄 Ajuste de **tamanho**, **rotação** e **transparência**  
- 👁 Visualização realista com adaptação à curvatura da pele  
- 💾 Download do resultado final  

---

## 🚀 Como Executar

### Pré-requisitos
```bash
- Python **3.8+**  
- `pip`
```
### Instalação
Clone o repositório:

Instale as dependências:
```bash
pip install -r requirements.txt
```

Execute a aplicação:
```bash
streamlit run main.py
```

Acesse no navegador:
```bash
http://localhost:8501
```
---
## 🛠 Tecnologias Utilizadas

Streamlit
 - Interface web

OpenCV
 - Processamento de imagem

NumPy
 - Manipulação de arrays

Pillow
 - Processamento de imagem

Docker
 - Containerização (opcional)

---

##📦 Uso com Docker
# Build da imagem
```bash
docker build -t rtg-tattoo .
```
# Executar container
```bash
docker run -p 8501:8501 rtg-tattoo
```
---
## 🎯 Como Usar

Faça upload de uma foto da área onde deseja a tatuagem

Faça upload do design da tatuagem (PNG com fundo transparente)

Ajuste posição, tamanho e rotação usando os controles

Visualize o resultado em tempo real

Baixe a imagem final quando estiver satisfeito
```bash
📂 Estrutura do Projeto
RTG-Tattoo/
├── main.py                 # Aplicação principal Streamlit
├── requirements.txt        # Dependências do projeto
├── Dockerfile              # Configuração do container Docker
├── .gitignore              # Arquivos ignorados pelo Git
├── LICENSE                 # Licença MIT
└── images/                 # Diretório para imagens de exemplo
    ├── body_sample.jpg     # Exemplo de imagem corporal
    └── tattoo_sample.png   # Exemplo de design de tatuagem
```

---
## 🤝 Como Contribuir

Contribuições são sempre bem-vindas! Para contribuir:

Faça um Fork do projeto

Crie uma Branch para sua Feature
```bash
git checkout -b feature/AmazingFeature
```

Adicione suas mudanças
```bash
git add .
```

Faça o Commit
```bash
git commit -m 'Add AmazingFeature'
```

Faça o Push
```bash
git push origin feature/AmazingFeature
```

Abra um Pull Request 🎉

---

## 📝 Licença

Este projeto está sob a licença MIT.
Veja o arquivo LICENSE
 para mais detalhes.

---

## 📞 Contato

### 👤 Alex Ritzmann

[LinkedIn](https://www.linkedin.com/in/alexritzmann/)

📌 Link do Projeto: [RTG Tattoo](https://www.rtgtattoo.com.br/)

---




Quer que eu já prepare também um **`requirements.txt` inicial** com as dependências que você citou (
git clone https://github.com/alexritzmann/RTG-Tattoo.git
cd RTG-Tattoo
