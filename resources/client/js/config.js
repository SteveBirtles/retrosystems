let id = -1;

/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function pageLoad() {

    let currentPage = window.location.href;
    Cookies.set("destination", currentPage);

    checkLogin(() => {

        const imageUploadForm = document.getElementById("imageUploadForm");

        imageUploadForm.addEventListener("submit", event => {

            event.preventDefault();

            if (document.getElementById("file").value !== '') {
                imageUploadForm.style.display = 'none';
                document.getElementById("uploading").style.display = 'block';

                let fileData = new FormData(imageUploadForm);

                fetch('/image/upload', {method: 'post', body: fileData},
                ).then(response => response.json()
                ).then(data => {

                        if (data.hasOwnProperty('error')) {
                            alert(data.error);
                        } else {
                            document.getElementById("file").value = '';
                            loadImages();
                        }
                        imageUploadForm.style.visibility = 'visible';

                        document.getElementById("uploading").style.display = 'none';
                    }
                );
            } else {
                alert("No file specified");
            }
        });

        loadManufacturers();
        loadCategories();
        loadImages();
        loadAdmins();

        document.getElementById("addManufacturer").addEventListener("click", addManufacturer);
        document.getElementById("addCategory").addEventListener("click", addCategory);
        document.getElementById("addAdmin").addEventListener("click", addAdmin);

    });

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
function addCategory() {

    let category = prompt("Please enter category name");

    let formData = new FormData();
    formData.append("name", category);

    if (category != null) {
        fetch('/category/new', {method: 'post', body: formData}
        ).then(response => response.json()
        ).then(data => {
                if (data.hasOwnProperty('error')) {
                    alert(data.error);
                } else {
                    loadCategories();
                }
            }
        );
    }

}

/*-------------------------------------------------------
  ...
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
  ...
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
  ...
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
function renameCategory(event) {

    let id = event.target.getAttribute("data-id");
    let oldName = event.target.getAttribute("data-name");
    let newName = prompt("Please enter new name", oldName);

    let formData = new FormData();
    formData.append("id", id);
    formData.append("name", newName);

    if (newName != null) {
        fetch('/category/rename',{method: 'post',  body: formData}
        ).then(response => response.json()
        ).then(data => {
                if (data.hasOwnProperty('error')) {
                    alert(data.error);
                } else {
                    loadCategories();
                }
            }
        );
    }

}

/*-------------------------------------------------------
  ...
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

/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function deleteCategory(event) {

    let id = event.target.getAttribute("data-id");
    let count = event.target.getAttribute("data-count");

    if (parseInt(count) > 0) {
        alert("Can't delete that category as it is in use");
        return;
    }

    let ok = confirm("Are you sure?");

    let formData = new FormData();
    formData.append("id", id);

    if (ok === true) {
        fetch( '/category/delete', {method: 'post', body: formData}
        ).then(response => response.json()
        ).then(data => {

                console.log(data.error);
                if (data.hasOwnProperty('error')) {
                    alert(data.error);
                } else {
                    loadCategories();
                }
            }
        );
    }

}

/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function renameImageFile(event) {

    let oldFilename = event.target.getAttribute("data-filename");
    let newFilename = prompt("Please enter new file name", oldFilename);

    let formData = new FormData();
    formData.append("oldFilename", oldFilename);
    formData.append("newFilename", newFilename);

    if (newFilename != null) {
        fetch('/image/rename', {method: 'post',  body: formData}
        ).then(response => response.json()
        ).then(data => {

                if (data.hasOwnProperty('error')) {
                    alert(data.error);
                } else {
                    loadImages();
                }
            }
        );
    }

}

/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function deleteImageFile(event) {

    let filename = event.target.getAttribute("data-filename");
    let ok = confirm("Are you sure you want to delete " + filename + "?");

    if (ok === true) {

        let formData = new FormData();
        formData.append("filename", filename);

        fetch('/image/delete', {method: 'post'})
            .then(response => response.json())
            .then(data => {

                    console.log(data.error);
                    if (data.hasOwnProperty('error')) {
                        alert(data.error);
                    } else {
                        loadImages();
                    }
                }
            );
    }

}

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
function loadCategories() {

    fetch( '/category/list', {method: 'get'})
        .then(response => response.json())
        .then(data => {

            if (data.hasOwnProperty('error')) {
                alert(data.error);
            } else {

                let categoriesHTML = `<div class="container">`
                    + `<div class="row mb-2">`
                    + `<div class="col-4 bg-light font-weight-bold">Category</div>`
                    + `<div class="col-3 bg-light font-weight-bold">Accessory Count</div>`
                    + `<div class="col-5 text-right bg-light font-weight-bold">Options</div>`
                    + `</div>`;

                for (let category of data) {

                    categoriesHTML += `<div class="row mb-2">`
                        + `<div class="col-4">${category.name}</div>`
                        + `<div class="col-3">${category.count}</div>`
                        + `<div class="col-5 text-right">`
                            + `<a class="btn btn-sm btn-success m-1 renameCategory" data-id="${category.categoryId}" data-name="${category.name}">Rename</a>`
                            + `<a class="btn btn-sm btn-danger m-1 deleteCategory" data-id="${category.categoryId}" data-count="${category.count}">Delete</a>`
                        +`</div>`
                    + `</div>`;
                }
                categoriesHTML += `</div>`;

                document.getElementById('categories').innerHTML = categoriesHTML;

                let renameCategoryButtons = document.getElementsByClassName("renameCategory");
                for (let e of renameCategoryButtons) {
                    e.addEventListener("click", renameCategory);
                }

                let deleteCategoryButtons = document.getElementsByClassName("deleteCategory");
                for (let e of deleteCategoryButtons) {
                    e.addEventListener("click", deleteCategory);
                }

            }
        }
    );

}

/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function loadImages() {

    fetch(  '/image/list',{method: 'get'})
        .then(response => response.json())
        .then(data => {

            if (data.hasOwnProperty('error')) {
                alert(data.error);
            } else {

                let imagesHTML = `<div class="container">`
                    + `<div class="row mb-2">`
                    + `<div class="col-4 bg-light font-weight-bold">Image filename</div>`
                    + `<div class="col-4 bg-light font-weight-bold">Usage</div>`
                    + `<div class="col-4 text-right bg-light font-weight-bold">Options</div>`
                    + `</div>`;

                for (let image of data) {

                    imagesHTML += `<div class="row mb-2">`
                        + `<div class="col-4"><a href="/client/img/${image.filename}" target="_blank">${image.filename}</a></div>`
                        + `<div class="col-4 small">`
                            + (image.systems > 0 ? `Systems x ${image.systems} ` : "")
                            + (image.software > 0 ? `Software x ${image.software} ` : "")
                            + (image.accessories > 0 ? `Accessories x ${image.accessories}` : "")
                        + `</div>`
                        + `<div class="col-4 text-right">`
                        + `<a class="btn btn-sm btn-success m-1 renameImageFile" data-filename="${image.filename}">Rename</a>`
                            + `<a class="btn btn-sm btn-danger m-1 deleteImageFile" data-filename="${image.filename}">Delete</a>`
                        +`</div>`
                        + `</div>`;
                }
                imagesHTML += `</div>`;

                document.getElementById('images').innerHTML = imagesHTML;

                let renameImageButtons = document.getElementsByClassName("renameImageFile");
                for (let e of renameImageButtons) {
                    e.addEventListener("click", renameImageFile);
                }

                let deleteImageButtons = document.getElementsByClassName("deleteImageFile");
                for (let e of deleteImageButtons) {
                    e.addEventListener("click", deleteImageFile);
                }

            }
        }
    );

}

/*-------------------------------------------------------
  ...
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
