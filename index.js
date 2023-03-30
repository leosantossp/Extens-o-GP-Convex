'use strict';

let options = {};

const sendInfos = () => {
    let products = '<hr><table><tr><th>Nome</th><th>Valor</th><th>Qtd</th></tr>';
    document.querySelectorAll('table#products tr').forEach(p => {
        products += '<tr>';
        p.querySelectorAll('td').forEach(pTd => {
            products += '<td>'+pTd.innerText+'</td>';
        })
        products += '</tr>';
    })
    products += '</table><hr>';
    const infos = {
        name: document.getElementById('name').innerText,
        telefone: document.getElementById('tel').innerText,
        email: 'sem email',
        empresa: '',
        info: `<b>Lead Mercado Livre</b><br>
        Nome: ${document.getElementById('name').innerText}<br>
        Telefone: ${document.getElementById('tel').innerText}<br>
        CPF: ${document.getElementById('cpf').innerText}<br>
        Endereço: ${document.getElementById('endereco').innerText}<br>
        ${products}
        Subtotal: ${document.getElementById('subtotal').innerText}<br>
        Total: ${document.getElementById('total').innerText}<br>`,
        tipo_contato: 'Extensão',
        valor_prop: document.getElementById('total').innerText,
        status: 2,
        source: null,
        keyword: null,
        network: null,
        device: null
    }
    const token = document.getElementById('gpToken').value;
    document.getElementById('infos').style.display = 'none';
    document.getElementById('msgs').style.display = 'block';
    document.getElementById('msgs').innerText = 'Enviando...';

    var ajax = new XMLHttpRequest();

    ajax.open("POST", "https://app.gpconvex.com/api/leads/new");
    ajax.setRequestHeader("Authorization", `Bearer ${token}`);
    ajax.setRequestHeader("Content-type", "application/json");

    ajax.send(JSON.stringify(infos));

    ajax.onreadystatechange = function() {
        console.log(infos, ajax);
        if (ajax.readyState == 4 && ajax.status == 201) {
            document.getElementById('infos').style.display = 'none';
            document.getElementById('msgs').style.display = 'block';
            document.getElementById('msgs').innerText = 'Lead adicionado com sucesso.';
            setTimeout(function() {
                document.getElementById('msgs').style.display = 'none';
                document.getElementById('msgs').innerText = '';
                document.getElementById('getInfos').style.display = 'block';
                document.getElementById('infos').style.display = 'none';
                document.getElementById('name').innerText = '';
                document.getElementById('tel').innerText = '';
            }, 2000);
        } else {
            document.getElementById('msgs').style.display = 'block';
            document.getElementById('msgs').innerText = 'Falha ao adicionar lead.';
            console.log(infos, ajax);
        }
    }
}

chrome.storage.local.get('options', (data) => {
    Object.assign(options, data.options);
    console.log(options)
    if(options.gpToken) {
        document.querySelector('.main').style.display = 'block';
        let inputToken =  document.createElement('input');
        inputToken.type = 'hidden';
        inputToken.value = options.gpToken;
        inputToken.id = 'gpToken';
        document.body.appendChild(inputToken);
    } else {
        chrome.tabs.create({ url: 'config.html' });
    }
});

document.getElementById('config').addEventListener('click', () => {
    chrome.tabs.create({ url: 'config.html' });
})

document.getElementById('getInfos').addEventListener('click', async function () {
    await chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        tabs.forEach((tab) => {
            if(!tab.url.includes("chrome://")) {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: async function () {
                        if(/https:\/\/www.mercadolivre.com.br\/vendas\/([0-9]{1,})\/detalhe/.test(window.location.href)) {
                            const lead = {};
                            lead.products = [];
                            let name = document.querySelector('.sc-title-subtitle-action__label').innerText;
                            let infos = document.querySelector('.andes-card>.sc-title-subtitle-action .sc-title-subtitle-action__sublabel').innerText;
                            let tel = infos.split('Tel.: ').at(-1);
                            let cpf = document.querySelector('.sc-title-subtitle-action__account-').innerText.split(' | ').at(-1).replace('CPF ', '');
                            let endereco = infos.replace('Envio normal\n', '').split('\nQuem recebe:')[0].replace('\n', ' - ');
                            let subTotal = (document.querySelector('.sc-account-rows__row__subTotal').innerText.replace(/\D/g,'') / 100).toFixed(2);
                            let total = (document.querySelector('.sc-account-rows__row__price').innerText.replace(/\D/g,'') / 100).toFixed(2);
                            document.querySelectorAll('.sc-row-content div.sc-product').forEach(product => {
                                let prod = {};
                                prod.name = product.querySelector('.sc-title').innerText;
                                let prodPrice = product.querySelector('.sc-price').innerText;
                                if(/\,/.test(prodPrice)) {
                                    prod.price = (prodPrice.replace(/\D/g, '') / 100).toFixed(2);
                                } else {
                                    prod.price = parseInt(prodPrice.replace(/\D/g, '')).toFixed(2);
                                }
                                prod.qtd = product.querySelector('.sc-quantity').innerText.replace(/\D/g, '');
                                lead.products.push(prod);
                            })
                            lead.name = name;
                            lead.tel = tel;
                            lead.cpf = cpf;
                            lead.endereco = endereco;
                            lead.subTotal = subTotal;
                            lead.total = total;
                            return lead;
                        }
                    }
                }, (e) => {
                    let infos = e[0].result;
                    document.getElementById('getInfos').style.display = 'none';
                    document.getElementById('infos').style.display = 'block';
                    document.getElementById('name').innerText = infos.name;
                    document.getElementById('tel').innerText = infos.tel;
                    document.getElementById('cpf').innerText = infos.cpf;
                    document.getElementById('endereco').innerText = infos.endereco;
                    document.getElementById('subtotal').innerText = infos.subTotal;
                    document.getElementById('total').innerText = infos.total;

                    infos.products.forEach(p => {
                        let tr = document.createElement('tr');
                        let tdTitle = document.createElement('td');
                        let tdPrice = document.createElement('td');
                        let tdQtd = document.createElement('td');
                        tdTitle.innerText = p.name;
                        tdPrice.innerText = p.price;
                        tdQtd.innerText = p.qtd;
                        tr.appendChild(tdTitle);
                        tr.appendChild(tdPrice);
                        tr.appendChild(tdQtd);
                        document.querySelector('table#products').appendChild(tr);
                    })
                });
            }
        })
    });
});

document.querySelector('#sendLead').addEventListener('click', sendInfos);
