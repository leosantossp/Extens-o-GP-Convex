async function getTab() {
    let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    return tab;
}
function doStuffWithDom(domContent) {
    console.log('I received the following DOM content:\n' + domContent);
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message === 'get-lead') {
        let resLead = {};
        let tab = await getTab();
        // if(!tab.url.includes("chrome://")) {
        //     chrome.scripting.executeScript({
        //         target: { tabId: tab.id },
        //         function: async function () {
        //             if(/https:\/\/www.mercadolivre.com.br\/vendas\/([0-9]{1,})\/detalhe/.test(window.location.href)) {
        //                 const loadComplete = new Promise((resolve) => {
        //                     document.body.addEventListener('load', resolve);
        //                 });
        //                 const lead = {};
        //                 let name = document.querySelector('.sc-title-subtitle-action__label').innerText;
        //                 let infos = document.querySelector('.andes-card>.sc-title-subtitle-action .sc-title-subtitle-action__sublabel').innerText;
        //                 let tel = infos.split('Tel.: ').at(-1);

        //                 lead.name = name;
        //                 lead.tel = tel;
        //                 await loadComplete;
        //                 return lead;
        //             }
        //         }
        //     }, (e) => {
        //         resLead = e;
        //     });
        // }
        sendResponse(tab);
    }
});

// chrome.action.onClicked.addListener((tab) => {
//     if(!tab.url.includes("chrome://")) {
//         chrome.scripting.executeScript({
//             target: { tabId: tab.id },
//             function: () => {
//                 if(/https:\/\/www.mercadolivre.com.br\/vendas\/([0-9]{1,})\/detalhe/.test(window.location.href)) {
//                     const lead = {};
//                     let name = document.querySelector('.sc-title-subtitle-action__label').innerText;
//                     let infos = document.querySelector('.andes-card>.sc-title-subtitle-action .sc-title-subtitle-action__sublabel').innerText;
//                     let tel = infos.split('Tel.: ').at(-1);

//                     lead.name = name;
//                     lead.tel = tel;
//                     console.log(lead);
//                     chrome.browserAction.setPopup('index.html');
//                 }
//             }
//         });
        
//     }
// });
// function setPassword(password) {
//     // Do something, eg..:
//     console.log(password);
// };