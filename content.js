document.addEventListener('DOMContentLoaded', function () {
    var defaults = {
        dropdown1: "https://metaso.cn/?q=",
        dropdown2: "https://so.360.com/?q=",
        dropdown3: "https://devv.ai/search/",
        dropdown4: "https://www.perplexity.ai/search?q=",
    };
    var preSaveSelection;
    // New function to determine and set the width class based on the column selection
    function setColumnWidth(columnSetting) {
        var columnClass = columnSetting === "2" ? "w-1/2" : "w-1/3";
        var searchSites = document.querySelectorAll('.searchsite');
        searchSites.forEach(function(site) {
            site.className = "searchsite " + columnClass + " p-1 bg-gray-100";
        });
    }
    chrome.storage.local.get(['ai-search-hub'], function(result) {

        preSaveSelection=result['ai-search-hub'] || defaults
        preSaveSelection.columns = result['ai-search-hub'].columns || "3";
        function createSearchSite(dropdownId) {
            var searchSiteDiv = document.createElement('div');
            searchSiteDiv.className = "searchsite w-1/3 p-1 bg-gray-100";

            var dropdownDiv = document.createElement('div');
            dropdownDiv.className = "dropdown mb-1";

            var select = document.createElement('select');
            select.id = dropdownId;
            select.className = "urlDropdown w-full py-2 px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500";
            console.log(preSaveSelection[dropdownId])
            for (var key in defaults) {
                if (defaults.hasOwnProperty(key)) {
                    var option = document.createElement('option');
                    option.value = defaults[key];
                    option.textContent = defaults[key];
                    if (option.value === preSaveSelection[dropdownId]) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                }
            }

            dropdownDiv.appendChild(select);

            var iframe = document.createElement('iframe');
            iframe.id = `i-${dropdownId}`;
            iframe.className = "w-full  border border-gray-300 rounded-md";
            searchSiteDiv.appendChild(dropdownDiv);
            searchSiteDiv.appendChild(iframe);

            return searchSiteDiv;
        }

        var container = document.querySelector('.searchSitesContainer');
        var count=0
        for (var key in defaults) {
            if(count>=preSaveSelection.columns){
                break
            }
            if (defaults.hasOwnProperty(key)) {
                var searchSite = createSearchSite(key);
                container.appendChild(searchSite);
                count+=1
            }
        }
        setColumnWidth(preSaveSelection.columns)

        function saveConfig() {
            document.querySelectorAll('.urlDropdown').forEach(function(dropdown) {
                var id = dropdown.id;
                var url = dropdown.value;
                preSaveSelection[id] = url;
            });
            var selectedColumn = document.querySelector('input[name="columns"]:checked').value;
            preSaveSelection.columns = selectedColumn;
            console.log(preSaveSelection);
            chrome.storage.local.set({'ai-search-hub': preSaveSelection}, function() {
                console.log('Defaults have been saved');
            });
        }

        document.querySelectorAll('.urlDropdown').forEach(function(dropdown) {
            dropdown.addEventListener('change', function() {
                saveConfig();
            });
        });


        // Add event listeners to column radio buttons for change event
        document.querySelectorAll('input[name="columns"]').forEach(function(radio) {
            radio.checked = preSaveSelection.columns === radio.value;
            radio.addEventListener('change', function() {
                saveConfig();
                setColumnWidth(this.value); // Update the column width immediately without refreshing
                window.location.reload();
            });
        });

        var searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', function (event) {
                event.preventDefault();
                var searchValue = document.getElementById('searchInput').value.trim();
                if (searchValue.length < 4) {
                    alert("Please enter at least 4 characters")
                    return
                }
                var iframes = document.querySelectorAll('iframe');
                var dropdowns = document.querySelectorAll('.urlDropdown');
                iframes.forEach(function (iframe, index) {
                    var selectedOption = dropdowns[index].value;
                    iframe.src = selectedOption + encodeURIComponent(searchValue);
                });

            });
        }
    });
});
