// src/pages/home.js
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Camera, Folder, FileText, Brain, Command, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from '@/components/ui/sidebar';
import axios from 'axios';
import Modal from '@/components/ui/Modal';
import './home.css';
import { useRouter } from 'next/router';

export default function Optidrive() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [modalMessage, setModalMessage] = useState('');
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const dropZone = document.getElementById('drop-zone');

    const handleDragOver = (event) => {
      event.preventDefault();
    };

    const handleDrop = (event) => {
      event.preventDefault();
      handleUpload(event);
    };

    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('drop', handleDrop);

    return () => {
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleUpload = async (event) => {
    const files = event.target.files || event.dataTransfer.files;
    const formData = new FormData();
    for (let file of files) {
      formData.append('file', file);
    }

    const userConfirmed = window.confirm('Do you want to proceed with the upload?');
    if (userConfirmed) {
      try {
        await axios.post('http://localhost:5676/upload', formData);
        setModalMessage('Files uploaded successfully');
      } catch (error) {
        console.error('Error uploading files:', error);
        setModalMessage('Error uploading files');
      }
    }
  };

  const handleCreateFolder = async () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      try {
        const response = await axios.post('http://localhost:5676/mkdir', { name: folderName });
        setModalMessage(response.data.message);
      } catch (error) {
        if (error.response && error.response.status === 400) {
          setModalMessage(`Folder with name "${folderName}" already exists.`);
        } else {
          console.error('Error creating folder:', error);
          setModalMessage('Error creating folder');
        }
      }
    }
  };

  const handleFileExplorer = async () => {
    try {
      await router.push('/FileExplorer');
    } catch (error) {
      console.error('Error navigating to File Explorer:', error);
      setModalMessage('Error navigating to File Explorer');
    }
  };

  const handleOpenCamera = async () => {
    const video = document.createElement('video');
    video.width = 640;
    video.height = 480;
    document.body.appendChild(video);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      await video.play();
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const formData = new FormData();
        formData.append('file', blob, 'video.mp4');
        try {
          await axios.post('http://localhost:5676/upload', formData);
          setModalMessage('Video uploaded successfully');
        } catch (error) {
          console.error('Error uploading video:', error);
          setModalMessage('Error uploading video');
        }
      };
      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(video);
      }, 5000); // Record for 5 seconds
      mediaRecorder.start();
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  return (
    <SidebarProvider>
      <div className="optidrive-container" ref={containerRef}>
        <Sidebar className="sidebar">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="sidebar-group-label">Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="sidebar-menu-button">
                      <Brain />
                      <span>Analyze with AI</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="sidebar-menu-button">
                      <Command />
                      <span>Command Center</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="sidebar-menu-button">
                      <Lock />
                      <span>Lock</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="main-content">
          <h1>Optidrive</h1>
          <div className="action-grid">
            <Button className="action-button" onClick={() => fileInputRef.current.click()}>
              <Upload /> Upload
            </Button>
            <Button className="action-button" onClick={handleOpenCamera}>
              <Camera /> Open Camera
            </Button>
            <Button className="action-button" onClick={handleCreateFolder}>
              <Folder /> Create Folder
            </Button>
            <Button className="action-button" onClick={handleFileExplorer}>
              <FileText /> File Explorer
            </Button>
          </div>
          <div className="drop-zone" id="drop-zone">
            <p>Drag and drop files here or click to upload</p>
            <Input type="file" id="file-input" ref={fileInputRef} style={{ display: 'none' }} onChange={handleUpload} multiple />
            <label htmlFor="file-input" className="file-input-label">Select File</label>
          </div>
        </main>
        <div className="glow-effect" style={{ '--mouse-x': `${mousePosition.x}px`, '--mouse-y': `${mousePosition.y}px` }} />
        {modalMessage && <Modal message={modalMessage} onClose={() => setModalMessage('')} />}
      </div>
    </SidebarProvider>
  );
}