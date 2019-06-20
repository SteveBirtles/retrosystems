/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function pageLoad() {

    let currentPage = window.location.href;
    Cookies.set("breadcrumb", currentPage);

    let params = getQueryStringParameters();
    let id = params['id'];

    updateAccessoriesList(id);

    document.getElementById("new").setAttribute("href", "/client/editaccessory.html?id=-1&systemId=" + id)

}

/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function updateAccessoriesList(id) {

    fetch('/accessory/list/' + id, {method: 'get'}
    ).then(response => response.json()
    ).then(data => {

        if (data.hasOwnProperty('error')) {

            alert(data.error);

        } else if (data.hasOwnProperty('accessories') && data.accessories.length > 0) {

            let accessoriesHTML = `<div class="container">`;

            for (let accessory of data.accessories) {

                let category = "";
                for (let c of data.categories) {
                    if (c.categoryId === accessory.categoryId) {
                        category = c.name;
                    }
                }

                accessoriesHTML += `<div class="row mb-2 border-bottom">`

                    + `<div class="col-xs p-2 align-bottom">`
                    + `<a href="/client/img/${accessory.imageURL}" target=”_blank”><img height="90px" src="/client/img/${accessory.imageURL}"></a>`
                    + `</div>`

                    + `<div class="col p-2 align-bottom">`
                    + `<div class="font-weight-bold">${accessory.description}</div>`
                    + `<div>${category} ${accessory.thirdParty ? "(Third Party)" : ""}</div>`
                    + `<div class="font-italic text-muted">Quantity: ${accessory.quantity}</div>`
                    + `</div>`

                    + `<div class="col-xl text-right py-2">`
                    + `<a class="btn btn-sm btn-success"  href="/client/editaccessory.html?id=${accessory.id}">Edit</a>`
                    + `</div>`

                    + `</div>`;

            }
            accessoriesHTML += `</div>`;

            document.getElementById('accessories').innerHTML = accessoriesHTML;

        }

        document.getElementById('system').innerHTML = data.systemName;

    });

}
