/*-------------------------------------------------------
  Does an API request to /category/list
  Uses the response to populate the 'categories' div element
  Also adds click event handlers for buttons of class 'renameCategory' and 'deleteCategory'
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
  Does an API request to /category/new
  Prompts for the new category name before sending the request.
  If successful, reloads the categories list.
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
  Does an API request to /manufacturer/rename
  Prompts for the new manufacturer name before sending the request.
  If successful, reloads the manufacturers list.
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
  Does an API request to /category/delete
  Checks if the category is in use before sending the request.
  Also prompts for confirmation.
  If successful, reloads the categories list.
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