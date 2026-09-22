<?php
/**
 * Template Site Institucional — Flávia Personal Chef & similares
 * Tipo: site — Padrão visual marketing (theme-marketing) adaptado, pagamento parametrizável, sem manutenção
 */
$siteTitulo = $proposta['titulo'] ?? 'Proposta Comercial — Criação de site institucional';
$siteSubtitulo = $proposta['subtitulo'] ?? '';
$siteCliente = $proposta['cliente_nome'] ?? $cliente ?? 'Cliente';
$siteCategoria = $dados['categoria_projeto'] ?? 'WEBSITE INSTITUCIONAL';
$siteObjetivo = $dados['secoes']['objetivo'] ?? $dados['objetivo_original'] ?? $dados['site_objetivo'] ?? '';
$siteBriefing = $dados['briefing'] ?? '';
$siteValorTotal = (float)($proposta['valor_total'] ?? $dados['site_valor_total'] ?? 2200);
$sitePrazo = $dados['site_prazo_dias'] ?? $dados['prazo_dias_uteis'] ?? '12';
$siteValidadeDias = $dados['site_validade_dias'] ?? $dados['validade_proposta'] ?? '10';
$sitePagamentoForma = $dados['site_pagamento_forma'] ?? $dados['forma_pagamento'] ?? 'pix_boleto';
$sitePagamentoModelo = $dados['site_pagamento_modelo'] ?? 'parcelado';
$sitePagamentoParcelas = $dados['site_pagamento_parcelas'] ?? [];
if (empty($sitePagamentoParcelas) || !is_array($sitePagamentoParcelas)) {
    $half = round($siteValorTotal / 2, 2);
    $sitePagamentoParcelas = [
        ['n' => 1, 'label' => 'Na aprovação', 'valor' => $half, 'vencimento' => 'na_aprovacao'],
        ['n' => 2, 'label' => 'Na entrega / aprovação final', 'valor' => $siteValorTotal - $half, 'vencimento' => 'na_entrega'],
    ];
}
$siteEscopo = $dados['site_escopo'] ?? $dados['escopo'] ?? [];
$siteEntregas = $dados['site_entregas'] ?? $dados['entregas'] ?? [];
$siteResponsabilidades = $dados['site_responsabilidades'] ?? $dados['responsabilidades_cliente'] ?? [];
$siteNaoIncluso = $dados['site_nao_incluso'] ?? $dados['nao_incluso'] ?? [];
if (empty($siteEscopo)) {
    $siteEscopo = [
        'planejamento' => ['Reunião de alinhamento', 'Organização de materiais enviados', 'Definição da estrutura de páginas/seções', 'Orientação sobre textos e imagens'],
        'design' => ['Layout personalizado com referências aprovadas', 'Paleta de cores e tipografia', 'Foco em gastronomia, elegância e clareza', '1 rodada de ajustes no layout'],
        'desenvolvimento' => ['Montagem na plataforma definida', 'Até 5 páginas/seções principais', 'Responsivo (desktop/tablet/celular)', 'WhatsApp + redes sociais + formulário condicional'],
        'testes' => ['Teste de navegação', 'Verificação de links/botões/form', 'Revisão mobile/desktop', 'Otimização de imagens + publicação + orientação'],
    ];
}
if (empty($siteEntregas)) $siteEntregas = ['Site responsivo','Layout personalizado','Até 5 páginas/seções','Sobre a chef e serviços','Galeria/portfólio','Depoimentos','Botão WhatsApp','Redes sociais','Formulário condicional','Publicação + 1 rodada de correções'];
if (empty($siteResponsabilidades)) $siteResponsabilidades = ['Logotipo e identidade','Textos sobre a chef/serviços','Descrição das experiências','Fotos/vídeos autorizados','Depoimentos autorizados','WhatsApp e contatos','Links de redes sociais','Acessos domínio/hospedagem'];
if (empty($siteNaoIncluso)) $siteNaoIncluso = ['Ensaio fotográfico','Produção de vídeos','Criação de logotipo/identidade','Redação integral','Domínio/hospedagem','Plugins/temas pagos','Loja/pagamentos','Reservas online','Área de clientes','CRM/automações','SEO avançado/anúncios','Gestão de redes','Tradução','Revisões ilimitadas'];
$siteInstagram = $dados['instagram_handle'] ?? '@distintowedding';
$siteEmail = $dados['email_contato'] ?? 'contato@wedistinto.com';
$siteWhatsapp = $dados['whatsapp_numero'] ?? '+55 27 9 8858-6935';

function normalizarValidadeSite($v){ if(empty($v)) return ''; $t=strtotime($v); return $t?date('Y-m-d',$t):''; }
function humanizarVencimentoSite($v){ $m=['na_aprovacao'=>'NA APROVAÇÃO','na_entrega'=>'NA ENTREGA / APROVAÇÃO FINAL','avista'=>'À VISTA','na_assinatura'=>'NA ASSINATURA']; $k=strtolower(trim($v)); return $m[$k]??strtoupper(str_replace('_',' ',$v)); }
$validadeISO = normalizarValidadeSite($proposta['validade'] ?? '');
$hoje = date('Y-m-d');
$vencida = ($validadeISO !== '' && $validadeISO < $hoje);
$validadeFmt = $validadeISO ? date('d/m/Y', strtotime($validadeISO)) : '—';
$formaLabel = $sitePagamentoForma === 'cartao' ? 'Cartão de crédito' : (in_array($sitePagamentoForma,['pix_boleto','boleto_pix'])?'PIX / Boleto':strtoupper($sitePagamentoForma));
$responsavelSaudacao = trim($dados['responsavel'] ?? $siteCliente);
$saudacao = explode(' ', $responsavelSaudacao)[0] ?? explode(' ', $siteCliente)[0] ?? 'CLIENTE';
if(empty($saudacao) || strtolower($saudacao)==='cliente') $saudacao = explode(' ', $siteCliente)[0] ?? 'CLIENTE';
?>
<div class="theme-marketing">
    <section class="proposal-page">
        <div class="page-content" style="grid-column:1;justify-content:center;padding:0;">
            <h1 style="font-family:var(--font-heading);font-weight:800;font-size:2rem;line-height:1;margin:0;text-transform:uppercase;letter-spacing:-2px;color:#000;width:80%;"><?= sanitizar($siteTitulo) ?></h1>
            <?php if(!empty($siteSubtitulo)): ?><p style="font-size:0.8em;text-transform:uppercase;letter-spacing:3px;color:rgba(0,0,0,0.4);font-weight:700;margin-top:2.5rem;line-height:1.4;"><?= sanitizar($siteSubtitulo) ?></p><?php endif; ?>
        </div>
    </section>
    <section class="proposal-page dark-page">
        <div class="page-content" style="grid-column:1;justify-content:center;">
            <h2 style="font-family:var(--font-heading);font-weight:800;font-size:3.25rem;line-height:1.1;margin:0;text-transform:uppercase;letter-spacing:-1px;color:#fff;width:60%;">PRESENÇA DIGITAL<br>QUE CONVERTE.</h2>
        </div>
        <div class="page-content" style="grid-column:2;justify-content:center;padding-left:2.5rem;height:100vh;padding-top:0;padding-bottom:0;">
            <div class="mission-text" style="color:#fff;font-size:clamp(14px,0.8rem,28px);line-height:1.5;opacity:0.9;">
                <h3 style="font-family:var(--font-heading);font-size:clamp(24px,1.75rem,56px);font-weight:800;margin-bottom:1rem;text-transform:uppercase;color:#fff;">OLÁ <?= mb_strtoupper($saudacao) ?>!</h3>
                <p style="font-weight:700;margin-bottom:1.25rem;">Seja bem-vindo à Poncem Studio | Distinto.</p>
                <p style="margin-bottom:0.9375rem;">Um site não é só um cartão de visitas — é o lugar onde a primeira impressão vira confiança e a confiança vira contato.<br><br>Para a <strong><?= sanitizar($siteCliente) ?></strong>, nossa missão é traduzir a elegância da cozinha em uma experiência digital leve, rápida e objetiva — que apresenta a chef, as experiências e facilita o próximo passo: falar no WhatsApp.</p>
                <p style="font-weight:700;margin-top:1.5rem;">Vamos tirar do papel?</p>
            </div>
        </div>
        <div class="side-gradient-container" style="grid-column:3;position:relative;height:100%;overflow:hidden;"><div class="abstract-gradient"></div></div>
    </section>
    <section class="proposal-page">
        <div class="page-content" style="grid-column:1;justify-content:center;"><h2 style="font-family:var(--font-heading);font-weight:800;font-size:3.25rem;line-height:1.1;margin:0;text-transform:uppercase;letter-spacing:-1px;color:#000;width:90%;">PARA ESTE PROJETO, QUAL SERÁ O NOSSO OBJETIVO?</h2></div>
        <div class="page-content" style="grid-column:2;justify-content:center;padding-left:2.5rem;"><div class="objective-text" style="color:#333;font-size:0.8em;line-height:1.6;opacity:0.9;"><?php if(!empty($siteObjetivo)): ?><?= nl2br(sanitizar($siteObjetivo)) ?><?php else: ?>Criação de presença digital mais sofisticada e organizada para <strong><?= sanitizar($siteCliente) ?></strong>, apresentando a chef, suas experiências gastronômicas, imagens, depoimentos e canais de atendimento de forma clara e convidativa, com visual elegante e navegação responsiva.<?php endif; ?><?php if(!empty($siteBriefing)): ?><p style="margin-top:14px;font-size:0.84rem;color:#6b7280;border-left:3px solid #000;padding-left:12px;"><?= nl2br(sanitizar($siteBriefing)) ?></p><?php endif; ?></div></div>
    </section>
    <?php
    $siteEtapasDefs=[
        ['id'=>'planejamento','rotulo'=>'PLANEJAMENTO','texto'=>'Tudo começa com clareza. Organizamos materiais, definimos a estrutura e a ordem das páginas para que o site conte a história da chef sem ruído.','itens'=>['Reunião de alinhamento','Organização de textos, fotos e depoimentos','Arquitetura das até 5 páginas/seções','Orientação sobre o que enviar'],'capsula'=>'1ª SEMANA'],
        ['id'=>'design','rotulo'=>'DESIGN','texto'=>'Layout personalizado com elegância e foco gastronômico — paleta, tipografia e ritmo visual pensados para transmitir sofisticação e apetite.','itens'=>['Moodboard com referências aprovadas','Sistema de cores e fontes','Grid responsivo (desktop/tablet/mobile)','1 rodada de ajustes inclusa'],'capsula'=>'1ª À 2ª SEMANA'],
        ['id'=>'desenvolvimento','rotulo'=>'DESENVOLVIMENTO','texto'=>'Montagem na plataforma definida, inserção de conteúdo e integrações de contato — tudo responsivo e leve.','itens'=>['Até 5 páginas: início, sobre, experiências, galeria, depoimentos, contato','Botão WhatsApp + redes sociais','Formulário condicional (quando suportado)','Otimização básica de imagens'],'capsula'=>'2ª À 3ª SEMANA'],
        ['id'=>'testes','rotulo'=>'TESTES & PUBLICAÇÃO','texto'=>'Navegação testada, links checados e publicação no domínio indicado — com orientação para atualizações futuras.','itens'=>['Testes de navegação e formulário','Revisão mobile/desktop','Publicação + checklist de entrega','Vídeo/guia rápido de atualização'],'capsula'=>'3ª SEMANA'],
    ];
    foreach($siteEtapasDefs as $idx=>$def):
    ?>
    <section class="proposal-page is-etapas">
        <div class="page-content" style="grid-column:1;justify-content:center;"><h2 style="font-family:var(--font-heading);font-weight:800;font-size:3.25rem;line-height:1.1;margin:0;text-transform:uppercase;letter-spacing:-1px;color:#000;width:80%;visibility:hidden;">ETAPAS DO<br>PROJETO</h2></div>
        <div class="page-content" style="grid-column:2 / span 2;flex-direction:row;align-items:center;padding-left:0;margin-left:-7rem;">
            <div style="display:flex;flex-direction:column;gap:0.75rem;width:14rem;flex-shrink:0;position:relative;z-index:9999;">
                <?php foreach($siteEtapasDefs as $p): ?>
                    <?php if($p['id']===$def['id']): ?><div style="padding:12px 1.875rem;border-radius:3.125rem;background:#000;color:#fff;text-align:center;font-weight:700;font-size:0.8em;text-transform:uppercase;letter-spacing:1px;position:relative;"><?= $p['rotulo'] ?><div style="position:absolute;right:-29px;top:50%;width:29px;height:1px;background:rgba(0,0,0,0.2);"></div></div>
                    <?php else: ?><div style="padding:12px 1.875rem;border-radius:3.125rem;border:1.5px solid #000;background:#fff;color:#000;text-align:center;font-weight:700;font-size:0.8em;text-transform:uppercase;letter-spacing:1px;"><?= $p['rotulo'] ?></div><?php endif; ?>
                <?php endforeach; ?>
            </div>
            <div style="margin-left:2rem;max-width:27rem;">
                <p style="font-size:1rem;line-height:1.5;color:#333;margin-bottom:1.25rem;"><?= sanitizar($def['texto']) ?></p>
                <ul style="list-style:none;padding:0;margin:0 0 25px 0;font-size:0.88rem;color:#444;line-height:1.8;"><?php foreach($def['itens'] as $it): ?><li>• <?= sanitizar($it) ?></li><?php endforeach; ?></ul>
                <div style="padding:15px 25px;border-radius:3.125rem;border:1px solid rgba(0,0,0,0.3);font-size:11px;font-weight:700;text-transform:uppercase;text-align:center;line-height:1.3;color:#000;letter-spacing:0.5px;width:fit-content;margin-top:1.5rem;"><?= $def['capsula'] ?></div>
            </div>
        </div>
    </section>
    <?php endforeach; ?>
    <section class="proposal-page dark-page is-etapas">
        <div class="page-content" style="grid-column:1;justify-content:center;"><h2 style="font-family:var(--font-heading);font-weight:800;font-size:3.25rem;line-height:1.1;margin:0;text-transform:uppercase;letter-spacing:-1px;color:#fff;width:80%;visibility:hidden;">ETAPAS DO<br>PROJETO</h2></div>
        <div class="page-content" style="grid-column:2 / span 2;flex-direction:row;align-items:center;padding-left:0;margin-left:-7rem;">
            <div style="display:flex;flex-direction:column;gap:0.75rem;width:14rem;flex-shrink:0;position:relative;z-index:9999;">
                <?php foreach($siteEtapasDefs as $p): ?><div style="padding:12px 1.875rem;border-radius:3.125rem;background:#fff;color:#000;text-align:center;font-weight:700;font-size:0.8em;text-transform:uppercase;letter-spacing:1px;"><?= $p['rotulo'] ?></div><?php endforeach; ?>
                <div style="position:absolute;right:-20px;top:20px;bottom:20px;width:20px;border:1.5px solid rgba(255,255,255,0.3);border-left:0;"></div>
            </div>
            <div style="margin-left:2rem;max-width:27rem;">
                <p style="font-size:1rem;line-height:1.5;color:#fff;margin-bottom:1.5625rem;">Cronograma estimado: <strong><?= $sitePrazo ?> DIAS ÚTEIS</strong> a partir da aprovação, pagamento inicial e entrega de todos os materiais.</p>
                <p style="font-size:0.85rem;line-height:1.5;color:rgba(255,255,255,0.7);">Prazos podem ser ajustados conforme aprovações e envio de conteúdos. Atrasos na entrega de textos/fotos/acessos impactam o prazo proporcionalmente.</p>
            </div>
        </div>
    </section>
    <section class="proposal-page is-investimento">
        <div class="page-content" style="grid-column:1;flex-direction:column;justify-content:center;gap:2.5rem;height:100vh;padding:0;">
            <h2 style="font-family:var(--font-heading);font-weight:800;font-size:3.25rem;line-height:1;margin:0;text-transform:uppercase;letter-spacing:-1px;color:#000;width:90%;">QUAL SERÁ O INVESTIMENTO PARA ESTE PROJETO</h2>
            <div style="padding:12px 25px;border-radius:3.125rem;border:1px solid <?= $vencida?'#ff4d4d':'rgba(0,0,0,0.3)' ?>;font-size:10px;font-weight:700;text-transform:uppercase;text-align:center;color:<?= $vencida?'#ff4d4d':'#000' ?>;letter-spacing:1px;width:fit-content;display:flex;align-items:center;gap:8px;"><?php if($vencida): ?><i data-lucide="alert-circle" style="width:0.8em;height:0.8em;"></i> PROPOSTA VENCIDA EM <?= $validadeFmt ?><?php else: ?>ESTA PROPOSTA É VÁLIDA ATÉ <?= $validadeFmt ?><?php endif; ?></div>
        </div>
        <div class="page-content" style="grid-column:2;flex-direction:column;align-items:center;justify-content:center;height:100vh;padding:0;">
            <div style="width:100%;max-height:85vh;overflow-y:auto;scrollbar-width:none;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2.5rem 0;">
            <div style="padding:8px 40px;border-radius:3.125rem;background:#333;color:#fff;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:0.75rem;">VALOR TOTAL DO PROJETO</div>
            <div style="font-family:var(--font-heading);font-size:4rem;font-weight:800;color:#000;margin-bottom:12px;"><?= formatarMoeda($siteValorTotal) ?></div>
            <div style="font-size:10px;color:#666;font-weight:600;text-transform:uppercase;margin-bottom:20px;"><?= $sitePagamentoModelo==='avista'?'À VISTA':'PARCELADO' ?> · <?= sanitizar($formaLabel) ?> · ATÉ 5 PÁGINAS</div>
            <div style="width:100%;display:flex;flex-direction:column;gap:8px;max-width:520px;">
                <?php foreach($sitePagamentoParcelas as $p): ?>
                <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-radius:12px;background:#fafafa;border:1px solid rgba(0,0,0,0.08);"><div><div style="font-size:0.82rem;font-weight:800;color:#111;"><?= sanitizar($p['label']) ?></div><div style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.6px;">#<?= (int)$p['n'] ?> · <?= sanitizar(humanizarVencimentoSite($p['vencimento']??'')) ?></div></div><div style="font-size:0.95rem;font-weight:800;color:#000;"><?= formatarMoeda($p['valor']) ?></div></div>
                <?php endforeach; ?>
            </div>
            <p style="margin-top:12px;font-size:10px;color:#6b7280;text-align:center;max-width:520px;"><?= sanitizar($dados['site_pagamento_obs']??'Publicação definitiva após quitação total. Escopo fechado desta proposta; adicionais orçados à parte.') ?></p>
            </div>
        </div>
    </section>
    <section class="proposal-page">
        <div class="page-content" style="grid-column:1;flex-direction:column;justify-content:center;gap:2.5rem;height:100vh;padding:0;">
            <h2 style="font-family:var(--font-heading);font-weight:800;font-size:3.25rem;line-height:1;margin:0;text-transform:uppercase;letter-spacing:-1px;color:#000;width:90%;">O QUE ESTÁ<br>INCLUSO &<br>RESPONSABILIDADES</h2>
            <div style="padding:12px 25px;border-radius:3.125rem;border:1px solid <?= $vencida?'#ff4d4d':'rgba(0,0,0,0.3)' ?>;font-size:10px;font-weight:700;text-transform:uppercase;text-align:center;color:<?= $vencida?'#ff4d4d':'#000' ?>;letter-spacing:1px;width:fit-content;display:flex;align-items:center;gap:8px;"><?php if($vencida): ?><i data-lucide="alert-circle" style="width:0.8em;height:0.8em;"></i> PROPOSTA VENCIDA EM <?= $validadeFmt ?><?php else: ?>ESTA PROPOSTA É VÁLIDA ATÉ <?= $validadeFmt ?><?php endif; ?></div>
        </div>
        <div class="page-content" style="grid-column:2;flex-direction:column;justify-content:center;height:100vh;padding:0;gap:18px;">
            <div style="width:100%;padding:1rem 0;">
                <div style="font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#000;margin-bottom:10px;">ENTREGAS PREVISTAS</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 18px;">
                    <?php foreach($siteEntregas as $e): ?><div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:#fff;border:1px solid rgba(0,0,0,0.08);border-radius:12px;"><span style="width:20px;height:20px;border-radius:50%;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;">✓</span><span style="font-size:0.82rem;font-weight:600;color:#111;"><?= sanitizar($e) ?></span></div><?php endforeach; ?>
                </div>
                <div style="font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#000;margin:18px 0 10px;">RESPONSABILIDADES DA CLIENTE</div>
                <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px;"><?php foreach($siteResponsabilidades as $r): ?><li style="display:flex;gap:10px;align-items:flex-start;font-size:0.84rem;color:#333;"><span style="margin-top:3px;width:7px;height:7px;border-radius:50%;background:#000;flex-shrink:0;"></span><?= sanitizar($r) ?></li><?php endforeach; ?></ul>
            </div>
        </div>
    </section>
    <section class="proposal-page">
        <div class="page-content" style="grid-column:1;flex-direction:column;justify-content:center;gap:1.5rem;">
            <h2 style="font-family:var(--font-heading);font-weight:800;font-size:3.25rem;line-height:1;margin:0;text-transform:uppercase;letter-spacing:-1px;color:#000;">REVISÕES<br>&<br>CRITÉRIOS</h2>
            <div style="padding:14px 18px;border-radius:12px;background:#000;color:#fff;display:inline-flex;align-items:center;gap:8px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;width:fit-content;">VALIDADE <?= $validadeFmt ?> · <?= sanitizar($siteValidadeDias) ?> DIAS CORRIDOS</div>
        </div>
        <div class="page-content" style="grid-column:2;flex-direction:column;justify-content:center;padding-left:2rem;gap:14px;">
            <div style="padding:16px;border-radius:16px;background:#fafafa;border:1px solid rgba(0,0,0,0.08);"><p style="font-size:0.9rem;font-weight:800;color:#111;margin:0 0 6px;">Incluso</p><p style="font-size:0.84rem;color:#444;margin:0;">1 rodada de ajustes no layout + 1 rodada de correções finais. Solicitações consolidadas por e-mail.</p></div>
            <div style="padding:16px;border-radius:16px;background:#fff;border:1px solid rgba(0,0,0,0.08);"><p style="font-size:0.9rem;font-weight:800;color:#111;margin:0 0 6px;">Fora do escopo</p><p style="font-size:0.84rem;color:#444;margin:0;">Mudança estrutural, novas páginas, troca completa de layout ou funcionalidades geram novo prazo/valor.</p></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px;"><?php foreach($siteNaoIncluso as $n): ?><div style="padding:8px 10px;border-radius:10px;background:#fff;border:1px solid rgba(0,0,0,0.07);font-size:0.78rem;color:#555;display:flex;gap:8px;align-items:center;"><span style="width:6px;height:6px;border-radius:50%;background:#9ca3af;flex-shrink:0;"></span><?= sanitizar($n) ?></div><?php endforeach; ?></div>
            <p style="margin-top:6px;font-size:9px;color:#9ca3af;font-style:italic;">Itens não inclusos são orçados à parte quando solicitados.</p>
        </div>
    </section>
    <section class="proposal-page dark-page">
        <div class="page-content" style="grid-column:1;flex-direction:column;justify-content:center;">
            <h2 style="font-family:var(--font-heading);font-weight:800;font-size:4rem;line-height:0.9;margin:0;text-transform:uppercase;letter-spacing:-2px;color:#fff;">VAMOS JUNTOS<br>TIRAR<br>DO PAPEL?</h2>
        </div>
        <div class="page-content" style="grid-column:2;flex-direction:column;align-items:flex-start;justify-content:center;padding-left:2.5rem;">
            <p style="font-size:18px;line-height:1.6;color:#fff;margin-bottom:2.5rem;font-weight:300;">Será um prazer tirar do papel um site à altura da sua cozinha — elegante, rápido e pronto para converter.</p>
            <p style="font-size:1rem;line-height:1.6;color:rgba(255,255,255,0.7);margin-bottom:40px;">Para aprovar, responda este link ou chame no WhatsApp informando <strong style="color:#fff;">Ref: <?= sanitizar($proposta['slug']??'') ?></strong>.</p>
            <div style="display:flex;flex-direction:column;gap:10px;">
                <a href="mailto:<?= sanitizar($siteEmail) ?>" style="color:#fff;text-decoration:none;font-size:1rem;font-weight:600;"><?= sanitizar($siteEmail) ?></a>
                <a href="https://wa.me/<?= preg_replace('/\D/','',$siteWhatsapp) ?>" target="_blank" style="color:#fff;text-decoration:none;font-size:1rem;font-weight:600;">WhatsApp: <?= sanitizar($siteWhatsapp) ?></a>
                <span style="font-size:0.82rem;color:rgba(255,255,255,0.6);"><?= sanitizar($siteInstagram) ?></span>
            </div>
        </div>
    </section>
</div>
