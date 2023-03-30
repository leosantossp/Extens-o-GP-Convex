'use strict';


chrome.storage.local.get('options', (data) => {
    let options = data.options;
    if(options.gpToken) {
        document.querySelector('#gpToken').value = options.gpToken;
    }
});
document.getElementById('config').addEventListener('click', (e)=> {
    e.preventDefault();
    if(document.querySelector('#gpToken').value != '') {
        let opt = {
            gpToken: document.querySelector('#gpToken').value
        }
        chrome.storage.local.set({options: opt}, async function() {
            document.body.innerText = "Parabéns! Sua extensão está configurada.";
        });
    }
})