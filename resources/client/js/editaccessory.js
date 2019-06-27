let id = -1;

/*-------------------------------------------------------
  This function runs when editaccessory.html is loaded.
  The back button's hyperlink is set to the value of the 'breadcrumb' cookie.
  The current page URL is stored in the 'destination' cookie.
  Then, checkLogin is called from admin.js...
  If successful, the rest of the page is loaded and prepared.
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
  Does an API request to /accessory/get/{id}
  Just before that does API requests to /image/list and /category/list
  Uses the responses to populate the elements in 'accessoryForm'
  ------------------------------------------------------*/
function loadAccessory() {

    fetch('/image/list', {method: 'get'}
    ).then(response => response.json()
    ).then(images => {
        for (let i of images) {
            document.querySelector("[name='imageURL']").innerHTML += `<option value="${i.filename}">${i.filename}</option>`;
        }

        fetch('/category/list', {method: 'get'}
        ).then(response => response.json()
        ).then(categories => {

            for (let c of categories) {
                document.querySelector("[name='categoryId']").innerHTML += `<option value="${c.categoryId}">${c.name}</option>`;
            }

            if (id !== -1) {

                fetch('/accessory/get/' + id, {method: 'get'}
                ).then(response => response.json()
                ).then(data => {

                        if (data.hasOwnProperty('error')) {
                            alert(data.error);
                        } else {
                            document.querySelector("[name='systemId']").value = data.accessory.systemId;
                            document.querySelector("[name='categoryId']").value = data.accessory.categoryId;
                            document.querySelector("[name='description']").value = data.accessory.description;
                            document.querySelector("[name='imageURL']").value = data.accessory.imageURL;
                            document.getElementById("chosenImage").src = "/client/img/" + data.accessory.imageURL;
                            document.querySelector("[name='quantity']").value = data.accessory.quantity;
                            document.querySelector("[name='thirdParty']").checked = data.accessory.thirdParty;
                        }
                    }
                );
            }
        });
    });

}

/*-------------------------------------------------------
  Adds an listener for the submit event of 'accessoryForm'
  which will do an API request to /accessory/save using data from the form
  and then redirect back to the previous page
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
  Adds an listener for the click event of the 'delete' button
  which will do an API request to /accessory/delete with the current id
  and then redirect back to the previous page
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
