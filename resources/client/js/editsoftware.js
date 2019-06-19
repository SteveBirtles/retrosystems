let id = -1;

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

function resetForm() {

    const form = document.getElementById('softwareForm');

    form.addEventListener("submit", event => {
        event.preventDefault();

        let formData = new FormData(form);
        formData.append("id", id);

        fetch('/software/save/', {method: 'post', body: formData}
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

function resetDeleteButton() {

    document.getElementById('delete').style.visibility = 'visible';

    document.getElementById('delete').addEventListener("click", () => {
            let r = confirm("Are you sure you want to delete this software?");
            if (r === true) {

                let formData = new FormData();
                formData.append("id", id);

                fetch('/software/delete/', {method: 'post', body: formData}
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
