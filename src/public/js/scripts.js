$('#post-comment').hide()
const btnLike = document.querySelector('#btn-like')
const btnDelete = document.querySelector('#btn-delete')
const btnComment = document.querySelector('#btn-toggle-comment')

if (btnLike !== null) {
    btnLike.addEventListener('click', (e) => {
        e.preventDefault()
        let imgId = btnLike.getAttribute('data-id')
        fetch(`/images/${imgId}/like`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            document.querySelector('.likes-count').innerHTML = data.likes
        })
    })
}

if (btnDelete !== null) {
    btnDelete.addEventListener('click', (e) => {
        e.preventDefault()
        const imgId = btnDelete.getAttribute('data-id')
        if (confirm('Are you sure you want to delete this image?')) {
            fetch(`/images/${imgId}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                btnDelete.className = 'btn btn-success'
                btnDelete.firstChild.className = 'fa fa-check'
                btnDelete.innerHTML = '<span>Deleted</span>'
            })
        }
    })
}

if (btnComment !== null) {
    btnComment.addEventListener('click', (e) => {
        e.preventDefault()
        $('#post-comment').slideToggle();
    })
}
