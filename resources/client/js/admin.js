/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function pageLoad() {

    resetLoginForm();

}

/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function resetLoginForm() {

    if (Cookies.get("destination") === undefined) {
        window.location.href = "/client/index.html";
    }

    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener("submit", event => {

        event.preventDefault();

        let formData = new FormData(loginForm);

        fetch('/admin/login', {method: 'post', body: formData}
        ).then(response => response.json()
        ).then(data => {

                if (data.hasOwnProperty('error')) {
                    alert(data.error);
                } else {
                    Cookies.set("sessionToken", data.token);
                    window.location.href = Cookies.get("destination");
                }
            }
        );
    });

}

/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function checkLogin(onSuccess) {

    let currentPage = window.location.pathname;
    let token = Cookies.get("sessionToken");

    if (token !== undefined) {

        fetch('/admin/check', {method: 'get'}
        ).then(response => response.json()
        ).then(data => {


                if (data.hasOwnProperty("username") && data.username !== "") {
                    document.getElementById("logout").addEventListener("click", logout);
                    onSuccess();
                } else {
                    if (data.hasOwnProperty("error")) {
                        alert(data.error);
                    }
                    if (currentPage !== '/client/login.html') {
                        window.location.href = '/client/login.html';
                    }
                }
            }
        );
    } else {
        if (currentPage !== '/client/login.html') {
            window.location.href = '/client/login.html';
        }
    }
}

/*-------------------------------------------------------
  ...
  ------------------------------------------------------*/
function logout() {

    fetch('/admin/logout', {method: 'post'}
    ).then(() => {
            Cookies.remove("sessionToken");
            window.location.href = "/client/index.html";
        }
    );

}
