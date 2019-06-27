let id = -1;

/*-------------------------------------------------------
  This function runs when editsoftware.html is loaded.
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

      loadSoftware();

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
  Does an API request to /software/get/{id}
  Uses the response to populate the elements in 'softwareForm'
  ------------------------------------------------------*/
function loadSoftware() {

    fetch('/software/get/' + id, {method: 'get'}
    ).then(response => response.json()
    ).then(data => {

            if (data.hasOwnProperty('error')) {
                alert(data.error);
            } else {
                for (let i of data.images) {
                    document.querySelector("[name='imageURL']").innerHTML += `<option value="${i}">${i}</option>`;
                }
                document.querySelector("[name='systemId']").value = data.software.systemId;
                document.querySelector("[name='name']").value = data.software.name;
                document.querySelector("[name='year']").value = data.software.year;
                document.querySelector("[name='sales']").value = data.software.sales;
                document.querySelector("[name='imageURL']").value = data.software.imageURL;
                document.getElementById("chosenImage").src = "/client/img/" + data.software.imageURL;

            }
        }
    );

}

/*-------------------------------------------------------
  Adds an listener for the submit event of 'softwareForm'
  which will do an API request to /software/save using data from the form
  and then redirect back to the previous page
  ------------------------------------------------------*/
function resetForm() {

    const form = document.getElementById('softwareForm');

    form.addEventListener("submit", event => {
        event.preventDefault();

        let formData = new FormData(form);
        formData.append("id", id);

        fetch('/software/save', {method: 'post', body: formData}
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
  which will do an API request to /software/delete with the current id
  and then redirect back to the previous page
  ------------------------------------------------------*/
function resetDeleteButton() {

    document.getElementById('delete').style.visibility = 'visible';

    document.getElementById('delete').addEventListener("click", () => {
            let r = confirm("Are you sure you want to delete this software?");
            if (r === true) {

                let formData = new FormData();
                formData.append("id", id);

                fetch('/software/delete', {method: 'post', body: formData}
                ).then(response => response.json()
                ).then(data => {

                        if (data.hasOwnProperty('error')) {
                            alert(data.error);
                        } else {
                            window.location.href = document.getElementById("back").href;
                        }
                    }
                );
            }
        }
    );

}
