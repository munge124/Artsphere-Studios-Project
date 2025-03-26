const API_URL = 'http://localhost:3000/artworks';

const artworksContainer = document.getElementById('artworks-container');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const addArtBtn = document.getElementById('add-art-btn');
const galleryView = document.getElementById('gallery-view');
const formView = document.getElementById('form-view');
const artForm = document.getElementById('art-form');
const formTitle = document.getElementById('form-title');
const artIdInput = document.getElementById('art-id');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const deleteBtn = document.getElementById('delete-btn');


let isEditing = false;

document.addEventListener('DOMContentLoaded', init);

async function init() {
    await fetchArtworks();
    setupEventListeners();
}

async function fetchArtworks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) 
            throw new Error('Failed to fetch artworks!');
        artworks = await response.json();
        renderArtworks(artworks);
    } catch (error) {
        console.error('Error:', error);
        artworksContainer.innerHTML = "<p class='error'>Failed to load artworks. Please try again later.</p>";
    }
}

function renderArtworks(artworksToRender) {
    artworksContainer.innerHTML = "";
    
    if (artworksToRender.length === 0) {
        artworksContainer.innerHTML = '<p>No artworks found.</p>';
        return;
    }
    
    artworksToRender.forEach(artwork => {
        const artworkCard = document.createElement('div');
        artworkCard.className = "artwork-card";
        
        artworkCard.innerHTML = `
            <img src="${artwork.image}" alt="${artwork.title}" class="artwork-image">
            <div class="artwork-info">
                <h3>${artwork.title}</h3>
                <p>${artwork.artist}</p>
                <p>${artwork.category} • ${artwork.year || 'Year unknown'}</p>
                <div class="artwork-actions">
                    <button class="edit-btn" data-id="${artwork.id}">Edit</button>
                    <button class="delete-btn" data-id="${artwork.id}">Delete</button>
                </div>
            </div>
        `;
        
        artworksContainer.appendChild(artworkCard);
    });
}

function searchArtworks() {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = artworks.filter(artwork => 
        artwork.title.toLowerCase().includes(searchTerm) || 
        artwork.artist.toLowerCase().includes(searchTerm)
    );
    renderArtworks(filtered);
}

function showForm(artwork = null) {
    isEditing = !!artwork;
    
    if (isEditing) {
        formTitle.textContent = "Edit Artwork";
        artIdInput.value = artwork.id;
        document.getElementById('title').value = artwork.title;
        document.getElementById('artist').value = artwork.artist;
        document.getElementById('year').value = artwork.year ;
        document.getElementById('category').value = artwork.category ;
        document.getElementById('image').value = artwork.image;
        document.getElementById('description').value = artwork.description ;
        deleteBtn.classList.remove('hidden');
    } else {
        formTitle.textContent = 'Add New Artwork';
        artForm.reset();
        deleteBtn.classList.add('hidden');
    }
    
    galleryView.classList.add('hidden');
    formView.classList.remove('hidden');
}

function hideForm() {
    galleryView.classList.remove('hidden');
    formView.classList.add('hidden');
    isEditing = false;
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const artwork = {
        title: document.getElementById('title').value,
        artist: document.getElementById('artist').value,
        year: document.getElementById('year').value,
        category: document.getElementById('category').value,
        image: document.getElementById('image').value,
        description: document.getElementById('description').value
    };
    
    try {
        if (isEditing) {
            await updateArtwork(artIdInput.value, artwork);
        } else {
            await createArtwork(artwork);
        }
        hideForm();
        await fetchArtworks();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to save artwork. Please try again.');
    }
}

async function createArtwork(artwork) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(artwork)
    });
    if (!response.ok) throw new Error('Failed to create artwork');
    return await response.json();
}

async function updateArtwork(id, artwork) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(artwork)
    });
    if (!response.ok) throw new Error('Failed to update artwork');
    return await response.json();
}

async function deleteArtwork(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete artwork');
}

function handleArtworkActions(e) {
    if (e.target.classList.contains('edit-btn')) {
        const id = e.target.dataset.id;
        const artwork = artworks.find(a => a.id == id);
        if (artwork) showForm(artwork);
    }
    
    if (e.target.classList.contains('delete-btn')) {
        if (confirm('Are you sure you want to delete this artwork?')) {
            const id = e.target.dataset.id;
            deleteArtwork(id)
                .then(fetchArtworks)
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to delete artwork.');
                });
        }
    }
}

function setupEventListeners() {
    
    searchBtn.addEventListener('click', searchArtworks);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') searchArtworks();
    });
    
    addArtBtn.addEventListener('click', () => showForm());
    
    artForm.addEventListener('submit', handleSubmit);
    
    cancelBtn.addEventListener('click', hideForm);
    
    deleteBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this artwork?')) {
            try {
                await deleteArtwork(artIdInput.value);
                hideForm();
                await fetchArtworks();
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to delete artwork.');
            }
        }
    });
    
    artworksContainer.addEventListener('click', handleArtworkActions);
}