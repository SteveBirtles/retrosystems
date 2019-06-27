let id = -1;

/*-------------------------------------------------------
  This function runs when editsystem.html is loaded.
  The current page URL is stored in the 'destination' cookie.
  Then, checkLogin is called from admin.js...
  If successful, the rest of the page is loaded and prepared.
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
  Does an API request to /system/get/{id}
  Just before that does API requests to /image/list and /manufacturer/list
  Uses the response to populate the elements in 'systemForm'
  ------------------------------------------------------*/
function loadSystem() {

    fetch('/image/list', {method: 'get'}
    ).then(response => response.json()
    ).then(images => {
        for (let i of images) {
            document.querySelector("[name='imageURL']").innerHTML += `<option value="${i.filename}">${i.filename}</option>`;
        }

        fetch('/manufacturer/list', {method: 'get'}
        ).then(response => response.json()
        ).then(manufacturers => {

            for (let m of manufacturers) {
                document.querySelector("[name='manufacturerId']").innerHTML += `<option value="${m.manufacturerId}">${m.name}</option>`;
            }

            if (id != -1) {

                fetch('/system/get/' + id, {method: 'get'}
                ).then(response => response.json()
                ).then(data => {

                        if (data.hasOwnProperty('error')) {
                            alert(data.error);
                        } else {
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
                );
            }
        });
    });

}

/*-------------------------------------------------------
  Adds an listener for the submit event of 'systemForm'
  which will do an API request to /system/save using data from the form
  and then redirect back to the index.html
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
  Adds an listener for the click event of the 'delete' button
  which will do an API request to /system/delete with the current id
  and then redirect back to index.html
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
