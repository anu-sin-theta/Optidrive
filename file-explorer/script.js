document.addEventListener('DOMContentLoaded', () => {
    const sidebarMenu = document.getElementById('sidebar-menu');
    const fileList = document.getElementById('file-list');
    const createFolderBtn = document.getElementById('create-folder-btn');
    const uploadFileBtn = document.getElementById('upload-file-btn');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
  
    let currentPath = '';
  
    const fetchFiles = async () => {
      const response = await fetch(`/list?path=${currentPath}`);
      const files = await response.json();
      fileList.innerHTML = '';
      files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
        fileItem.textContent = file;
        fileList.appendChild(fileItem);
      });
    };
  
    const updateSidebar = () => {
      sidebarMenu.innerHTML = '';
      const homeButton = document.createElement('button');
      homeButton.classList.add('sidebar-menu-button');
      homeButton.textContent = 'Home';
      homeButton.addEventListener('click', () => {
        currentPath = '';
        fetchFiles();
      });
      sidebarMenu.appendChild(homeButton);
    };
  
    createFolderBtn.addEventListener('click', async () => {
      const folderName = prompt('Enter folder name:');
      if (folderName) {
        await fetch('/mkdir', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: folderName }),
        });
        fetchFiles();
      }
    });
  
    uploadFileBtn.addEventListener('click', () => {
      fileInput.click();
    });
  
    fileInput.addEventListener('change', async (event) => {
      const formData = new FormData();
      formData.append('file', event.target.files[0]);
      await fetch(`/upload?path=${currentPath}`, {
        method: 'POST',
        body: formData,
      });
      fetchFiles();
    });
  
    dropZone.addEventListener('dragover', (event) => {
      event.preventDefault();
      dropZone.classList.add('pulse');
    });
  
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('pulse');
    });
  
    dropZone.addEventListener('drop', async (event) => {
      event.preventDefault();
      dropZone.classList.remove('pulse');
      const formData = new FormData();
      formData.append('file', event.dataTransfer.files[0]);
      await fetch(`/upload?path=${currentPath}`, {
        method: 'POST',
        body: formData,
      });
      fetchFiles();
    });
  
    fetchFiles();
    updateSidebar();
  });
  