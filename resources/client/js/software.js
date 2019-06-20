/*-------------------------------------------------------
  This function runs when software.html is loaded.
  ------------------------------------------------------*/
function pageLoad() {

    let currentPage = window.location.href;
    Cookies.set("breadcrumb", currentPage);

    let params = getQueryStringParameters();
    let id = params['id'];

    updateSoftwareList(id);

    document.getElementById("new").setAttribute("href", "/client/editsoftware.html?id=-1&systemId=" + id)

}

/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function updateSoftwareList(id) {

    fetch('/software/list/' + id, {method: 'get'}
    ).then(response => response.json()
    ).then(data => {

        if (data.hasOwnProperty('error')) {

            alert(data.error);

        } else if (data.hasOwnProperty('software') && data.software.length > 0) {

            let softwareHTML = `<div class="container">`;

            for (let software of data.software) {

                softwareHTML += `<div class="row mb-2 border-bottom">`

                    + `<div class="col-xs p-2 align-bottom">`
                    + `<a href="/client/img/${software.imageURL}" target=”_blank”><img height="90px" src="/client/img/${software.imageURL}"></a>`
                    + `</div>`

                    + `<div class="col p-2 align-bottom">`
                    + `<div class="font-weight-bold">${software.name}</div>`
                    + `<div>${software.year}</div>`
                    + `<div class="font-italic text-muted">${software.sales}</div>`
                    + `</div>`

                    + `<div class="col-xl text-right py-2">`
                    + `<a class="btn btn-sm btn-success"  href="/client/editsoftware.html?id=${software.id}">Edit</a>`
                    + `</div>`

                    + `</div>`;

            }
            softwareHTML += `</div>`;

            document.getElementById('software').innerHTML = softwareHTML;

        }

        document.getElementById('system').innerHTML = data.systemName;


    });

}
