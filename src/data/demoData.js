/* ==========================================================================
   ESTRUTURA DE DADOS MOCK / DEMONSTRAÇÃO DO SYSCOR - 100% SERIALIZADO
   ========================================================================== */

// --- Vendedores e Usuários ---
export const VENDEDORES = [
  { id: 'vend-1', nome: 'Guilherme Caixeta', email: 'guilhermecaixeta@vivo4redes.com' },
  { id: 'vend-2', nome: 'VILTON JODEVON SOARES FERREIRA', email: 'vilton.ferreira@vivo4redes.com' },
  { id: 'vend-3', nome: 'Marina Ferreira', email: 'marina.ferreira@vivo4redes.com' },
  { id: 'vend-4', nome: 'Lucas Andrade', email: 'lucas.andrade@vivo4redes.com' },
  { id: 'vend-5', nome: 'Rafael Lima', email: 'rafael.lima@vivo4redes.com' }
];

// --- Pontos de Venda (PDVs) ---
export const PDVS = [
  { id: 'pdv-1', codigo: '0142', nome: 'Loja Shopping Centro', regional: 'CO', uf: 'DF' },
  { id: 'pdv-2', codigo: '0198', nome: 'Loja Bairro Industrial', regional: 'CO', uf: 'GO' },
  { id: 'pdv-3', codigo: '0231', nome: 'Quiosque Rodoviária', regional: 'CO', uf: 'DF' }
];

// --- Clientes Cadastrados & LGPD ---
export const clientesDemo = [
  { id: 'cli-1', nome: 'Ana Beatriz Souza', doc: '123.456.789-00', documento: '123.456.789-00', tel: '(61) 99811-2233', telefone: '(61) 99811-2233', email: 'ana.souza@email.com', lgpd: 'opt-in', optIn: true, desde: '12/03/2024', termoVersao: 'v2.1' },
  { id: 'cli-2', nome: 'Carlos Eduardo Lima', doc: '987.654.321-00', documento: '987.654.321-00', tel: '(61) 98722-1190', telefone: '(61) 98722-1190', email: 'carlos.lima@email.com', lgpd: 'opt-in', optIn: true, desde: '02/07/2023', termoVersao: 'v2.1' },
  { id: 'cli-3', nome: 'Fernanda Ribeiro Telecom Ltda', doc: '12.345.678/0001-90', documento: '12.345.678/0001-90', tel: '(61) 3555-0101', telefone: '(61) 3555-0101', email: 'contato@fernandatelecom.com.br', lgpd: 'opt-out', optIn: false, desde: '19/11/2022' },
  { id: 'cli-4', nome: 'João Pedro Martins', doc: '456.789.123-00', documento: '456.789.123-00', tel: '(61) 99100-4477', telefone: '(61) 99100-4477', email: 'joao.martins@email.com', lgpd: 'opt-in', optIn: true, desde: '05/01/2026', termoVersao: 'v2.1' },
  { id: 'cli-5', nome: 'Marina Alves Costa', doc: '321.654.987-00', documento: '321.654.987-00', tel: '(61) 98888-6655', telefone: '(61) 98888-6655', email: 'marina.costa@email.com', lgpd: 'opt-in', optIn: true, desde: '27/06/2025', termoVersao: 'v2.1' },
  { id: 'cli-6', nome: 'Caio Silva de Sousa', doc: '049.882.111-90', documento: '049.882.111-90', tel: '(61) 99437-3977', telefone: '(61) 99437-3977', email: 'caio.sousa@email.com', lgpd: 'opt-in', optIn: true, desde: '15/02/2026', termoVersao: 'v2.1' }
];

export const CLIENTES_INICIAIS = clientesDemo;

// --- Catálogo de Seriais (IMEIs de Aparelhos + Seriais de Acessórios + ICCIDs de Chips) ---
export const imeiDemo = [
  // ================= APPLE =================
  // Apple iPhone 16 Pro Max 256GB
  { nome: 'Apple iPhone 16 Pro Max 256GB Titânio Preto', sku: 'SKU-APL-16PM', imei: '354890123456781', imeiOuSerial: '354890123456781', preco: 9499.0, valorUnitario: 9499.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Apple iPhone 16 Pro Max 256GB Titânio Preto', sku: 'SKU-APL-16PM', imei: '354890123456782', imeiOuSerial: '354890123456782', preco: 9499.0, valorUnitario: 9499.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Apple iPhone 16 Pro Max 256GB Titânio Preto', sku: 'SKU-APL-16PM', imei: '354890123456783', imeiOuSerial: '354890123456783', preco: 9499.0, valorUnitario: 9499.0, cat: 'produto-vivo', status: 'DISPONIVEL' },

  // Apple iPhone 15 Pro 128GB
  { nome: 'Apple iPhone 15 Pro 128GB Titânio Natural', sku: 'SKU-APL-15P', imei: '356781290345601', imeiOuSerial: '356781290345601', preco: 6299.0, valorUnitario: 6299.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Apple iPhone 15 Pro 128GB Titânio Natural', sku: 'SKU-APL-15P', imei: '356781290345602', imeiOuSerial: '356781290345602', preco: 6299.0, valorUnitario: 6299.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Apple iPhone 15 Pro 128GB Titânio Natural', sku: 'SKU-APL-15P', imei: '356781290345603', imeiOuSerial: '356781290345603', preco: 6299.0, valorUnitario: 6299.0, cat: 'produto-vivo', status: 'DISPONIVEL' },

  // Apple iPhone 15 128GB
  { nome: 'Apple iPhone 15 128GB Preto', sku: 'SKU-APL-15128', imei: '357890123987601', imeiOuSerial: '357890123987601', preco: 4699.0, valorUnitario: 4699.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Apple iPhone 15 128GB Preto', sku: 'SKU-APL-15128', imei: '357890123987602', imeiOuSerial: '357890123987602', preco: 4699.0, valorUnitario: 4699.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Apple iPhone 15 128GB Preto', sku: 'SKU-APL-15128', imei: '357890123987603', imeiOuSerial: '357890123987603', preco: 4699.0, valorUnitario: 4699.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Apple iPhone 15 128GB Preto', sku: 'SKU-APL-15128', imei: '357890123987604', imeiOuSerial: '357890123987604', preco: 4699.0, valorUnitario: 4699.0, cat: 'produto-vivo', status: 'DISPONIVEL' },

  // Apple iPhone 14 128GB (unificado com SKU-1042 / SKU-APL-14128)
  { nome: 'iPhone 14 128GB', sku: 'SKU-1042', imei: '352849102938471', imeiOuSerial: '352849102938471', preco: 3899.0, valorUnitario: 3899.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'iPhone 14 128GB', sku: 'SKU-1042', imei: '352849102938472', imeiOuSerial: '352849102938472', preco: 3899.0, valorUnitario: 3899.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'iPhone 14 128GB', sku: 'SKU-1042', imei: '352849102938473', imeiOuSerial: '352849102938473', preco: 3899.0, valorUnitario: 3899.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'iPhone 14 128GB', sku: 'SKU-1042', imei: '352849102938474', imeiOuSerial: '352849102938474', preco: 3899.0, valorUnitario: 3899.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'iPhone 14 128GB', sku: 'SKU-1042', imei: '352849102938475', imeiOuSerial: '352849102938475', preco: 3899.0, valorUnitario: 3899.0, cat: 'produto-vivo', status: 'DISPONIVEL' },

  // ================= SAMSUNG =================
  // Samsung Galaxy S24 Ultra 512GB
  { nome: 'Samsung Galaxy S24 Ultra 512GB Titânio Cinza', sku: 'SKU-SAM-S24U', imei: '358941092837411', imeiOuSerial: '358941092837411', preco: 7999.0, valorUnitario: 7999.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Samsung Galaxy S24 Ultra 512GB Titânio Cinza', sku: 'SKU-SAM-S24U', imei: '358941092837412', imeiOuSerial: '358941092837412', preco: 7999.0, valorUnitario: 7999.0, cat: 'produto-vivo', status: 'DISPONIVEL' },

  // Samsung Galaxy S23 128GB (SKU-001)
  { nome: 'Samsung Galaxy S23 128GB', sku: 'SKU-001', imei: '358941092837461', imeiOuSerial: '358941092837461', preco: 2899.0, valorUnitario: 2899.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Samsung Galaxy S23 128GB', sku: 'SKU-001', imei: '358941092837462', imeiOuSerial: '358941092837462', preco: 2899.0, valorUnitario: 2899.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Samsung Galaxy S23 128GB', sku: 'SKU-001', imei: '358941092837463', imeiOuSerial: '358941092837463', preco: 2899.0, valorUnitario: 2899.0, cat: 'produto-vivo', status: 'DISPONIVEL' },

  // Samsung Galaxy A55 256GB (SKU-1187)
  { nome: 'Galaxy A55 256GB', sku: 'SKU-1187', imei: '354862118273941', imeiOuSerial: '354862118273941', preco: 1899.0, valorUnitario: 1899.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Galaxy A55 256GB', sku: 'SKU-1187', imei: '354862118273942', imeiOuSerial: '354862118273942', preco: 1899.0, valorUnitario: 1899.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Galaxy A55 256GB', sku: 'SKU-1187', imei: '354862118273943', imeiOuSerial: '354862118273943', preco: 1899.0, valorUnitario: 1899.0, cat: 'produto-vivo', status: 'DISPONIVEL' },

  // Samsung Galaxy A15 5G 128GB
  { nome: 'Samsung Galaxy A15 5G 128GB Azul Claro', sku: 'SKU-SAM-A15', imei: '354862118273911', imeiOuSerial: '354862118273911', preco: 999.0, valorUnitario: 999.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Samsung Galaxy A15 5G 128GB Azul Claro', sku: 'SKU-SAM-A15', imei: '354862118273912', imeiOuSerial: '354862118273912', preco: 999.0, valorUnitario: 999.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Samsung Galaxy A15 5G 128GB Azul Claro', sku: 'SKU-SAM-A15', imei: '354862118273913', imeiOuSerial: '354862118273913', preco: 999.0, valorUnitario: 999.0, cat: 'produto-vivo', status: 'DISPONIVEL' },

  // ================= MOTOROLA =================
  // Motorola Edge 40 256GB (SKU-003)
  { nome: 'Motorola Edge 40 256GB', sku: 'SKU-003', imei: '359182736451921', imeiOuSerial: '359182736451921', preco: 2199.0, valorUnitario: 2199.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Motorola Edge 40 256GB', sku: 'SKU-003', imei: '359182736451922', imeiOuSerial: '359182736451922', preco: 2199.0, valorUnitario: 2199.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Motorola Edge 40 256GB', sku: 'SKU-003', imei: '359182736451923', imeiOuSerial: '359182736451923', preco: 2199.0, valorUnitario: 2199.0, cat: 'produto-vivo', status: 'DISPONIVEL' },

  // Moto G84 5G 256GB
  { nome: 'Moto G84 5G 256GB Viva Magenta', sku: 'SKU-MOT-G84', imei: '359182736451981', imeiOuSerial: '359182736451981', preco: 1499.0, valorUnitario: 1499.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Moto G84 5G 256GB Viva Magenta', sku: 'SKU-MOT-G84', imei: '359182736451982', imeiOuSerial: '359182736451982', preco: 1499.0, valorUnitario: 1499.0, cat: 'produto-vivo', status: 'DISPONIVEL' },

  // ================= XIAOMI =================
  // Xiaomi Redmi Note 13 Pro 5G
  { nome: 'Xiaomi Redmi Note 13 Pro 5G 256GB Midnight Black', sku: 'SKU-XIA-RN13P', imei: '357192830192831', imeiOuSerial: '357192830192831', preco: 2499.0, valorUnitario: 2499.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Xiaomi Redmi Note 13 Pro 5G 256GB Midnight Black', sku: 'SKU-XIA-RN13P', imei: '357192830192832', imeiOuSerial: '357192830192832', preco: 2499.0, valorUnitario: 2499.0, cat: 'produto-vivo', status: 'DISPONIVEL' },

  // ================= CHIPS / SIMCARDS (SERIAL ICCID) =================
  { nome: 'Chip pré-pago Vivo', sku: 'SKU-3010', imei: '895502114488991', imeiOuSerial: '895502114488991', preco: 15.0, valorUnitario: 15.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Chip pré-pago Vivo', sku: 'SKU-3010', imei: '895502114488992', imeiOuSerial: '895502114488992', preco: 15.0, valorUnitario: 15.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Chip pré-pago Vivo', sku: 'SKU-3010', imei: '895502114488993', imeiOuSerial: '895502114488993', preco: 15.0, valorUnitario: 15.0, cat: 'produto-vivo', status: 'DISPONIVEL' },
  { nome: 'Chip pré-pago Vivo', sku: 'SKU-3010', imei: '895502114488994', imeiOuSerial: '895502114488994', preco: 15.0, valorUnitario: 15.0, cat: 'produto-vivo', status: 'DISPONIVEL' },

  // ================= ACESSÓRIOS SERIALIZADOS (TODOS COM SERIAL) =================
  // Capa Protetora Reforçada (SKU-2093)
  { nome: 'Capa protetora reforçada', sku: 'SKU-2093', imei: 'CAP-2093-SN001', imeiOuSerial: 'CAP-2093-SN001', preco: 69.9, valorUnitario: 69.9, cat: 'acessorio', status: 'DISPONIVEL' },
  { nome: 'Capa protetora reforçada', sku: 'SKU-2093', imei: 'CAP-2093-SN002', imeiOuSerial: 'CAP-2093-SN002', preco: 69.9, valorUnitario: 69.9, cat: 'acessorio', status: 'DISPONIVEL' },

  // Fone Bluetooth TWS (SKU-2140)
  { nome: 'Fone Bluetooth TWS', sku: 'SKU-2140', imei: '869900112233441', imeiOuSerial: '869900112233441', preco: 149.9, valorUnitario: 149.9, cat: 'acessorio', status: 'DISPONIVEL' },
  { nome: 'Fone Bluetooth TWS', sku: 'SKU-2140', imei: '869900112233442', imeiOuSerial: '869900112233442', preco: 149.9, valorUnitario: 149.9, cat: 'acessorio', status: 'DISPONIVEL' },
  { nome: 'Fone Bluetooth TWS', sku: 'SKU-2140', imei: '869900112233443', imeiOuSerial: '869900112233443', preco: 149.9, valorUnitario: 149.9, cat: 'acessorio', status: 'DISPONIVEL' },
  { nome: 'Fone Bluetooth TWS', sku: 'SKU-2140', imei: '869900112233445', imeiOuSerial: '869900112233445', preco: 149.9, valorUnitario: 149.9, cat: 'acessorio', status: 'DISPONIVEL' },

  // Película de Vidro 3D Premium
  { nome: 'Película de Vidro 3D Premium', sku: 'SKU-ACS-PEL-3D', imei: 'PEL-3D-991021', imeiOuSerial: 'PEL-3D-991021', preco: 49.9, valorUnitario: 49.9, cat: 'acessorio', status: 'DISPONIVEL' },
  { nome: 'Película de Vidro 3D Premium', sku: 'SKU-ACS-PEL-3D', imei: 'PEL-3D-991022', imeiOuSerial: 'PEL-3D-991022', preco: 49.9, valorUnitario: 49.9, cat: 'acessorio', status: 'DISPONIVEL' },
  { nome: 'Película de Vidro 3D Premium', sku: 'SKU-ACS-PEL-3D', imei: 'PEL-3D-991023', imeiOuSerial: 'PEL-3D-991023', preco: 49.9, valorUnitario: 49.9, cat: 'acessorio', status: 'DISPONIVEL' },

  // Carregador Turbo Power 30W USB-C
  { nome: 'Carregador Turbo Power 30W USB-C', sku: 'SKU-ACS-CARG-30W', imei: 'CHG-30W-44101', imeiOuSerial: 'CHG-30W-44101', preco: 129.9, valorUnitario: 129.9, cat: 'acessorio', status: 'DISPONIVEL' },
  { nome: 'Carregador Turbo Power 30W USB-C', sku: 'SKU-ACS-CARG-30W', imei: 'CHG-30W-44102', imeiOuSerial: 'CHG-30W-44102', preco: 129.9, valorUnitario: 129.9, cat: 'acessorio', status: 'DISPONIVEL' },

  // Cabo USB-C para Lightning Reforçado 1.2m
  { nome: 'Cabo USB-C para Lightning Reforçado 1.2m', sku: 'SKU-ACS-CABO-LTG', imei: 'CAB-LTG-77011', imeiOuSerial: 'CAB-LTG-77011', preco: 79.9, valorUnitario: 79.9, cat: 'acessorio', status: 'DISPONIVEL' },
  { nome: 'Cabo USB-C para Lightning Reforçado 1.2m', sku: 'SKU-ACS-CABO-LTG', imei: 'CAB-LTG-77012', imeiOuSerial: 'CAB-LTG-77012', preco: 79.9, valorUnitario: 79.9, cat: 'acessorio', status: 'DISPONIVEL' }
];

export const CATALOGO_PRODUTOS = {
  PRODUTO_VIVO: imeiDemo
    .filter(i => i.cat === 'produto-vivo')
    .map(i => ({ imeiOuSerial: i.imeiOuSerial, descricao: i.nome, valorUnitario: i.preco })),
  SERVICO_VIVO: [
    { imeiOuSerial: 'PLN-CTL-15GB', descricao: 'Plano Vivo Controle 15GB', valorUnitario: 59.90 },
    { imeiOuSerial: 'PLN-CTL-25GB', descricao: 'Plano Vivo Controle 25GB', valorUnitario: 74.90 },
    { imeiOuSerial: 'PLN-POS-50GB', descricao: 'Plano Vivo Pós 50GB', valorUnitario: 119.90 },
    { imeiOuSerial: 'PLN-FAM-120GB', descricao: 'Plano Vivo Família 120GB', valorUnitario: 180.00 },
    { imeiOuSerial: 'FIBRA-500M', descricao: 'Vivo Fibra 500 Mega', valorUnitario: 120.00 }
  ],
  ACESSORIO: imeiDemo
    .filter(i => i.cat === 'acessorio')
    .map(i => ({ imeiOuSerial: i.imeiOuSerial, descricao: i.nome, valorUnitario: i.preco })),
  RECARGA: [
    { imeiOuSerial: 'REC-15', descricao: 'Recarga R$ 15,00', valorUnitario: 15.00 },
    { imeiOuSerial: 'REC-20', descricao: 'Recarga R$ 20,00', valorUnitario: 20.00 },
    { imeiOuSerial: 'REC-30', descricao: 'Recarga R$ 30,00', valorUnitario: 30.00 },
    { imeiOuSerial: 'REC-50', descricao: 'Recarga R$ 50,00', valorUnitario: 50.00 }
  ]
};

// --- Estoque e Saldos Físicos Consolidados por SKU ---
export const estoqueDemo = [
  // Apple
  { sku: 'SKU-APL-16PM', nome: 'Apple iPhone 16 Pro Max 256GB Titânio Preto', cat: 'Produto Vivo', saldo: 3, min: 2, status: 'ok', preco: 9499.00 },
  { sku: 'SKU-APL-15P', nome: 'Apple iPhone 15 Pro 128GB Titânio Natural', cat: 'Produto Vivo', saldo: 3, min: 2, status: 'ok', preco: 6299.00 },
  { sku: 'SKU-APL-15128', nome: 'Apple iPhone 15 128GB Preto', cat: 'Produto Vivo', saldo: 4, min: 3, status: 'ok', preco: 4699.00 },
  { sku: 'SKU-1042', nome: 'iPhone 14 128GB', cat: 'Produto Vivo', saldo: 5, min: 3, status: 'ok', preco: 3899.00 },

  // Samsung
  { sku: 'SKU-SAM-S24U', nome: 'Samsung Galaxy S24 Ultra 512GB Titânio Cinza', cat: 'Produto Vivo', saldo: 2, min: 2, status: 'ok', preco: 7999.00 },
  { sku: 'SKU-001', nome: 'Samsung Galaxy S23 128GB', cat: 'Produto Vivo', saldo: 3, min: 2, status: 'ok', preco: 2899.00 },
  { sku: 'SKU-1187', nome: 'Galaxy A55 256GB', cat: 'Produto Vivo', saldo: 3, min: 3, status: 'ok', preco: 1899.00 },
  { sku: 'SKU-SAM-A15', nome: 'Samsung Galaxy A15 5G 128GB Azul Claro', cat: 'Produto Vivo', saldo: 3, min: 3, status: 'ok', preco: 999.00 },

  // Motorola
  { sku: 'SKU-003', nome: 'Motorola Edge 40 256GB', cat: 'Produto Vivo', saldo: 3, min: 2, status: 'ok', preco: 2199.00 },
  { sku: 'SKU-MOT-G84', nome: 'Moto G84 5G 256GB Viva Magenta', cat: 'Produto Vivo', saldo: 2, min: 2, status: 'ok', preco: 1499.00 },

  // Xiaomi
  { sku: 'SKU-XIA-RN13P', nome: 'Xiaomi Redmi Note 13 Pro 5G 256GB Midnight Black', cat: 'Produto Vivo', saldo: 2, min: 2, status: 'ok', preco: 2499.00 },

  // Chips
  { sku: 'SKU-3010', nome: 'Chip pré-pago Vivo', cat: 'Produto Vivo', saldo: 4, min: 5, status: 'baixo', preco: 15.00 },

  // Acessórios
  { sku: 'SKU-2093', nome: 'Capa protetora reforçada', cat: 'Acessório', saldo: 2, min: 5, status: 'baixo', preco: 69.90 },
  { sku: 'SKU-2140', nome: 'Fone Bluetooth TWS', cat: 'Acessório', saldo: 4, min: 3, status: 'ok', preco: 149.90 },
  { sku: 'SKU-ACS-PEL-3D', nome: 'Película de Vidro 3D Premium', cat: 'Acessório', saldo: 3, min: 5, status: 'baixo', preco: 49.90 },
  { sku: 'SKU-ACS-CARG-30W', nome: 'Carregador Turbo Power 30W USB-C', cat: 'Acessório', saldo: 2, min: 3, status: 'baixo', preco: 129.90 },
  { sku: 'SKU-ACS-CABO-LTG', nome: 'Cabo USB-C para Lightning Reforçado 1.2m', cat: 'Acessório', saldo: 2, min: 3, status: 'baixo', preco: 79.90 }
];

// --- Inventário & Conciliação SAP IQ09 ---
export const sapIq09Demo = [
  { material: 'SKU-APL-16PM', serial: '354890123456781', descricao: 'Apple iPhone 16 Pro Max 256GB Titânio Preto', deposito: 'DP01', statusSap: 'DISP' },
  { material: 'SKU-APL-16PM', serial: '354890123456782', descricao: 'Apple iPhone 16 Pro Max 256GB Titânio Preto', deposito: 'DP01', statusSap: 'DISP' },
  { material: 'SKU-APL-16PM', serial: '354890123456783', descricao: 'Apple iPhone 16 Pro Max 256GB Titânio Preto', deposito: 'DP01', statusSap: 'DISP' },

  { material: 'SKU-1042', serial: '352849102938471', descricao: 'iPhone 14 128GB', deposito: 'DP01', statusSap: 'DISP' },
  { material: 'SKU-1042', serial: '352849102938472', descricao: 'iPhone 14 128GB', deposito: 'DP01', statusSap: 'DISP' },
  { material: 'SKU-1042', serial: '352849102938473', descricao: 'iPhone 14 128GB', deposito: 'DP01', statusSap: 'DISP' },

  { material: 'SKU-001', serial: '358941092837461', descricao: 'Samsung Galaxy S23 128GB', deposito: 'DP01', statusSap: 'DISP' },
  { material: 'SKU-001', serial: '358941092837462', descricao: 'Samsung Galaxy S23 128GB', deposito: 'DP01', statusSap: 'DISP' },

  { material: 'SKU-1187', serial: '354862118273941', descricao: 'Galaxy A55 256GB', deposito: 'DP01', statusSap: 'DISP' },
  { material: 'SKU-1187', serial: '354862118273942', descricao: 'Galaxy A55 256GB', deposito: 'DP01', statusSap: 'DISP' },

  { material: 'SKU-2093', serial: 'CAP-2093-SN001', descricao: 'Capa protetora reforçada', deposito: 'DP01', statusSap: 'DISP' },
  { material: 'SKU-2140', serial: '869900112233441', descricao: 'Fone Bluetooth TWS', deposito: 'DP01', statusSap: 'DISP' },
  { material: 'SKU-3010', serial: '895502114488991', descricao: 'Chip pré-pago Vivo', deposito: 'DP01', statusSap: 'DISP' }
];

// --- Consolidado de Remuneração & Produção Vivo ---
export const consolidadoVivoDemo = [
  { idTransacao: 'TRX-9941', acesso: '61994373977', cliente: 'Caio Silva de Sousa', cpf: '049.882.111-90', plano: 'Vivo Controle 30GB', valorComissao: 59.90, dataVenda: '2026-08-28' },
  { idTransacao: 'TRX-9942', acesso: '61981223344', cliente: 'Mariana Costa Ramos', cpf: '512.430.881-22', plano: 'Vivo Pos Individual 50GB', valorComissao: 119.90, dataVenda: '2026-08-29' },
  { idTransacao: 'TRX-9943', acesso: '61988776655', cliente: 'Carlos Alberto Meireles', cpf: '331.890.111-04', plano: 'Vivo Familia 2 120GB', valorComissao: 180.00, dataVenda: '2026-08-30' },
  { idTransacao: 'TRX-9944', acesso: '61991112233', cliente: 'Fernanda Lima de Paula', cpf: '822.419.001-77', plano: 'Vivo Fibra 500M', valorComissao: 120.00, dataVenda: '2026-08-31' }
];

// --- Gestão Documental & Protocolos GED ---
export const documentalDemo = [
  { id: 'doc-1', nome: 'Contrato_Caio_Silva_VivoControle.pdf', vinc: 'Caio Silva de Sousa', tipo: 'Contrato', data: '28/08/2026', tam: '1.4 MB', status: 'APROVADO' },
  { id: 'doc-2', nome: 'Termo_Adesao_Mariana_Costa.pdf', vinc: 'Mariana Costa Ramos', tipo: 'Termo', data: '29/08/2026', tam: '850 KB', status: 'APROVADO' },
  { id: 'doc-3', nome: 'Contrato_locacao_matriz.pdf', vinc: 'Filial Matriz', tipo: 'Contrato', data: '14/08/2026', tam: '1.2 MB', status: 'APROVADO' },
  { id: 'doc-4', nome: 'NF-e_4821.xml', vinc: 'Venda #4821', tipo: 'Nota fiscal', data: '30/08/2026', tam: '18 KB', status: 'APROVADO' },
  { id: 'doc-5', nome: 'Comprovante_conciliacao_ago.pdf', vinc: 'Financeiro', tipo: 'Comprovante', data: '30/08/2026', tam: '340 KB', status: 'APROVADO' }
];

// --- Contas a Pagar / Receber ---
export const financeiroDemo = {
  receber: [
    { desc: 'Venda #4821', quem: 'Ana Beatriz Souza', venc: '02/09/2026', valor: 'R$ 3.299,00', status: 'pendente' },
    { desc: 'Venda #4790', quem: 'Fernanda Ribeiro Telecom', venc: '31/08/2026', valor: 'R$ 1.899,00', status: 'vencida' },
    { desc: 'Venda #4756', quem: 'João Pedro Martins', venc: '05/09/2026', valor: 'R$ 219,80', status: 'pendente' }
  ],
  pagar: [
    { desc: 'Fornecedor Distrib. Tech', quem: 'Distrib. Tech Ltda', venc: '03/09/2026', valor: 'R$ 8.400,00', status: 'pendente' },
    { desc: 'Aluguel — Matriz', quem: 'Imob. Valparaíso', venc: '05/09/2026', valor: 'R$ 6.200,00', status: 'pendente' },
    { desc: 'Comissão vendedores', quem: 'Folha interna', venc: '31/08/2026', valor: 'R$ 4.940,00', status: 'vencida' }
  ]
};

// --- Conciliação de Cartões / Adquirentes ---
export const conciliacaoDemo = [
  { data: '30/08', op: 'Cielo', nsu: '004821', venda: '#4821', vv: 'R$ 3.299,00', ve: 'R$ 3.299,00', status: 'ok' },
  { data: '30/08', op: 'Stone', nsu: '004790', venda: '#4790', vv: 'R$ 1.899,00', ve: 'R$ 1.899,00', status: 'ok' },
  { data: '29/08', op: 'Rede', nsu: '004756', venda: '#4756', vv: 'R$ 219,80', ve: 'R$ 199,80', status: 'divergencia' },
  { data: '29/08', op: 'Cielo', nsu: '004701', venda: '#4701', vv: 'R$ 149,90', ve: '—', status: 'pendente' }
];

// --- Controle de Acesso / Perfis (RBAC) ---
export const rbacDemo = [
  { perfil: 'Administrador', usuarios: 3, perm: 'Acesso total ao sistema' },
  { perfil: 'Vendedor', usuarios: 12, perm: 'Vendas, clientes, consulta de estoque' },
  { perfil: 'Financeiro', usuarios: 4, perm: 'Contas a pagar/receber, conciliação' },
  { perfil: 'Logística', usuarios: 5, perm: 'Produtos, entrada de estoque, estoque' }
];

// --- Trilha de Auditoria ---
export const auditDemo = [
  { dt: '31/08 09:14', user: 'Guilherme Caixeta', acao: 'Login realizado', mod: 'Autenticação' },
  { dt: '31/08 09:02', user: 'Marina Ferreira', acao: 'Venda #4821 finalizada', mod: 'Vendas' },
  { dt: '30/08 18:40', user: 'Lucas Andrade', acao: 'Entrada de estoque registrada', mod: 'Estoque' },
  { dt: '30/08 17:15', user: 'Guilherme Caixeta', acao: 'Perfil "Estoquista" editado', mod: 'Configurações' }
];