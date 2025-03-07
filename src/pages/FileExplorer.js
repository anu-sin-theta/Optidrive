// src/pages/FileExplorer.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button'; // Ensure Button is imported correctly
import Modal from '@/components/ui/Modal';
import { Folder, File, MoreVertical } from 'lucide-react'; // Import icons
import './FileExplorer.css'; // Ensure this line is present
import path from 'path-browserify'; // Import path-browserify

const API_BASE_URL = 'http://localhost:5676';

export default function FileExplorer() {
  const [files, setFiles] = useState([]);
  const [modalMessage, setModalMessage] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFiles();
  }, [currentPath]);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/list?path=${currentPath}`);
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
      setModalMessage('Error fetching files');
    } finally {
      setLoading(false);
    }
  }, [currentPath]);

  const handleUpload = async (event) => {
    const files = event.target.files;
    const formData = new FormData();
    for (let file of files) {
      formData.append('file', file);
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/upload?path=${currentPath}`, formData);
      setModalMessage('Files uploaded successfully');
      fetchFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
      setModalMessage('Error uploading files');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      setLoading(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/mkdir?path=${currentPath}`, { name: folderName });
        setModalMessage(response.data.message);
        fetchFiles();
      } catch (error) {
        if (error.response && error.response.status === 400) {
          setModalMessage(`Folder with name "${folderName}" already exists.`);
        } else {
          console.error('Error creating folder:', error);
          setModalMessage('Error creating folder');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (name) => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/delete?path=${currentPath}&name=${name}`);
      setModalMessage('File deleted successfully');
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      setModalMessage('Error deleting file');
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (oldName) => {
    const newName = prompt('Enter new name:');
    if (newName) {
      setLoading(true);
      try {
        await axios.post(`${API_BASE_URL}/rename?path=${currentPath}`, { oldName, newName });
        setModalMessage('File renamed successfully');
        fetchFiles();
      } catch (error) {
        console.error('Error renaming file:', error);
        setModalMessage('Error renaming file');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDownload = async (name) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/download?path=${currentPath}&name=${name}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      setModalMessage('Error downloading file');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (name) => {
    const newPath = path.join(currentPath, name);
    setCurrentPath(newPath);
  };

  const handleGoBack = () => {
    const newPath = path.dirname(currentPath);
    setCurrentPath(newPath === '.' ? '' : newPath);
  };

  const toggleMenu = (index) => {
    setOpenMenuIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredFiles = files.filter((file) =>
    file.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="file-explorer">
      <h1>File Explorer</h1>
      <div className="folder-navigation">
        Current Path: {currentPath || 'Root'}
      </div>
      <input
        type="text"
        className="search-bar"
        placeholder="Search files..."
        value={searchQuery}
        onChange={handleSearch}
      />
      <div className="action-grid">
        <Button className="action-button" onClick={() => document.getElementById('file-input').click()}>
          Upload
        </Button>
        <Button className="action-button" onClick={handleCreateFolder}>
          Create Folder
        </Button>
        <Button className="action-button" onClick={handleGoBack}>
          Go Back
        </Button>
      </div>
      <input type="file" id="file-input" style={{ display: 'none' }} onChange={handleUpload} multiple />
      <div className="file-grid">
        {loading && <p>Loading...</p>}
        {filteredFiles.map((file, index) => (
          <div key={index} className="file-card">
            <div className="file-icon">
              {file.includes('.') ? <File /> : <Folder />}
            </div>
            <div className="file-name">{file}</div>
            <div className="file-menu">
              <MoreVertical className="icon menu-icon" onClick={() => toggleMenu(index)} />
              {openMenuIndex === index && (
                <div className="menu-options">
                  <Button className="file-menu-button" onClick={() => handleDelete(file)}>
                    Delete
                  </Button>
                  <Button className="file-menu-button" onClick={() => handleRename(file)}>
                    Rename
                  </Button>
                  {!file.includes('.') && (
                    <Button className="file-menu-button" onClick={() => handleNavigate(file)}>
                      Open
                    </Button>
                  )}
                  {file.includes('.') && (
                    <Button className="file-menu-button" onClick={() => handleDownload(file)}>
                      Download
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {modalMessage && <Modal message={modalMessage} onClose={() => setModalMessage('')} />}
    </div>
  );
}

