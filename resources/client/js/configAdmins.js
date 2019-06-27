/*-------------------------------------------------------
  Does an API request to /admin/list
  Uses the response to populate the 'administrators' div element
  Also adds click event handlers for buttons of class 'renameAdmin', 'resetPassword' and 'deleteAdmin'
  ------------------------------------------------------*/
function loadAdmins() {

    fetch('/admin/list', {method: 'get'}
    ).then(response => response.json()
    ).then(data => {

            if (data.hasOwnProperty('error')) {
                alert(data.error);
            } else {

                let adminsHTML = `<div class="container">`
                    + `<div class="row mb-2">`
                    + `<div class="col-6 bg-light font-weight-bold">Username</div>`
                    + `<div class="col-6 text-right bg-light font-weight-bold">Options</div>`
                    + `</div>`;

                for (let admin of data) {

                    adminsHTML += `<div class="row mb-2">`
                        + `<div class="col-6">${admin.username}</div>`
                        + `<div class="col-6 text-right">`
                        + `<a class="btn btn-sm btn-success m-1 renameAdmin" data-username="${admin.username}">Rename</a>`
                        + `<a class="btn btn-sm btn-warning m-1 resetPassword" data-username="${admin.username}">Reset Password</a>`
                        + `<a class="btn btn-sm btn-danger m-1 deleteAdmin" data-username="${admin.username}">Delete</a>`
                        + `</div>`
                        + `</div>`;
                }
                adminsHTML += `</div>`;

                document.getElementById('administrators').innerHTML = adminsHTML;

                let renameAdminButtons = document.querySelectorAll(".renameAdmin");
                for (let e of renameAdminButtons) {
                    e.addEventListener("click", renameAdmin);
                }

                let resetPasswordButtons = document.getElementsByClassName("resetPassword");
                for (let e of resetPasswordButtons) {
                    e.addEventListener("click", resetPassword);
                }

                let deleteAdminButtons = document.getElementsByClassName("deleteAdmin");
                for (let e of deleteAdminButtons) {
                    e.addEventListener("click", deleteAdmin);
                }

            }
        }
    );

}

/*-------------------------------------------------------
  Does an API request to /admin/new
  Prompts for the new admin name before sending the request.
  If successful, reloads the admins list.
  ------------------------------------------------------*/
function addAdmin() {

    let admin = prompt("Please enter admin name");

    let formData = new FormData();
    formData.append("username", admin);

    if (admin != null) {
        fetch('/admin/new', {method: 'post', body: formData}
        ).then(response => response.json()
        ).then(data => {

                if (data.hasOwnProperty('error')) {
                    alert(data.error);
                } else {
                    alert("Admin created with password 'password'");
                    loadAdmins();
                }
            }
        );
    }

}

/*-------------------------------------------------------
  Does an API request to /admin/reset
  Prompts for the new password before sending the request.
  ------------------------------------------------------*/
function resetPassword(event) {

    let admin = event.target.getAttribute("data-username");
    let password = prompt("Please enter new password for " + admin);

    let formData = new FormData();
    formData.append("username", admin);
    formData.append("password", password);

    if (admin != null && password != null) {

        fetch('/admin/reset', {method: 'post',  body: formData}
        ).then(response => response.json()
        ).then(data => {

                if (data.hasOwnProperty('error')) {
                    alert(data.error);
                }
            }
        );
    }

}

/*-------------------------------------------------------
  Does an API request to /admin/rename
  Prompts for the new admin name before sending the request.
  If successful, reloads the admins list.
  ------------------------------------------------------*/
function renameAdmin(event) {

    let oldUsername = event.target.getAttribute("data-username");
    let newUsername = prompt("Please enter new username", oldUsername);

    if (newUsername != null) {

        let formData = new FormData();
        formData.append('oldUsername', oldUsername);
        formData.append('newUsername', newUsername);

        fetch('/admin/rename' , {method: 'post',  body: formData}
        ).then(response => response.json()
        ).then(data => {

                if (data.hasOwnProperty('error')) {
                    alert(data.error);
                } else {
                    loadAdmins();
                }
            }
        );
    }

}

/*-------------------------------------------------------
  Does an API request to /admin/delete
  Prompts for confirmation before sending the request.
  If successful, reloads the admins list.
  ------------------------------------------------------*/
function deleteAdmin(event) {

    let admin = event.target.getAttribute("data-username");
    let ok = confirm("Are you sure you want to delete " + admin + "?");

    if (ok === true) {

        let formData = new FormData();
        formData.append("username", admin);

        fetch('/admin/delete', {method: 'post', body: formData}
        ).then(response => response.json()
        ).then(data => {

                console.log(data.error);
                if (data.hasOwnProperty('error')) {
                    alert(data.error);
                } else {
                    loadAdmins();
                }
            }
        );
    }

}