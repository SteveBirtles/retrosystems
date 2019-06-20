/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function loadManufacturers() {

    fetch('/manufacturer/list', {method: 'get'})
        .then(response => response.json())
        .then(data => {

                if (data.hasOwnProperty('error')) {
                    alert(data.error);
                } else {

                    let manufacturersHTML = `<div class="container">`
                        + `<div class="row mb-2">`
                        + `<div class="col-4 bg-light font-weight-bold">Manufacturer</div>`
                        + `<div class="col-3 bg-light font-weight-bold">System Count</div>`
                        + `<div class="col-5 text-right bg-light font-weight-bold">Options</div>`
                        + `</div>`;

                    for (let manufacturer of data) {

                        manufacturersHTML += `<div class="row mb-2">`
                            + `<div class="col-4">${manufacturer.name}</div>`
                            + `<div class="col-3">${manufacturer.count}</div>`
                            + `<div class="col-5 text-right">`
                            + `<a class="btn btn-sm btn-success m-1 renameManufacturer" data-id="${manufacturer.manufacturerId}" data-name="${manufacturer.name}">Rename</a>`
                            + `<a class="btn btn-sm btn-danger m-1 deleteManufacturer" data-id="${manufacturer.manufacturerId}" data-count="${manufacturer.count}">Delete</a>`
                            + `</div>`
                            + `</div>`;
                    }
                    manufacturersHTML += `</div>`;

                    document.getElementById('manufacturers').innerHTML = manufacturersHTML;

                    let renameManufacturerButtons = document.getElementsByClassName("renameManufacturer");
                    for (let e of renameManufacturerButtons) {
                        e.addEventListener("click", renameManufacturer);
                    }

                    let deleteManufacturerButtons = document.getElementsByClassName("deleteManufacturer");
                    for (let e of deleteManufacturerButtons) {
                        e.addEventListener("click", deleteManufacturer);
                    }

                }
            }
        );

}

/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function addManufacturer() {

    let manufacturer = prompt("Please enter manufacturer name");

    let formData = new FormData();
    formData.append("name", manufacturer);

    fetch('/manufacturer/new', {method: 'post', body: formData}
    ).then(response => response.json()
    ).then(data => {
            if (data.hasOwnProperty('error')) {
                alert(data.error);
            } else {
                loadManufacturers();
            }
        }
    );

}

/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function renameManufacturer(event) {

    let id = event.target.getAttribute("data-id");
    let oldName = event.target.getAttribute("data-name");
    let newName = prompt("Please enter new name", oldName);

    let formData = new FormData();
    formData.append('id', id);
    formData.append('name', newName);

    if (newName != null) {
        fetch('/manufacturer/rename', {method: 'post',  body: formData}
        ).then(response => response.json()
        ).then(data => {

                if (data.hasOwnProperty('error')) {
                    alert(data.error);
                } else {
                    loadManufacturers();
                }
            }
        );
    }

}

/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function deleteManufacturer(event) {

    let id = event.target.getAttribute("data-id");
    let count = event.target.getAttribute("data-count");

    if (parseInt(count) > 0) {
        alert("Can't delete that manufacturer as it is in use");
        return;
    }

    let ok = confirm("Are you sure?");

    if (ok === true) {

        let formData = new FormData();
        formData.append("id", id);

        fetch('/manufacturer/delete', {method: 'post', body: formData}
        ).then(response => response.json()
        ).then(data => {

                console.log(data.error);
                if (data.hasOwnProperty('error')) {
                    alert(data.error);
                } else {
                    loadManufacturers();
                }
            }
        );
    }

}
