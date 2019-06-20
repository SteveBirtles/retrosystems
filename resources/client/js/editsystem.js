let id = -1;

/*-------------------------------------------------------
  This function runs when editsystem.html is loaded.
  ------------------------------------------------------*/
function pageLoad() {

    let currentPage = window.location.href;
    Cookies.set("destination", currentPage);

    checkLogin(() => {

      let params = getQueryStringParameters();
      if (params['id'] !== undefined) {
          id = parseInt(params['id']);
      }

      loadSystem();

      if (id !== -1) {
          resetDeleteButton();
      }

      resetForm();

        document.querySelector("[name='imageURL']").addEventListener("change", function() {
          document.getElementById("chosenImage").src = "/client/img/" + document.querySelector("[name='imageURL']").value;
      })

    });

}

/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function loadSystem() {

    fetch('/system/get/' + id, {method: 'get'}
    ).then(response => response.json()
    ).then(data => {

            if (data.hasOwnProperty('error')) {
                alert(data.error);
            } else {
                for (let m of data.manufacturers) {
                    document.querySelector("[name='manufacturerId']").innerHTML += `<option value="${m.manufacturerId}">${m.name}</option>`;
                }
                for (let i of data.images) {
                    document.querySelector("[name='imageURL']").innerHTML +=`<option value="${i}">${i}</option>`;
                }

                if (id != -1) {
                    document.querySelector("[name='name']").value = data.system.name;
                    document.querySelector("[name='manufacturerId']").value = data.system.manufacturerId;
                    document.querySelector("[name='mediaType']").value = data.system.mediaType;
                    document.querySelector("[name='year']").value = data.system.year;
                    document.querySelector("[name='sales']").value = data.system.sales;
                    document.querySelector("[name='handheld']").checked = data.system.handheld;
                    document.querySelector("[name='imageURL']").value = data.system.imageURL;
                    document.getElementById("chosenImage").src = "/client/img/" + data.system.imageURL;
                    document.querySelector("[name='notes']").value = data.system.notes;
                }
            }
        }
    );

}

/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function resetForm() {

    const form = document.getElementById('systemForm');

    form.addEventListener("submit", event => {
        event.preventDefault();

        let formData = new FormData(form);
        formData.append("id", id);

        fetch('/system/save', {method: 'post', body: formData}
        ).then(response => response.json()
        ).then(data => {

                if (data.hasOwnProperty('error')) {
                    alert(data.error);
                } else {
                    window.location.href = "/client/index.html";
                }
            }
        );
    });
}

/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function resetDeleteButton() {

    document.getElementById('delete').style.visibility = 'visible';

    document.getElementById('delete').addEventListener("click", () => {
            let r = confirm("Are you sure you want to delete this system?");
            if (r === true) {

                let formData = new FormData();
                formData.append("id", id);

                fetch('/system/delete',{method: 'post', body: formData}
                ).then(response => response.json()
                ).then(data => {

                    if (data.hasOwnProperty('error')) {
                            alert(data.error);
                        } else {
                            window.location.href = "/client/index.html";
                        }
                    }
                );
            }
        }
    );

}
