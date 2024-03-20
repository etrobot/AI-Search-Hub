document.addEventListener('DOMContentLoaded', function () {
        chrome.tabs.create({url: './index.html', selected: true, active: true});
});