
$(document).ready(function(){

    function loadModal(htmlFile) {
        fetch(htmlFile)
        .then(response => response.text())
        .then(html => {
            $('#modal-container .modal-content').innerHTML = html;
            // Show the modal
            $('#modal-container').style.display = 'block';
        });
    }
    $("#open-settings").on('click', function(){
        loadModal('settings.html');
    });



});  
