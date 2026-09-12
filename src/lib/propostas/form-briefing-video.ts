export interface BriefingVideoField {
  id: string;
  label: string;
  type: 'text' | 'tel' | 'email' | 'date' | 'time' | 'textarea' | 'radio' | 'checkbox' | 'select';
  required?: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
}

export interface BriefingVideoSection {
  section_name: string;
  description?: string;
  fields: BriefingVideoField[];
}

export interface BriefingVideoFormConfig {
  form_title: string;
  form_description: string;
  sections: BriefingVideoSection[];
}

export const briefingVideoConfig: BriefingVideoFormConfig = {
  form_title: 'Briefing para Orçamento de Vídeo',
  form_description:
    'Respostas rápidas (3 min) para gerarmos um orçamento preciso. Quanto mais detalhes, mais assertivo será o valor.',
  sections: [
    {
      section_name: '1. Identificação',
      description: 'Para já deixarmos seu orçamento vinculado ao seu cadastro',
      fields: [
        {
          id: 'nome_cliente',
          label: 'Seu nome',
          type: 'text',
          required: true,
          placeholder: 'Ex: Ana Silva',
        },
        {
          id: 'empresa',
          label: 'Empresa / Marca',
          type: 'text',
          placeholder: 'Ex: Ateliê da Ana — Doces Artesanais',
        },
        {
          id: 'whatsapp',
          label: 'WhatsApp (com DDD)',
          type: 'tel',
          required: true,
          placeholder: '(00) 00000-0000',
        },
        {
          id: 'email',
          label: 'E-mail',
          type: 'email',
          placeholder: 'seu@email.com',
        },
      ],
    },
    {
      section_name: '2. Objetivo e Distribuição',
      description: 'Onde o vídeo vai viver define formato e entrega',
      fields: [
        {
          id: 'objetivo_video',
          label: 'Qual é o objetivo principal do vídeo?',
          type: 'radio',
          required: true,
          options: [
            'Vender produto/serviço',
            'Mostrar ambiente / bastidores',
            'Fortalecer marca / autoridade',
            'Conteúdo para redes sociais',
            'Outro',
          ],
        },
        {
          id: 'onde_publicado',
          label: 'Onde ele será publicado? (pode marcar mais de um)',
          type: 'checkbox',
          required: true,
          options: [
            'Instagram Feed/Reels',
            'Stories',
            'Anúncios (Tráfego Pago)',
            'Site',
            'YouTube',
            'Outro',
          ],
        },
        {
          id: 'formato',
          label: 'Formatos necessários',
          type: 'radio',
          required: true,
          options: ['Só vertical (celular)', 'Só horizontal (YouTube/TV)', 'Ambos (vertical + horizontal)'],
        },
        {
          id: 'duracao_prevista',
          label: 'Duração aproximada do vídeo principal',
          type: 'radio',
          required: true,
          options: ['Até 30s', '30s - 1 min', '1 - 3 min', 'Acima de 3 min / Ainda não sei'],
        },
      ],
    },
    {
      section_name: '3. Conteúdo e Roteiro',
      fields: [
        {
          id: 'qtd_pessoas',
          label: 'Quantas pessoas vão aparecer no vídeo?',
          type: 'text',
          required: true,
          placeholder: 'Ex: 1 pessoa, 3 pessoas, só ambiente sem ninguém',
        },
        {
          id: 'tipo_gravacao',
          label: 'Será mais gravação cozinhando/preparando produto ou mostrando o ambiente?',
          type: 'radio',
          required: true,
          options: ['Alguém cozinhando/preparando', 'Só ambiente/decoração', 'Misto'],
        },
        {
          id: 'roteiro',
          label: 'Você já tem um roteiro ou precisa que a gente desenvolva?',
          type: 'radio',
          required: true,
          options: ['Já tenho roteiro', 'Preciso que desenvolvam', 'Tenho ideia, preciso de ajuda para lapidar'],
        },
        {
          id: 'audio',
          label: 'Precisa de captação de áudio com falas/narração ou só imagem + música?',
          type: 'radio',
          required: true,
          options: ['Só imagem + música', 'Com falas/narração', 'Ainda não sei'],
        },
      ],
    },
    {
      section_name: '4. Logística',
      fields: [
        {
          id: 'local_gravacao',
          label: 'Onde será a gravação? (endereço ou região)',
          type: 'textarea',
          required: true,
          placeholder: 'Ex: Rua das Flores, 123 — Centro, Vitória/ES — ponto de referência',
        },
        {
          id: 'data_gravacao',
          label: 'Já tem data e horário em mente para a gravação?',
          type: 'text',
          placeholder: 'Ex: 20/09 pela manhã, ou a combinar',
        },
        {
          id: 'prazo_entrega',
          label: 'Qual o prazo final para entrega do material finalizado?',
          type: 'date',
          required: true,
        },
      ],
    },
    {
      section_name: '5. Produção e Referências',
      fields: [
        {
          id: 'escopo',
          label: 'O que precisa contratar?',
          type: 'radio',
          required: true,
          options: [
            'Só gravação e edição',
            'Completo (roteiro + direção + maquiagem/cabelo se necessário)',
          ],
        },
        {
          id: 'cortes_pilulas',
          label: 'Quer extrair cortes menores (pílulas) da mesma gravação para outros formatos?',
          type: 'radio',
          required: true,
          options: ['Sim, quero pílulas', 'Não, só o vídeo principal'],
        },
        {
          id: 'verba_estimada',
          label: 'Tem uma verba estimada para este projeto? (opcional)',
          type: 'select',
          options: ['Ainda não sei', 'Até R$ 1.500', 'R$ 1.500 - R$ 4.000', 'Acima de R$ 4.000'],
        },
        {
          id: 'referencia',
          label: 'Tem referência de vídeo no estilo que imagina? Cole o link aqui',
          type: 'textarea',
          placeholder: 'Ex: https://instagram.com/... ou https://youtube.com/...',
        },
      ],
    },
  ],
};
