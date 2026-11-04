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
const profileButton = document.getElementById('profile-button');
const settingsDialog = document.getElementById('settings-dialog');
const closeSettingsButton = document.getElementById('close-settings');
const themeToggle = document.getElementById('theme-toggle');
const STORAGE_KEY = 'lulucas-posts';
const THEME_STORAGE_KEY = 'lulucas-theme';
const tabs = [...document.querySelectorAll('.tab')];
let selectedImage = '';
let activeSort = 'recent';

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

function readLocalPosts() {
    try {
        const storedPosts = localStorage.getItem(STORAGE_KEY);
        if (!storedPosts) return [];

        const posts = JSON.parse(storedPosts);
        if (!Array.isArray(posts)) return [];

        return posts.filter((post) => post && typeof post === 'object'
            && typeof post.caption === 'string'
            && typeof post.image === 'string');
    } catch {
        return [];
    }
}

function saveLocalPost(caption, image) {
    try {
        const posts = readLocalPosts();
        posts.unshift({ caption, image });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts.slice(0, 10)));
        return true;
    } catch {
        return false;
    }
}

function sortPosts(sort = activeSort) {
    activeSort = sort;
    const posts = [...postList.querySelectorAll('.post-card')];
    if (sort === 'popular') {
        posts.sort((a, b) => Number(b.dataset.likes) - Number(a.dataset.likes));
    }
    posts.forEach((post) => postList.appendChild(post));
}

function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    themeToggle.textContent = isDark ? 'Tema claro' : 'Tema escuro';
    themeToggle.setAttribute('aria-pressed', String(isDark));
}

function restoreTheme() {
    try {
        applyTheme(localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light');
    } catch {
        applyTheme('light');
    }
}

function restoreLocalPosts() {
    const posts = readLocalPosts();
    posts.slice(0, 10).reverse().forEach((postData) => postList.prepend(createPost(postData)));
    sortPosts();
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
    const newPost = createPost({ caption, image: selectedImage });
    postList.prepend(newPost);
    const saved = saveLocalPost(caption, selectedImage);
    captionInput.value = '';
    resetImage();
    showMessage(saved ? 'Publicado no mural.' : 'Post publicado nesta sessão, mas não foi possível salvá-lo neste navegador.', !saved);
    updatePostCount();
    sortPosts();
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
        if (activeSort === 'popular') sortPosts('popular');
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

tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        tabs.forEach((item) => {
            item.classList.toggle('is-active', item === tab);
            item.setAttribute('aria-selected', String(item === tab));
        });
        sortPosts(tab.dataset.sort);
    });
});

searchButton.addEventListener('click', () => captionInput.focus());
profileButton.addEventListener('click', () => settingsDialog.showModal());
closeSettingsButton.addEventListener('click', () => settingsDialog.close());
settingsDialog.addEventListener('click', (event) => {
    if (event.target === settingsDialog) settingsDialog.close();
});
themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
        // O tema continua aplicado durante esta sessão mesmo sem armazenamento disponível.
    }
});
restoreTheme();
restoreLocalPosts();
