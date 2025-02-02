$(document).ready(function() {
    $("#search-form").submit(function (event) {
        event.preventDefault();

        let searchText = $("#search-text").val();
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
});

//const jsonString = '[ { "ott":"Netflix", "result":[ { "title":"nTitleA", "href":"https://google.com" }, { "title":"nTitleB", "href":"nHrefB" } ] }, { "ott":"MyVideo", "result":[ { "title":"mTitleA", "href":"mHrefA" }, { "title":"mTitleB", "href":"mHrefB" } ] } ]';

function clearResultArea() {
    $("#result-area").empty()
}

function hideModel() {
    $("#search-loading").modal('hide')
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
