const config = {};

//14% mais 6% com frete gratis, taxa somente no produto
config.shopee = { freedelivery: 20, standard: 14 };

// 16% com antecipação automatica ativada, taxa somente no produto
config.magalu = { standard: 16 };

//Frete gratis Produtos >= R$39,99 16% + valor tabela, abaixo R$40 16%
config.b2w = {
  standard: [16, 5],
  freedelivery: 16,
  // Grupo 1: 0 a 119 pontos
  // Grupo 2: 120 a 149 40% desconto
  // Grupo 3: Apartir de 150 pontos 50% desconto
  //Fulfillment frete gratis pela b2w
  peso: [
    { 1: 32.9 },
    { 2: 35.9 },
    { 3: 36.9 },
    { 4: 45.9 },
    { 5: 67.9 },
    { 6: 91.9 },
    { 7: 104.9 },
    { 8: 112.9 },
    { 9: 119.9 },
  ],
};

//Frete gratis Produtos >= R$79,00, custo fixo R$5 abaixo R$79,00
config.ml = {
  // Laranja ou Vermelho: Sem desconto
  // Amarelo e Sem Reputação: 40% desconto
  // Mercado Lider, Lojas Oficiais e Verde: 50% desconto
  //Fulfillment: 9,1%
  peso: {
    1: 32.9,
    2: 35.9,
    3: 36.9,
    4: 45.9,
    5: 67.9,
    6: 106.9,
    7: 118.9,
    8: 138.9,
    9: 159.9,
    10: 181.9,
  },
  reputacao: { 1: 50, 2: 40, 3: 0 },
};

//16% na soma do produto mais frete
config.amazon = { standard: 16 };

// Em breve
config.via = {};

// Em breve
config.carrefour = {};

// Em breve
config.madeiramadeira = {};

//Em breve
config.GPA = {};

async function listingPrice(desc, price, quantity = 1) {
  let resp = await fetch(
    `https://api.mercadolibre.com/sites/MLB/domain_discovery/search?limit=1&q=${encodeURIComponent(
      desc
    )}`
  );
  resp = await resp.json();
  const cat_id = resp[0].category_id;
  const cat_name = resp[0].category_name;

  resp = await fetch(
    `https://api.mercadolibre.com/sites/MLB/listing_prices?price=${price}&category_id=${cat_id}&quantity=${quantity}&cy_id=BRL`
  );
  resp = await resp.json();
  return {
    Categoria: cat_name,
    Premium: resp[0],
    Classico: resp[2],
  };
}

async function atualizar() {
  update();
}

function getelem() {
  const descricao = document.getElementById('descricao');
  const custo = document.getElementById('custo');
  const quantidade = document.getElementById('quantidade');
  const margem = document.getElementById('margem');
  const reputacaoml = document.getElementById('reputacaoml');
  const peso = document.getElementById('peso');
  return {
    descricao: descricao,
    custo: custo,
    quantidade: quantidade,
    margem: margem,
    reputacaoml: reputacaoml,
    peso: peso,
  };
}

function clearAlert() {
  document.getElementById('mlcategory').setAttribute('hidden', true);
}

async function update() {
  const elem = getelem();

  //Custo direto no produto
  const embalagem = 0.6;
  const comissao = 1;
  const aliquota_frete = 0.86;
  const uberflash = 12;

  //Custo variável
  const imposto = 4;
  const resp = await listingPrice(elem.descricao.value, 100);
  const mktax = {
    shopeetax: 18,
    magalutax: 16,
    b2wtax: 16,
    mltax: resp.Premium.sale_fee_amount,
  };
  const custo = parseFloat(elem.custo.value);
  const lucroliquido = (custo * parseFloat(elem.margem.value)) / 100;
  const custo_total = custo + embalagem + comissao + aliquota_frete + lucroliquido;
  const ml5tax = custo_total / (1 - (mktax.mltax + imposto) / 100) >= 79 ? 0 : 5;
  const mg3tax = 3;
  let mlvalfrete = ml5tax <= 0 ? config.ml.peso[elem.peso.value] - (config.ml.peso[elem.peso.value] * config.ml.reputacao[elem.reputacaoml.value]) /100 : 0;
  mlvalfrete = elem.reputacaoml.value == 3 ? config.ml.peso[elem.peso.value] : mlvalfrete;

  const vendashopee = custo_total / (1 - (mktax.shopeetax + imposto) / 100);
  const vendamagalu = (custo_total + mg3tax) / (1 - (mktax.magalutax + imposto) / 100);
  const vendaml = (custo_total + ml5tax + uberflash) / (1 - (mktax.mltax + imposto) / 100) + mlvalfrete;
  const vendab2w = custo_total / (1 - (mktax.b2wtax + imposto) / 100);

  console.log({
    frete: mlvalfrete,
    peso: config.ml.peso[elem.peso.value],
    reputacao: config.ml.reputacao[elem.reputacaoml.value],
  });
  //Shopee
  document.getElementById('shopeeval').innerHTML = vendashopee.toLocaleString(
    'pt-BR',
    { style: 'currency', currency: 'BRL' }
  );
  let lucrobrutoshopee = vendashopee * (1 - (mktax.shopeetax + imposto) / 100);

  document.getElementById('shopeelucrobruto').innerHTML =
    lucrobrutoshopee.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  document.getElementById('shopeelucroliquido').innerHTML =
    lucroliquido.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  //magalu
  document.getElementById('magaluval').innerHTML = vendamagalu.toLocaleString(
    'pt-BR',
    { style: 'currency', currency: 'BRL' }
  );
  let lucrobrutomagalu = vendamagalu * (1 - (mktax.magalutax + imposto) / 100) - mg3tax;
  document.getElementById('magalulucrobruto').innerHTML =
    lucrobrutomagalu.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  document.getElementById('magalulucroliquido').innerHTML =
    lucroliquido.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  //Mercado Livre
  let catelem = document.getElementById('mlcategory');
  const mlfrete = `<----> Frete Gratis: ${mlvalfrete.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })}`;
  catelem.innerHTML = `Categoria detectada ML: ${resp.Categoria} <----> Taxa: ${
    mktax.mltax
  }% ${mlvalfrete ? mlfrete : ''}`;
  catelem.removeAttribute('hidden');
  document.getElementById('ml-premium').innerHTML = vendaml.toLocaleString(
    'pt-BR',
    { style: 'currency', currency: 'BRL' }
  );
  let lucrobrutoml =
    vendaml * (1 - (mktax.mltax + imposto) / 100) - ml5tax;
  document.getElementById('ml-lucrobruto').innerHTML =
    lucrobrutoml.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  document.getElementById('ml-lucroliquido').innerHTML =
    lucroliquido.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
}
