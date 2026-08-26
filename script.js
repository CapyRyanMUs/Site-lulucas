const postForm = document.getElementById('post-form');
const captionInput = document.getElementById('post-caption');
const imageInput = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const previewImage = document.getElementById('preview-image');
const removeImageButton = document.getElementById('remove-image');
const formMessage = document.getElementById('form-message');
const postList = document.getElementById('post-list');
const postCount = document.getElementById('post-count');
const searchButton = document.querySelector('.icon-button');
let selectedImage = '';

function updatePostCount() {
    const total = postList.querySelectorAll('.post-card').length;
    postCount.textContent = `${total} ${total === 1 ? 'post' : 'posts'}`;
}

function showMessage(message, isError = true) {
    formMessage.textContent = message;
    formMessage.style.color = isError ? 'var(--coral)' : '#4d9b70';
}

function resetImage() {
    selectedImage = '';
    imageInput.value = '';
    imagePreview.hidden = true;
    previewImage.removeAttribute('src');
}

function createPost({ caption, image }) {
    const post = document.createElement('article');
    post.className = 'post-card user-post';
    post.dataset.likes = '0';

    const header = document.createElement('div');
    header.className = 'post-header';
    header.innerHTML = '<div class="user-summary"><div class="avatar avatar-yellow">LC</div><div><strong>lucas</strong><span>agora · internet</span></div></div><button class="more-button" type="button" aria-label="Mais opções">•••</button>';
    post.appendChild(header);

    const text = document.createElement('p');
    text.className = 'post-text';
    text.textContent = caption || 'Uma nova imagem acaba de chegar ao mural.';
    post.appendChild(text);

    if (image) {
        const picture = document.createElement('img');
        picture.className = 'post-image';
        picture.src = image;
        picture.alt = caption ? `Imagem da publicação: ${caption}` : 'Imagem compartilhada no mural';
        post.appendChild(picture);
    }

    const footer = document.createElement('div');
    footer.className = 'post-footer';
    footer.innerHTML = '<div class="post-actions"><button class="action-button like-button" type="button" aria-label="Curtir publicação"><span>♡</span> <b>0</b></button><button class="action-button" type="button" aria-label="Comentar"><span>◌</span> <b>0</b></button><button class="action-button" type="button" aria-label="Compartilhar">↗</button></div><button class="save-button" type="button" aria-label="Salvar publicação">⌑</button>';
    post.appendChild(footer);
    return post;
}

function saveLocalPost(caption, image) {
    const posts = JSON.parse(localStorage.getItem('lulucas-posts') || '[]');
    posts.unshift({ caption, image });
    localStorage.setItem('lulucas-posts', JSON.stringify(posts.slice(0, 10)));
}

function restoreLocalPosts() {
    const posts = JSON.parse(localStorage.getItem('lulucas-posts') || '[]');
    posts.reverse().forEach((postData) => postList.prepend(createPost(postData)));
    updatePostCount();
}

imageInput.addEventListener('change', () => {
    const [file] = imageInput.files;
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        showMessage('Escolha um arquivo de imagem.');
        resetImage();
        return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
        selectedImage = reader.result;
        previewImage.src = selectedImage;
        imagePreview.hidden = false;
        showMessage('Imagem pronta para publicar.', false);
    });
    reader.readAsDataURL(file);
});

removeImageButton.addEventListener('click', resetImage);

postForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const caption = captionInput.value.trim();
    if (!caption && !selectedImage) {
        showMessage('Adicione uma legenda ou escolha uma imagem.');
        return;
    }
    postList.prepend(createPost({ caption, image: selectedImage }));
    saveLocalPost(caption, selectedImage);
    captionInput.value = '';
    resetImage();
    showMessage('Publicado no mural.', false);
    updatePostCount();
});

postList.addEventListener('click', (event) => {
    const likeButton = event.target.closest('.like-button');
    const saveButton = event.target.closest('.save-button');
    const playButton = event.target.closest('.music-card button');

    if (likeButton) {
        const post = likeButton.closest('.post-card');
        const count = Number(post.dataset.likes) + (likeButton.classList.toggle('is-liked') ? 1 : -1);
        post.dataset.likes = String(count);
        likeButton.querySelector('b').textContent = count;
        likeButton.querySelector('span').textContent = likeButton.classList.contains('is-liked') ? '♥' : '♡';
    }
    if (saveButton) {
        saveButton.classList.toggle('is-saved');
        saveButton.textContent = saveButton.classList.contains('is-saved') ? '▣' : '⌑';
    }
    if (playButton) {
        playButton.textContent = playButton.textContent === '▶' ? 'Ⅱ' : '▶';
        playButton.closest('.music-card').classList.toggle('is-playing');
    }
});

document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach((item) => {
            item.classList.toggle('is-active', item === tab);
            item.setAttribute('aria-selected', String(item === tab));
        });
        const posts = [...postList.querySelectorAll('.post-card')];
        if (tab.dataset.sort === 'popular') {
            posts.sort((a, b) => Number(b.dataset.likes) - Number(a.dataset.likes));
        }
        posts.forEach((post) => postList.appendChild(post));
    });
});

searchButton.addEventListener('click', () => captionInput.focus());
restoreLocalPosts();
