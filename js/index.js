const MAX_HISTORY = 100;

$(document).ready(function() {
    $("#search-form").submit(function (event) {
        event.preventDefault();

        let searchText = $("#search-text").val();
        if (searchText) addHistory(searchText);
        $.ajax({
            url: "https://api.ott-search.com/search?query=" + searchText, success:function(result){
                hideModel();
                clearResultArea();
                let json = JSON.parse(result.replace('\\&', ''));

                if (json.length !== 0 ){
                    let count = 0;
                    for (let i=0; i<json.length; i++) {
                        count += json[i].result.length
                    }
                    $(`<p style="margin-left: 5px; color: #333; font-size: 15px"> ${count} 筆搜尋結果</p>`).appendTo("#result-area")
                } else {
                    $(`<p style="margin-left: 2px; color: #333; font-size: 15px">查無搜尋結果</p>`).appendTo("#result-area")
                }
                insertOtt(json)
            }
        });
    });

    $("#search-history").click(function (event) {
        clearHistoryArea()
        const history = getHistory();
        if (history.length) {
            for (let i=0; i<history.length; i++) {
                $(`<li class="list-group-item history-item" style="cursor: pointer; display: flex; justify-content: space-between; vertical-align: middle;" data="${history[i]}">
                    <div style="display: flex; align-items: center;">${history[i]}</div>
                    <button type="button" class="btn history-btn history-delete ml-2" style="float: right; padding: 0;">
                        <svg class="history-delete-svg" style="height: 1.4rem; width: 1.4rem; color: #808080" fill="none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"  stroke-linejoin="round">  <polyline points="3 6 5 6 21 6" />  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />  <line x1="10" y1="11" x2="10" y2="17" />  <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                    </button>
                </li>`).appendTo("#history-area");
            }
            $("#history-area li").click(function (event) {
                $("#search-text").val($(this).attr("data"));
                hideHistory();
            });
            $(".history-delete").click(function (event) {
                const $list = $(this).parent(); 
                if (removeHistory($list.attr("data"))) $(`<li class="pl-3 list-group-item history-item" style="cursor: pointer;">*無搜尋紀錄*</li>`).appendTo("#history-area");
                $list.remove();
                event.stopPropagation();
            });
        }
        else {
            $(`<li class="pl-3 list-group-item history-item" style="cursor: pointer;">*無搜尋紀錄*</li>`).appendTo("#history-area");
        }
    });

    $("#history-close").click(function (event) {
        hideHistory();
    });

    $("#history-clear").click(function (event) {
        const clear = confirm('確定清除全部歷史紀錄嗎？');
        if (clear) {
            localStorage.removeItem("history");
            hideHistory();
        } 
    });
});

//const jsonString = '[ { "ott":"Netflix", "result":[ { "title":"nTitleA", "href":"https://google.com" }, { "title":"nTitleB", "href":"nHrefB" } ] }, { "ott":"MyVideo", "result":[ { "title":"mTitleA", "href":"mHrefA" }, { "title":"mTitleB", "href":"mHrefB" } ] } ]';

function clearResultArea() {
    $("#result-area").empty()
}

function hideModel() {
    $("#search-loading").modal('hide')
}

function clearHistoryArea() {
    $("#history-area").empty()
}

function hideHistory() {
    $("#history-model").modal('hide')
}

function getHistory() {
    let history = [];
    let historyRaw = localStorage.getItem("history");
    if (historyRaw) history= JSON.parse(historyRaw);
    return history;
}

function addHistory(searchText) {
    const space = /\s+/g;
    const searchText_trim = searchText.replace(space, ' ').trim();
    let history =  getHistory();
    history = history.filter(word => word !== searchText_trim);
    history.unshift(searchText_trim);
    if (history.length > MAX_HISTORY) history.pop();
    localStorage.setItem("history", JSON.stringify(history));
    return history;
}

function removeHistory(searchText) {
    let history =  getHistory();
    history = history.filter(word => word !== searchText);
    localStorage.setItem("history", JSON.stringify(history));
    return (history.length == 0);
}

function insertOtt(json) {
    for (let i=0; i<json.length; i++) {
        let ottName = json[i].ott;
        let result = json[i].result;
        appendPerOtt(i, ottName, result)
    }
}

function appendPerOtt(index, ottName, result) {
    let cardHeaderId = "card-header-" + index.toString();
    let collapseId = "collapse-" + index.toString();

    let listHtml = "";
    for (let i = 0; i<result.length; i++) {
        listHtml += `<a href="${result[i].href}" target="_blank" class="list-group-item">${showPayment(result[i].payment)}${result[i].title}</a>`
    }


    $(`<div class="card">
      <div class="card-header" id="${cardHeaderId}">
        <h2 class="mb-0">
          <button class="btn btn-block text-left collapsed" type="button" data-toggle="collapse" data-target="${"#" + collapseId}" aria-expanded="false" aria-controls="${collapseId})">
            ${ottName}
            <span class="badge badge-info badge-pill" style="float: right;margin-top: 3px;">${result.length}</span>
          </button>
        </h2>
      </div>
      <div id="${collapseId}" class="collapse" aria-labelledby="${cardHeaderId}">
        <div class="card-body" style="padding: 4px 10px 0;">
          <ul class="list-group list-group-flush">
            ${listHtml}
          </ul>
        </div>
      </div>
    </div>`).appendTo("#result-area")
}

function showPayment(payments) {
    // <span style="margin-right: 5px" class="badge badge-pill badge-info">FREE</span>
    let show = ''
    for (let i=0; i<payments.length; i++) {
        if (payments[i] === 1){
            show += '<span style="margin-right: 5px" class="badge badge-pill badge-success">免費</span>'
        }
        if (payments[i] === 2){
            show += '<span style="margin-right: 5px" class="badge badge-pill badge-primary">訂閱</span>'
        }
        if (payments[i] === 3){
            show += '<span style="margin-right: 5px; background-color: #E09016!important;" class="badge badge-pill badge-success">單次</span>'
        }
    }
    return show
}
