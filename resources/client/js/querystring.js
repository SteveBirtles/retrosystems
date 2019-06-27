/*-------------------------------------------------------
  A utility function to extract the query string parameters
  and return them as a map of key-value pairs
  ------------------------------------------------------*/
function getQueryStringParameters() {
    let params = [];
    let q = document.URL.split('?')[1];
    if (q !== undefined) {
        q = q.split('&');
        for (let i = 0; i < q.length; i++) {
            let bits = q[i].split('=');
            params[bits[0]] = bits[1];
        }
    }
    return params;
}