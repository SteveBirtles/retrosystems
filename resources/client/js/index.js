/*-------------------------------------------------------
  This function runs when index.html is loaded.
  ------------------------------------------------------*/
function pageLoad() {
    updateSystemList();
}

/*-------------------------------------------------------
  Does an API request to /system/list
  Just before that, does an API request to /manufacturers/list
  Uses the responses to populate the 'systems' div element
  (sorted as specified by the 'systemSort' select element)
  Also adds an event listener for the 'systemSort' select element
  ------------------------------------------------------*/
function updateSystemList() {

    document.getElementById("systemSort").addEventListener("change", updateSystemList);

    fetch('/manufacturer/list', {method: 'get'}
    ).then(response => response.json()
    ).then(manufacturers => {

        fetch('/system/list', {method: 'get'}
        ).then(response => response.json()
        ).then(data => {

            if (data.hasOwnProperty('error')) {

                alert(data.error);

            } else if (data.hasOwnProperty('systems') && data.systems.length > 0) {

                let order = document.getElementById("systemSort").value;

                data.systems.sort(function (a, b) {
                    switch (order) {
                        case "name":
                            return a.name.localeCompare(b.name);
                        case "manufacturer":
                            let manufacturerA = "";
                            let manufacturerB = "";
                            for (let m of manufacturers) {
                                if (m.manufacturerId === a.manufacturerId) {
                                    manufacturerA = m.name;
                                }
                                if (m.manufacturerId === b.manufacturerId) {
                                    manufacturerB = m.name;
                                }
                            }
                            return manufacturerA.localeCompare(manufacturerB);
                        case "year":
                            if (a.year !== b.year) {
                                return a.year.localeCompare(b.year);
                            } else {
                                return a.name.localeCompare(b.name);
                            }
                    }
                });

                let systemsHTML = `<div class="container">`;

                for (let system of data.systems) {

                    let manufacturer = `<div class=\"container\">`;
                    for (let m of manufacturers) {
                        if (m.manufacturerId === system.manufacturerId) {
                            manufacturer = m.name;
                        }
                    }

                    systemsHTML += `<div class="row mb-2 border-bottom">`

                        + `<div class="col-xs p-2 align-bottom">`
                        + `<a href="/client/img/${system.imageURL}" target=”_blank”><img height="90px" src="/client/img/${system.imageURL}"></a>`
                        + `</div>`

                        + `<div class="col p-2 align-bottom">`
                        + `<div class="font-weight-bold">${system.name}</div>`
                        + `<div>${manufacturer} (${system.year})</div>`
                        + `<div class="font-italic text-muted">${system.mediaType}</div>`
                        + `</div>`

                        + `<div class="col-xl text-right py-2">`
                        + `<a class="btn btn-sm btn-info m-1" style="width:100px;" href="/client/software.html?id=${system.id}">Software</a>`
                        + `<a class="btn btn-sm btn-info m-1" style="width:100px;"  href="/client/accessories.html?id=${system.id}">Accessories</a>`
                        + `<a class="btn btn-sm btn-success m-1" style="width:75px;" href="/client/editsystem.html?id=${system.id}">Edit</a>`
                        + `</div>`

                        + `</div>`;

                }
                systemsHTML += `</div>`;

                document.getElementById('systems').innerHTML = systemsHTML;

            }

        });

    });

}
