let id = -1;

/*-------------------------------------------------------
  This function runs when editaccessory.html is loaded.
  ------------------------------------------------------*/
function pageLoad() {

    let lastPage =  Cookies.get("breadcrumb");
    document.getElementById("back").href = lastPage;

    let currentPage = window.location.href;
    Cookies.set("destination", currentPage);

    checkLogin(() => {

      let params = getQueryStringParameters();
      if (params['id'] !== undefined) {
          id = parseInt(params['id']);
      }

      loadAccessory();

      if (id !== -1) {
          resetDeleteButton();
      } else {
          if (params['systemId'] !== undefined) {
              document.querySelector("[name='systemId']").value = params['systemId'];
          }
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
function loadAccessory() {

    fetch('/accessory/get/' + id, {method: 'get'}
    ).then(response => response.json()
    ).then(data => {

            if (data.hasOwnProperty('error')) {
                alert(data.error);
            } else {
                for (let c of data.categories) {
                    document.querySelector("[name='categoryId']").innerHTML +=`<option value="${c.categoryId}">${c.name}</option>`;
                }
                for (let i of data.images) {
                    document.querySelector("[name='imageURL']").innerHTML +=`<option value="${i}">${i}</option>`;
                }
                if (id != -1) {
                    document.querySelector("[name='systemId']").value = data.accessory.systemId;
                    document.querySelector("[name='categoryId']").value = data.accessory.categoryId;
                    document.querySelector("[name='description']").value = data.accessory.description;
                    document.querySelector("[name='imageURL']").value = data.accessory.imageURL;
                    document.getElementById("chosenImage").src = "/client/img/" + data.accessory.imageURL;
                    document.querySelector("[name='quantity']").value = data.accessory.quantity;
                    document.querySelector("[name='thirdParty']").checked = data.accessory.thirdParty;
                }
            }
        }
    );

}

/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function resetForm() {

    const form = document.getElementById('accessoryForm');

    form.addEventListener("submit", event => {
        event.preventDefault();

        let formData = new FormData(form);
        formData.append("id", id);

        fetch('/accessory/save', {method: 'post', body: formData}
        ).then(response => response.json()
        ).then(data => {

            if (data.hasOwnProperty('error')) {
                alert(data.error);
            } else {
                window.location.href = document.getElementById("back").href;
            }

        });
    });
}

/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function resetDeleteButton() {

    document.getElementById('delete').style.visibility = 'visible';

    document.getElementById('delete').addEventListener("click", () => {
            let r = confirm("Are you sure you want to delete this accessory?");
            if (r === true) {

                let formData = new FormData();
                formData.append("id", id);

                fetch('/accessory/delete',{method: 'post', body: formData}
                ).then(response => response.json()
                ).then(data => {

                    if (data.hasOwnProperty('error')) {
                        alert(data.error);
                    } else {
                        window.location.href = document.getElementById("back").href;
                    }

                });
            }
        }
    );

}
