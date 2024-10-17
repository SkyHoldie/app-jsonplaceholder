const fetchBtn = document.getElementById('fetchBtn');
const apiUrlInput = document.getElementById('apiUrl');
const tableHeader = document.getElementById('tableHeader');
const tableBody = document.getElementById('tableBody');
const loadingMsg = document.getElementById('loading');
const errorMsg = document.getElementById('errorMsg');
const detailModal = new bootstrap.Modal(document.getElementById('detailModal'));
const modalBody = document.getElementById('modalBody');

// The API URL to fetch data from
const apiUrl = 'https://jsonplaceholder.typicode.com/posts';

// Fetch data from the API on page load
window.onload = () => {
  showLoading();
  fetchData(apiUrl);
};

// Event listener for the Fetch button
fetchBtn.addEventListener('click', () => {
  const apiUrl = apiUrlInput.value.trim() || 'https://jsonplaceholder.typicode.com/posts'; // Fallback to the default URL

  if (!isValidUrl(apiUrl)) {
    showError('URL tidak valid. Mohon masukkan URL yang benar.');
    return;
  }

  showLoading();
  fetchData(apiUrl);
});

// Check if the URL is valid
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Fetch data from the API
async function fetchData(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    await displayData(data);
  } catch (error) {
    showError('Gagal mengambil data. Cek URL atau koneksi internet Anda.');
  } finally {
    hideLoading();
  }
}

// Display data by user
async function displayData(dataArray) {
  const userMap = new Map();

  // Group posts by userId
  for (const post of dataArray) {
    const user = await fetchUser(post.userId);
    if (!userMap.has(post.userId)) {
      userMap.set(post.userId, {
        user,
        posts: []
      });
    }
    userMap.get(post.userId).posts.push(post);
  }

  generateTableHeader(['Nama', 'Nomor', 'Email', 'Actions']);

  tableBody.innerHTML = '';
  userMap.forEach(({ user }) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.name || 'N/A'}</td>
      <td>${user.phone || 'N/A'}</td>
      <td>${user.email || 'N/A'}</td>
      <td>
        <button class="btn btn-info btn-sm me-1" onclick="fetchUserPosts(${user.id})">Post</button>
        <button class="btn btn-warning btn-sm me-1" onclick="fetchUserAlbums(${user.id})">Album</button>
        <button class="btn btn-success btn-sm me-1" onclick="fetchUserTodos(${user.id})">Todo List</button>
        <button class="btn btn-secondary btn-sm" onclick="fetchUserDetail(${user.id})">Detail</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  errorMsg.classList.add('d-none');
}

// Fetch user data by userId
async function fetchUser(userId) {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    return { name: 'N/A', phone: 'N/A', email: 'N/A' }; // Default values on error
  }
}

// Generate table header
function generateTableHeader(keys) {
  tableHeader.innerHTML = `<tr>${keys.map(key => `<th>${key}</th>`).join('')}</tr>`;
}

// Show error message
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove('d-none');
}

// Show loading spinner
function showLoading() {
  loadingMsg.classList.remove('d-none');
  errorMsg.classList.add('d-none');
  tableHeader.innerHTML = '';
  tableBody.innerHTML = '';
}

// Hide loading spinner
function hideLoading() {
  loadingMsg.classList.add('d-none');
}

// Fetch user posts and show in modal
async function fetchUserPosts(userId) {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const posts = await response.json();
    modalBody.innerHTML = formatPostData(posts); // Format data for display
    detailModal.show();
  } catch (error) {
    modalBody.innerHTML = '<p>Error fetching posts.</p>';
  }
}

// Fetch user albums and show in modal
async function fetchUserAlbums(userId) {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/albums?userId=${userId}`);

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const albums = await response.json();
    modalBody.innerHTML = formatAlbumData(albums); // Format data for display
    detailModal.show();
  } catch (error) {
    modalBody.innerHTML = '<p>Error fetching albums.</p>';
  }
}

// Fetch user todos and show in modal
async function fetchUserTodos(userId) {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/todos?userId=${userId}`);

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const todos = await response.json();
    modalBody.innerHTML = formatTodoData(todos); // Format data for display
    detailModal.show();
  } catch (error) {
    modalBody.innerHTML = '<p>Error fetching todos.</p>';
  }
}

// Fetch and display user details in the modal
async function fetchUserDetail(userId) {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const user = await response.json();
    modalBody.innerHTML = formatUserDetail(user);
    detailModal.show();
  } catch (error) {
    modalBody.innerHTML = '<p>Error fetching user details.</p>';
  }
}

// Format user detail data for the modal
function formatUserDetail(user) {
  return `
    <h5>User Detail:</h5>
    <ul class="list-group">
      <li class="list-group-item"><strong>Name:</strong> ${user.name}</li>
      <li class="list-group-item"><strong>Email:</strong> ${user.email}</li>
      <li class="list-group-item"><strong>Phone:</strong> ${user.phone}</li>
      <li class="list-group-item"><strong>Website:</strong> ${user.website}</li>
      <li class="list-group-item"><strong>Company:</strong> ${user.company.name}</li>
      <li class="list-group-item"><strong>Address:</strong> 
        ${user.address.suite}, ${user.address.street}, ${user.address.city}, ${user.address.zipcode}
      </li>
    </ul>
  `;
}

// Format post data for display in modal
function formatPostData(posts) {
  if (posts.length === 0) return '<p>No posts found.</p>';
  return `
    <h5>Posts:</h5>
    <ul class="list-group">
      ${posts.map(post => `
        <li class="list-group-item">
          <strong>Title:</strong> ${post.title} <br />
          <strong>Body:</strong> ${post.body}
        </li>`).join('')}
    </ul>
  `;
}

// Format album data for display in modal
function formatAlbumData(albums) {
  if (albums.length === 0) return '<p>No albums found.</p>';
  return `
    <h5>Albums:</h5>
    <ul class="list-group">
      ${albums.map(album => `
        <li class="list-group-item">
          <strong>Title:</strong> ${album.title}
        </li>`).join('')}
    </ul>
  `;
}

// Format todo data for display in modal
function formatTodoData(todos) {
  if (todos.length === 0) return '<p>No todos found.</p>';
  return `
    <h5>Todo List:</h5>
    <ul class="list-group">
      ${todos.map(todo => `
        <li class="list-group-item">
          <strong>${todo.completed ? '✅' : '❌'} ${todo.title}</strong>
        </li>`).join('')}
    </ul>
  `;
}
