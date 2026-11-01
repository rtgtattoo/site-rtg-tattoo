const field = (name, label, widget='string', extra={}) => ({name,label,widget,...extra});
const text = (name,label) => field(name,label,'text');
const image = (name,label) => field(name,label,'image',{allow_multiple:false});
const object = (name,label,fields,extra={}) => field(name,label,'object',{fields,...extra});
export const adminConfig = {
  backend:{name:'github',repo:'rtgtattoo/site-rtg-tattoo',branch:'main',base_url:'https://www.rtgtattoo.com.br',auth_endpoint:'api/auth'},
  locale:'pt',site_url:'https://www.rtgtattoo.com.br',display_url:'https://www.rtgtattoo.com.br',
  logo_url:'/assets/images/logo-png.PNG',media_folder:'public/uploads',public_folder:'/uploads',
  publish_mode:'editorial_workflow',
  slug:{encoding:'ascii',clean_accents:true,sanitize_replacement:'-'},
  collections:[{
    name:'site',label:'Textos, banners e contato',editor:{preview:false},files:[{
      name:'site',label:'Página inicial',file:'content/site.json',fields:[
        field('name','Nome do estúdio'),field('seoTitle','Título para o Google'),text('seoDescription','Descrição para o Google'),
        object('hero','Banner principal',[
          field('eyebrow','Texto acima do título'),text('title','Título (uma linha por frase)'),text('text','Apresentação'),image('image','Foto principal'),field('imageAlt','Descrição da foto para acessibilidade'),field('button','Texto do botão')
        ]),
        object('banner','Faixa de chamada',[
          field('enabled','Mostrar faixa','boolean',{default:true}),field('text','Texto da faixa'),field('button','Texto do botão')
        ]),field('portfolioTitle','Título do portfólio'),text('portfolioText','Apresentação do portfólio'),
        object('about','Sobre o estúdio',[
          text('title','Título'),text('text','História do estúdio'),image('image','Foto do estúdio'),field('imageAlt','Descrição da foto'),
          field('team','Equipe','list',{fields:[field('name','Nome'),field('role','Função'),image('image','Foto'),text('bio','Apresentação')],min:1,max:5})
        ]),
        object('contact','Contato e localização',[
          field('whatsapp','WhatsApp (país + DDD + número, só dígitos)', 'string',{pattern:['^[0-9]{10,15}$','Use apenas dígitos, incluindo país e DDD.']}),
          field('phoneLabel','Telefone formatado'),field('email','Email'),field('instagram','Link do Instagram'),field('instagramLabel','Nome no Instagram'),field('street','Rua e número'),field('neighborhood','Bairro'),field('city','Cidade'),field('state','Estado (sigla)'),field('hours','Horário de atendimento'),field('maps','Link do Google Maps')
        ]),
        field('faq','Dúvidas frequentes','list',{fields:[field('question','Pergunta'),text('answer','Resposta')]})
      ]
    }]
  },{
    name:'portfolio',label:'Portfólio de tatuagens',label_singular:'Tatuagem',folder:'content/portfolio',extension:'json',format:'json',create:true,
    slug:'{{slug}}',identifier_field:'title',summary:'{{title}} · {{category}}',preview_path:'portfolio/{{fields.slug}}/',
    editor:{preview:false},fields:[
      field('title','Nome do trabalho'),field('slug','Endereço da página (não altere após publicar)','string',{hint:'Ex.: borboleta-geometrica. Use letras minúsculas, números e hífens.',pattern:['^[a-z0-9]+(-[a-z0-9]+)*$','Use letras minúsculas, números e hífens.']}),
      field('published','Exibir no site','boolean',{default:false}),field('order','Ordem na galeria','number',{default:10,value_type:'int',min:0}),
      field('featured','Destaque na página inicial','boolean',{default:false,required:false,hint:'A página inicial mostra até 12 destaques, seguindo a Ordem na galeria (menores números primeiro). Os demais continuam no portfólio completo.'}),
      field('category','Categoria','select',{options:['Ilustração','Botânica','Escrita','Ornamental']}),image('image','Foto da tatuagem'),
      field('alt','Descrição visual da foto','string',{hint:'Descreva a imagem para quem não consegue vê-la.'}),
      text('description','Sobre o trabalho'),
      object('google','Publicação no Perfil da Empresa',[
        field('enabled','Publicar foto e postagem no Google após publicar o site','boolean',{default:false,hint:'Envia a foto à galeria e cria ou atualiza uma postagem com texto e link. Depende da integração ativa e do processamento e aprovação do Google.'}),
        field('text','Texto da postagem','text',{required:false,hint:'Opcional. Se vazio, será usada a descrição do trabalho.'})
      ],{required:false})
    ]
  }]
};
