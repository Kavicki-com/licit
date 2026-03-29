/**
 * Keywords used to filter IT-related bids from PNCP.
 * Based on the company's CNAE activities (CNPJ 45.625.800/0001-36).
 */
export const IT_KEYWORDS = [
    // Suporte técnico e manutenção em TI
    'suporte técnico',
    'manutenção de sistemas',
    'manutenção de software',
    'manutenção de hardware',
    'help desk',
    'service desk',
    'assistência técnica em informática',
    'suporte em ti',
    'suporte em tecnologia',

    // Consultoria em TI
    'consultoria em tecnologia',
    'consultoria em ti',
    'consultoria em informática',
    'consultoria técnica',

    // Tratamento de dados
    'tratamento de dados',
    'processamento de dados',
    'banco de dados',
    'análise de dados',
    'gestão de dados',
    'data center',

    // Provedores de serviço e hospedagem
    'hospedagem',
    'hosting',
    'cloud computing',
    'computação em nuvem',
    'serviço de aplicação',
    'saas',
    'iaas',
    'paas',
    'infraestrutura de ti',
    'servidor',

    // Portais, conteúdo e internet
    'portal',
    'provedor de conteúdo',
    'serviços de internet',
    'intranet',

    // Desenvolvimento de software
    'desenvolvimento de sistema',
    'desenvolvimento de software',
    'desenvolvimento de programa',
    'sistema customizáve',
    'software customizáve',
    'programa de computador',
    'sistema sob encomenda',
    'software sob encomenda',
    'fábrica de software',
    'desenvolvimento de aplicativo',
    'desenvolvimento de app',
    'desenvolvimento de solução',

    // Web design
    'web design',
    'design de interface',
    'interface para internet',
    'desenvolvimento web',
    'criação de site',
    'criação de website',
    'design de website',
    'front-end',
    'frontend',
    'layout web',

    // Termos gerais de TI frequentes em editais
    'tecnologia da informação',
    'informática',
    'solução de ti',
    'serviço de ti',
    'segurança da informação',
    'lgpd',
    'sistema de informação',
    'licença de software',
    'licenciamento de software',
    'rede de computadores',
    'cabeamento estruturado',
    'firewall',
    'antivírus',
    'backup',
    'virtualização',
    'monitoramento de rede',
    'gestão de ti',
    'governança de ti',
];

/**
 * CNAEs associated with CNPJ 45.625.800/0001-36
 */
export const COMPANY_CNAES = [
    '6209-1/00', // Suporte técnico, manutenção e outros serviços em TI
    '6204-0/00', // Consultoria em tecnologia da informação
    '6311-9/00', // Tratamento de dados, provedores de serviços de aplicação e serviços de hospedagem na internet
    '6319-4/00', // Portais, provedores de conteúdo e outros serviços de informação na internet
    '6201-5/01', // Desenvolvimento de programas de computador sob encomenda
    '6202-3/00', // Desenvolvimento e licenciamento de programas de computador customizáveis
    '6319-4/00', // Portais, provedores de conteúdo e outros serviços de informação na internet
    '6201-5/02', // Web design
];

/**
 * Checks if a text matches any IT keyword.
 */
export function matchesITKeywords(text: string): boolean {
    if (!text) return false;
    const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    return IT_KEYWORDS.some((keyword) => {
        const normalizedKeyword = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return normalized.includes(normalizedKeyword);
    });
}

/**
 * Checks if a bid object or description matches IT criteria.
 */
export function isITRelated(objetoCompra: string, informacaoComplementar?: string | null): boolean {
    return matchesITKeywords(objetoCompra) || matchesITKeywords(informacaoComplementar || '');
}
