/*-------------------------------------------------------
  Does an API request to /image/list
  Uses the response to populate the 'images' div element
  Also adds click event handlers for buttons of class 'renameImageFile' and 'deleteImageFile'
  ------------------------------------------------------*/
function loadImages() {

    fetch('/image/list',{method: 'get'})
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

                    let renameImageButtons = document.getElementsByClassName('renameImageFile');
                    for (let e of renameImageButtons) {
                        e.addEventListener('click', renameImageFile);
                    }

                    let deleteImageButtons = document.getElementsByClassName('deleteImageFile');
                    for (let e of deleteImageButtons) {
                        e.addEventListener('click', deleteImageFile);
                    }

                }
            }
        );

}

/*-------------------------------------------------------
  Does an API request to /image/upload using the data in 'imageUploadForm'
  Whilst uploading, the 'uploading' div is made visible
  If successful, reloads the list of images, resets the file upload element and hides the 'uploading' div
  ------------------------------------------------------*/
function uploadImage(event) {

    event.preventDefault();

    const imageUploadForm = document.getElementById('imageUploadForm');

    if (document.getElementById('file').value !== '') {

        imageUploadForm.style.display = 'none';
        document.getElementById('uploading').style.display = 'block';

        let fileData = new FormData(imageUploadForm);

        fetch('/image/upload', {method: 'post', body: fileData},
        ).then(response => response.json()
        ).then(data => {

                if (data.hasOwnProperty('error')) {
                    alert(data.error);
                } else {
                    document.getElementById('file').value = '';
                    loadImages();
                }
                imageUploadForm.style.visibility = 'visible';

                document.getElementById('uploading').style.display = 'none';
            }
        );
    } else {
        alert('No file specified');
    }


}

/*-------------------------------------------------------
  Does an API request to /image/rename
  Prompts for the new filename before sending the request.
  If successful, reloads the image list.
  ------------------------------------------------------*/
function renameImageFile(event) {

    let oldFilename = event.target.getAttribute('data-filename');
    let newFilename = prompt('Please enter new file name', oldFilename);

    let formData = new FormData();
    formData.append('oldFilename', oldFilename);
    formData.append('newFilename', newFilename);

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
  Does an API request to /image/delete
  Prompts for confirmation before sending the request.
  If successful, reloads the images list.
  ------------------------------------------------------*/
function deleteImageFile(event) {

    let filename = event.target.getAttribute('data-filename');
    let ok = confirm('Are you sure you want to delete ' + filename + '?');

    if (ok === true) {

        let formData = new FormData();
        formData.append('filename', filename);

        fetch('/image/delete', {method: 'post',  body: formData})
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